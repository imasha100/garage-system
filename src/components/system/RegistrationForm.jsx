import React, { useState } from 'react';
import { Bell, ShieldAlert } from 'lucide-react';

export default function NodeRegistration() {
  // State management for form inputs
  const [branchName, setBranchName] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [address, setAddress] = useState('');
  const [latitude, setLatitude] = useState('6.92710008'); // Default values from screenshot
  const [longitude, setLongitude] = useState('79.86120008');
  const [garageCapacity, setGarageCapacity] = useState('');
  const [fleetCount, setFleetCount] = useState('');
  const [shiftType, setShiftType] = useState('24/7 Emergency Active');
  
  const [truckNumber, setTruckNumber] = useState('');
  const [driverId, setDriverId] = useState('');

  // Specialization Flags State
  const [specializations, setSpecializations] = useState({
    hybridPowertrain: false,
    evBattery: false,
    heavyMechanical: false,
    standardObd: false,
  });

  const handleCheckboxChange = (key) => {
    setSpecializations(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleFetchCoordinates = () => {
    // Simulating auto-fetching GPS data
    setLatitude('6.92710008');
    setLongitude('79.86120008');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Committed Infrastructure Node Data:", {
      branchName, contactNumber, address, latitude, longitude,
      garageCapacity, fleetCount, shiftType, truckNumber, driverId, specializations
    });
    alert("Infrastructure Node Committed Successfully to Core System!");
  };

  return (
    <div className="w-screen h-screen max-h-screen overflow-hidden bg-[#0a0b10] text-slate-300 font-mono flex relative">
      
      {/* LEFT SIDEBAR SKELETON (Matching GEAR_OS Layout) */}
      <div className="w-72 h-full border-r border-slate-900/60 bg-[#06070a] hidden md:flex flex-col p-6 z-20">
        <div className="mb-10 pl-2">
          <h1 className="text-2xl font-black tracking-widest text-[#4f46e5]">GEAR_OS</h1>
          <span className="text-[10px] text-slate-600 tracking-widest uppercase block mt-1">CORE_ROUTING_ENGINE</span>
        </div>
        <div className="flex-1 flex flex-col gap-3 opacity-30">
          <div className="h-8 bg-slate-900 rounded-sm w-4/5"></div>
          <div className="h-8 bg-slate-900 rounded-sm w-3/4"></div>
          <div className="h-8 bg-slate-900 rounded-sm w-5/6"></div>
        </div>
      </div>

      {/* MAIN CONTAINER */}
      <div className="flex-1 h-full flex flex-col min-w-0 bg-[#0a0b10]">
        
        {/* TOP STATUS BAR */}
        <div className="w-full h-16 border-b border-slate-900/60 bg-[#06070a]/60 backdrop-blur-md px-6 flex items-center justify-between shrink-0 z-20">
          <div className="text-xs font-bold tracking-wider text-slate-400">
            REGISTRATION_HUB // <span className="text-indigo-400">NODE_PROVISIONING</span>
          </div>
          <div className="flex items-center gap-4">
            <button className="text-slate-500 hover:text-white transition-colors">
              <Bell className="w-4 h-4" />
            </button>
            <div className="w-7 h-7 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center">
              <div className="w-2.5 h-2.5 rounded-full bg-indigo-500"></div>
            </div>
          </div>
        </div>

        {/* SCROLLABLE FORM SECTION */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8 flex justify-center items-start">
          <div className="w-full max-w-3xl bg-[#11131c] border border-[#1e2230] rounded-sm p-6 md:p-8 shadow-2xl">
            
            {/* HEADER */}
            <div className="flex items-center gap-3 mb-6 border-b border-slate-900 pb-4">
              <span className="text-2xl">🏢</span>
              <h2 className="text-base md:text-lg font-black text-slate-100 tracking-wider uppercase">
                PHYSICAL INFRASTRUCTURE NODE REGISTRATION
              </h2>
            </div>
            
            <p className="text-[10px] font-medium text-slate-500 tracking-wider uppercase mb-8 leading-relaxed">
              INPUT REGIONAL PARAMETERS, STATIC WORKSHOP CAPACITIES, AND DIAGNOSTIC FLAGS INTO THE CORE NEAREST-NEIGHBOR ROUTING ENGINE.
            </p>

            {/* FORM */}
            <form onSubmit={handleSubmit} className="flex flex-col gap-6">
              
              {/* ROW 1: Name and Contact */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-2">
                    GARAGE / BRANCH STRUCTURAL NAME
                  </label>
                  <input 
                    type="text"
                    value={branchName}
                    onChange={(e) => setBranchName(e.target.value)}
                    placeholder="e.g., Malabe Premium Node A04"
                    className="w-full bg-[#07080c] border border-slate-900 rounded-sm p-3 text-xs text-slate-200 placeholder-slate-700 focus:outline-none focus:border-indigo-500/50"
                  />
                </div>
                <div>
                  <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-2">
                    BRANCH CONTACT NUMBERS
                  </label>
                  <input 
                    type="text"
                    value={contactNumber}
                    onChange={(e) => setContactNumber(e.target.value)}
                    placeholder="e.g., +94 11 234 5678"
                    className="w-full bg-[#07080c] border border-slate-900 rounded-sm p-3 text-xs text-slate-200 placeholder-slate-700 focus:outline-none focus:border-indigo-500/50"
                  />
                </div>
              </div>

              {/* ROW 2: Physical Address */}
              <div>
                <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-2">
                  PHYSICAL ADDRESS
                </label>
                <input 
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="e.g., 42 Tech Corridor, Industrial Zone, Colombo 10"
                  className="w-full bg-[#07080c] border border-slate-900 rounded-sm p-3 text-xs text-slate-200 placeholder-slate-700 focus:outline-none focus:border-indigo-500/50"
                />
              </div>

              {/* ROW 3: GPS Coordinates */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-2">
                    GEOGRAPHIC LATITUDE (DECIMAL)
                  </label>
                  <input 
                    type="text"
                    value={latitude}
                    onChange={(e) => setLatitude(e.target.value)}
                    placeholder="6.92710008"
                    className="w-full bg-[#07080c] border border-slate-900 rounded-sm p-3 text-xs text-slate-200 font-sans tracking-wide focus:outline-none focus:border-indigo-500/50"
                  />
                </div>
                <div>
                  <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-2">
                    GEOGRAPHIC LONGITUDE (DECIMAL)
                  </label>
                  <input 
                    type="text"
                    value={longitude}
                    onChange={(e) => setLongitude(e.target.value)}
                    placeholder="79.86120008"
                    className="w-full bg-[#07080c] border border-slate-900 rounded-sm p-3 text-xs text-slate-200 font-sans tracking-wide focus:outline-none focus:border-indigo-500/50"
                  />
                </div>
              </div>

              {/* AUTO-FETCH BUTTON */}
              <div className="flex">
                <button
                  type="button"
                  onClick={handleFetchCoordinates}
                  className="flex items-center gap-2 px-4 py-2 bg-[#161a26] border border-slate-800 rounded-sm text-[10px] font-bold tracking-widest text-slate-400 hover:text-white hover:bg-slate-900 transition-colors"
                >
                  AUTO-FETCH CURRENT DEVICE GPS COORDINATES
                </button>
              </div>

              {/* ROW 4: Capacity, Fleet & Shift */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-2">
                    GARAGE CAPACITY
                  </label>
                  <input 
                    type="text"
                    value={garageCapacity}
                    onChange={(e) => setGarageCapacity(e.target.value)}
                    placeholder="e.g., 12"
                    className="w-full bg-[#07080c] border border-slate-900 rounded-sm p-3 text-xs text-slate-200 placeholder-slate-700 focus:outline-none focus:border-indigo-500/50"
                  />
                </div>
                <div>
                  <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-2">
                    ALLOCATED EMERGENCY FLEET COUNT
                  </label>
                  <input 
                    type="text"
                    value={fleetCount}
                    onChange={(e) => setFleetCount(e.target.value)}
                    placeholder="e.g., 4"
                    className="w-full bg-[#07080c] border border-slate-900 rounded-sm p-3 text-xs text-slate-200 placeholder-slate-700 focus:outline-none focus:border-indigo-500/50"
                  />
                </div>
                <div>
                  <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-2">
                    OPERATIONAL HOURS / SHIFT TYPE
                  </label>
                  <select
                    value={shiftType}
                    onChange={(e) => setShiftType(e.target.value)}
                    className="w-full bg-[#07080c] border border-slate-900 rounded-sm p-3 text-xs text-slate-300 focus:outline-none focus:border-indigo-500/50 appearance-none cursor-pointer"
                  >
                    <option value="24/7 Emergency Active">24/7 Emergency Active</option>
                    <option value="Standard 8-5 Shift">Standard 8-5 Shift</option>
                    <option value="Day Shift Only">Day Shift Only</option>
                  </select>
                </div>
              </div>

              {/* SECTION: TOW-TRUCK REGISTRATION */}
              <div className="mt-2">
                <h3 className="text-[10px] font-black text-indigo-400 tracking-widest uppercase mb-4">
                  TOW-TRUCK REGISTRATION
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-2">
                      TRUCK REGISTRATION NUMBER
                    </label>
                    <input 
                      type="text"
                      value={truckNumber}
                      onChange={(e) => setTruckNumber(e.target.value)}
                      placeholder="WP-CAD-8881"
                      className="w-full bg-[#07080c] border border-slate-900 rounded-sm p-3 text-xs text-slate-200 placeholder-slate-700 focus:outline-none focus:border-indigo-500/50"
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-2">
                      DRIVER NAME / ID
                    </label>
                    <input 
                      type="text"
                      value={driverId}
                      onChange={(e) => setDriverId(e.target.value)}
                      placeholder="OPERATOR_ID_868"
                      className="w-full bg-[#07080c] border border-slate-900 rounded-sm p-3 text-xs text-slate-200 placeholder-slate-700 focus:outline-none focus:border-indigo-500/50"
                    />
                  </div>
                </div>
              </div>

              {/* SECTION: WORKSHOP SPECIALIZATION FLAGS */}
              <div className="mt-2">
                <h3 className="text-[10px] font-black text-slate-500 tracking-widest uppercase mb-4">
                  WORKSHOP SPECIALIZATION FLAGS (ALGORITHMIC FILTER MATCHING)
                </h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  
                  {/* FLAG 1 */}
                  <label className="flex items-center gap-3 bg-[#07080c] border border-slate-900 p-3.5 rounded-sm cursor-pointer select-none hover:border-slate-800 transition-colors">
                    <input 
                      type="checkbox"
                      checked={specializations.hybridPowertrain}
                      onChange={() => handleCheckboxChange('hybridPowertrain')}
                      className="w-3.5 h-3.5 rounded-sm accent-indigo-500 cursor-pointer"
                    />
                    <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase">
                      HYBRID POWERTRAIN SYSTEMS (HV)
                    </span>
                  </label>

                  {/* FLAG 2 */}
                  <label className="flex items-center gap-3 bg-[#07080c] border border-slate-900 p-3.5 rounded-sm cursor-pointer select-none hover:border-slate-800 transition-colors">
                    <input 
                      type="checkbox"
                      checked={specializations.evBattery}
                      onChange={() => handleCheckboxChange('evBattery')}
                      className="w-3.5 h-3.5 rounded-sm accent-indigo-500 cursor-pointer"
                    />
                    <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase">
                      EV BATTERY DIAGNOSTICS & CELL BALANCING
                    </span>
                  </label>

                  {/* FLAG 3 */}
                  <label className="flex items-center gap-3 bg-[#07080c] border border-slate-900 p-3.5 rounded-sm cursor-pointer select-none hover:border-slate-800 transition-colors">
                    <input 
                      type="checkbox"
                      checked={specializations.heavyMechanical}
                      onChange={() => handleCheckboxChange('heavyMechanical')}
                      className="w-3.5 h-3.5 rounded-sm accent-indigo-500 cursor-pointer"
                    />
                    <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase">
                      HEAVY MECHANICAL OVERHAUL
                    </span>
                  </label>

                  {/* FLAG 4 */}
                  <label className="flex items-center gap-3 bg-[#07080c] border border-slate-900 p-3.5 rounded-sm cursor-pointer select-none hover:border-slate-800 transition-colors">
                    <input 
                      type="checkbox"
                      checked={specializations.standardObd}
                      onChange={() => handleCheckboxChange('standardObd')}
                      className="w-3.5 h-3.5 rounded-sm accent-indigo-500 cursor-pointer"
                    />
                    <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase">
                      STANDARD OBD-II ERROR CODE SCANNING
                    </span>
                  </label>

                </div>
              </div>

              {/* SUBMIT BUTTON */}
              <div className="mt-4">
                <button
                  type="submit"
                  className="w-full py-3.5 bg-[#5a4fed] hover:bg-[#4c42d4] text-white text-xs font-black tracking-[0.2em] uppercase rounded-sm transition-colors shadow-lg flex items-center justify-center gap-2 cursor-pointer"
                >
                   COMMITTED NEW INFRASTRUCTURE NODE TO CORE
                </button>
              </div>

            </form>
          </div>
        </div>
      </div>
    </div>
  );
}