import React, { useState } from "react";
import { User, AlertCircle, MapPin, X, Clock, Navigation } from "lucide-react";

const ResourceSchedule = () => {
  // ==========================
  // States
  // ==========================
  const [currentCapacity, setCurrentCapacity] = useState(7);
  const maxCapacity = 10;

  // Modern Popup State
  const [popup, setPopup] = useState({
    show: false,
    title: "",
    message: "",
    color: "#52f0ac",
    showCancel: false, 
    requestData: null,
  });

  // Details Modal State
  const [showDetailsModal, setShowDetailsModal] = useState(null);

  // Accepted & Rejected States
  const [acceptedRequests, setAcceptedRequests] = useState([]);
  const [rejectedRequests, setRejectedRequests] = useState([]);
  
  // Technician allocation vehicle selection state
  const [selectedVehicles, setSelectedVehicles] = useState({});

  const [emergencyRequests, setEmergencyRequests] = useState([
    {
      id: "TK-9958",
      name: "Amila Perera",
      contact: "+94 77 123 4567",
      vehicle: "BMW i3 [BEV]",
      vNo: "WP-CAB-9958",
      eta: "14:20 Mins",
      dist: "8.4 km",
      loc: "Highway, Near Kaduwela Exit",
    },
    {
      id: "TK-9960",
      name: "Sunil Silva",
      contact: "+94 71 987 6543",
      vehicle: "Toyota Prius",
      vNo: "WP-CAP-1122",
      eta: "18:45 Mins",
      dist: "12.2 km",
      loc: "Colombo 07, Town Hall",
    },
    {
      id: "TK-9962",
      name: "Ravi Kumara",
      contact: "+94 77 555 1234",
      vehicle: "Honda Vezel",
      vNo: "WP-CAP-3344",
      eta: "22:10 Mins",
      dist: "15.0 km",
      loc: "Gampaha, Main Road",
    },
    {
      id: "TK-9965",
      name: "Nimali Perera",
      contact: "+94 76 444 8888",
      vehicle: "Suzuki Alto",
      vNo: "WP-CAA-9988",
      eta: "10:05 Mins",
      dist: "5.2 km",
      loc: "Kandy, City Center",
    },
  ]);

  // Technicians State
  const [availableTechs, setAvailableTechs] = useState(["David Vance", "Sarah Jenkins"]);
  const [activeTechs, setActiveTechs] = useState([
    { name: "Marcus Thorne", task: "Hybrid System", completion: 65, time: "18 Mins" },
    { name: "Alex Mercer", task: "Mechanical Overhaul", completion: 30, time: "42 Mins" },
  ]);

  const [selectedReq, setSelectedReq] = useState(emergencyRequests[0] ? { ...emergencyRequests[0], status: "pending" } : null);

  // ==========================
  // Handlers
  // ==========================
  
  // Allocate Handler
  const handleAllocate = (techName) => {
    const vNo = selectedVehicles[techName];
    if (!vNo) {
      setPopup({ show: true, title: "SELECT VEHICLE", message: "Please select a vehicle to allocate.", color: "#e78181" });
      return;
    }
    
    // Available ලැයිස්තුවෙන් ඉවත් කර Active ලැයිස්තුවට එකතු කිරීම
    setAvailableTechs(prev => prev.filter(t => t !== techName));
    setActiveTechs(prev => [...prev, { name: techName, task: `Assigned: ${vNo}`, completion: 0, time: "Just Now" }]);
    
    setPopup({
      show: true,
      title: "TECHNICIAN ALLOCATED",
      message: `${techName} has been assigned to vehicle ${vNo}.`,
      color: "#52f0ac",
    });
  };

  const handleAccept = () => {
    if (!selectedReq) return;

    if (currentCapacity >= maxCapacity) {
      setPopup({
        show: true,
        title: "CAPACITY FULL",
        message: "Garage capacity is full. Cannot accept this request.",
        color: "#e78181",
      });
      return;
    }

    const newCapacity = currentCapacity + 1;
    setCurrentCapacity(newCapacity);

    // Accept Logic
    const acceptedReq = { ...selectedReq, status: "accepted" };
    setAcceptedRequests((prev) => [...prev, acceptedReq]);

    const updatedRequests = emergencyRequests.filter((req) => req.id !== selectedReq.id);
    setEmergencyRequests(updatedRequests);
    setSelectedReq(updatedRequests[0] ? { ...updatedRequests[0], status: "pending" } : null);

    // Popup with Cancel option
    setPopup({
      show: true,
      title: "REQUEST ACCEPTED",
      message: `${selectedReq.id} has been accepted successfully.`,
      color: "#52f0ac",
      showCancel: true,
      requestData: acceptedReq
    });
  };

  const handleReject = () => {
    if (!selectedReq) return;

    // Reject Logic
    const rejectedReq = { ...selectedReq, status: "rejected" };
    setRejectedRequests((prev) => [...prev, rejectedReq]);

    const updatedRequests = emergencyRequests.filter((req) => req.id !== selectedReq.id);
    setEmergencyRequests(updatedRequests);
    setSelectedReq(updatedRequests[0] ? { ...updatedRequests[0], status: "pending" } : null);

    setPopup({
      show: true,
      title: "REQUEST REJECTED",
      message: `${selectedReq.id} has been rejected successfully.`,
      color: "#f59e0b",
    });
  };

  // Cancel Handler
  const handleCancel = (req) => {
    setAcceptedRequests((prev) => prev.filter((r) => r.id !== req.id));
    setCurrentCapacity((prev) => Math.max(prev - 1, 0));
    setEmergencyRequests((prev) => [...prev, { ...req, status: "pending" }]);
    setSelectedReq({ ...req, status: "pending" });
    setPopup({ show: false, title: "", message: "", color: "#52f0ac", showCancel: false });
  };

  const handleListCancel = (id) => {
    if (!window.confirm("Are you sure you want to cancel this request?")) return;
    const request = acceptedRequests.find((r) => r.id === id);
    if (!request) return;
    setAcceptedRequests((prev) => prev.filter((r) => r.id !== id));
    setCurrentCapacity((prev) => Math.max(prev - 1, 0));
    setEmergencyRequests((prev) => [...prev, { ...request, status: "pending" }]);
    setSelectedReq({ ...request, status: "pending" });
    setPopup({ show: true, title: "REQUEST CANCELLED", message: `${id} has been moved back to Pending Requests.`, color: "#f59e0b" });
  };

  return (
    <div className="w-full h-full bg-[#0b0e14] text-[#a0a8b7] p-8 font-sans overflow-y-auto relative">
      
      {/* Detail Modal */}
      {showDetailsModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-[#15191f] border border-[#2b313d] rounded-xl p-8 w-full max-w-lg relative">
            <button onClick={() => setShowDetailsModal(null)} className="absolute top-4 right-4 text-gray-500 hover:text-white"><X /></button>
            <h2 className="text-xl font-bold text-white mb-6 uppercase">Request Details: {showDetailsModal.id}</h2>
            
            <div className="h-40 rounded-lg bg-[#0b0e14] border border-[#1a1f26] flex flex-col justify-center items-center mb-6">
                <MapPin size={45} className="text-[#3b82f6]" />
                <p className="mt-3 text-xs uppercase">{showDetailsModal.loc}</p>
            </div>

            <div className="space-y-4 text-white">
              <p>Customer: <span className="text-[#3b82f6]">{showDetailsModal.name}</span></p>
              <p>Contact: {showDetailsModal.contact}</p>
              <p>Vehicle: {showDetailsModal.vehicle} ({showDetailsModal.vNo})</p>
              <p>Status: <span className={`capitalize font-bold ${showDetailsModal.status === "accepted" ? "text-[#3b82f6]" : "text-[#e78181]"}`}>{showDetailsModal.status}</span></p>
            </div>
          </div>
        </div>
      )}

      {/* Modern Modal Popup */}
      {popup.show && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-[#15191f] border border-[#2b313d] rounded-xl p-8 w-[420px] text-center shadow-xl">
            <h2 className="text-2xl font-bold mb-4" style={{ color: popup.color }}>{popup.title}</h2>
            <p className="text-[#cbd5e1] mb-6">{popup.message}</p>
            <div className="flex justify-center gap-3">
              <button
                onClick={() => setPopup({ show: false, title: "", message: "", color: "#52f0ac", showCancel: false })}
                className="bg-[#3b82f6] hover:bg-[#45cc92] text-black font-bold px-6 py-2 rounded-lg cursor-pointer"
              >
                OK
              </button>
              {popup.showCancel && (
                <button
                  onClick={() => handleCancel(popup.requestData)}
                  className="bg-red-500 hover:bg-red-600 text-white font-bold px-6 py-2 rounded-lg cursor-pointer"
                >
                  CANCEL
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-white text-2xl font-bold uppercase tracking-wider">Dispatch Center</h1>
        <div className="text-sm">Capacity : <span className="text-white font-bold ml-2">{currentCapacity}/{maxCapacity}</span></div>
      </div>

      <div className="space-y-6">
        {/* Top Section */}
        <div className={`grid ${emergencyRequests.length === 0 && !selectedReq ? "grid-cols-1" : "grid-cols-1 xl:grid-cols-2"} gap-6`}>
          
          {/* Pending Request List */}
          {emergencyRequests.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-white font-bold mb-2">PENDING REQUESTS</h2>
              {emergencyRequests.map((req) => (
                <div key={req.id} onClick={() => setSelectedReq({ ...req, status: "pending" })} 
                  className={`cursor-pointer rounded-xl p-6 border transition-all ${selectedReq?.id === req.id ? "border-[#3b82f6] shadow-[0_0_12px_rgba(82,240,172,0.2)]" : "border-[#1a1f26] bg-[#15191f]"}`}>
                  <h2 className="text-[#ce2222] font-bold mb-4 flex items-center gap-2"><AlertCircle size={18} /> EMERGENCY REQUEST ({req.id})</h2>
                  <p className="text-sm">Customer : <span className="text-white ml-2">{req.name}</span></p>
                  <p className="text-sm mt-1">Vehicle No : <span className="text-white ml-2">{req.vNo}</span></p>
                  <p className="text-sm mt-1">Vehicle : <span className="text-white ml-2">{req.vehicle}</span></p>
                </div>
              ))}
            </div>
          )}

          {/* Selected Request Details */}
          {selectedReq ? (
            <div className="bg-[#15191f] rounded-xl border border-[#1a1f26] p-6 flex flex-col">
              {/* Map Section */}
              <div className="h-48 rounded-lg bg-[#0b0e14] border border-[#1a1f26] flex flex-col justify-center items-center mb-6 relative overflow-hidden">
                 <MapPin size={50} className="text-[#3b82f6] animate-pulse" />
                 <div className="flex gap-4 mt-4 bg-black/40 px-4 py-2 rounded-lg border border-[#3b82f6]/30">
                    <div className="flex items-center gap-2 text-[#3b82f6]"><Clock size={16} /> <span className="font-bold">{selectedReq.eta}</span></div>
                    <div className="flex items-center gap-2 text-[#3b82f6]"><Navigation size={16} /> <span className="font-bold">{selectedReq.dist}</span></div>
                 </div>
                 <p className="mt-2 text-[10px] text-[#3b82f6] uppercase tracking-widest">{selectedReq.loc}</p>
              </div>

              <div className="bg-[#0b0e14] border border-[#1a1f26] rounded-lg p-4 mb-4 space-y-2 text-sm">
                <p><span className="text-[#6e7681]">Customer :</span><span className="text-white ml-2">{selectedReq.contact}</span></p>
                <p><span className="text-[#6e7681]">Status :</span><span className={`ml-2 font-bold ${selectedReq.status === "accepted" ? "text-[#3b82f6]" : selectedReq.status === "rejected" ? "text-[#e78181]" : "text-white"}`}>{selectedReq.status.toUpperCase()}</span></p>
              </div>
              
              {selectedReq.status === "pending" ? (
                <div className="flex gap-4 mt-auto">
                  <button onClick={handleAccept} className="flex-1 bg-[#52f0ac] hover:bg-[#45cc92] text-black py-3 rounded font-bold cursor-pointer">ACCEPT REQUEST</button>
                  <button onClick={handleReject} className="flex-1 border border-[#e78181] text-[#e78181] py-3 rounded font-bold cursor-pointer">REJECT</button>
                </div>
              ) : (
                <div className="mt-auto bg-[#0b0e14] border border-[#1a1f26] rounded-lg p-4 text-center font-bold">
                  {selectedReq.status === "accepted" ? "✓ ACCEPTED REQUEST" : "✕ REJECTED REQUEST"}
                </div>
              )}
            </div>
          ) : (
            <div className="bg-[#15191f] rounded-xl border border-[#1a1f26] p-12 flex flex-col items-center justify-center text-center">
              <AlertCircle size={50} className="text-[#3b82f6] mb-4" />
              <h2 className="text-white text-xl font-bold">All Requests Processed</h2>
            </div>
          )}
        </div>

        {/* Bottom Section */}
        <div className="grid xl:grid-cols-2 gap-6">
          <div className="bg-[#15191f] rounded-xl border border-[#1a1f26] p-6">
            <h2 className="text-[#3b82f6] font-bold mb-5">AVAILABLE TECHNICIANS</h2>
            {availableTechs.map((tech, index) => (
              <div key={index} className="bg-[#0b0e14] rounded-lg border border-[#1a1f26] p-4 mb-4">
                <div className="flex gap-3 items-center mb-2"><User size={35} /><p className="text-white font-bold">{tech}</p></div>
                <select className="w-full bg-[#15191f] border border-[#1a2e26] text-white p-2 mb-2 rounded text-sm" onChange={(e) => setSelectedVehicles({...selectedVehicles, [tech]: e.target.value})}>
                    <option value="">Select Vehicle</option>
                    {acceptedRequests.map(req => <option key={req.id} value={req.vNo}>{req.vNo}</option>)}
                </select>
                <button onClick={() => handleAllocate(tech)} className="w-full bg-[#3b82f6] text-black px-4 py-2 rounded text-xs font-bold hover:bg-[#45cc92] cursor-pointer">ALLOCATE</button>
              </div>
            ))}
          </div>

          <div className="bg-[#15191f] rounded-xl border border-[#1a1f26] p-6">
            <h2 className="text-[#ce2222] font-bold mb-5">ACTIVE FIELD TECHS</h2>
            {activeTechs.map((tech, index) => (
              <div key={index} className="bg-[#0b0e14] rounded-lg border border-[#1a1f26] p-4 mb-4">
                <div className="flex justify-between items-center mb-2">
                  <div className="flex gap-3 items-center"><User size={35} /><div><p className="text-white font-bold">{tech.name}</p><p className="text-xs text-[#3b82f6]">{tech.task}</p></div></div>
                  <div className="text-right"><p className="text-white font-bold">{tech.time}</p><p className="text-xs text-[#6e7681]">Remaining</p></div>
                </div>
                <div className="w-full bg-[#15191f] rounded-full h-2"><div className="bg-[#e78181] h-2 rounded-full" style={{ width: `${tech.completion}%` }} /></div>
              </div>
            ))}
          </div>
        </div>

        {/* Accepted & Rejected Status Lists */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mt-6">
          <div className="bg-[#15191f] border border-[#1a1f26] rounded-xl p-6">
            <h2 className="text-[#52f0ac] font-bold mb-4">ACCEPTED REQUESTS</h2>
            {acceptedRequests.map(req => (
              <div key={req.id} className="bg-[#0b0e14] border border-[#1a2e26] rounded-lg p-4 mb-3 flex justify-between items-center">
                <div><p className="text-white font-bold">{req.id} - {req.vNo}</p><p className="text-xs text-[#52f0ac]">Accepted</p></div>
                <div className="flex gap-2">
                  <button onClick={() => setShowDetailsModal(req)} className="bg-[#3b82f6] text-black px-3 py-1 rounded text-xs font-bold cursor-pointer">VIEW DETAILS</button>
                  
                </div>
              </div>
            ))}
          </div>
          <div className="bg-[#15191f] border border-[#1a1f26] rounded-xl p-6">
            <h2 className="text-[#e78181] font-bold mb-4">REJECTED REQUESTS</h2>
            {rejectedRequests.map(req => (
              <div key={req.id} className="bg-[#0b0e14] border border-[#2b1d1d] rounded-lg p-4 mb-3 flex justify-between items-center">
                <div><p className="text-white font-bold">{req.id} - {req.vNo}</p><p className="text-xs text-[#e78181]">Rejected</p></div>
                <button onClick={() => setShowDetailsModal(req)} className="border border-[#e78181] text-[#e78181] px-3 py-1 rounded text-xs font-bold cursor-pointer">VIEW DETAILS</button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResourceSchedule;