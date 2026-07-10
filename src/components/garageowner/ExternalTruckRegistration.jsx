import React, { useState } from "react";
import {
  Menu,
  Truck,
  Save,
  ArrowLeft,
  UserRound,
  MapPin,
} from "lucide-react";

export default function ExternalTruckRegistration({
  toggleSidebar,
  onNavigate,
}) {
  const generateTruckId = () =>
    `EXT-TRUCK-${Date.now().toString().slice(-6)}`;

  const generateDriverId = () =>
    `EXT-DRV-${Date.now().toString().slice(-6)}`;

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
    driverNic: "",
    driverEmail: "",
    contactNumber: "",
    licenseNumber: "",
    licenseExpireDate: "",
    driverExperience: "",

    // Service Location
    serviceArea: "",
    latitude: "",
    longitude: "",
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

    const existingExternalTrucks =
      JSON.parse(localStorage.getItem("externalTowTrucks")) || [];

    const updatedExternalTrucks = [
      ...existingExternalTrucks,
      formData,
    ];

    localStorage.setItem(
      "externalTowTrucks",
      JSON.stringify(updatedExternalTrucks)
    );

    console.log("External Tow Truck:", formData);

    alert("External tow truck and driver registered successfully!");

    setFormData({
      truckId: generateTruckId(),
      plateNumber: "",
      truckModel: "",
      truckType: "",
      capacity: "",

      driverId: generateDriverId(),
      driverName: "",
      driverNic: "",
      driverEmail: "",
      contactNumber: "",
      licenseNumber: "",
      licenseExpireDate: "",
      driverExperience: "",

      serviceArea: "",
      latitude: "",
      longitude: "",
    });
  };

  const handleBack = () => {
    if (typeof onNavigate === "function") {
      onNavigate("Registration");
    }
  };

  return (
    <div className="min-h-screen bg-[#07080f] text-white font-sans">
      {/* Header */}
      <header className="min-h-16 border-b border-white/10 bg-[#15151f] flex items-center justify-between px-4 md:px-8">
        <div className="flex items-center gap-3">
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
              EXTERNAL TRUCK REGISTRATION
            </h1>

            <p className="text-[10px] text-gray-500 uppercase tracking-widest">
              Register third-party tow trucks and drivers
            </p>
          </div>
        </div>

        <div className="w-10 h-10 rounded-xl border border-purple-500/30 bg-purple-500/10 flex items-center justify-center">
          <Truck className="text-purple-400" size={24} />
        </div>
      </header>

      {/* Main Content */}
      <main className="p-4 md:p-8">
        <button
          type="button"
          onClick={handleBack}
          className="flex items-center gap-2 text-sm text-gray-400 hover:text-white mb-6 transition"
        >
          <ArrowLeft size={18} />
          Back to Registration
        </button>

        {/* Page Title */}
        <div className="mb-8 text-center">
          <p className="text-purple-400 text-xs tracking-widest font-bold mb-2">
            THIRD-PARTY RECOVERY VEHICLE
          </p>

          <h2 className="text-2xl md:text-3xl font-black mb-2">
            Register External Tow Truck
          </h2>

          <p className="text-gray-400">
            Add external recovery vehicles and assigned drivers to the system.
          </p>
        </div>

        {/* Centered Form Card */}
        <div className="w-full max-w-5xl mx-auto bg-[#15151f] border border-white/10 rounded-2xl p-5 md:p-8 shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-10">
            {/* Truck Information */}
            <section>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-11 h-11 rounded-xl border border-purple-500/30 bg-purple-500/10 flex items-center justify-center">
                  <Truck className="text-purple-400" size={24} />
                </div>

                <div>
                  <h3 className="text-xl md:text-2xl font-black">
                    Truck Information
                  </h3>

                  <p className="text-xs text-gray-500 mt-1">
                    Enter the external recovery vehicle details
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Truck ID */}
                <div>
                  <label
                    htmlFor="truckId"
                    className="block text-xs font-bold text-gray-400 mb-2"
                  >
                    TRUCK ID
                  </label>

                  <input
                    id="truckId"
                    type="text"
                    name="truckId"
                    value={formData.truckId}
                    readOnly
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-gray-500 outline-none cursor-not-allowed"
                  />
                </div>

                {/* Plate Number */}
                <div>
                  <label
                    htmlFor="plateNumber"
                    className="block text-xs font-bold text-gray-400 mb-2"
                  >
                    PLATE NUMBER
                  </label>

                  <input
                    id="plateNumber"
                    type="text"
                    name="plateNumber"
                    value={formData.plateNumber}
                    onChange={handleChange}
                    placeholder="WP CAA-1234"
                    required
                    className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-gray-600 outline-none focus:border-purple-500"
                  />
                </div>

                {/* Truck Model */}
                <div>
                  <label
                    htmlFor="truckModel"
                    className="block text-xs font-bold text-gray-400 mb-2"
                  >
                    TRUCK MODEL
                  </label>

                  <input
                    id="truckModel"
                    type="text"
                    name="truckModel"
                    value={formData.truckModel}
                    onChange={handleChange}
                    placeholder="Isuzu NPR / Toyota Dyna"
                    required
                    className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-gray-600 outline-none focus:border-purple-500"
                  />
                </div>

                {/* Truck Type */}
                <div>
                  <label
                    htmlFor="truckType"
                    className="block text-xs font-bold text-gray-400 mb-2"
                  >
                    TRUCK TYPE
                  </label>

                  <select
                    id="truckType"
                    name="truckType"
                    value={formData.truckType}
                    onChange={handleChange}
                    required
                    className="w-full bg-[#101018] border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-purple-500"
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
                    className="block text-xs font-bold text-gray-400 mb-2"
                  >
                    CAPACITY (TONS)
                  </label>

                  <input
                    id="capacity"
                    type="number"
                    name="capacity"
                    value={formData.capacity}
                    onChange={handleChange}
                    placeholder="Example: 3"
                    required
                    min="0"
                    step="0.1"
                    className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-gray-600 outline-none focus:border-purple-500"
                  />
                </div>
              </div>
            </section>

            <div className="border-t border-white/10" />

            {/* Driver Information */}
            <section>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-11 h-11 rounded-xl border border-emerald-500/30 bg-emerald-500/10 flex items-center justify-center">
                  <UserRound className="text-emerald-400" size={24} />
                </div>

                <div>
                  <h3 className="text-xl md:text-2xl font-black">
                    Driver Information
                  </h3>

                  <p className="text-xs text-gray-500 mt-1">
                    Enter the assigned driver details
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Driver ID */}
                <div>
                  <label
                    htmlFor="driverId"
                    className="block text-xs font-bold text-gray-400 mb-2"
                  >
                    DRIVER ID
                  </label>

                  <input
                    id="driverId"
                    type="text"
                    name="driverId"
                    value={formData.driverId}
                    readOnly
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-gray-500 outline-none cursor-not-allowed"
                  />
                </div>

                {/* Driver Name */}
                <div>
                  <label
                    htmlFor="driverName"
                    className="block text-xs font-bold text-gray-400 mb-2"
                  >
                    DRIVER FULL NAME
                  </label>

                  <input
                    id="driverName"
                    type="text"
                    name="driverName"
                    value={formData.driverName}
                    onChange={handleChange}
                    placeholder="Enter driver full name"
                    required
                    className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-gray-600 outline-none focus:border-emerald-500"
                  />
                </div>

                {/* Driver NIC */}
                <div>
                  <label
                    htmlFor="driverNic"
                    className="block text-xs font-bold text-gray-400 mb-2"
                  >
                    DRIVER NIC
                  </label>

                  <input
                    id="driverNic"
                    type="text"
                    name="driverNic"
                    value={formData.driverNic}
                    onChange={handleChange}
                    placeholder="200012345678 or 901234567V"
                    required
                    maxLength={12}
                    className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-gray-600 outline-none focus:border-emerald-500"
                  />
                </div>

                {/* Driver Email */}
                <div>
                  <label
                    htmlFor="driverEmail"
                    className="block text-xs font-bold text-gray-400 mb-2"
                  >
                    DRIVER EMAIL
                  </label>

                  <input
                    id="driverEmail"
                    type="email"
                    name="driverEmail"
                    value={formData.driverEmail}
                    onChange={handleChange}
                    placeholder="driver@example.com"
                    required
                    className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-gray-600 outline-none focus:border-emerald-500"
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
                    className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-gray-600 outline-none focus:border-emerald-500"
                  />
                </div>

                {/* License Number */}
                <div>
                  <label
                    htmlFor="licenseNumber"
                    className="block text-xs font-bold text-gray-400 mb-2"
                  >
                    LICENSE NUMBER
                  </label>

                  <input
                    id="licenseNumber"
                    type="text"
                    name="licenseNumber"
                    value={formData.licenseNumber}
                    onChange={handleChange}
                    placeholder="Enter driving license number"
                    required
                    className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-gray-600 outline-none focus:border-emerald-500"
                  />
                </div>

                {/* License Expire Date */}
                <div>
                  <label
                    htmlFor="licenseExpireDate"
                    className="block text-xs font-bold text-gray-400 mb-2"
                  >
                    LICENSE EXPIRE DATE
                  </label>

                  <input
                    id="licenseExpireDate"
                    type="date"
                    name="licenseExpireDate"
                    value={formData.licenseExpireDate}
                    onChange={handleChange}
                    required
                    className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-emerald-500 [color-scheme:dark]"
                  />
                </div>

                {/* Driver Experience */}
                <div>
                  <label
                    htmlFor="driverExperience"
                    className="block text-xs font-bold text-gray-400 mb-2"
                  >
                    DRIVING EXPERIENCE (YEARS)
                  </label>

                  <input
                    id="driverExperience"
                    type="number"
                    name="driverExperience"
                    value={formData.driverExperience}
                    onChange={handleChange}
                    placeholder="Enter years of experience"
                    required
                    min="0"
                    className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-gray-600 outline-none focus:border-emerald-500"
                  />
                </div>
              </div>
            </section>

            <div className="border-t border-white/10" />

            {/* Service Location */}
            <section>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-11 h-11 rounded-xl border border-blue-500/30 bg-blue-500/10 flex items-center justify-center">
                  <MapPin className="text-blue-400" size={24} />
                </div>

                <div>
                  <h3 className="text-xl md:text-2xl font-black">
                    Service Location
                  </h3>

                  <p className="text-xs text-gray-500 mt-1">
                    Enter the operating area and map location
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Service Area */}
                <div className="md:col-span-2">
                  <label
                    htmlFor="serviceArea"
                    className="block text-xs font-bold text-gray-400 mb-2"
                  >
                    SERVICE AREA
                  </label>

                  <input
                    id="serviceArea"
                    type="text"
                    name="serviceArea"
                    value={formData.serviceArea}
                    onChange={handleChange}
                    placeholder="Example: Colombo"
                    required
                    className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-gray-600 outline-none focus:border-blue-500"
                  />
                </div>

                {/* Latitude */}
                <div>
                  <label
                    htmlFor="latitude"
                    className="block text-xs font-bold text-gray-400 mb-2"
                  >
                    LATITUDE
                  </label>

                  <input
                    id="latitude"
                    type="number"
                    step="any"
                    name="latitude"
                    value={formData.latitude}
                    onChange={handleChange}
                    placeholder="6.9271"
                    required
                    className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-gray-600 outline-none focus:border-blue-500"
                  />
                </div>

                {/* Longitude */}
                <div>
                  <label
                    htmlFor="longitude"
                    className="block text-xs font-bold text-gray-400 mb-2"
                  >
                    LONGITUDE
                  </label>

                  <input
                    id="longitude"
                    type="number"
                    step="any"
                    name="longitude"
                    value={formData.longitude}
                    onChange={handleChange}
                    placeholder="79.8612"
                    required
                    className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-gray-600 outline-none focus:border-blue-500"
                  />
                </div>
              </div>
            </section>

            {/* Submit Button */}
            <div className="flex justify-center pt-2">
              <button
                type="submit"
                className="w-full md:w-auto flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-500 text-white font-black rounded-xl px-8 py-3 transition"
              >
                <Save size={18} />
                REGISTER EXTERNAL TRUCK & DRIVER
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}