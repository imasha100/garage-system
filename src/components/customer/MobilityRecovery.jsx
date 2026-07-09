import React, { useState } from "react";
import {
  Car,
  AlertTriangle,
  Rocket,
  ArrowRight,
  X,
  Check,
  MapPin,
  Truck,
  Clock,
  Users,
  ChevronRight,
  Phone,
  Route,
} from "lucide-react";

import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  CircleMarker,
  Polyline,
} from "react-leaflet";

import "leaflet/dist/leaflet.css";
import L from "leaflet";

delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

const truckIcon = new L.Icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/1048/1048313.png",
  iconSize: [36, 36],
  iconAnchor: [18, 18],
});

export default function MobilityRecovery() {
  const [vehicleStatus, setVehicleStatus] = useState("driveable");
  const [showPopup, setShowPopup] = useState(false);
  const [step, setStep] = useState(1);
  const [selectedGarage, setSelectedGarage] = useState(null);
  const [selectedTruck, setSelectedTruck] = useState(null);

  const saegisLocation = [6.8728, 79.8887];

  const calculateTowPrice = (distanceKm) => {
    const baseCharge = 3500;
    const perKmCharge = 600;
    return baseCharge + distanceKm * perKmCharge;
  };

  const formatLKR = (amount) => {
    return `LKR ${Math.round(amount).toLocaleString("en-LK")}`;
  };

  const garages = [
    {
      id: "kohuwala",
      name: "Kohuwala Auto Care",
      distanceKm: 0.4,
      etaMins: 3,
      freeTrucks: 2,
      color: "emerald",
      lat: 6.8721,
      lng: 79.8852,
    },
    {
      id: "nugegoda",
      name: "Nugegoda Service Hub",
      distanceKm: 1.2,
      etaMins: 6,
      freeTrucks: 1,
      color: "emerald",
      lat: 6.8729,
      lng: 79.8996,
    },
    {
      id: "kirulapone",
      name: "Kirulapone Garage Point",
      distanceKm: 1.8,
      etaMins: 8,
      freeTrucks: 2,
      color: "amber",
      lat: 6.8797,
      lng: 79.8746,
    },
    {
      id: "dehiwala",
      name: "Dehiwala Motor Works",
      distanceKm: 3.2,
      etaMins: 13,
      freeTrucks: 1,
      color: "amber",
      lat: 6.8519,
      lng: 79.8655,
    },
    {
      id: "maharagama",
      name: "Maharagama Auto Tech",
      distanceKm: 5.0,
      etaMins: 18,
      freeTrucks: 1,
      color: "amber",
      lat: 6.848,
      lng: 79.9265,
    },
    {
      id: "piliyandala",
      name: "Piliyandala Recovery Hub",
      distanceKm: 8.7,
      etaMins: 28,
      freeTrucks: 0,
      color: "rose",
      lat: 6.8018,
      lng: 79.9227,
    },
  ];

  const parkedTrucks = [
    {
      id: "truck-1",
      number: "TRK-8842",
      driverName: "Kamal Perera",
      phone: "071-2345678",
      garageId: "kohuwala",
    },
    {
      id: "truck-2",
      number: "TRK-5521",
      driverName: "Nuwan Silva",
      phone: "077-4567890",
      garageId: "kohuwala",
    },
    {
      id: "truck-3",
      number: "TRK-9920",
      driverName: "Saman Jayasuriya",
      phone: "075-9876543",
      garageId: "nugegoda",
    },
    {
      id: "truck-4",
      number: "TRK-6612",
      driverName: "Kasun Fernando",
      phone: "076-2223344",
      garageId: "kirulapone",
    },
    {
      id: "truck-5",
      number: "TRK-7401",
      driverName: "Lahiru Fernando",
      phone: "078-1112233",
      garageId: "kirulapone",
    },
    {
      id: "truck-6",
      number: "TRK-3188",
      driverName: "Milan Jayasinghe",
      phone: "070-6677889",
      garageId: "dehiwala",
    },
    {
      id: "truck-7",
      number: "TRK-4567",
      driverName: "Dilan Perera",
      phone: "072-4455667",
      garageId: "maharagama",
    },
  ];

  const selectedDispatch = selectedTruck || parkedTrucks[0];

  const getGarageByTruck = (truck) => {
    return garages.find((g) => g.id === truck?.garageId);
  };

  const getTrucksByGarage = (garageId) => {
    return parkedTrucks.filter((truck) => truck.garageId === garageId);
  };

  const getTruckDistanceText = (truck) => {
    const garage = getGarageByTruck(truck);
    return garage
      ? `${garage.distanceKm} KM • ${garage.etaMins} Minutes`
      : "Distance N/A";
  };

  const getTowChargeByTruck = (truck) => {
    const garage = getGarageByTruck(truck);
    return formatLKR(calculateTowPrice(garage?.distanceKm || 0));
  };

  const textColor = {
    rose: "text-rose-400",
    amber: "text-amber-400",
    emerald: "text-emerald-400",
  };

  const handleStart = () => {
    setSelectedGarage(null);
    setSelectedTruck(null);
    setShowPopup(true);
    setStep(vehicleStatus === "driveable" ? 3 : 0);
  };

  const handleSelectTruck = (truck) => {
    const garage = getGarageByTruck(truck);
    setSelectedTruck(truck);
    setSelectedGarage(garage || null);
  };

  const handleRequestTruck = () => {
    if (!selectedTruck) return;
    setStep(1);
  };

  const handleStartNavigation = () => {
    if (!selectedGarage) return;

    const existingRequest =
      JSON.parse(localStorage.getItem("currentCustomerRequest")) || {};

    const updatedRequest = {
      ...existingRequest,
      vehicleStatus: "driveable",
      selectedGarage,
      currentLocation: "Saegis Campus",
      status: "Navigation Started",
    };

    localStorage.setItem(
      "currentCustomerRequest",
      JSON.stringify(updatedRequest)
    );

    alert(`Navigation started from Saegis Campus to ${selectedGarage.name}`);
    setShowPopup(false);
  };

  const handleDispatchTruck = () => {
    const garage = getGarageByTruck(selectedTruck);
    const towCharge = getTowChargeByTruck(selectedTruck);

    const existingRequest =
      JSON.parse(localStorage.getItem("currentCustomerRequest")) || {};

    const updatedRequest = {
      ...existingRequest,
      vehicleStatus: "non-driveable",
      currentLocation: "Saegis Campus",
      selectedTruck: {
        ...selectedTruck,
        price: towCharge,
        distanceKm: garage?.distanceKm,
        etaMins: garage?.etaMins,
        status: "Parked at Garage",
      },
      selectedGarage: garage,
      towCharge,
      status: "Tow Truck Assigned",
    };

    localStorage.setItem(
      "currentCustomerRequest",
      JSON.stringify(updatedRequest)
    );

    alert(`Truck Assigned Successfully! Charge: ${towCharge}`);
    setShowPopup(false);
  };

  const modalShellClass =
    "w-full max-w-6xl h-[92vh] md:h-[650px] bg-[#0c0d19] border border-slate-700 rounded-2xl flex flex-col md:flex-row overflow-hidden relative";

  const mapClass =
    "w-full md:flex-1 h-[42vh] md:h-full relative bg-[#070710] overflow-hidden";

  const sidePanelClass =
    "w-full md:w-[350px] h-[50vh] md:h-full border-t md:border-t-0 md:border-l border-slate-700 bg-[#0c0d19] flex flex-col";

  const renderMap = (type = "garage") => (
    <MapContainer
      center={saegisLocation}
      zoom={13}
      scrollWheelZoom={true}
      className="w-full h-full z-0"
    >
      <TileLayer
        attribution='&copy; OpenStreetMap contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      <CircleMarker
        center={saegisLocation}
        radius={11}
        pathOptions={{
          color: "#a78bfa",
          fillColor: "#a78bfa",
          fillOpacity: 0.9,
        }}
      >
        <Popup>
          <strong>Saegis Campus</strong>
          <br />
          Current Location
        </Popup>
      </CircleMarker>

      {garages.map((garage) => {
        const garageTrucks = getTrucksByGarage(garage.id);

        return (
          <Marker
            key={garage.id}
            position={[garage.lat, garage.lng]}
            eventHandlers={{
              click: () => setSelectedGarage(garage),
            }}
          >
            <Popup>
              <strong>{garage.name}</strong>
              <br />
              Distance: {garage.distanceKm} KM
              <br />
              ETA: {garage.etaMins} Mins
              <br />
              Parked Trucks: {garageTrucks.length}
            </Popup>
          </Marker>
        );
      })}

      {type === "truck" &&
        parkedTrucks.map((truck, index) => {
          const garage = getGarageByTruck(truck);
          if (!garage) return null;

          const offset = (index % 3) * 0.00045;

          return (
            <Marker
              key={truck.id}
              position={[garage.lat + offset, garage.lng + offset]}
              icon={truckIcon}
              eventHandlers={{
                click: () => handleSelectTruck(truck),
              }}
            >
              <Popup>
                <strong>{truck.number}</strong>
                <br />
                Driver: {truck.driverName}
                <br />
                Phone: {truck.phone}
                <br />
                Status: Parked at Garage
                <br />
                Garage: {garage.name}
                <br />
                Distance / ETA: {garage.distanceKm} KM • {garage.etaMins} Mins
                <br />
                Price: {getTowChargeByTruck(truck)}
              </Popup>
            </Marker>
          );
        })}

      {selectedGarage && (
        <Polyline
          positions={[saegisLocation, [selectedGarage.lat, selectedGarage.lng]]}
          pathOptions={{
            color: "#22d3ee",
            weight: 5,
            dashArray: "10 8",
          }}
        />
      )}
    </MapContainer>
  );

  return (
    <div className="w-full max-w-5xl mx-auto px-4 md:px-0">
      <div className="mb-8 md:mb-10">
        <h1 className="text-3xl md:text-5xl font-black text-white uppercase tracking-wide">
          Emergency Logistics
        </h1>

        <div className="w-24 h-1 bg-cyan-400 mt-4 rounded-full"></div>

        <p className="text-slate-400 mt-6 max-w-2xl text-sm leading-7">
          Select your current vehicle condition to continue recovery support.
          Current location is fixed as Saegis Campus.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
        <div
          onClick={() => setVehicleStatus("driveable")}
          className={`cursor-pointer rounded-xl border p-5 md:p-8 transition-all duration-300 hover:scale-[1.02] ${
            vehicleStatus === "driveable"
              ? "border-cyan-500 bg-cyan-500/10 shadow-lg shadow-cyan-500/20"
              : "border-slate-700 bg-[#0c0d19] hover:border-cyan-700"
          }`}
        >
          <div className="flex items-center gap-4 md:gap-5">
            <div className="w-12 h-12 md:w-14 md:h-14 rounded-lg bg-cyan-500/10 flex items-center justify-center">
              <Car className="w-7 h-7 md:w-8 md:h-8 text-cyan-400" />
            </div>

            <div>
              <h2 className="text-lg md:text-xl font-bold text-white uppercase">
                Driveable
              </h2>
              <p className="text-slate-400 text-xs md:text-sm mt-1">
                Vehicle can continue driving safely to a selected garage.
              </p>
            </div>
          </div>
        </div>

        <div
          onClick={() => setVehicleStatus("non-driveable")}
          className={`cursor-pointer rounded-xl border p-5 md:p-8 transition-all duration-300 hover:scale-[1.02] ${
            vehicleStatus === "non-driveable"
              ? "border-red-500 bg-red-500/10 shadow-lg shadow-red-500/20"
              : "border-slate-700 bg-[#0c0d19] hover:border-red-700"
          }`}
        >
          <div className="flex items-center gap-4 md:gap-5">
            <div className="w-12 h-12 md:w-14 md:h-14 rounded-lg bg-red-500/10 flex items-center justify-center">
              <AlertTriangle className="w-7 h-7 md:w-8 md:h-8 text-red-400" />
            </div>

            <div>
              <h2 className="text-lg md:text-xl font-bold text-white uppercase">
                Non Driveable
              </h2>
              <p className="text-slate-400 text-xs md:text-sm mt-1">
                Vehicle requires towing or emergency roadside recovery.
              </p>
            </div>
          </div>
        </div>
      </div>

      <button
        onClick={handleStart}
        className={`mt-8 md:mt-10 w-full rounded-xl p-4 md:p-5 transition-all duration-300 flex items-center justify-between font-bold uppercase tracking-wider text-sm md:text-base ${
          vehicleStatus === "driveable"
            ? "bg-cyan-600 hover:bg-cyan-500"
            : "bg-red-700 hover:bg-red-600"
        }`}
      >
        <div className="flex items-center gap-3 md:gap-4">
          <Rocket className="w-5 h-5 md:w-6 md:h-6" />
          <span>
            {vehicleStatus === "driveable"
              ? "Start Guided Recovery"
              : "Initiate Emergency Tow Dispatch"}
          </span>
        </div>

        <ArrowRight className="w-5 h-5 md:w-6 md:h-6" />
      </button>

      {showPopup && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-2 md:p-4">
          {step === 3 && (
            <div className={modalShellClass}>
              <button
                onClick={() => setShowPopup(false)}
                className="absolute top-3 right-3 md:top-4 md:right-4 text-slate-400 hover:text-white z-30 bg-slate-900/70 md:bg-transparent rounded-full p-1"
              >
                <X className="w-5 h-5" />
              </button>

              <div className={mapClass}>{renderMap("garage")}</div>

              <div className={sidePanelClass}>
                <div className="p-4 md:p-5 border-b border-slate-700">
                  <h2 className="text-base md:text-lg font-black text-white uppercase tracking-wide">
                    Select Garage
                  </h2>
                  <p className="text-slate-500 text-xs mt-1">
                    Select garage around Saegis Campus.
                  </p>
                </div>

                <div className="flex-1 overflow-y-auto p-3 md:p-4 space-y-3">
                  {garages
                    .slice()
                    .sort((a, b) => a.distanceKm - b.distanceKm)
                    .map((garage) => (
                      <div
                        key={garage.id}
                        onClick={() => setSelectedGarage(garage)}
                        className={`cursor-pointer rounded-xl border p-3 md:p-4 transition-all ${
                          selectedGarage?.id === garage.id
                            ? "border-cyan-500 bg-cyan-500/10"
                            : "border-slate-700 bg-[#10111f] hover:border-slate-500"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <MapPin
                              className={`w-4 h-4 ${textColor[garage.color]}`}
                            />
                            <span className="text-white font-bold text-sm">
                              {garage.name}
                            </span>
                          </div>

                          {selectedGarage?.id === garage.id && (
                            <Check className="w-4 h-4 text-cyan-400" />
                          )}
                        </div>

                        <div className="flex items-center gap-3 md:gap-4 mt-3 text-xs text-slate-400">
                          <span>{garage.distanceKm} KM</span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {garage.etaMins} Mins
                          </span>
                          <span className="flex items-center gap-1">
                            <Truck className="w-3 h-3" />
                            {getTrucksByGarage(garage.id).length} Parked
                          </span>
                        </div>
                      </div>
                    ))}
                </div>

                {selectedGarage && (
                  <div className="mx-3 md:mx-4 mb-3 rounded-xl border border-cyan-500/30 bg-cyan-500/10 p-3 md:p-4 text-sm">
                    <div className="flex items-center gap-2 text-cyan-300 font-bold">
                      <Route className="w-4 h-4" />
                      Navigation Details
                    </div>

                    <div className="mt-3 space-y-2 text-xs text-slate-300">
                      <p>From: Saegis Campus</p>
                      <p>Destination: {selectedGarage.name}</p>
                      <p>Distance: {selectedGarage.distanceKm} KM</p>
                      <p>Estimated Time: {selectedGarage.etaMins} Minutes</p>
                      <p>
                        Parked Trucks:{" "}
                        {getTrucksByGarage(selectedGarage.id).length}
                      </p>
                    </div>
                  </div>
                )}

                <div className="p-3 md:p-4 border-t border-slate-700 space-y-3">
                  <button
                    disabled={!selectedGarage}
                    onClick={handleStartNavigation}
                    className={`w-full py-3 rounded-xl font-bold uppercase tracking-wide text-sm flex items-center justify-center gap-2 transition-all ${
                      selectedGarage
                        ? "bg-cyan-600 hover:bg-cyan-500 text-white"
                        : "bg-slate-800 text-slate-500 cursor-not-allowed"
                    }`}
                  >
                    Start Navigation
                    <ChevronRight className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => setShowPopup(false)}
                    className="w-full py-3 rounded-xl font-bold uppercase tracking-wide text-sm bg-slate-700 hover:bg-slate-600 text-white"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}

          {step === 0 && (
            <div className={modalShellClass}>
              <button
                onClick={() => setShowPopup(false)}
                className="absolute top-3 right-3 md:top-4 md:right-4 text-slate-400 hover:text-white z-30 bg-slate-900/70 md:bg-transparent rounded-full p-1"
              >
                <X className="w-5 h-5" />
              </button>

              <div className={mapClass}>{renderMap("truck")}</div>

              <div className={sidePanelClass}>
                <div className="p-4 md:p-5 border-b border-slate-700">
                  <h2 className="text-base md:text-lg font-black text-white uppercase tracking-wide">
                    Select Tow Truck
                  </h2>
                  <p className="text-slate-500 text-xs mt-1">
                    All trucks are parked at garages. Distance and ETA are based
                    on the garage location.
                  </p>
                </div>

                <div className="flex-1 overflow-y-auto p-3 md:p-4 space-y-3">
                  {parkedTrucks
                    .slice()
                    .sort((a, b) => {
                      const garageA = getGarageByTruck(a);
                      const garageB = getGarageByTruck(b);
                      return (
                        (garageA?.distanceKm || 0) -
                        (garageB?.distanceKm || 0)
                      );
                    })
                    .map((truck) => {
                      const garage = getGarageByTruck(truck);

                      return (
                        <div
                          key={truck.id}
                          onClick={() => handleSelectTruck(truck)}
                          className={`cursor-pointer rounded-xl border p-3 md:p-4 transition-all ${
                            selectedTruck?.id === truck.id
                              ? "border-cyan-500 bg-cyan-500/10"
                              : "border-slate-700 bg-[#10111f] hover:border-slate-500"
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Truck className="w-4 h-4 text-red-400" />
                              <span className="text-white font-bold text-sm">
                                {truck.number}
                              </span>
                            </div>

                            {selectedTruck?.id === truck.id && (
                              <Check className="w-4 h-4 text-cyan-400" />
                            )}
                          </div>

                          <div className="mt-3 space-y-2 text-xs text-slate-400">
                            <p className="flex items-center gap-2">
                              <Users className="w-3 h-3" />
                              {truck.driverName}
                            </p>

                            <p className="flex items-center gap-2">
                              <Phone className="w-3 h-3" />
                              {truck.phone}
                            </p>

                            <p className="flex items-center gap-2">
                              <MapPin className="w-3 h-3" />
                              Parked at {garage?.name || "Garage"}
                            </p>

                            <p className="flex items-center gap-2">
                              <Clock className="w-3 h-3" />
                              {getTruckDistanceText(truck)}
                            </p>
                          </div>

                          <div className="mt-3 flex items-center justify-between">
                            <span className="text-[11px] text-slate-500 uppercase">
                              Tow Charge
                            </span>
                            <span className="text-sm font-bold text-white">
                              {getTowChargeByTruck(truck)}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                </div>

                <div className="p-3 md:p-4 border-t border-slate-700 space-y-3">
                  <button
                    disabled={!selectedTruck}
                    onClick={handleRequestTruck}
                    className={`w-full py-3 rounded-xl font-bold uppercase tracking-wide text-sm flex items-center justify-center gap-2 transition-all ${
                      selectedTruck
                        ? "bg-red-700 hover:bg-red-600 text-white"
                        : "bg-slate-800 text-slate-500 cursor-not-allowed"
                    }`}
                  >
                    Assign Selected Truck
                    <ChevronRight className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => setShowPopup(false)}
                    className="w-full py-3 rounded-xl font-bold uppercase tracking-wide text-sm bg-slate-700 hover:bg-slate-600 text-white"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}

          {step === 1 && (
            <div className="w-full max-w-[520px] max-h-[90vh] overflow-y-auto bg-[#0c0d19] border border-slate-700 rounded-2xl p-5 md:p-6 relative">
              <button
                onClick={() => setShowPopup(false)}
                className="absolute top-4 right-4 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>

              <h2 className="text-xl md:text-2xl font-black text-white uppercase text-center">
                Tow Truck Details
              </h2>

              {selectedGarage && (
                <p className="text-center text-xs text-cyan-400 uppercase tracking-wide mt-2">
                  Parked at {selectedGarage.name}
                </p>
              )}

              <div className="mt-6 space-y-3 text-sm">
                <div className="flex justify-between gap-4">
                  <span className="text-slate-400">Driver Name</span>
                  <span className="text-white text-right">
                    {selectedDispatch.driverName}
                  </span>
                </div>

                <div className="flex justify-between gap-4">
                  <span className="text-slate-400">Phone</span>
                  <span className="text-white text-right">
                    {selectedDispatch.phone}
                  </span>
                </div>

                <div className="flex justify-between gap-4">
                  <span className="text-slate-400">Truck Number</span>
                  <span className="text-white text-right">
                    {selectedDispatch.number}
                  </span>
                </div>

                <div className="flex justify-between gap-4">
                  <span className="text-slate-400">Distance / ETA</span>
                  <span className="text-white text-right">
                    {getTruckDistanceText(selectedDispatch)}
                  </span>
                </div>

                <div className="flex justify-between gap-4">
                  <span className="text-slate-400">Price</span>
                  <span className="text-white font-bold text-right">
                    {getTowChargeByTruck(selectedDispatch)}
                  </span>
                </div>
              </div>

              <div className="mt-6 flex gap-3">
                <button
                  onClick={() => setStep(0)}
                  className="w-1/2 bg-slate-700 hover:bg-slate-600 text-white font-bold py-3 rounded-xl"
                >
                  Back
                </button>

                <button
                  onClick={() => setStep(2)}
                  className="w-1/2 bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-3 rounded-xl"
                >
                  Continue
                </button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="w-full max-w-[520px] max-h-[90vh] overflow-y-auto bg-[#0c0d19] border border-slate-700 rounded-2xl p-5 md:p-6 relative">
              <button
                onClick={() => setShowPopup(false)}
                className="absolute top-4 right-4 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>

              <h2 className="text-xl md:text-2xl font-black text-white text-center uppercase">
                Confirm Truck Assignment
              </h2>

              <p className="text-slate-400 text-center mt-4 text-sm">
                This will update the existing customer request with the selected
                tow truck.
              </p>

              <div className="mt-6 rounded-xl border border-slate-700 bg-[#10111f] p-4 text-sm space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-400">Truck</span>
                  <span className="text-white font-bold">
                    {selectedDispatch.number}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-slate-400">Driver</span>
                  <span className="text-white">
                    {selectedDispatch.driverName}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-slate-400">Distance / ETA</span>
                  <span className="text-white">
                    {getTruckDistanceText(selectedDispatch)}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-slate-400">Tow Charge</span>
                  <span className="text-white font-bold">
                    {getTowChargeByTruck(selectedDispatch)}
                  </span>
                </div>
              </div>

              <div className="mt-6 flex gap-3">
                <button
                  onClick={() => setShowPopup(false)}
                  className="w-1/2 bg-slate-700 hover:bg-slate-600 text-white py-3 rounded-xl"
                >
                  Cancel
                </button>

                <button
                  onClick={handleDispatchTruck}
                  className="w-1/2 bg-green-600 hover:bg-green-500 text-white py-3 rounded-xl flex items-center justify-center gap-2"
                >
                  <Check className="w-4 h-4" />
                  Confirm
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}