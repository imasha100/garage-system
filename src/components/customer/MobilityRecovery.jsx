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

export default function MobilityRecovery() {
  const [vehicleStatus, setVehicleStatus] = useState("driveable");
  const [showPopup, setShowPopup] = useState(false);
  const [step, setStep] = useState(1);
  const [selectedGarage, setSelectedGarage] = useState(null);
  const [selectedTruck, setSelectedTruck] = useState(null);

  const garages = [
    {
      id: "kadawatha",
      name: "Kadawatha Hub",
      distanceKm: 15.8,
      etaMins: 35,
      freeTrucks: 0,
      x: 12,
      y: 14,
      color: "rose",
      parkedTrucks: [],
    },
    {
      id: "kaduwela",
      name: "Kaduwela Hub",
      distanceKm: 12.1,
      etaMins: 22,
      freeTrucks: 1,
      x: 20,
      y: 78,
      color: "amber",
      parkedTrucks: [{ xOffset: 5, yOffset: -5 }],
    },
    {
      id: "malabe",
      name: "Malabe Hub",
      distanceKm: 6.4,
      etaMins: 11,
      freeTrucks: 2,
      x: 55,
      y: 55,
      color: "emerald",
      parkedTrucks: [
        { xOffset: 5, yOffset: -5 },
        { xOffset: 9, yOffset: 3 },
      ],
    },
  ];

  const nearbyTrucks = [
    {
      id: "truck-1",
      number: "TRK-8842",
      driverName: "Kamal Perera",
      phone: "071-2345678",
      etaMins: 12,
      price: "LKR 8,500",
      garageId: "malabe",
      x: 70,
      y: 30,
    },
    {
      id: "truck-2",
      number: "TRK-5521",
      driverName: "Nuwan Silva",
      phone: "077-4567890",
      etaMins: 8,
      price: "LKR 7,800",
      garageId: "malabe",
      x: 84,
      y: 35,
    },
    {
      id: "truck-3",
      number: "TRK-9920",
      driverName: "Saman Jayasuriya",
      phone: "075-9876543",
      etaMins: 15,
      price: "LKR 9,200",
      garageId: "kaduwela",
      x: 72,
      y: 58,
    },
    {
      id: "truck-4",
      number: "TRK-6612",
      driverName: "Kasun Fernando",
      phone: "076-2223344",
      etaMins: 22,
      price: "LKR 10,000",
      garageId: "kaduwela",
      x: 88,
      y: 52,
    },
  ];

  const selectedDispatch = selectedTruck || nearbyTrucks[0];

  const dotColor = {
    rose: "bg-rose-500 shadow-rose-500/50",
    amber: "bg-amber-400 shadow-amber-400/50",
    emerald: "bg-emerald-400 shadow-emerald-400/50",
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
    const garage = garages.find((g) => g.id === truck.garageId);
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
      status: "Navigation Started",
    };

    localStorage.setItem(
      "currentCustomerRequest",
      JSON.stringify(updatedRequest)
    );

    alert(`Navigation started to ${selectedGarage.name}`);
    setShowPopup(false);
  };

  const handleDispatchTruck = () => {
    const existingRequest =
      JSON.parse(localStorage.getItem("currentCustomerRequest")) || {};

    const updatedRequest = {
      ...existingRequest,
      vehicleStatus: "non-driveable",
      selectedTruck,
      selectedGarage,
      status: "Tow Truck Assigned",
    };

    localStorage.setItem(
      "currentCustomerRequest",
      JSON.stringify(updatedRequest)
    );

    alert("Truck Assigned Successfully!");
    setShowPopup(false);
  };

  const renderGarageMarker = (g) => (
    <div
      key={g.id}
      onClick={() => setSelectedGarage(g)}
      className="absolute flex flex-col items-start cursor-pointer group z-10"
      style={{ left: `${g.x}%`, top: `${g.y}%` }}
    >
      {g.parkedTrucks?.map((truck, idx) => (
        <div
          key={idx}
          className="absolute z-0"
          style={{
            left: `${truck.xOffset * 7}px`,
            top: `${truck.yOffset * 7}px`,
          }}
        >
          <div className="w-6 h-6 md:w-7 md:h-7 rounded-full bg-slate-800 border border-cyan-500 flex items-center justify-center shadow-lg shadow-cyan-500/20">
            <Truck className="w-3 h-3 md:w-3.5 md:h-3.5 text-cyan-400" />
          </div>
        </div>
      ))}

      <div className="relative z-10">
        <div
          className={`w-4 h-4 md:w-5 md:h-5 rotate-45 ${dotColor[g.color]} shadow-lg transition-transform group-hover:scale-125`}
        ></div>

        {g.freeTrucks > 0 && (
          <div className="absolute -top-4 -right-4 min-w-[22px] h-[22px] rounded-full bg-cyan-500 text-white text-[10px] font-bold flex items-center justify-center shadow-lg">
            {g.freeTrucks}
          </div>
        )}
      </div>

      <div
        className={`mt-3 px-2 md:px-3 py-2 rounded-lg border backdrop-blur-sm transition-all max-w-[150px] md:max-w-none ${
          selectedGarage?.id === g.id
            ? "border-cyan-400 bg-[#111321]"
            : "border-slate-700 bg-[#11132170] group-hover:border-slate-500"
        }`}
      >
        <p className="text-[10px] md:text-[12px] font-bold text-white whitespace-nowrap">
          {g.name}
        </p>

        <p className="text-[10px] md:text-[11px] text-slate-400 mt-1">
          {g.distanceKm} KM • {g.etaMins} Mins
        </p>

        <div className="flex items-center gap-1 md:gap-2 mt-2">
          <div className="flex items-center gap-1">
            {g.freeTrucks > 0 ? (
              [...Array(g.freeTrucks)].map((_, index) => (
                <Truck
                  key={index}
                  className={`w-3 h-3 md:w-3.5 md:h-3.5 ${
                    textColor[g.color]
                  }`}
                />
              ))
            ) : (
              <Truck className="w-3 h-3 md:w-3.5 md:h-3.5 text-rose-400" />
            )}
          </div>

          <span
            className={`text-[10px] md:text-[11px] font-semibold ${
              g.freeTrucks > 0 ? textColor[g.color] : "text-rose-400"
            }`}
          >
            {g.freeTrucks > 0 ? `${g.freeTrucks} Free` : "No Free"}
          </span>
        </div>
      </div>
    </div>
  );

  const modalShellClass =
    "w-full max-w-6xl h-[92vh] md:h-[650px] bg-[#0c0d19] border border-slate-700 rounded-2xl flex flex-col md:flex-row overflow-hidden relative";

  const mapClass =
    "w-full md:flex-1 h-[42vh] md:h-full relative bg-[#070710] overflow-hidden";

  const sidePanelClass =
    "w-full md:w-[350px] h-[50vh] md:h-full border-t md:border-t-0 md:border-l border-slate-700 bg-[#0c0d19] flex flex-col";

  return (
    <div className="w-full max-w-5xl mx-auto px-4 md:px-0">
      <div className="mb-8 md:mb-10">
        <h1 className="text-3xl md:text-5xl font-black text-white uppercase tracking-wide">
          Emergency Logistics
        </h1>

        <div className="w-24 h-1 bg-cyan-400 mt-4 rounded-full"></div>

        <p className="text-slate-400 mt-6 max-w-2xl text-sm leading-7">
          Select your current vehicle condition to continue recovery support.
          Your request is already saved, so this step only updates the recovery
          method.
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

              <div className={mapClass}>
                <div
                  className="absolute inset-0 opacity-20"
                  style={{
                    backgroundImage:
                      "linear-gradient(rgba(148,163,184,0.15) 1px, transparent 1px), linear-gradient(90deg, rgba(148,163,184,0.15) 1px, transparent 1px)",
                    backgroundSize: "40px 40px",
                  }}
                ></div>

                <div className="absolute top-4 left-4 z-10">
                  <span className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-slate-500">
                    Garage Navigation Map
                  </span>
                </div>

                <div
                  className="absolute flex flex-col items-center z-10"
                  style={{ left: "78%", top: "42%" }}
                >
                  <div className="relative">
                    <div className="absolute -inset-5 md:-inset-6 rounded-full bg-violet-500/10 animate-ping"></div>
                    <div className="w-4 h-4 md:w-5 md:h-5 rotate-45 bg-violet-400 shadow-lg shadow-violet-400/60"></div>
                  </div>

                  <div className="mt-3 px-2 md:px-3 py-1.5 rounded-lg bg-[#11132190] border border-violet-500/40 backdrop-blur-sm">
                    <span className="text-[9px] md:text-[11px] font-bold uppercase tracking-wider text-violet-300">
                      Your Location
                    </span>
                  </div>
                </div>

                {garages.map((g) => renderGarageMarker(g))}

                {selectedGarage && (
                  <div
                    className="absolute border-t-2 border-dashed border-cyan-400/70 z-0 hidden md:block"
                    style={{
                      left: `${selectedGarage.x + 2}%`,
                      top: `${selectedGarage.y + 2}%`,
                      width: "260px",
                      transform: "rotate(-18deg)",
                    }}
                  ></div>
                )}
              </div>

              <div className={sidePanelClass}>
                <div className="p-4 md:p-5 border-b border-slate-700">
                  <h2 className="text-base md:text-lg font-black text-white uppercase tracking-wide">
                    Select Garage
                  </h2>
                  <p className="text-slate-500 text-xs mt-1">
                    No new request is created. Select a garage to start
                    navigation.
                  </p>
                </div>

                <div className="flex-1 overflow-y-auto p-3 md:p-4 space-y-3">
                  {garages
                    .slice()
                    .sort((a, b) => a.distanceKm - b.distanceKm)
                    .map((g) => (
                      <div
                        key={g.id}
                        onClick={() => setSelectedGarage(g)}
                        className={`cursor-pointer rounded-xl border p-3 md:p-4 transition-all ${
                          selectedGarage?.id === g.id
                            ? "border-cyan-500 bg-cyan-500/10"
                            : "border-slate-700 bg-[#10111f] hover:border-slate-500"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <MapPin
                              className={`w-4 h-4 ${textColor[g.color]}`}
                            />
                            <span className="text-white font-bold text-sm">
                              {g.name}
                            </span>
                          </div>

                          {selectedGarage?.id === g.id && (
                            <Check className="w-4 h-4 text-cyan-400" />
                          )}
                        </div>

                        <div className="flex items-center gap-3 md:gap-4 mt-3 text-xs text-slate-400">
                          <span>{g.distanceKm} KM</span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {g.etaMins} Mins
                          </span>
                          <span className="flex items-center gap-1">
                            <Truck className="w-3 h-3" />
                            {g.freeTrucks} Free
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
                      <p>Destination: {selectedGarage.name}</p>
                      <p>Distance: {selectedGarage.distanceKm} KM</p>
                      <p>Estimated Time: {selectedGarage.etaMins} Minutes</p>
                      <p>Free Trucks: {selectedGarage.freeTrucks}</p>
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

              <div className={mapClass}>
                <iframe
                  title="Nearby Tow Truck Map"
                  src="https://www.google.com/maps?q=Malabe,Sri%20Lanka&z=13&output=embed"
                  className="absolute inset-0 w-full h-full border-0"
                  loading="lazy"
                  allowFullScreen
                />

                <div className="absolute inset-0 bg-black/35"></div>

                <div className="absolute top-4 left-4 z-10">
                  <span className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-white">
                    Nearby Tow Truck Map
                  </span>
                </div>

                <div
                  className="absolute flex flex-col items-center z-10"
                  style={{ left: "78%", top: "42%" }}
                >
                  <div className="relative">
                    <div className="absolute -inset-5 md:-inset-6 rounded-full bg-violet-500/10 animate-ping"></div>
                    <div className="w-4 h-4 md:w-5 md:h-5 rotate-45 bg-violet-400 shadow-lg shadow-violet-400/60"></div>
                  </div>

                  <div className="mt-3 px-2 md:px-3 py-1.5 rounded-lg bg-[#11132190] border border-violet-500/40 backdrop-blur-sm">
                    <span className="text-[9px] md:text-[11px] font-bold uppercase tracking-wider text-violet-300">
                      Your Location
                    </span>
                  </div>
                </div>

                {garages.map((g) => renderGarageMarker(g))}

                {nearbyTrucks.map((truck) => (
                  <div
                    key={truck.id}
                    onClick={() => handleSelectTruck(truck)}
                    className="absolute flex flex-col items-center group cursor-pointer z-10"
                    style={{ left: `${truck.x}%`, top: `${truck.y}%` }}
                  >
                    <div
                      className={`w-9 h-9 md:w-11 md:h-11 rounded-full border flex items-center justify-center shadow-lg transition-all duration-300 ${
                        selectedTruck?.id === truck.id
                          ? "bg-cyan-500 border-cyan-200 shadow-cyan-500/50 scale-110"
                          : "bg-red-600 border-red-300 shadow-red-500/50 group-hover:scale-110"
                      }`}
                    >
                      <Truck className="w-4 h-4 md:w-5 md:h-5 text-white" />
                    </div>

                    <div
                      className={`mt-2 transition-all duration-300 bg-[#111321] rounded-lg px-2 md:px-3 py-2 whitespace-nowrap border ${
                        selectedTruck?.id === truck.id
                          ? "opacity-100 border-cyan-400"
                          : "opacity-0 group-hover:opacity-100 border-red-500/40"
                      }`}
                    >
                      <p className="text-[10px] md:text-xs font-bold text-white">
                        {truck.number}
                      </p>
                      <p className="text-[10px] md:text-[11px] text-slate-400">
                        {truck.driverName}
                      </p>
                      <p className="text-[10px] md:text-[11px] text-cyan-400">
                        ETA {truck.etaMins} mins
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className={sidePanelClass}>
                <div className="p-4 md:p-5 border-b border-slate-700">
                  <h2 className="text-base md:text-lg font-black text-white uppercase tracking-wide">
                    Select Tow Truck
                  </h2>
                  <p className="text-slate-500 text-xs mt-1">
                    Existing request will be updated with assigned truck.
                  </p>
                </div>

                <div className="flex-1 overflow-y-auto p-3 md:p-4 space-y-3">
                  {nearbyTrucks
                    .slice()
                    .sort((a, b) => a.etaMins - b.etaMins)
                    .map((truck) => {
                      const garage = garages.find(
                        (g) => g.id === truck.garageId
                      );

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
                              <Clock className="w-3 h-3" />
                              ETA {truck.etaMins} Minutes
                            </p>

                            <p className="flex items-center gap-2">
                              <MapPin className="w-3 h-3" />
                              {garage?.name || "Nearest Hub"}
                            </p>
                          </div>

                          <div className="mt-3 flex items-center justify-between">
                            <span className="text-[11px] text-slate-500 uppercase">
                              Tow Charge
                            </span>
                            <span className="text-sm font-bold text-white">
                              {truck.price}
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
                  From {selectedGarage.name}
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
                  <span className="text-slate-400">ETA</span>
                  <span className="text-white text-right">
                    {selectedDispatch.etaMins} Minutes
                  </span>
                </div>

                <div className="flex justify-between gap-4">
                  <span className="text-slate-400">Price</span>
                  <span className="text-white font-bold text-right">
                    {selectedDispatch.price}
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
                  <span className="text-slate-400">ETA</span>
                  <span className="text-white">
                    {selectedDispatch.etaMins} Minutes
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