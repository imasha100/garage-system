import React, { useState } from "react";
import { Menu, Save, UserCog } from "lucide-react";

export default function TechRegistration({ toggleSidebar }) {
  const generateTechId = () => `TECH-${Date.now().toString().slice(-6)}`;

  const specializationOptions = [
    "Engine Repair",
    "Electrical Systems",
    "EV Diagnostics",
    "Transmission",
    "Tire & Brake",
  ];

  const [formData, setFormData] = useState({
    technicianId: generateTechId(),
    fullName: "",
    email: "",
    contactNumber: "",
    nic: "",
    specialization: [],
    experience: "",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSpecializationChange = (value) => {
    setFormData((prev) => {
      const alreadySelected = prev.specialization.includes(value);

      return {
        ...prev,
        specialization: alreadySelected
          ? prev.specialization.filter((item) => item !== value)
          : [...prev.specialization, value],
      };
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (formData.specialization.length === 0) {
      alert("Please select at least one specialization");
      return;
    }

    console.log("Technician Data:", formData);
    alert("Technician Registered Successfully");

    setFormData({
      technicianId: generateTechId(),
      fullName: "",
      email: "",
      contactNumber: "",
      nic: "",
      specialization: [],
      experience: "",
    });
  };

  return (
    <div className="min-h-screen bg-[#07080f] text-white font-sans">
      <div className="min-h-16 border-b border-white/10 bg-[#15151f] flex items-center px-4 md:px-8 gap-3">
        <button
          onClick={toggleSidebar}
          className="md:hidden w-10 h-10 rounded-lg border border-white/10 bg-black/40 flex items-center justify-center text-white"
        >
          <Menu size={20} />
        </button>

        <div>
          <h1 className="text-lg md:text-xl font-black tracking-widest">
            TECHNICIAN REGISTRATION
          </h1>
          <p className="text-[10px] text-gray-500 uppercase tracking-widest">
            Add workshop technicians
          </p>
        </div>
      </div>

      <main className="p-4 md:p-8 flex justify-center">
        <div className="w-full max-w-4xl bg-[#15151f] border border-white/10 rounded-2xl p-6 md:p-8 shadow-2xl">
          <div className="flex items-center gap-3 mb-8">
            <UserCog className="text-emerald-400" size={28} />
            <h2 className="text-2xl font-bold">Technician Information</h2>
          </div>

          <form onSubmit={handleSubmit} className="grid md:grid-cols-2 gap-5">
            <div>
              <label className="block mb-2 text-sm text-gray-400">
                Technician ID
              </label>
              <input
                type="text"
                value={formData.technicianId}
                readOnly
                className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-gray-400 outline-none"
              />
            </div>

            <div>
              <label className="block mb-2 text-sm text-gray-400">
                Full Name
              </label>
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                required
                placeholder="Enter full name"
                className="w-full bg-black/40 border border-white/10 rounded-lg p-3 outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block mb-2 text-sm text-gray-400">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="example@gmail.com"
                className="w-full bg-black/40 border border-white/10 rounded-lg p-3 outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block mb-2 text-sm text-gray-400">
                Contact Number
              </label>
              <input
                type="text"
                name="contactNumber"
                value={formData.contactNumber}
                onChange={handleChange}
                required
                placeholder="07XXXXXXXX"
                className="w-full bg-black/40 border border-white/10 rounded-lg p-3 outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block mb-2 text-sm text-gray-400">NIC</label>
              <input
                type="text"
                name="nic"
                value={formData.nic}
                onChange={handleChange}
                required
                placeholder="Enter NIC"
                className="w-full bg-black/40 border border-white/10 rounded-lg p-3 outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block mb-2 text-sm text-gray-400">
                Experience (Years)
              </label>
              <input
                type="number"
                name="experience"
                value={formData.experience}
                onChange={handleChange}
                required
                min="0"
                placeholder="Enter experience"
                className="w-full bg-black/40 border border-white/10 rounded-lg p-3 outline-none focus:border-emerald-500"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block mb-3 text-sm text-gray-400">
                Specialization
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {specializationOptions.map((item) => (
                  <label
                    key={item}
                    className={`cursor-pointer border rounded-xl px-4 py-3 text-sm transition-all duration-300 ${
                      formData.specialization.includes(item)
                        ? "border-emerald-500 bg-emerald-500/10 text-emerald-400"
                        : "border-white/10 bg-black/30 text-gray-400 hover:border-emerald-500/50"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={formData.specialization.includes(item)}
                      onChange={() => handleSpecializationChange(item)}
                      className="hidden"
                    />
                    {item}
                  </label>
                ))}
              </div>
            </div>

            <div className="md:col-span-2 pt-4">
              <button
                type="submit"
                className="w-full md:w-auto flex items-center justify-center gap-2 px-8 py-3 bg-emerald-600 hover:bg-emerald-700 rounded-xl font-bold transition-all duration-300"
              >
                <Save size={18} />
                Register Technician
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}