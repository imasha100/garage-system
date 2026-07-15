import React, { useState } from "react";
import {
  ShieldAlert,
  Wrench,
  Cpu,
  ChevronDown,
  Info,
  MapPin,
  Truck,
  CheckCircle2,
  Navigation,
  BrainCircuit,
  Clock3,
  ShieldCheck,
  Phone,
  Mail,
  Menu,
  X,
  Send,
  ArrowUpRight,
  Sparkles,
  Headphones,
  CarFront,
  Gauge,
  UserRound,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import heroImage from "../assets/hero.jpg";
import aboutImage from "../assets/about.jpg";
import processImage from "../assets/process.jpg";
import technicianImage from "../assets/technician.jpg";
import supportImage from "../assets/support.jpg";

import towServiceImage from "../assets/service-tow.jpg";
import garageServiceImage from "../assets/service-garage.jpg";
import trackingServiceImage from "../assets/service-tracking1.jpg";
import aiServiceImage from "../assets/service-ai.jpg";
import recoveryServiceImage from "../assets/service-recovery.jpg";
import managementServiceImage from "../assets/service-management.jpg";

const fadeUp = {
  hidden: { opacity: 0, y: 45 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] },
  },
};

const staggerContainer = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.1, delayChildren: 0.08 },
  },
};

const cardReveal = {
  hidden: { opacity: 0, y: 35, scale: 0.96 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] },
  },
};

const imageRevealLeft = {
  hidden: { opacity: 0, x: -55, scale: 0.94 },
  visible: {
    opacity: 1,
    x: 0,
    scale: 1,
    transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] },
  },
};

const imageRevealRight = {
  hidden: { opacity: 0, x: 55, scale: 0.94 },
  visible: {
    opacity: 1,
    x: 0,
    scale: 1,
    transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] },
  },
};

const premiumImageRevealLeft = {
  hidden: {
    opacity: 0,
    x: -90,
    y: 24,
    scale: 0.88,
    rotateY: 12,
    filter: "blur(14px)",
  },
  visible: {
    opacity: 1,
    x: 0,
    y: 0,
    scale: 1,
    rotateY: 0,
    filter: "blur(0px)",
    transition: {
      duration: 1.05,
      ease: [0.16, 1, 0.3, 1],
    },
  },
};

const premiumImageRevealRight = {
  hidden: {
    opacity: 0,
    x: 90,
    y: 24,
    scale: 0.88,
    rotateY: -12,
    filter: "blur(14px)",
  },
  visible: {
    opacity: 1,
    x: 0,
    y: 0,
    scale: 1,
    rotateY: 0,
    filter: "blur(0px)",
    transition: {
      duration: 1.05,
      ease: [0.16, 1, 0.3, 1],
    },
  },
};

const sectionViewport = { once: true, amount: 0.18 };

export default function StartPage({ onNavigate }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [contactForm, setContactForm] = useState({
    name: "",
    email: "",
    contactNumber: "",
    message: "",
  });
  const [messageSent, setMessageSent] = useState(false);
  const [truckRequestOpen, setTruckRequestOpen] = useState(false);
  const [truckRequestSent, setTruckRequestSent] = useState(false);
  const [truckRequestForm, setTruckRequestForm] = useState({
    truckNumber: "",
    truckType: "",
    capacity: "",
    truckModel: "",
    registrationDate: "",
    latitude: "",
    longitude: "",
    driverFullName: "",
    driverNic: "",
    driverEmail: "",
    driverContactNumber: "",
    licenceNumber: "",
    licenceExpiryDate: "",
    experienceYears: "",
  });

  const handleContactChange = (event) => {
    const { name, value } = event.target;

    setContactForm((previousForm) => ({
      ...previousForm,
      [name]: value,
    }));

    if (messageSent) setMessageSent(false);
  };

  const handleContactSubmit = (event) => {
    event.preventDefault();
    setMessageSent(true);
    setContactForm({
      name: "",
      email: "",
      contactNumber: "",
      message: "",
    });
  };

  const scrollToAbout = () => {
    document.getElementById("about")?.scrollIntoView({ behavior: "smooth" });
  };

  const openTruckRequest = () => {
    setMobileMenuOpen(false);
    setTruckRequestSent(false);
    setTruckRequestOpen(true);
  };

  const closeTruckRequest = () => {
    setTruckRequestOpen(false);
  };

  const handleTruckRequestChange = (event) => {
    const { name, value, type, checked } = event.target;

    setTruckRequestForm((previousForm) => ({
      ...previousForm,
      [name]: type === "checkbox" ? checked : value,
    }));

    if (truckRequestSent) setTruckRequestSent(false);
  };

  const handleTruckRequestSubmit = (event) => {
    event.preventDefault();
    setTruckRequestSent(true);
  };

  const services = [
    {
      icon: Truck,
      title: "Emergency Tow Dispatch",
      description:
        "Request the nearest available tow truck and receive coordinated roadside support during a breakdown.",
      image: towServiceImage,
    },
    {
      icon: MapPin,
      title: "Nearby Garage Search",
      description:
        "Discover suitable garages around your live location and compare available service options instantly.",
      image: garageServiceImage,
    },
    {
      icon: Navigation,
      title: "Live Service Tracking",
      description:
        "Follow technician arrival, tow movement and service progress through real-time status updates.",
      image: trackingServiceImage,
    },
    {
      icon: BrainCircuit,
      title: "AI Recommendations",
      description:
        "Receive intelligent garage and service suggestions based on location, urgency and vehicle requirements.",
      image: aiServiceImage,
    },
    {
      icon: Wrench,
      title: "Vehicle Recovery",
      description:
        "Access professional assistance for both driveable and non-driveable vehicle recovery situations.",
      image: recoveryServiceImage,
    },
    {
      icon: CheckCircle2,
      title: "Digital Service Management",
      description:
        "Manage requests, invoices, payments, service history and customer feedback through one platform.",
      image: managementServiceImage,
    },
  ];

  const features = [
    {
      icon: Clock3,
      title: "Fast Response",
      description:
        "Rapidly connects customers with available garages, technicians and towing resources.",
      stat: "24/7",
      label: "Support coverage",
    },
    {
      icon: MapPin,
      title: "Real-Time Tracking",
      description:
        "Live location visibility helps customers monitor every stage of their roadside request.",
      stat: "Live",
      label: "Location updates",
    },
    {
      icon: BrainCircuit,
      title: "Smart Recommendations",
      description:
        "AI-powered matching identifies the most suitable service provider for each situation.",
      stat: "AI",
      label: "Decision support",
    },
    {
      icon: ShieldCheck,
      title: "Secure Platform",
      description:
        "Role-based access protects customer, technician, assistance and garage owner operations.",
      stat: "4",
      label: "Protected user roles",
    },
  ];

  const processSteps = [
    {
      number: "01",
      icon: ShieldAlert,
      title: "Request Assistance",
      description: "Submit an emergency or roadside support request in seconds.",
    },
    {
      number: "02",
      icon: MapPin,
      title: "Share Live Location",
      description: "Provide the vehicle location and the required service details.",
    },
    {
      number: "03",
      icon: Truck,
      title: "Resource Dispatch",
      description: "The best available technician or tow truck is assigned.",
    },
    {
      number: "04",
      icon: CheckCircle2,
      title: "Track & Complete",
      description: "Monitor progress until recovery or repair is fully completed.",
    },
  ];

  const navLinks = [
    ["About", "about"],
    ["How It Works", "how-it-works"],
    ["Services", "services"],
    ["Why Choose Us", "why-us"],
    ["Contact", "contact"],
  ];

  return (
    <div className="w-full min-h-screen overflow-x-hidden bg-[#05080d] text-white scroll-smooth selection:bg-teal-400 selection:text-slate-950">
      {/* STICKY NAVIGATION */}
      <header className="fixed inset-x-0 top-0 z-[100] border-b border-white/10 bg-[#05080d]/90 shadow-[0_8px_30px_rgba(0,0,0,0.18)] backdrop-blur-2xl">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <a
              href="#top"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2"
            >
              <div className="rounded-xl border border-teal-400/20 bg-teal-400/10 p-2">
                <Wrench className="h-5 w-5 text-teal-400" />
              </div>
              <span className="font-black tracking-wide">
                SwiftGarage <span className="text-teal-400">AI</span>
              </span>
            </a>

            <nav className="hidden items-center gap-1 md:flex" aria-label="Main navigation">
              {navLinks.map(([label, id]) => (
                <a
                  key={id}
                  href={`#${id}`}
                  className="rounded-xl px-3 py-2 text-sm font-semibold text-slate-300 transition hover:bg-white/5 hover:text-teal-300 lg:px-4"
                >
                  {label}
                </a>
              ))}
            </nav>

            <button
              type="button"
              onClick={openTruckRequest}
              className="hidden items-center gap-2 rounded-xl bg-gradient-to-r from-teal-400 to-cyan-400 px-4 py-2.5 text-sm font-black text-slate-950 shadow-[0_10px_30px_rgba(45,212,191,0.18)] transition hover:-translate-y-0.5 hover:shadow-[0_14px_40px_rgba(45,212,191,0.3)] xl:flex"
            >
              <Truck className="h-4 w-4" />
              Register Tow Truck
            </button>

            <button
              type="button"
              onClick={() => setMobileMenuOpen((previous) => !previous)}
              className="rounded-xl border border-white/10 bg-white/5 p-2 text-slate-200 transition hover:border-teal-400/30 hover:text-teal-300 md:hidden"
              aria-label="Toggle navigation menu"
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>

          <AnimatePresence>
            {mobileMenuOpen && (
              <motion.nav
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.25 }}
                className="overflow-hidden md:hidden"
                aria-label="Mobile navigation"
              >
                <div className="mb-4 flex flex-col gap-1 rounded-2xl border border-white/10 bg-slate-900/95 p-3 shadow-2xl">
                  {navLinks.map(([label, id]) => (
                    <a
                      key={id}
                      href={`#${id}`}
                      onClick={() => setMobileMenuOpen(false)}
                      className="rounded-xl px-4 py-3 text-sm font-semibold text-slate-300 transition hover:bg-teal-400/10 hover:text-teal-300"
                    >
                      {label}
                    </a>
                  ))}
                  <button
                    type="button"
                    onClick={openTruckRequest}
                    className="mt-2 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-teal-400 to-cyan-400 px-4 py-3 text-sm font-black text-slate-950"
                  >
                    <Truck className="h-4 w-4" />
                    Register Tow Truck
                  </button>
                </div>
              </motion.nav>
            )}
          </AnimatePresence>
        </div>
      </header>


      {/* HERO */}
      <section
        id="top"
        className="relative min-h-screen overflow-hidden px-4 pb-5 pt-24 sm:px-8 sm:pt-24 md:px-12 lg:h-screen lg:min-h-[720px] lg:px-16 lg:pb-4 lg:pt-20 scroll-mt-20"
      >
        <div className="absolute inset-0">
          <img
            src={heroImage}
            alt="Professional mechanic working in a modern automotive service centre"
            className="h-full w-full object-cover object-center opacity-30"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#05080d] via-[#05080d]/95 to-[#05080d]/50" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#05080d] via-transparent to-[#05080d]/50" />
        </div>

        <motion.div
          animate={{ x: [0, 40, 0], y: [0, -25, 0] }}
          transition={{ duration: 11, repeat: Infinity, ease: "easeInOut" }}
          className="pointer-events-none absolute -left-32 top-24 h-[420px] w-[420px] rounded-full bg-teal-500/15 blur-[120px]"
        />
        <motion.div
          animate={{ x: [0, -35, 0], y: [0, 30, 0] }}
          transition={{ duration: 13, repeat: Infinity, ease: "easeInOut" }}
          className="pointer-events-none absolute -right-32 bottom-20 h-[460px] w-[460px] rounded-full bg-red-500/15 blur-[140px]"
        />

        <div className="relative z-10 mx-auto flex min-h-[calc(100vh-7rem)] max-w-7xl flex-col lg:h-full lg:min-h-0">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65 }}
            className="flex items-center justify-center gap-3 pt-1 lg:hidden"
          >
            <div className="relative rounded-2xl border border-teal-400/25 bg-slate-950/70 p-3 shadow-[0_0_35px_rgba(45,212,191,0.2)] backdrop-blur-xl">
              <Wrench className="h-8 w-8 text-teal-400 md:h-10 md:w-10" />
              <Cpu className="absolute -right-1 -top-1 h-4 w-4 animate-pulse text-cyan-300" />
            </div>
            <h1 className="bg-gradient-to-r from-white via-slate-100 to-teal-300 bg-clip-text text-2xl font-black uppercase tracking-wider text-transparent sm:text-4xl md:text-5xl">
              SwiftGarage <span className="text-teal-400">AI</span>
            </h1>
          </motion.div>

          <div className="grid flex-1 items-center gap-8 py-8 lg:min-h-0 lg:grid-cols-[1.08fr_0.92fr] lg:gap-10 lg:py-3">
            <motion.div
              initial={{ opacity: 0, x: -55 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.12 }}
              className="text-center lg:text-left"
            >
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-teal-400/25 bg-teal-400/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.22em] text-teal-300 backdrop-blur-md sm:text-sm">
                <Sparkles className="h-4 w-4" />
                Intelligent roadside assistance
              </div>

              <h2 className="max-w-4xl text-4xl font-black leading-[1.05] tracking-tight sm:text-5xl md:text-6xl lg:text-5xl xl:text-6xl">
                Smarter roadside support,
                <span className="mt-2 block bg-gradient-to-r from-teal-300 via-cyan-300 to-blue-400 bg-clip-text text-transparent">
                  whenever you need it.
                </span>
              </h2>

              <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-slate-300 sm:text-lg lg:mx-0 lg:text-base xl:text-lg">
                Connect with nearby garages, qualified technicians and towing
                resources through one secure, intelligent and real-time service
                platform.
              </p>

              <div className="mt-6 flex flex-col items-center gap-3 sm:flex-row lg:justify-start">
                <motion.button
                  whileHover={{ scale: 1.025, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => onNavigate("customer-login")}
                  className="group flex w-full items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-red-600 via-orange-500 to-red-600 px-6 py-4 font-black uppercase tracking-wider text-white shadow-[0_18px_50px_rgba(220,38,38,0.35)] transition-shadow hover:shadow-[0_22px_70px_rgba(220,38,38,0.5)] sm:w-auto"
                >
                  <ShieldAlert className="h-6 w-6 group-hover:animate-pulse" />
                  Emergency / Customer Login
                  <ArrowUpRight className="h-5 w-5 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
                </motion.button>

                <button
                  type="button"
                  onClick={scrollToAbout}
                  className="group flex items-center gap-3 rounded-2xl border border-white/15 bg-white/5 px-6 py-4 font-bold text-slate-100 backdrop-blur-md transition hover:border-teal-400/40 hover:bg-teal-400/10"
                >
                  Explore Platform
                  <ChevronDown className="h-5 w-5 transition-transform group-hover:translate-y-1" />
                </button>

                <button
                  type="button"
                  onClick={openTruckRequest}
                  className="group flex w-full items-center justify-center gap-3 rounded-2xl border border-teal-400/30 bg-teal-400/10 px-6 py-4 font-bold text-teal-200 backdrop-blur-md transition hover:border-teal-300/60 hover:bg-teal-400/15 sm:w-auto"
                >
                  <Truck className="h-5 w-5" />
                  Register Your Tow Truck
                </button>
              </div>

              
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 55, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              transition={{ duration: 0.85, delay: 0.22 }}
              className="relative mx-auto w-full max-w-xl"
            >
              <motion.div
                animate={{ y: [0, -9, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                className="overflow-hidden rounded-[2rem] border border-white/15 bg-slate-900/65 p-3 shadow-[0_30px_90px_rgba(0,0,0,0.55)] backdrop-blur-2xl"
              >
                <div className="relative h-[300px] overflow-hidden rounded-[1.55rem] sm:h-[380px] lg:h-[310px] xl:h-[350px]">
                  <img
                    src={towServiceImage}
                    alt="Roadside towing and vehicle recovery service"
                    className="h-full w-full object-cover transition-transform duration-[1500ms] hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />

                  <div className="absolute bottom-8 left-8 right-8">
  <h3 className="text-2xl font-black text-white drop-shadow-[0_4px_20px_rgba(0,0,0,0.8)]">
    Fast, Reliable Support When You Need It Most.
  </h3>
</div>
                </div>
              </motion.div>

             

              
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.4 }}
            className="pb-1 lg:shrink-0"
          >
            <motion.button
              type="button"
              whileHover={{ y: -6, scale: 1.015 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onNavigate("staff-login")}
              className="group mx-auto flex w-full max-w-3xl items-center justify-between gap-5 rounded-2xl border border-white/10 bg-slate-950/60 p-4 text-left backdrop-blur-xl transition hover:border-teal-400/40 hover:bg-slate-900/80 sm:p-5"
            >
              <div className="flex items-center gap-4">
                <div className="rounded-xl bg-teal-400/10 p-3 text-teal-300 transition-transform duration-300 group-hover:rotate-3 group-hover:scale-110">
                  <ShieldCheck className="h-7 w-7" />
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">
                    Secure staff access
                  </p>
                  <p className="text-lg font-black text-white sm:text-xl">Staff Login</p>
                  <p className="mt-1 text-xs text-slate-400 sm:text-sm">
                    Garage Owner, Technician and Assistance Officer
                  </p>
                </div>
              </div>

              <ArrowUpRight className="h-5 w-5 shrink-0 text-slate-500 transition-transform group-hover:-translate-y-1 group-hover:translate-x-1 group-hover:text-teal-300" />
            </motion.button>
          </motion.div>
        </div>
      </section>

      {/* ABOUT */}
      <section id="about" className="relative overflow-hidden bg-[#080d14] px-5 py-24 sm:px-8 md:py-32 lg:px-14 scroll-mt-20">
        <div className="pointer-events-none absolute right-0 top-0 h-96 w-96 rounded-full bg-teal-500/10 blur-[150px]" />
        <div className="mx-auto grid max-w-7xl items-center gap-14 lg:grid-cols-2">
          <motion.div
            initial={{ opacity: 0, y: 80, scale: 0.9, rotateX: 10 }}
            whileInView={{ opacity: 1, y: 0, scale: 1, rotateX: 0 }}
            viewport={{ once: true, amount: 0.28 }}
            transition={{ duration: 1.05, ease: [0.16, 1, 0.3, 1] }}
            whileHover={{ y: -8, scale: 1.01 }}
            className="relative [perspective:1400px]"
          >
            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
              className="group relative overflow-hidden rounded-[2rem] border border-white/10 shadow-[0_35px_100px_rgba(0,0,0,0.5)]"
            >
              <motion.img
                src={aboutImage}
                alt="Technician servicing a vehicle in a modern garage"
                initial={{ scale: 1.18, filter: "blur(10px)" }}
                whileInView={{ scale: 1, filter: "blur(0px)" }}
                viewport={{ once: true, amount: 0.28 }}
                transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1] }}
                whileHover={{ scale: 1.06 }}
                className="h-[420px] w-full object-cover sm:h-[540px]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-transparent to-transparent" />
              <motion.div
                initial={{ x: -28, opacity: 0 }}
                whileInView={{ x: 0, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.7, delay: 0.45, ease: [0.22, 1, 0.36, 1] }}
                className="absolute bottom-0 left-0 right-0 p-6 sm:p-8"
              >
                <div className="max-w-sm rounded-2xl border border-white/15 bg-slate-950/65 p-5 backdrop-blur-xl">
                  <p className="text-sm font-bold uppercase tracking-[0.2em] text-teal-300">Connected ecosystem</p>
                  <p className="mt-2 text-xl font-black">Customer. Garage. Technician. Assistance.</p>
                </div>
              </motion.div>
            </motion.div>

            
          </motion.div>

          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={sectionViewport}
          >
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-teal-400/20 bg-teal-400/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.22em] text-teal-300">
              <Info className="h-4 w-4" /> About the platform
            </div>
            <h2 className="text-4xl font-black leading-tight sm:text-5xl md:text-6xl">
              One intelligent platform for
              <span className="block text-teal-400">complete vehicle support.</span>
            </h2>
            <p className="mt-6 text-lg leading-8 text-slate-300">
              SwiftGarage AI connects customers, garage owners, technicians and
              assistance officers in real time, creating a faster and more reliable
              roadside service experience.
            </p>
            <p className="mt-4 leading-8 text-slate-400">
              From emergency towing and nearby garage discovery to technician
              assignment, live tracking, digital invoicing and AI-powered
              recommendations, every service is managed through one centralized system.
            </p>

            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              {[
                [Gauge, "Faster coordination", "Reduce delays with real-time resource visibility."],
                [ShieldCheck, "Trusted operations", "Secure role-based access for every platform user."],
                [CarFront, "End-to-end recovery", "Support the customer from breakdown to completion."],
                [BrainCircuit, "Intelligent decisions", "Use AI guidance to select suitable service options."],
              ].map(([Icon, title, text]) => (
                <motion.div
                  key={title}
                  whileHover={{ y: -5 }}
                  className="rounded-2xl border border-white/10 bg-white/[0.035] p-5 transition hover:border-teal-400/30 hover:bg-teal-400/[0.06]"
                >
                  <Icon className="h-6 w-6 text-teal-300" />
                  <h3 className="mt-4 font-bold">{title}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-400">{text}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how-it-works" className="relative overflow-hidden bg-[#05080d] px-5 py-24 sm:px-8 md:py-32 lg:px-14 scroll-mt-20">
        <div className="pointer-events-none absolute left-1/2 top-0 h-80 w-80 -translate-x-1/2 rounded-full bg-blue-500/10 blur-[140px]" />
        <div className="mx-auto max-w-7xl">
          <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={sectionViewport} className="mx-auto mb-16 max-w-3xl text-center">
            <p className="text-sm font-bold uppercase tracking-[0.3em] text-teal-400">Simple process</p>
            <h2 className="mt-4 text-4xl font-black sm:text-5xl md:text-6xl">From request to recovery in four steps.</h2>
            <p className="mt-6 leading-8 text-slate-400">A clear digital workflow helps customers receive faster, better coordinated roadside support.</p>
          </motion.div>

          <div className="grid items-center gap-12 lg:grid-cols-[0.9fr_1.1fr]">
            <motion.div variants={imageRevealLeft} initial="hidden" whileInView="visible" viewport={sectionViewport} className="relative overflow-hidden rounded-[2rem] border border-white/10">
              <img
                src={processImage}
                alt="Vehicle travelling on a road with live assistance tracking"
                className="h-[470px] w-full object-cover sm:h-[620px]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/10 to-transparent" />
              <div className="absolute bottom-6 left-6 right-6 rounded-2xl border border-white/15 bg-slate-950/75 p-5 backdrop-blur-xl">
                <div className="flex items-center gap-4">
                  <div className="rounded-xl bg-teal-400/15 p-3 text-teal-300"><Navigation className="h-7 w-7" /></div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">Real-time journey</p>
                    <p className="mt-1 text-lg font-black">Track every important service update.</p>
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div variants={staggerContainer} initial="hidden" whileInView="visible" viewport={sectionViewport} className="relative space-y-4">
              <div className="absolute bottom-10 left-7 top-10 hidden w-px bg-gradient-to-b from-teal-400/70 via-teal-400/20 to-transparent sm:block" />
              {processSteps.map((step) => {
                const Icon = step.icon;
                return (
                  <motion.div key={step.number} variants={cardReveal} whileHover={{ x: 6 }} className="group relative flex gap-5 rounded-3xl border border-white/10 bg-slate-900/55 p-6 backdrop-blur-sm transition hover:border-teal-400/35 hover:bg-slate-900/80 sm:p-7">
                    <div className="relative z-10 flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-teal-400/20 bg-teal-400/10 text-teal-300 shadow-[0_0_25px_rgba(45,212,191,0.1)]">
                      <Icon className="h-7 w-7 transition-transform duration-300 group-hover:scale-110" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center justify-between gap-3">
                        <h3 className="text-xl font-black">{step.title}</h3>
                        <span className="text-3xl font-black text-white/[0.06]">{step.number}</span>
                      </div>
                      <p className="mt-2 leading-7 text-slate-400">{step.description}</p>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          </div>
        </div>
      </section>

      {/* SERVICES */}
      <section id="services" className="bg-[#080d14] px-5 py-24 sm:px-8 md:py-32 lg:px-14 scroll-mt-20">
        <div className="mx-auto max-w-7xl">
          <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={sectionViewport} className="mb-16 flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
            <div className="max-w-3xl">
              <p className="text-sm font-bold uppercase tracking-[0.3em] text-teal-400">What we provide</p>
              <h2 className="mt-4 text-4xl font-black sm:text-5xl md:text-6xl">Professional services built around your journey.</h2>
            </div>
            <p className="max-w-md leading-7 text-slate-400">A complete set of digital services supports emergency response, recovery, communication and service management.</p>
          </motion.div>

          <motion.div variants={staggerContainer} initial="hidden" whileInView="visible" viewport={sectionViewport} className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {services.map((service) => {
              const Icon = service.icon;
              return (
                <motion.article key={service.title} variants={cardReveal} whileHover={{ y: -10 }} className="group overflow-hidden rounded-[1.75rem] border border-white/10 bg-slate-950/70 shadow-[0_18px_55px_rgba(0,0,0,0.22)] transition hover:border-teal-400/35 hover:shadow-[0_24px_70px_rgba(0,0,0,0.36)]">
                  <div className="relative h-52 overflow-hidden">
                    <img src={service.image} alt={service.title} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110" />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/15 to-transparent" />
                    <div className="absolute bottom-4 left-5 rounded-2xl border border-white/15 bg-slate-950/75 p-3 text-teal-300 backdrop-blur-xl">
                      <Icon className="h-6 w-6" />
                    </div>
                  </div>
                  <div className="p-6 sm:p-7">
                    <div className="flex items-start justify-between gap-3">
                      <h3 className="text-xl font-black">{service.title}</h3>
                      <ArrowUpRight className="h-5 w-5 shrink-0 text-slate-600 transition-all group-hover:-translate-y-1 group-hover:translate-x-1 group-hover:text-teal-300" />
                    </div>
                    <p className="mt-3 text-sm leading-7 text-slate-400">{service.description}</p>
                  </div>
                </motion.article>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* WHY CHOOSE US */}
      <section id="why-us" className="relative overflow-hidden bg-[#05080d] px-5 py-24 sm:px-8 md:py-32 lg:px-14 scroll-mt-20">
        <div className="pointer-events-none absolute -left-20 bottom-0 h-96 w-96 rounded-full bg-blue-500/10 blur-[150px]" />
        <div className="mx-auto grid max-w-7xl items-center gap-14 lg:grid-cols-[1.05fr_0.95fr]">
          <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={sectionViewport}>
            <p className="text-sm font-bold uppercase tracking-[0.3em] text-teal-400">Why choose us</p>
            <h2 className="mt-4 text-4xl font-black sm:text-5xl md:text-6xl">Reliable technology. Human-focused assistance.</h2>
            <p className="mt-6 max-w-2xl leading-8 text-slate-400">SwiftGarage AI combines automation, live information and coordinated service teams to create a dependable roadside support experience.</p>

            <motion.div variants={staggerContainer} initial="hidden" whileInView="visible" viewport={sectionViewport} className="mt-10 grid gap-5 sm:grid-cols-2">
              {features.map((feature) => {
                const Icon = feature.icon;
                return (
                  <motion.div key={feature.title} variants={cardReveal} whileHover={{ y: -6 }} className="rounded-3xl border border-white/10 bg-white/[0.035] p-6 transition hover:border-teal-400/30 hover:bg-teal-400/[0.055]">
                    <div className="flex items-center justify-between gap-4">
                      <div className="rounded-2xl bg-teal-400/10 p-3 text-teal-300"><Icon className="h-6 w-6" /></div>
                      <div className="text-right">
                        <p className="text-2xl font-black text-white">{feature.stat}</p>
                        <p className="text-[11px] text-slate-500">{feature.label}</p>
                      </div>
                    </div>
                    <h3 className="mt-5 text-xl font-black">{feature.title}</h3>
                    <p className="mt-3 text-sm leading-7 text-slate-400">{feature.description}</p>
                  </motion.div>
                );
              })}
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 110, rotate: 3, scale: 0.92 }}
            whileInView={{ opacity: 1, x: 0, rotate: 0, scale: 1 }}
            viewport={{ once: true, amount: 0.26 }}
            transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
            whileHover={{ rotate: -1, scale: 1.01 }}
            className="relative"
          >
            <motion.div
              animate={{ scale: [1, 1.012, 1] }}
              transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
              className="group relative overflow-hidden rounded-[2rem] border border-white/10 shadow-[0_35px_110px_rgba(0,0,0,0.52)]"
            >
              <img
                src={technicianImage}
                alt="Professional automotive technician using digital diagnostic technology"
                className="block h-[520px] w-full object-cover transition-transform duration-700 group-hover:scale-105 sm:h-[680px]"
              />
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 24, scale: 0.94 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true }}
              animate={{ y: [0, -10, 0] }} transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }} className="absolute bottom-5 left-5 right-5 rounded-2xl border border-white/15 bg-slate-950/75 p-5 backdrop-blur-xl sm:left-8 sm:right-auto sm:max-w-sm">
              <div className="flex items-center gap-4">
                <div className="rounded-xl bg-emerald-400/15 p-3 text-emerald-300"><ShieldCheck className="h-7 w-7" /></div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-300">Secure & connected</p>
                  <p className="mt-1 font-black">Built for trusted service operations.</p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* CONTACT */}
      <section id="contact" className="relative overflow-hidden bg-[#080d14] px-5 pt-24 sm:px-8 md:pt-32 lg:px-14 scroll-mt-20">
        <div className="pointer-events-none absolute right-0 top-20 h-96 w-96 rounded-full bg-teal-500/10 blur-[150px]" />
        <div className="mx-auto max-w-7xl">
          <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={sectionViewport} className="mx-auto mb-14 max-w-3xl text-center">
            <p className="text-sm font-bold uppercase tracking-[0.3em] text-teal-400">Get in touch</p>
            <h2 className="mt-4 text-4xl font-black sm:text-5xl md:text-6xl">We are ready to assist you.</h2>
            <p className="mt-6 leading-8 text-slate-400">Contact the SwiftGarage AI support team for roadside assistance or platform-related inquiries.</p>
          </motion.div>

          <div className="grid gap-8 pb-24 lg:grid-cols-[0.9fr_1.1fr]">
            <motion.div variants={imageRevealLeft} initial="hidden" whileInView="visible" viewport={sectionViewport} className="relative overflow-hidden rounded-[2rem] border border-white/10 min-h-[620px]">
              <img
                src={supportImage}
                alt="Customer support team ready to assist"
                className="absolute inset-0 h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/65 to-slate-950/15" />
              <div className="relative z-10 flex h-full min-h-[620px] flex-col justify-end p-6 sm:p-8">
                <div className="mb-auto inline-flex w-fit items-center gap-2 rounded-full border border-white/15 bg-slate-950/65 px-4 py-2 text-xs font-bold uppercase tracking-[0.2em] text-teal-300 backdrop-blur-xl">
                  <Headphones className="h-4 w-4" /> Support centre
                </div>
                <h3 className="max-w-md text-3xl font-black sm:text-4xl">Professional support when every minute matters.</h3>
                <p className="mt-4 max-w-lg leading-7 text-slate-300">Our support team helps coordinate assistance requests, service communication and platform inquiries.</p>

                <div className="mt-8 space-y-3">
                  {[
                    [Phone, "+94 77 123 4567"],
                    [Mail, "support@swiftgarage.ai"],
                    [MapPin, "Colombo, Sri Lanka"],
                  ].map(([Icon, text]) => (
                    <div key={text} className="flex items-center gap-4 rounded-2xl border border-white/10 bg-slate-950/60 p-4 backdrop-blur-xl">
                      <div className="rounded-xl bg-teal-400/10 p-2.5 text-teal-300"><Icon className="h-5 w-5" /></div>
                      <p className="break-all font-semibold text-slate-200">{text}</p>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>

            <motion.form variants={imageRevealRight} initial="hidden" whileInView="visible" viewport={sectionViewport} onSubmit={handleContactSubmit} className="rounded-[2rem] border border-white/10 bg-slate-950/65 p-6 shadow-[0_25px_70px_rgba(0,0,0,0.28)] backdrop-blur-xl sm:p-9">
              <div className="mb-8">
                <p className="text-xs font-bold uppercase tracking-[0.22em] text-teal-300">Send a message</p>
                <h3 className="mt-3 text-3xl font-black">How can we help?</h3>
                <p className="mt-3 leading-7 text-slate-400">Complete the form and our support team will respond as soon as possible.</p>
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label htmlFor="contact-name" className="mb-2 block text-sm font-semibold text-slate-300">Name</label>
                  <input id="contact-name" name="name" type="text" value={contactForm.name} onChange={handleContactChange} placeholder="Enter your name" required className="w-full rounded-xl border border-white/10 bg-white/[0.045] px-4 py-3.5 text-white outline-none transition placeholder:text-slate-600 focus:border-teal-400/60 focus:ring-4 focus:ring-teal-400/10" />
                </div>
                <div>
                  <label htmlFor="contact-email" className="mb-2 block text-sm font-semibold text-slate-300">Email</label>
                  <input id="contact-email" name="email" type="email" value={contactForm.email} onChange={handleContactChange} placeholder="Enter your email" required className="w-full rounded-xl border border-white/10 bg-white/[0.045] px-4 py-3.5 text-white outline-none transition placeholder:text-slate-600 focus:border-teal-400/60 focus:ring-4 focus:ring-teal-400/10" />
                </div>
              </div>

              <div className="mt-5">
                <label htmlFor="contact-number" className="mb-2 block text-sm font-semibold text-slate-300">Contact Number</label>
                <input id="contact-number" name="contactNumber" type="tel" value={contactForm.contactNumber} onChange={handleContactChange} placeholder="Enter your contact number" required className="w-full rounded-xl border border-white/10 bg-white/[0.045] px-4 py-3.5 text-white outline-none transition placeholder:text-slate-600 focus:border-teal-400/60 focus:ring-4 focus:ring-teal-400/10" />
              </div>

              <div className="mt-5">
                <label htmlFor="contact-message" className="mb-2 block text-sm font-semibold text-slate-300">Message / Comment</label>
                <textarea id="contact-message" name="message" value={contactForm.message} onChange={handleContactChange} placeholder="Type your message or comment" rows={6} required className="w-full resize-none rounded-xl border border-white/10 bg-white/[0.045] px-4 py-3.5 text-white outline-none transition placeholder:text-slate-600 focus:border-teal-400/60 focus:ring-4 focus:ring-teal-400/10" />
              </div>

              <AnimatePresence>
                {messageSent && (
                  <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} role="status" className="mt-5 flex items-center gap-3 rounded-xl border border-emerald-400/25 bg-emerald-400/10 px-4 py-3 text-sm text-emerald-300">
                    <CheckCircle2 className="h-5 w-5 shrink-0" />
                    Your message has been sent successfully.
                  </motion.div>
                )}
              </AnimatePresence>

              <motion.button type="submit" whileHover={{ scale: 1.015, y: -2 }} whileTap={{ scale: 0.98 }} className="mt-6 flex w-full items-center justify-center gap-3 rounded-xl bg-gradient-to-r from-teal-400 to-cyan-400 px-5 py-4 font-black tracking-wide text-slate-950 shadow-[0_15px_40px_rgba(45,212,191,0.2)] transition hover:shadow-[0_18px_55px_rgba(45,212,191,0.3)]">
                <Send className="h-5 w-5" /> Send Message
              </motion.button>
            </motion.form>
          </div>
        </div>

        <footer className="border-t border-white/10 py-8">
          <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 md:flex-row">
            <div className="flex items-center gap-2">
              <Wrench className="h-6 w-6 text-teal-400" />
              <span className="font-black tracking-wide">SwiftGarage <span className="text-teal-400">AI</span></span>
            </div>
            <nav aria-label="Footer navigation" className="flex flex-wrap justify-center gap-x-6 gap-y-3 text-sm">
              <a href="#top" className="text-slate-400 transition hover:text-teal-300">Home</a>
              {navLinks.map(([label, id]) => (
                <a key={id} href={`#${id}`} className="text-slate-400 transition hover:text-teal-300">{label}</a>
              ))}
            </nav>
            <p className="text-center text-sm text-slate-500">© 2026 SwiftGarage AI. All Rights Reserved.</p>
          </div>
        </footer>
      </section>

      <AnimatePresence>
        {truckRequestOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 p-3 backdrop-blur-md sm:p-5"
            onMouseDown={closeTruckRequest}
          >
            <motion.div
              initial={{ opacity: 0, y: 30, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.97 }}
              transition={{ duration: 0.25 }}
              onMouseDown={(event) => event.stopPropagation()}
              className="max-h-[94vh] w-full max-w-5xl overflow-y-auto rounded-[2rem] border border-white/10 bg-[#080d14] shadow-[0_35px_120px_rgba(0,0,0,0.7)]"
            >
              <div className="sticky top-0 z-10 flex items-center justify-between border-b border-white/10 bg-[#080d14]/95 px-5 py-4 backdrop-blur-xl sm:px-8">
                <div className="flex items-center gap-3">
                  <div className="rounded-xl bg-teal-400/10 p-3 text-teal-300">
                    <Truck className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.2em] text-teal-300">External Partner Request</p>
                    <h2 className="text-xl font-black sm:text-2xl">Tow Truck Registration Request</h2>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={closeTruckRequest}
                  className="rounded-xl border border-white/10 bg-white/5 p-2 text-slate-300 transition hover:border-red-400/30 hover:bg-red-400/10 hover:text-red-300"
                  aria-label="Close registration form"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <form onSubmit={handleTruckRequestSubmit} className="space-y-8 p-5 sm:p-8">
                <div className="rounded-2xl border border-blue-400/15 bg-blue-400/[0.06] p-5">
                  <p className="text-sm leading-7 text-slate-300">
                    Enter the tow truck and truck driver details below. The request will be reviewed before the tow truck is added to the SwiftGarage AI service network.
                  </p>
                </div>

                <FormSection icon={Truck} title="Tow Truck Details">
                  <FormInput
                    label="Truck Number"
                    name="truckNumber"
                    value={truckRequestForm.truckNumber}
                    onChange={handleTruckRequestChange}
                    required
                  />
                  <FormSelect
                    label="Truck Type"
                    name="truckType"
                    value={truckRequestForm.truckType}
                    onChange={handleTruckRequestChange}
                    required
                    options={[
                      "Flatbed Tow Truck",
                      "Wheel-Lift Tow Truck",
                      "Integrated Tow Truck",
                      "Heavy-Duty Tow Truck",
                    ]}
                  />
                  <FormInput
                    label="Capacity"
                    name="capacity"
                    value={truckRequestForm.capacity}
                    onChange={handleTruckRequestChange}
                    placeholder="Example: 5 tons"
                    required
                  />
                  <FormInput
                    label="Truck Model"
                    name="truckModel"
                    value={truckRequestForm.truckModel}
                    onChange={handleTruckRequestChange}
                    required
                  />
                  <FormInput
                    label="Registration Date"
                    name="registrationDate"
                    type="date"
                    value={truckRequestForm.registrationDate}
                    onChange={handleTruckRequestChange}
                    required
                  />
                  <FormInput
                    label="Latitude"
                    name="latitude"
                    type="number"
                    step="any"
                    value={truckRequestForm.latitude}
                    onChange={handleTruckRequestChange}
                    required
                  />
                  <FormInput
                    label="Longitude"
                    name="longitude"
                    type="number"
                    step="any"
                    value={truckRequestForm.longitude}
                    onChange={handleTruckRequestChange}
                    required
                  />
                </FormSection>

                <FormSection icon={UserRound} title="Truck Driver Details">
                  <FormInput
                    label="Full Name"
                    name="driverFullName"
                    value={truckRequestForm.driverFullName}
                    onChange={handleTruckRequestChange}
                    required
                  />
                  <FormInput
                    label="NIC"
                    name="driverNic"
                    value={truckRequestForm.driverNic}
                    onChange={handleTruckRequestChange}
                    required
                  />
                  <FormInput
                    label="Email"
                    name="driverEmail"
                    type="email"
                    value={truckRequestForm.driverEmail}
                    onChange={handleTruckRequestChange}
                    required
                  />
                  <FormInput
                    label="Contact Number"
                    name="driverContactNumber"
                    type="tel"
                    value={truckRequestForm.driverContactNumber}
                    onChange={handleTruckRequestChange}
                    required
                  />
                  <FormInput
                    label="Licence Number"
                    name="licenceNumber"
                    value={truckRequestForm.licenceNumber}
                    onChange={handleTruckRequestChange}
                    required
                  />
                  <FormInput
                    label="Licence Expiry Date"
                    name="licenceExpiryDate"
                    type="date"
                    value={truckRequestForm.licenceExpiryDate}
                    onChange={handleTruckRequestChange}
                    required
                  />
                  <FormInput
                    label="Experience (Years)"
                    name="experienceYears"
                    type="number"
                    min="0"
                    value={truckRequestForm.experienceYears}
                    onChange={handleTruckRequestChange}
                    required
                  />
                </FormSection>

                <AnimatePresence>
                  {truckRequestSent && (
                    <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="flex items-start gap-3 rounded-2xl border border-emerald-400/25 bg-emerald-400/10 p-4 text-emerald-300">
                      <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" />
                      <div>
                        <p className="font-bold">Registration request submitted successfully.</p>
                        <p className="mt-1 text-sm text-emerald-200/75">The request is currently a frontend demonstration and can later be connected to the Garage Owner Registration Center.</p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="flex flex-col-reverse gap-3 border-t border-white/10 pt-6 sm:flex-row sm:justify-end">
                  <button type="button" onClick={closeTruckRequest} className="rounded-xl border border-white/10 bg-white/5 px-6 py-3.5 font-bold text-slate-300 transition hover:bg-white/10">Cancel</button>
                  <motion.button type="submit" whileHover={{ y: -2, scale: 1.01 }} whileTap={{ scale: 0.98 }} className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-teal-400 to-cyan-400 px-6 py-3.5 font-black text-slate-950 shadow-[0_14px_40px_rgba(45,212,191,0.2)]">
                    <Send className="h-5 w-5" /> Submit Registration Request
                  </motion.button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function FormSection({ icon: Icon, title, children }) {
  return (
    <section className="rounded-3xl border border-white/10 bg-white/[0.025] p-5 sm:p-6">
      <div className="mb-5 flex items-center gap-3">
        <div className="rounded-xl bg-teal-400/10 p-2.5 text-teal-300"><Icon className="h-5 w-5" /></div>
        <h3 className="text-lg font-black">{title}</h3>
      </div>
      <div className="grid gap-5 sm:grid-cols-2">{children}</div>
    </section>
  );
}

function FormInput({ label, className = "", type = "text", ...props }) {
  const openCalendar = (event) => {
    if (type === "date" && typeof event.currentTarget.showPicker === "function") {
      event.currentTarget.showPicker();
    }
  };

  return (
    <div className={className}>
      <label className="mb-2 block text-sm font-semibold text-slate-300">
        {label}
      </label>
      <input
        {...props}
        type={type}
        onClick={openCalendar}
        className={`w-full rounded-xl border border-white/10 bg-slate-950/70 px-4 py-3.5 text-white outline-none transition placeholder:text-slate-600 focus:border-teal-400/60 focus:ring-4 focus:ring-teal-400/10 ${
          type === "date" ? "cursor-pointer [color-scheme:dark]" : ""
        }`}
      />
    </div>
  );
}

function FormSelect({ label, options, ...props }) {
  return (
    <div>
      <label className="mb-2 block text-sm font-semibold text-slate-300">{label}</label>
      <select {...props} className="w-full rounded-xl border border-white/10 bg-slate-950/70 px-4 py-3.5 text-white outline-none transition focus:border-teal-400/60 focus:ring-4 focus:ring-teal-400/10">
        <option value="">Select {label}</option>
        {options.map((option) => <option key={option} value={option}>{option}</option>)}
      </select>
    </div>
  );
}