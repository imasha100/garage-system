import React, { useState } from "react";
import {
  User,
  Lock,
  ArrowLeft,
  ShieldQuestion,
  LoaderCircle,
  AlertCircle,
} from "lucide-react";

export default function AssistanceLogin({ onNavigate }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const [isLoading, setIsLoading] = useState(false);

  const [errorMessage, setErrorMessage] = useState("");

  const handleLogin = async (event) => {
    event.preventDefault();

    setIsLoading(true);
    setErrorMessage("");

    try {
      const response = await fetch(
        "http://localhost:5000/api/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            username: username.trim(),
            password,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Invalid username or password."
        );
      }

      const userRole = String(
        data.user?.role || data.role || ""
      ).toLowerCase();

      if (userRole !== "assistance") {
        throw new Error(
          "This account is not authorized for the Assistance Portal."
        );
      }

      localStorage.setItem(
        "loggedInUser",
        JSON.stringify({
          loginId:
            data.user?.loginId ||
            data.user?.login_id ||
            data.loginId ||
            null,
          username:
            data.user?.username ||
            data.user?.user_name ||
            username.trim(),
          role: userRole,
        })
      );

      setUsername("");
      setPassword("");

      onNavigate("assistance-dashboard");
    } catch (error) {
      console.error("Assistance login error:", error);

      setErrorMessage(
        error.message || "Unable to login. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#020617] flex items-center justify-center px-4 text-white relative overflow-hidden">
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-[150px]" />

      <button
        type="button"
        onClick={() => onNavigate("start")}
        className="absolute top-6 left-6 flex items-center gap-2 text-amber-400 hover:text-amber-300 transition"
      >
        <ArrowLeft size={20} />
        Back
      </button>

      <form
        onSubmit={handleLogin}
        className="relative z-10 w-full max-w-md bg-slate-900/80 backdrop-blur-md border border-amber-500/20 rounded-3xl p-8 shadow-[0_0_50px_rgba(245,158,11,0.15)]"
      >
        <div className="text-center mb-8">
          <div className="w-20 h-20 rounded-2xl bg-amber-500/10 flex items-center justify-center mx-auto mb-4">
            <ShieldQuestion
              size={40}
              className="text-amber-400"
            />
          </div>

          <h1 className="text-3xl font-bold">
            Assistance Login
          </h1>

          <p className="text-slate-400 mt-2">
            SwiftGarage AI Assistance Portal
          </p>
        </div>

        {errorMessage && (
          <div className="mb-5 flex items-start gap-3 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
            <AlertCircle
              size={18}
              className="mt-0.5 shrink-0"
            />

            <span>{errorMessage}</span>
          </div>
        )}

        <div className="mb-5">
          <label
            htmlFor="username"
            className="block text-sm text-slate-300 mb-2"
          >
            Username
          </label>

          <div className="flex items-center bg-slate-800 rounded-xl px-4 border border-slate-700 focus-within:border-amber-400">
            <User
              size={18}
              className="text-amber-400"
            />

            <input
              id="username"
              type="text"
              placeholder="Enter Username"
              value={username}
              onChange={(event) => {
                setUsername(event.target.value);
                setErrorMessage("");
              }}
              required
              disabled={isLoading}
              autoComplete="username"
              className="w-full bg-transparent outline-none px-3 py-4 text-white placeholder:text-slate-500 disabled:opacity-60"
            />
          </div>
        </div>

        <div className="mb-6">
          <label
            htmlFor="password"
            className="block text-sm text-slate-300 mb-2"
          >
            Password
          </label>

          <div className="flex items-center bg-slate-800 rounded-xl px-4 border border-slate-700 focus-within:border-amber-400">
            <Lock
              size={18}
              className="text-amber-400"
            />

            <input
              id="password"
              type="password"
              placeholder="Enter Password"
              value={password}
              onChange={(event) => {
                setPassword(event.target.value);
                setErrorMessage("");
              }}
              required
              disabled={isLoading}
              autoComplete="current-password"
              className="w-full bg-transparent outline-none px-3 py-4 text-white placeholder:text-slate-500 disabled:opacity-60"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-lg flex items-center justify-center gap-2 transition disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <>
              <LoaderCircle
                size={20}
                className="animate-spin"
              />
              Logging in...
            </>
          ) : (
            "Login"
          )}
        </button>

        <div className="mt-6 text-center text-slate-500 text-sm">
          Authorized Assistance Staff Only
        </div>
      </form>
    </div>
  );
}