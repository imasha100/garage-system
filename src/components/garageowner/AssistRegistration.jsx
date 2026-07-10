import React, { useState } from "react";
import { Menu, UserPlus, Save, ArrowLeft } from "lucide-react";

export default function AssistRegistration({
  toggleSidebar,
  onNavigate,
}) {
  const [formData, setFormData] = useState({
    fullName: "",
    nic: "",
    email: "",
    password: "",
    contactNumber: "",
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

    console.log("Assistance Officer:", formData);
    alert("Assistance officer registered successfully!");

    setFormData({
      fullName: "",
      nic: "",
      email: "",
      password: "",
      contactNumber: "",
    });
  };

  return (
    <div className="min-h-screen bg-[#07080f] text-white">
      {/* Header */}
      <header className="min-h-16 border-b border-white/10 bg-[#15151f] flex items-center justify-between px-4 md:px-8">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={toggleSidebar}
            className="md:hidden w-10 h-10 rounded-lg border border-white/10 bg-black/40 flex items-center justify-center text-white"
            aria-label="Open sidebar"
          >
            <Menu size={20} />
          </button>

          <div>
            <h1 className="text-lg md:text-xl font-black tracking-widest">
              ASSISTANCE REGISTRATION
            </h1>

            <p className="text-[10px] text-gray-500 uppercase tracking-widest">
              Register assistance officers
            </p>
          </div>
        </div>

        <div className="w-10 h-10 rounded-xl border border-blue-500/30 bg-blue-500/10 flex items-center justify-center">
          <UserPlus className="text-blue-400" size={24} />
        </div>
      </header>

      {/* Main Content */}
      <main className="p-4 md:p-8">
        <button
          type="button"
          onClick={() => onNavigate("Registration")}
          className="flex items-center gap-2 text-sm text-gray-400 hover:text-white mb-6 transition"
        >
          <ArrowLeft size={18} />
          Back to Registration
        </button>

        {/* Title Section */}
        <div className="mb-8 text-center">
          <p className="text-blue-400 text-xs tracking-widest font-bold mb-2">
            ASSISTANCE OFFICER
          </p>

          <h2 className="text-2xl md:text-3xl font-black mb-2">
            Register Assistance Officer
          </h2>

          <p className="text-gray-400">
            Add a new assistance officer or dispatch operator to the system.
          </p>
        </div>

        {/* Centered Form Card */}
        <form
          onSubmit={handleSubmit}
          className="w-full max-w-3xl mx-auto bg-[#15151f] border border-white/10 rounded-2xl p-5 md:p-8"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Full Name */}
            <div>
              <label
                htmlFor="fullName"
                className="block text-xs font-bold text-gray-400 mb-2"
              >
                FULL NAME
              </label>

              <input
                id="fullName"
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                placeholder="Enter full name"
                required
                className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-gray-600 outline-none focus:border-blue-500"
              />
            </div>

            {/* NIC */}
            <div>
              <label
                htmlFor="nic"
                className="block text-xs font-bold text-gray-400 mb-2"
              >
                NIC NUMBER
              </label>

              <input
                id="nic"
                type="text"
                name="nic"
                value={formData.nic}
                onChange={handleChange}
                placeholder="200012345678 or 901234567V"
                required
                maxLength={12}
                className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-gray-600 outline-none focus:border-blue-500"
              />
            </div>

            {/* Contact Number */}
            <div>
              <label
                htmlFor="contactNumber"
                className="block text-xs font-bold text-gray-400 mb-2"
              >
                CONTACT NUMBER
              </label>

              <input
                id="contactNumber"
                type="tel"
                name="contactNumber"
                value={formData.contactNumber}
                onChange={handleChange}
                placeholder="0771234567"
                required
                className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-gray-600 outline-none focus:border-blue-500"
              />
            </div>

            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="block text-xs font-bold text-gray-400 mb-2"
              >
                EMAIL
              </label>

              <input
                id="email"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="officer@example.com"
                required
                className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-gray-600 outline-none focus:border-blue-500"
              />
            </div>

            {/* Password */}
            <div className="md:col-span-2">
              <label
                htmlFor="password"
                className="block text-xs font-bold text-gray-400 mb-2"
              >
                PASSWORD
              </label>

              <input
                id="password"
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter password"
                required
                minLength={6}
                className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-gray-600 outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {/* Submit Button */}
          <div className="mt-7 flex justify-center">
            <button
              type="submit"
              className="flex items-center justify-center gap-2 bg-blue-500 hover:bg-blue-400 text-black font-black rounded-xl px-7 py-3 transition"
            >
              <Save size={18} />
              REGISTER ASSISTANCE
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}