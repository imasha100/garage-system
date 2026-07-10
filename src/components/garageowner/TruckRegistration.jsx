import React, { useState } from "react";
import { Menu, Save, Truck, UserRound } from "lucide-react";

export default function TruckRegistration({ toggleSidebar }) {
  const generateTruckId = () =>
    `TRUCK-${Date.now().toString().slice(-6)}`;

  const generateDriverId = () =>
    `DRV-${Date.now().toString().slice(-6)}`;

  const [formData, setFormData] = useState({
    // Truck Information
    truckId: generateTruckId(),
    plateNumber: "",
    truckModel: "",
    truckType: "",
    capacity: "",

    // Driver Information
    driverId: generateDriverId(),
    driverName: "",
    driverEmail: "",
    driverContact: "",
    driverNic: "",
    licenseNumber: "",
    licenseExpireDate: "",
    driverExperience: "",
  });

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previousData) => ({
      ...previousData,
      [name]: value,
    }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    const existingTrucks =
      JSON.parse(localStorage.getItem("towTrucks")) || [];

    const updatedTrucks = [...existingTrucks, formData];

    localStorage.setItem(
      "towTrucks",
      JSON.stringify(updatedTrucks)
    );

    console.log("Tow Truck and Driver:", formData);

    alert("Tow Truck and Driver Registered Successfully");

    setFormData({
      // Truck Information
      truckId: generateTruckId(),
      plateNumber: "",
      truckModel: "",
      truckType: "",
      capacity: "",

      // Driver Information
      driverId: generateDriverId(),
      driverName: "",
      driverEmail: "",
      driverContact: "",
      driverNic: "",
      licenseNumber: "",
      licenseExpireDate: "",
      driverExperience: "",
    });
  };

  return (
    <div className="min-h-screen bg-[#07080f] text-white font-sans">
      {/* Header */}
      <header className="min-h-16 border-b border-white/10 bg-[#15151f] flex items-center px-4 md:px-8 gap-3">
        <button
          type="button"
          onClick={toggleSidebar}
          className="md:hidden w-10 h-10 rounded-lg border border-white/10 bg-black/40 flex items-center justify-center text-white hover:bg-white/10 transition"
          aria-label="Open sidebar"
        >
          <Menu size={20} />
        </button>

        <div>
          <h1 className="text-lg md:text-xl font-black tracking-widest">
            TOW TRUCK REGISTRATION
          </h1>

          <p className="text-[10px] text-gray-500 uppercase tracking-widest">
            Register recovery vehicle and assigned driver
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-4 md:p-8 flex justify-center">
        <div className="w-full max-w-5xl bg-[#15151f] border border-white/10 rounded-2xl p-6 md:p-8 shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-10">
            {/* Truck Information */}
            <section>
              <div className="flex items-center gap-3 mb-6">
                <Truck className="text-amber-400" size={28} />

                <h2 className="text-2xl font-bold">
                  Truck Information
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Truck ID */}
                <div>
                  <label
                    htmlFor="truckId"
                    className="block mb-2 text-sm text-gray-400"
                  >
                    Truck ID
                  </label>

                  <input
                    id="truckId"
                    type="text"
                    name="truckId"
                    value={formData.truckId}
                    readOnly
                    className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-gray-400 outline-none cursor-not-allowed"
                  />
                </div>

                {/* Plate Number */}
                <div>
                  <label
                    htmlFor="plateNumber"
                    className="block mb-2 text-sm text-gray-400"
                  >
                    Plate Number
                  </label>

                  <input
                    id="plateNumber"
                    type="text"
                    name="plateNumber"
                    value={formData.plateNumber}
                    onChange={handleChange}
                    required
                    placeholder="WP CAA-1234"
                    className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-white placeholder:text-gray-600 outline-none focus:border-amber-500"
                  />
                </div>

                {/* Truck Model */}
                <div>
                  <label
                    htmlFor="truckModel"
                    className="block mb-2 text-sm text-gray-400"
                  >
                    Truck Model
                  </label>

                  <input
                    id="truckModel"
                    type="text"
                    name="truckModel"
                    value={formData.truckModel}
                    onChange={handleChange}
                    required
                    placeholder="Isuzu NPR / Toyota Dyna"
                    className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-white placeholder:text-gray-600 outline-none focus:border-amber-500"
                  />
                </div>

                {/* Truck Type */}
                <div>
                  <label
                    htmlFor="truckType"
                    className="block mb-2 text-sm text-gray-400"
                  >
                    Truck Type
                  </label>

                  <select
                    id="truckType"
                    name="truckType"
                    value={formData.truckType}
                    onChange={handleChange}
                    required
                    className="w-full bg-[#101018] border border-white/10 rounded-lg p-3 text-white outline-none focus:border-amber-500"
                  >
                    <option value="">Select Truck Type</option>

                    <option value="Flatbed Tow Truck">
                      Flatbed Tow Truck
                    </option>

                    <option value="Wheel Lift Tow Truck">
                      Wheel Lift Tow Truck
                    </option>

                    <option value="Integrated Tow Truck">
                      Integrated Tow Truck
                    </option>

                    <option value="Heavy Duty Tow Truck">
                      Heavy Duty Tow Truck
                    </option>
                  </select>
                </div>

                {/* Capacity */}
                <div className="md:col-span-2">
                  <label
                    htmlFor="capacity"
                    className="block mb-2 text-sm text-gray-400"
                  >
                    Capacity (TONS)
                  </label>

                  <input
                    id="capacity"
                    type="number"
                    name="capacity"
                    value={formData.capacity}
                    onChange={handleChange}
                    required
                    min="0"
                    step="0.1"
                    placeholder="Example: 3"
                    className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-white placeholder:text-gray-600 outline-none focus:border-amber-500"
                  />
                </div>
              </div>
            </section>

            <div className="border-t border-white/10" />

            {/* Driver Information */}
            <section>
              <div className="flex items-center gap-3 mb-6">
                <UserRound className="text-emerald-400" size={28} />

                <h2 className="text-2xl font-bold">
                  Driver Information
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Driver ID */}
                <div>
                  <label
                    htmlFor="driverId"
                    className="block mb-2 text-sm text-gray-400"
                  >
                    Driver ID
                  </label>

                  <input
                    id="driverId"
                    type="text"
                    name="driverId"
                    value={formData.driverId}
                    readOnly
                    className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-gray-400 outline-none cursor-not-allowed"
                  />
                </div>

                {/* Driver Full Name */}
                <div>
                  <label
                    htmlFor="driverName"
                    className="block mb-2 text-sm text-gray-400"
                  >
                    Driver Full Name
                  </label>

                  <input
                    id="driverName"
                    type="text"
                    name="driverName"
                    value={formData.driverName}
                    onChange={handleChange}
                    required
                    placeholder="Enter driver full name"
                    className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-white placeholder:text-gray-600 outline-none focus:border-emerald-500"
                  />
                </div>

                {/* Driver Email */}
                <div>
                  <label
                    htmlFor="driverEmail"
                    className="block mb-2 text-sm text-gray-400"
                  >
                    Driver Email
                  </label>

                  <input
                    id="driverEmail"
                    type="email"
                    name="driverEmail"
                    value={formData.driverEmail}
                    onChange={handleChange}
                    required
                    placeholder="driver@gmail.com"
                    className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-white placeholder:text-gray-600 outline-none focus:border-emerald-500"
                  />
                </div>

                {/* Driver Contact */}
                <div>
                  <label
                    htmlFor="driverContact"
                    className="block mb-2 text-sm text-gray-400"
                  >
                    Driver Contact
                  </label>

                  <input
                    id="driverContact"
                    type="tel"
                    name="driverContact"
                    value={formData.driverContact}
                    onChange={handleChange}
                    required
                    placeholder="07XXXXXXXX"
                    className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-white placeholder:text-gray-600 outline-none focus:border-emerald-500"
                  />
                </div>

                {/* Driver NIC */}
                <div>
                  <label
                    htmlFor="driverNic"
                    className="block mb-2 text-sm text-gray-400"
                  >
                    Driver NIC
                  </label>

                  <input
                    id="driverNic"
                    type="text"
                    name="driverNic"
                    value={formData.driverNic}
                    onChange={handleChange}
                    required
                    maxLength={12}
                    placeholder="200012345678 or 901234567V"
                    className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-white placeholder:text-gray-600 outline-none focus:border-emerald-500"
                  />
                </div>

                {/* License Number */}
                <div>
                  <label
                    htmlFor="licenseNumber"
                    className="block mb-2 text-sm text-gray-400"
                  >
                    License Number
                  </label>

                  <input
                    id="licenseNumber"
                    type="text"
                    name="licenseNumber"
                    value={formData.licenseNumber}
                    onChange={handleChange}
                    required
                    placeholder="Enter license number"
                    className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-white placeholder:text-gray-600 outline-none focus:border-emerald-500"
                  />
                </div>

                {/* License Expire Date */}
                <div>
                  <label
                    htmlFor="licenseExpireDate"
                    className="block mb-2 text-sm text-gray-400"
                  >
                    License Expire Date
                  </label>

                  <input
                    id="licenseExpireDate"
                    type="date"
                    name="licenseExpireDate"
                    value={formData.licenseExpireDate}
                    onChange={handleChange}
                    required
                    className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-white outline-none focus:border-emerald-500 [color-scheme:dark]"
                  />
                </div>

                {/* Driving Experience */}
                <div>
                  <label
                    htmlFor="driverExperience"
                    className="block mb-2 text-sm text-gray-400"
                  >
                    Driving Experience (Years)
                  </label>

                  <input
                    id="driverExperience"
                    type="number"
                    name="driverExperience"
                    value={formData.driverExperience}
                    onChange={handleChange}
                    required
                    min="0"
                    placeholder="Years"
                    className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-white placeholder:text-gray-600 outline-none focus:border-emerald-500"
                  />
                </div>
              </div>
            </section>

            {/* Submit Button */}
            <div className="flex justify-center">
              <button
                type="submit"
                className="w-full md:w-auto flex items-center justify-center gap-2 px-8 py-3 bg-amber-600 hover:bg-amber-700 rounded-xl font-bold transition-all duration-300"
              >
                <Save size={18} />
                Register Truck & Driver
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}