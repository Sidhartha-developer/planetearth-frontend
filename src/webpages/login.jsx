import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { Mail, Lock, Eye, EyeOff, ArrowRight } from "lucide-react";
import { login } from "../redux/rAuth/actions";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { loading, error, token, user } = useSelector((state) => state.auth);

  useEffect(() => {
    if (token && user) {
      if (user.role === "admin") navigate("/admin");
      else if (user.role === "staff") navigate("/staff");
    }
  }, [token, user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    await dispatch(login(email, password));
  };

  return (
    <div className="relative min-h-screen w-full overflow-hidden flex items-center justify-center bg-[#050712]">

      {/* 🔥 FIRE FORCE */}
      <div className="absolute left-[-25%] top-1/2 -translate-y-1/2
                      w-[700px] h-[700px]
                      bg-gradient-to-br from-orange-500 via-red-600 to-amber-500
                      rounded-full blur-[160px] opacity-80
                      animate-[fireFloat_14s_ease-in-out_infinite]" />

      {/* 🌊 WATER FORCE */}
      <div className="absolute right-[-25%] top-1/2 -translate-y-1/2
                      w-[700px] h-[700px]
                      bg-gradient-to-br from-cyan-400 via-blue-600 to-indigo-700
                      rounded-full blur-[160px] opacity-80
                      animate-[waterFloat_16s_ease-in-out_infinite]" />

      {/* ✨ COLLISION CORE */}
      <div className="absolute w-[520px] h-[520px]
                      bg-gradient-to-br from-cyan-400/40 via-purple-500/30 to-orange-400/40
                      rounded-full blur-[140px]" />

      {/* 🔐 LOGIN CARD */}
      <div
        className="relative z-10 w-[92%] max-w-md
                   bg-white/10 backdrop-blur-2xl
                   border border-white/20
                   rounded-3xl p-8
                   shadow-[0_0_80px_rgba(0,0,0,0.6)]"
        style={{
          boxShadow:
            "0 0 40px rgba(0,194,255,0.25), 0 0 40px rgba(255,140,0,0.25)",
        }}
      >
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            Admin Login
          </h1>
          <p className="text-white/70 text-sm">
            Control where fire meets water
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-5 p-3 rounded-xl bg-red-500/20 border border-red-400/30 text-red-200 text-sm">
            {error}
          </div>
        )}

        {/* FORM */}
        <form onSubmit={handleSubmit} className="space-y-6">

          {/* Email */}
          <div>
            <label className="text-sm text-white/80 mb-2 block">
              Email
            </label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40 w-5 h-5" />
              <input
                type="email"
                required
                disabled={loading}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@planetearth.com"
                className="w-full pl-12 pr-4 py-3 rounded-xl
                           bg-white/80 text-gray-900
                           border border-white/30
                           focus:ring-2 focus:ring-cyan-400
                           outline-none"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="text-sm text-white/80 mb-2 block">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40 w-5 h-5" />
              <input
                type={showPassword ? "text" : "password"}
                required
                disabled={loading}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-12 pr-12 py-3 rounded-xl
                           bg-white/80 text-gray-900
                           border border-white/30
                           focus:ring-2 focus:ring-orange-400
                           outline-none"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-600"
              >
                {showPassword ? <EyeOff /> : <Eye />}
              </button>
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl font-semibold text-white
                       bg-gradient-to-r from-orange-500 via-red-500 to-amber-500
                       hover:shadow-[0_0_40px_rgba(255,140,0,0.6)]
                       transition-all duration-300
                       flex items-center justify-center gap-2
                       disabled:opacity-50"
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Signing in...
              </>
            ) : (
              <>
                Sign In
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>
        </form>
      </div>

      {/* 🔑 ANIMATIONS */}
      <style>
        {`
          @keyframes fireFloat {
            0%,100% { transform: translateY(-50%) scale(1); }
            50% { transform: translateY(-52%) scale(1.05); }
          }
          @keyframes waterFloat {
            0%,100% { transform: translateY(-50%) scale(1); }
            50% { transform: translateY(-48%) scale(1.04); }
          }
        `}
      </style>
    </div>
  );
}
