from ultralytics import YOLO
import cv2
import requests
import time

# =======================================
# Load YOLO Model
# =======================================
model = YOLO("best.pt")

# =======================================
# Phone Camera URL
# =======================================
camera_url = "http://192.168.8.199:8080/video"

# =======================================
# Garage Details
# =======================================

# IMPORTANT:
# Change this if your actual garage_id is not 1
GARAGE_ID = 1

# Node.js Backend API
BACKEND_URL = "http://localhost:5000/api/garages/outside-count"

# =======================================
# Open Camera
# =======================================
cap = cv2.VideoCapture(camera_url)

if not cap.isOpened():
    print("Camera connection failed!")
    exit()

print("Camera connected successfully!")

# =======================================
# Variables
# =======================================
last_sent_count = None
last_sent_time = 0

# Wait at least 2 seconds between backend updates
SEND_INTERVAL = 2

# =======================================
# Main Detection Loop
# =======================================
while True:

    success, frame = cap.read()

    if not success:
        print("Failed to read camera frame")
        break

    # Run YOLO detection
    results = model(
        frame,
        conf=0.60,
        verbose=False
    )

    # =======================================
    # Count Vehicles
    # =======================================
    vehicle_count = 0

    if results[0].boxes is not None:
        vehicle_count = len(results[0].boxes)

    # =======================================
    # Send Count to Backend
    # =======================================
    current_time = time.time()

    if (
        vehicle_count != last_sent_count
        and current_time - last_sent_time >= SEND_INTERVAL
    ):

        try:
            response = requests.post(
                BACKEND_URL,
                json={
                    "garage_id": GARAGE_ID,
                    "outside_vehicle_count": vehicle_count
                },
                timeout=3
            )

            if response.status_code == 200:
                print(
                    f"Backend updated successfully | "
                    f"Garage ID: {GARAGE_ID} | "
                    f"Outside Vehicles: {vehicle_count}"
                )

                last_sent_count = vehicle_count
                last_sent_time = current_time

            else:
                print(
                    "Backend update failed:",
                    response.status_code,
                    response.text
                )

        except requests.exceptions.RequestException as error:
            print(
                "Backend connection error:",
                error
            )

    # =======================================
    # Draw Detection Results
    # =======================================
    annotated_frame = results[0].plot()

    cv2.putText(
        annotated_frame,
        f"Outside Vehicles: {vehicle_count}",
        (30, 50),
        cv2.FONT_HERSHEY_SIMPLEX,
        1,
        (255, 255, 255),
        2
    )

    cv2.putText(
        annotated_frame,
        f"Garage ID: {GARAGE_ID}",
        (30, 90),
        cv2.FONT_HERSHEY_SIMPLEX,
        0.8,
        (255, 255, 255),
        2
    )

    # =======================================
    # Show Window
    # =======================================
    cv2.imshow(
        "Garage Vehicle Detection",
        annotated_frame
    )

    # Press Q to stop
    if cv2.waitKey(1) & 0xFF == ord("q"):
        break

# =======================================
# Cleanup
# =======================================
cap.release()
cv2.destroyAllWindows()