import React, { useState } from "react";
import {
  Car,
  AlertTriangle,
  Rocket,
  ArrowRight,
  Phone,
  X,
  Check,
  MapPin,
  Truck,
  Clock,
  Users,
  ChevronRight,
} from "lucide-react";

export default function MobilityRecovery() {
  const [vehicleStatus, setVehicleStatus] = useState("driveable");
  const [showPopup, setShowPopup] = useState(false);
  const [step, setStep] = useState(1);
  const [selectedGarage, setSelectedGarage] = useState(null);

  const dispatchData = {
    driverName: "Kamal Perera",
    phone: "071-2345678",
    truckNumber: "TRK-8842",
    eta: "12 Minutes",
    price: "LKR 8,500",
  };

  // Garages positioned around the user's current location (% based, matches map mock)
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
    },
  ];

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
    setShowPopup(true);
    setStep(vehicleStatus === "non-driveable" ? 0 : 1); // step 0 = garage map
  };

  const handleRequestGarage = (garage) => {
    setSelectedGarage(garage);
    setStep(1);
  };

  return (
    <div className="w-full max-w-5xl mx-auto">
      {/* Heading */}
      <div className="mb-10">
        <h1 className="text-4xl md:text-5xl font-black text-white uppercase tracking-wide">
          Emergency Logistics
        </h1>

        <div className="w-24 h-1 bg-cyan-400 mt-4 rounded-full"></div>

        <p className="text-slate-400 mt-6 max-w-2xl text-sm leading-7">
          Select your current vehicle condition to initiate the appropriate
          recovery procedure. The system will automatically prepare the
          required logistics and roadside assistance workflow.
        </p>
      </div>

      {/* Vehicle Status Options */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Driveable */}
        <div
          onClick={() => setVehicleStatus("driveable")}
          className={`cursor-pointer rounded-xl border p-8 transition-all duration-300 hover:scale-[1.02]
            ${
              vehicleStatus === "driveable"
                ? "border-cyan-500 bg-cyan-500/10 shadow-lg shadow-cyan-500/20"
                : "border-slate-700 bg-[#0c0d19] hover:border-cyan-700"
            }`}
        >
          <div className="flex items-center gap-5">
            <div className="w-14 h-14 rounded-lg bg-cyan-500/10 flex items-center justify-center">
              <Car className="w-8 h-8 text-cyan-400" />
            </div>

            <div>
              <h2 className="text-xl font-bold text-white uppercase">
                Driveable
              </h2>
              <p className="text-slate-400 text-sm mt-1">
                Vehicle can continue driving safely to the selected garage.
              </p>
            </div>
          </div>
        </div>

        {/* Non Driveable */}
        <div
          onClick={() => setVehicleStatus("non-driveable")}
          className={`cursor-pointer rounded-xl border p-8 transition-all duration-300 hover:scale-[1.02]
            ${
              vehicleStatus === "non-driveable"
                ? "border-red-500 bg-red-500/10 shadow-lg shadow-red-500/20"
                : "border-slate-700 bg-[#0c0d19] hover:border-red-700"
            }`}
        >
          <div className="flex items-center gap-5">
            <div className="w-14 h-14 rounded-lg bg-red-500/10 flex items-center justify-center">
              <AlertTriangle className="w-8 h-8 text-red-400" />
            </div>

            <div>
              <h2 className="text-xl font-bold text-white uppercase">
                Non Driveable
              </h2>
              <p className="text-slate-400 text-sm mt-1">
                Vehicle requires towing or emergency roadside recovery.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Emergency Button */}
      <button
        onClick={handleStart}
        className={`mt-10 w-full rounded-xl p-5 transition-all duration-300 flex items-center justify-between font-bold uppercase tracking-wider
          ${
            vehicleStatus === "driveable"
              ? "bg-cyan-600 hover:bg-cyan-500"
              : "bg-red-700 hover:bg-red-600"
          }`}
      >
        <div className="flex items-center gap-4">
          <Rocket className="w-6 h-6" />

          <span>
            {vehicleStatus === "driveable"
              ? "Start Guided Recovery"
              : "Initiate Emergency Tow Dispatch"}
          </span>
        </div>

        <ArrowRight className="w-6 h-6" />
      </button>

      {/* 🔥 DISPATCH POPUP MODAL */}
      {showPopup && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          {/* STEP 0 - MAP + GARAGE PANEL (non-driveable flow) */}
          {step === 0 && (
            <div className="w-full max-w-5xl h-[600px] bg-[#0c0d19] border border-slate-700 rounded-2xl flex overflow-hidden relative">
              {/* Close */}
              <button
                onClick={() => setShowPopup(false)}
                className="absolute top-4 right-4 text-slate-400 hover:text-white z-20"
              >
                <X className="w-5 h-5" />
              </button>

              {/* MAP AREA */}
              <div className="flex-1 relative bg-[#070710] overflow-hidden">
                {/* faint grid lines for map texture */}
                <div
                  className="absolute inset-0 opacity-20"
                  style={{
                    backgroundImage:
                      "linear-gradient(rgba(148,163,184,0.15) 1px, transparent 1px), linear-gradient(90deg, rgba(148,163,184,0.15) 1px, transparent 1px)",
                    backgroundSize: "40px 40px",
                  }}
                ></div>

                {/* Header label */}
                <div className="absolute top-4 left-4 z-10">
                  <span className="text-xs font-bold uppercase tracking-widest text-slate-500">
                    Nearby Recovery Garages
                  </span>
                </div>

                {/* Current location marker */}
                <div
                  className="absolute flex flex-col items-center"
                  style={{ left: "78%", top: "42%" }}
                >
                  <div className="w-4 h-4 rotate-45 bg-violet-400 shadow-lg shadow-violet-400/60"></div>
                  <div className="mt-2 px-3 py-1.5 rounded-lg bg-[#11132170] border border-violet-500/40 backdrop-blur-sm">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-violet-300">
                      Your Current Location
                    </span>
                  </div>
                </div>

                {/* Garage markers */}
                {garages.map((g) => (
                  <div
                    key={g.id}
                    onClick={() => setSelectedGarage(g)}
                    className="absolute flex flex-col items-start cursor-pointer group"
                    style={{ left: `${g.x}%`, top: `${g.y}%` }}
                  >
                    <div
                      className={`w-4 h-4 rotate-45 ${dotColor[g.color]} shadow-lg transition-transform group-hover:scale-125`}
                    ></div>

                    <div
                      className={`mt-2 px-3 py-2 rounded-lg border backdrop-blur-sm transition-all
                        ${
                          selectedGarage?.id === g.id
                            ? "border-cyan-400 bg-[#11132190]"
                            : "border-slate-700 bg-[#11132170] group-hover:border-slate-500"
                        }`}
                    >
                      <p className="text-[12px] font-bold text-white whitespace-nowrap">
                        {g.name}{" "}
                        <span className="text-slate-400 font-normal">
                          [{g.distanceKm} KM | {g.etaMins} Mins]
                        </span>
                      </p>
                      <div className="flex items-center gap-1 mt-1">
                        <Users className="w-3 h-3 text-slate-400" />
                        <span className="text-[11px] text-slate-400">
                          Free:{" "}
                          <span className={`font-bold ${textColor[g.color]}`}>
                            {g.freeTrucks}
                          </span>
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* RIGHT SIDE PANEL */}
              <div className="w-[320px] border-l border-slate-700 bg-[#0c0d19] flex flex-col">
                <div className="p-5 border-b border-slate-700">
                  <h2 className="text-lg font-black text-white uppercase tracking-wide">
                    Select Garage
                  </h2>
                  <p className="text-slate-500 text-xs mt-1">
                    Choose a garage to dispatch the nearest available truck.
                  </p>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  {garages
                    .slice()
                    .sort((a, b) => a.distanceKm - b.distanceKm)
                    .map((g) => (
                      <div
                        key={g.id}
                        onClick={() => setSelectedGarage(g)}
                        className={`cursor-pointer rounded-xl border p-4 transition-all
                          ${
                            selectedGarage?.id === g.id
                              ? "border-cyan-500 bg-cyan-500/10"
                              : "border-slate-700 bg-[#10111f] hover:border-slate-500"
                          }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <MapPin className={`w-4 h-4 ${textColor[g.color]}`} />
                            <span className="text-white font-bold text-sm">
                              {g.name}
                            </span>
                          </div>
                          {selectedGarage?.id === g.id && (
                            <Check className="w-4 h-4 text-cyan-400" />
                          )}
                        </div>

                        <div className="flex items-center gap-4 mt-3 text-xs text-slate-400">
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

                        {g.freeTrucks === 0 && (
                          <p className="mt-2 text-[11px] text-rose-400 uppercase tracking-wide font-bold">
                            No trucks available
                          </p>
                        )}
                      </div>
                    ))}
                </div>

                <div className="p-4 border-t border-slate-700 space-y-3">
                  <button
                    disabled={!selectedGarage || selectedGarage.freeTrucks === 0}
                    onClick={() => handleRequestGarage(selectedGarage)}
                    className={`w-full py-3 rounded-xl font-bold uppercase tracking-wide text-sm flex items-center justify-center gap-2 transition-all
                      ${
                        selectedGarage && selectedGarage.freeTrucks > 0
                          ? "bg-red-700 hover:bg-red-600 text-white"
                          : "bg-slate-800 text-slate-500 cursor-not-allowed"
                      }`}
                  >
                    Request Truck
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

          {/* STEP 1 - DETAILS */}
          {step === 1 && (
            <div className="w-full max-w-[520px] bg-[#0c0d19] border border-slate-700 rounded-2xl p-6 relative">
              <button
                onClick={() => setShowPopup(false)}
                className="absolute top-4 right-4 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>

              <h2 className="text-2xl font-black text-white uppercase text-center">
                DISPATCH DETAILS
              </h2>

              {selectedGarage && (
                <p className="text-center text-xs text-cyan-400 uppercase tracking-wide mt-2">
                  From {selectedGarage.name}
                </p>
              )}

              <div className="mt-6 space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-400">Driver Name</span>
                  <span className="text-white">{dispatchData.driverName}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-slate-400">Phone</span>
                  <span className="text-white">{dispatchData.phone}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-slate-400">Truck Number</span>
                  <span className="text-white">{dispatchData.truckNumber}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-slate-400">ETA</span>
                  <span className="text-white">
                    {selectedGarage ? `${selectedGarage.etaMins} Minutes` : dispatchData.eta}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-slate-400">Price</span>
                  <span className="text-white font-bold">{dispatchData.price}</span>
                </div>
              </div>

              <div className="mt-6 flex gap-3">
                {vehicleStatus === "non-driveable" && (
                  <button
                    onClick={() => setStep(0)}
                    className="w-1/2 bg-slate-700 hover:bg-slate-600 text-white font-bold py-3 rounded-xl"
                  >
                    Back
                  </button>
                )}
                <button
                  onClick={() => setStep(2)}
                  className={`${
                    vehicleStatus === "non-driveable" ? "w-1/2" : "w-full"
                  } bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-3 rounded-xl`}
                >
                  Continue
                </button>
              </div>
            </div>
          )}

          {/* STEP 2 - CONFIRMATION */}
          {step === 2 && (
            <div className="w-full max-w-[520px] bg-[#0c0d19] border border-slate-700 rounded-2xl p-6 relative">
              <button
                onClick={() => setShowPopup(false)}
                className="absolute top-4 right-4 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>

              <h2 className="text-2xl font-black text-white text-center uppercase">
                CONFIRM DISPATCH
              </h2>

              <p className="text-slate-400 text-center mt-4">
                Do you want to send this truck to the customer location?
              </p>

              <div className="mt-6 flex gap-3">
                <button
                  onClick={() => setShowPopup(false)}
                  className="w-1/2 bg-slate-700 hover:bg-slate-600 text-white py-3 rounded-xl"
                >
                  Cancel
                </button>

                <button
                  onClick={() => {
                    alert("🚛 Truck Dispatched Successfully!");
                    setShowPopup(false);
                  }}
                  className="w-1/2 bg-green-600 hover:bg-green-500 text-white py-3 rounded-xl flex items-center justify-center gap-2"
                >
                  <Check className="w-4 h-4" />
                  Dispatch
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}