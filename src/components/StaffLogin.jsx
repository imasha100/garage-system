import React, { useMemo, useState } from "react";
import {
  ArrowLeft,
  Building2,
  CheckCircle2,
  Eye,
  EyeOff,
  LockKeyhole,
  LogIn,
  ShieldCheck,
  UserRound,
  Wrench,
  Headphones,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

const STAFF_ACCOUNTS = [
  {
    username: "owner01",
    password: "1234",
    role: "garage-owner",
    displayRole: "Garage Owner",
    redirectPage: "Live Dashboard",
  },
  {
    username: "tech01",
    password: "1234",
    role: "technician",
    displayRole: "Technician",
    redirectPage: "technician-dashboard",
  },
  {
    username: "assist01",
    password: "1234",
    role: "assistance",
    displayRole: "Assistance Officer",
    redirectPage: "assistance-dashboard",
  },
];

const ROLE_CARDS = [
  {
    icon: Building2,
    title: "Garage Owner",
    description: "Manage garage operations, resources and performance.",
  },
  {
    icon: Wrench,
    title: "Technician",
    description: "Access assigned jobs, vehicle intake and task history.",
  },
  {
    icon: Headphones,
    title: "Assistance Officer",
    description: "Coordinate service requests, dispatches and customer support.",
  },
];

export default function StaffLogin({ onNavigate }) {
  const [form, setForm] = useState({
    username: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const canSubmit = useMemo(
    () => form.username.trim() !== "" && form.password.trim() !== "",
    [form]
  );

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((previousForm) => ({
      ...previousForm,
      [name]: value,
    }));

    if (errorMessage) setErrorMessage("");
    if (successMessage) setSuccessMessage("");
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    const username = form.username.trim();
    const password = form.password.trim();

    if (!username || !password) {
      setErrorMessage("Please enter your username and password.");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage("");
    setSuccessMessage("");

    const matchedAccount = STAFF_ACCOUNTS.find(
      (account) =>
        account.username.toLowerCase() === username.toLowerCase() &&
        account.password === password
    );

    window.setTimeout(() => {
      if (!matchedAccount) {
        setIsSubmitting(false);
        setErrorMessage("Invalid username or password.");
        return;
      }

      setSuccessMessage(
        `Login successful. Opening the ${matchedAccount.displayRole} dashboard...`
      );

      window.setTimeout(() => {
        onNavigate(matchedAccount.redirectPage);
      }, 700);
    }, 500);
  };

  const handleBack = () => {
    onNavigate("start");
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#05080d] px-4 py-8 text-white sm:px-6 lg:px-10">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-24 top-20 h-96 w-96 rounded-full bg-teal-500/10 blur-[130px]" />
        <div className="absolute -right-24 bottom-10 h-[420px] w-[420px] rounded-full bg-blue-500/10 blur-[150px]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(45,212,191,0.08),transparent_30%),radial-gradient(circle_at_bottom_left,rgba(59,130,246,0.08),transparent_32%)]" />
      </div>

      <div className="relative z-10 mx-auto flex min-h-[calc(100vh-4rem)] max-w-7xl items-center">
        <div className="grid w-full overflow-hidden rounded-[2rem] border border-white/10 bg-slate-950/65 shadow-[0_35px_120px_rgba(0,0,0,0.55)] backdrop-blur-2xl lg:grid-cols-[1.08fr_0.92fr]">
          <motion.section
            initial={{ opacity: 0, x: -45 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
            className="relative overflow-hidden border-b border-white/10 p-6 sm:p-10 lg:border-b-0 lg:border-r lg:p-12"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-teal-400/[0.08] via-transparent to-blue-500/[0.08]" />

            <div className="relative">
              <button
                type="button"
                onClick={handleBack}
                className="mb-10 inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-semibold text-slate-300 transition hover:border-teal-400/30 hover:bg-teal-400/10 hover:text-teal-300"
              >
                <ArrowLeft className="h-4 w-4" />
               
              </button>

              <div className="mx-auto flex w-fit items-center gap-3 rounded-2xl border border-teal-400/20 bg-teal-400/10 px-4 py-3">
                <div className="rounded-xl bg-teal-400/15 p-2.5 text-teal-300">
                  <ShieldCheck className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.22em] text-teal-300">
                    Secure Staff Access
                  </p>
                  <p className="font-black">SwiftGarage AI</p>
                </div>
              </div>

              <h1 className="mt-8 max-w-xl text-4xl font-black leading-tight sm:text-5xl">
                One secure login for every
                <span className="block bg-gradient-to-r from-teal-300 via-cyan-300 to-blue-400 bg-clip-text text-transparent">
                  staff role.
                </span>
              </h1>

              <p className="mt-5 max-w-2xl leading-8 text-slate-400">
                Garage owners, technicians and assistance officers can sign in
                using the same staff portal. The system identifies the user role
                and opens the correct dashboard automatically.
              </p>

              <div className="mt-10 grid gap-4 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
                {ROLE_CARDS.map((role, index) => {
                  const Icon = role.icon;

                  return (
                    <motion.div
                      key={role.title}
                      initial={{ opacity: 0, y: 24 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: 0.16 + index * 0.1 }}
                      whileHover={{ y: -5 }}
                      className="rounded-2xl border border-white/10 bg-white/[0.035] p-5 transition hover:border-teal-400/25 hover:bg-teal-400/[0.05]"
                    >
                      <div className="w-fit rounded-xl bg-teal-400/10 p-3 text-teal-300">
                        <Icon className="h-6 w-6" />
                      </div>
                      <h2 className="mt-4 font-black">{role.title}</h2>
                      <p className="mt-2 text-sm leading-6 text-slate-500">
                        {role.description}
                      </p>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </motion.section>

          <motion.section
            initial={{ opacity: 0, x: 45 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{
              duration: 0.75,
              delay: 0.08,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="flex items-center p-6 sm:p-10 lg:p-12"
          >
            <form onSubmit={handleSubmit} className="mx-auto w-full max-w-md">
              <div className="mb-8">
                <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl border border-teal-400/20 bg-teal-400/10 text-teal-300 shadow-[0_0_35px_rgba(45,212,191,0.12)]">
                  <LogIn className="h-7 w-7" />
                </div>

                <p className="text-xs font-bold uppercase tracking-[0.24em] text-teal-300">
                  Staff Portal
                </p>

                <h2 className="mt-3 text-3xl font-black sm:text-4xl">
                  Sign in to continue
                </h2>

                <p className="mt-3 leading-7 text-slate-400">
                  Enter your registered username and password to access your
                  assigned dashboard.
                </p>
              </div>

              <div>
                <label
                  htmlFor="staff-username"
                  className="mb-2 block text-sm font-semibold text-slate-300"
                >
                  Username
                </label>

                <div className="relative">
                  <UserRound className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500" />

                  <input
                    id="staff-username"
                    name="username"
                    type="text"
                    value={form.username}
                    onChange={handleChange}
                    placeholder="Enter your username"
                    autoComplete="username"
                    required
                    className="w-full rounded-xl border border-white/10 bg-white/[0.045] py-3.5 pl-12 pr-4 text-white outline-none transition placeholder:text-slate-600 focus:border-teal-400/60 focus:ring-4 focus:ring-teal-400/10"
                  />
                </div>
              </div>

              <div className="mt-5">
                <label
                  htmlFor="staff-password"
                  className="mb-2 block text-sm font-semibold text-slate-300"
                >
                  Password
                </label>

                <div className="relative">
                  <LockKeyhole className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500" />

                  <input
                    id="staff-password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    value={form.password}
                    onChange={handleChange}
                    placeholder="Enter your password"
                    autoComplete="current-password"
                    required
                    className="w-full rounded-xl border border-white/10 bg-white/[0.045] py-3.5 pl-12 pr-12 text-white outline-none transition placeholder:text-slate-600 focus:border-teal-400/60 focus:ring-4 focus:ring-teal-400/10"
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword((previous) => !previous)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-2 text-slate-500 transition hover:bg-white/5 hover:text-teal-300"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>

              <AnimatePresence mode="wait">
                {errorMessage && (
                  <motion.div
                    key="error"
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    role="alert"
                    className="mt-5 rounded-xl border border-red-400/25 bg-red-400/10 px-4 py-3 text-sm text-red-300"
                  >
                    {errorMessage}
                  </motion.div>
                )}

                {successMessage && (
                  <motion.div
                    key="success"
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    role="status"
                    className="mt-5 flex items-start gap-3 rounded-xl border border-emerald-400/25 bg-emerald-400/10 px-4 py-3 text-sm text-emerald-300"
                  >
                    <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" />
                    <span>{successMessage}</span>
                  </motion.div>
                )}
              </AnimatePresence>

              <motion.button
                type="submit"
                disabled={!canSubmit || isSubmitting || Boolean(successMessage)}
                whileHover={
                  canSubmit && !isSubmitting ? { y: -2, scale: 1.01 } : {}
                }
                whileTap={canSubmit && !isSubmitting ? { scale: 0.98 } : {}}
                className="mt-6 flex w-full items-center justify-center gap-3 rounded-xl bg-gradient-to-r from-teal-400 to-cyan-400 px-5 py-4 font-black tracking-wide text-slate-950 shadow-[0_15px_45px_rgba(45,212,191,0.2)] transition disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <span className="h-5 w-5 animate-spin rounded-full border-2 border-slate-950/30 border-t-slate-950" />
                    Signing In...
                  </>
                ) : (
                  <>
                    <LogIn className="h-5 w-5" />
                    Staff Login
                  </>
                )}
              </motion.button>

              <button
                type="button"
                onClick={() =>
                  window.alert(
                    "Forgot Password can be connected to the backend email recovery process later."
                  )
                }
                className="mt-4 w-full text-center text-sm font-semibold text-slate-500 transition hover:text-teal-300"
              >
                Forgot Password?
              </button>

              <div className="mt-8 rounded-2xl border border-white/10 bg-white/[0.025] p-4">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
                  Demo Credentials
                </p>

                <div className="mt-3 space-y-2 text-xs text-slate-400">
                  <p>
                    Garage Owner: <span className="font-semibold text-slate-200">owner01 / 1234</span>
                  </p>
                  <p>
                    Technician: <span className="font-semibold text-slate-200">tech01 / 1234</span>
                  </p>
                  <p>
                    Assistance: <span className="font-semibold text-slate-200">assist01 / 1234</span>
                  </p>
                </div>
              </div>
            </form>
          </motion.section>
        </div>
      </div>
    </div>
  );
}