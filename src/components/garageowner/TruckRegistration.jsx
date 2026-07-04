import React, { useState } from "react";
import { Menu, Save, Truck, UserRound } from "lucide-react";

export default function TruckRegistration({ toggleSidebar }) {
  const generateTruckId = () => `TRUCK-${Date.now().toString().slice(-6)}`;
  const generateDriverId = () => `DRV-${Date.now().toString().slice(-6)}`;

  const [formData, setFormData] = useState({
    truckId: generateTruckId(),
    plateNumber: "",
    truckModel: "",
    truckType: "",
    capacity: "",
    status: "Available",

    driverId: generateDriverId(),
    driverName: "",
    driverEmail: "",
    driverContact: "",
    driverNic: "",
    licenseNumber: "",
    driverExperience: "",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const existingTrucks = JSON.parse(localStorage.getItem("towTrucks")) || [];
    const updatedTrucks = [...existingTrucks, formData];

    localStorage.setItem("towTrucks", JSON.stringify(updatedTrucks));

    alert("Tow Truck and Driver Registered Successfully");

    setFormData({
      truckId: generateTruckId(),
      plateNumber: "",
      truckModel: "",
      truckType: "",
      capacity: "",
      status: "Available",

      driverId: generateDriverId(),
      driverName: "",
      driverEmail: "",
      driverContact: "",
      driverNic: "",
      licenseNumber: "",
      driverExperience: "",
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
            TOW TRUCK REGISTRATION
          </h1>
          <p className="text-[10px] text-gray-500 uppercase tracking-widest">
            Register recovery vehicle and assigned driver
          </p>
        </div>
      </div>

      <main className="p-4 md:p-8 flex justify-center">
        <div className="w-full max-w-5xl bg-[#15151f] border border-white/10 rounded-2xl p-6 md:p-8 shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-10">
            <section>
              <div className="flex items-center gap-3 mb-6">
                <Truck className="text-amber-400" size={28} />
                <h2 className="text-2xl font-bold">Truck Information</h2>
              </div>

              <div className="grid md:grid-cols-2 gap-5">
                <div>
                  <label className="block mb-2 text-sm text-gray-400">
                    Truck ID
                  </label>
                  <input
                    type="text"
                    value={formData.truckId}
                    readOnly
                    className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-gray-400 outline-none"
                  />
                </div>

                <div>
                  <label className="block mb-2 text-sm text-gray-400">
                    Plate Number
                  </label>
                  <input
                    type="text"
                    name="plateNumber"
                    value={formData.plateNumber}
                    onChange={handleChange}
                    required
                    placeholder="WP CAA-1234"
                    className="w-full bg-black/40 border border-white/10 rounded-lg p-3 outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block mb-2 text-sm text-gray-400">
                    Truck Model
                  </label>
                  <input
                    type="text"
                    name="truckModel"
                    value={formData.truckModel}
                    onChange={handleChange}
                    required
                    placeholder="Isuzu NPR / Toyota Dyna"
                    className="w-full bg-black/40 border border-white/10 rounded-lg p-3 outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block mb-2 text-sm text-gray-400">
                    Truck Type
                  </label>
                  <select
                    name="truckType"
                    value={formData.truckType}
                    onChange={handleChange}
                    required
                    className="w-full bg-black/40 border border-white/10 rounded-lg p-3 outline-none focus:border-amber-500"
                  >
                    <option value="">Select Truck Type</option>
                    <option value="Flatbed Tow Truck">Flatbed Tow Truck</option>
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

                <div>
                  <label className="block mb-2 text-sm text-gray-400">
                    Capacity
                  </label>
                  <input
                    type="text"
                    name="capacity"
                    value={formData.capacity}
                    onChange={handleChange}
                    required
                    placeholder="Example: 3 Ton"
                    className="w-full bg-black/40 border border-white/10 rounded-lg p-3 outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block mb-2 text-sm text-gray-400">
                    Truck Status
                  </label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    className="w-full bg-black/40 border border-white/10 rounded-lg p-3 outline-none focus:border-amber-500"
                  >
                    <option value="Available">Available</option>
                    <option value="On Duty">On Duty</option>
                    <option value="Maintenance">Maintenance</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>
            </section>

            <section>
              <div className="flex items-center gap-3 mb-6">
                <UserRound className="text-emerald-400" size={28} />
                <h2 className="text-2xl font-bold">Driver Information</h2>
              </div>

              <div className="grid md:grid-cols-2 gap-5">
                <div>
                  <label className="block mb-2 text-sm text-gray-400">
                    Driver ID
                  </label>
                  <input
                    type="text"
                    value={formData.driverId}
                    readOnly
                    className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-gray-400 outline-none"
                  />
                </div>

                <div>
                  <label className="block mb-2 text-sm text-gray-400">
                    Driver Full Name
                  </label>
                  <input
                    type="text"
                    name="driverName"
                    value={formData.driverName}
                    onChange={handleChange}
                    required
                    placeholder="Enter driver full name"
                    className="w-full bg-black/40 border border-white/10 rounded-lg p-3 outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block mb-2 text-sm text-gray-400">
                    Driver Email
                  </label>
                  <input
                    type="email"
                    name="driverEmail"
                    value={formData.driverEmail}
                    onChange={handleChange}
                    required
                    placeholder="driver@gmail.com"
                    className="w-full bg-black/40 border border-white/10 rounded-lg p-3 outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block mb-2 text-sm text-gray-400">
                    Driver Contact
                  </label>
                  <input
                    type="text"
                    name="driverContact"
                    value={formData.driverContact}
                    onChange={handleChange}
                    required
                    placeholder="07XXXXXXXX"
                    className="w-full bg-black/40 border border-white/10 rounded-lg p-3 outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block mb-2 text-sm text-gray-400">
                    Driver NIC
                  </label>
                  <input
                    type="text"
                    name="driverNic"
                    value={formData.driverNic}
                    onChange={handleChange}
                    required
                    placeholder="Enter NIC"
                    className="w-full bg-black/40 border border-white/10 rounded-lg p-3 outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block mb-2 text-sm text-gray-400">
                    License Number
                  </label>
                  <input
                    type="text"
                    name="licenseNumber"
                    value={formData.licenseNumber}
                    onChange={handleChange}
                    required
                    placeholder="Enter license number"
                    className="w-full bg-black/40 border border-white/10 rounded-lg p-3 outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block mb-2 text-sm text-gray-400">
                    Driving Experience (Years)
                  </label>
                  <input
                    type="number"
                    name="driverExperience"
                    value={formData.driverExperience}
                    onChange={handleChange}
                    required
                    min="0"
                    placeholder="Years"
                    className="w-full bg-black/40 border border-white/10 rounded-lg p-3 outline-none focus:border-emerald-500"
                  />
                </div>
              </div>
            </section>

            <button
              type="submit"
              className="w-full md:w-auto flex items-center justify-center gap-2 px-8 py-3 bg-amber-600 hover:bg-amber-700 rounded-xl font-bold transition-all duration-300"
            >
              <Save size={18} />
              Register Truck & Driver
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}