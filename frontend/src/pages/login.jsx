import { useState } from "react";
import axios from "axios";
import { Sparkles } from "lucide-react";
const API_URL = import.meta.env.VITE_API_URL;

export default function Login({ onLoginSuccess }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const url = isRegister
        ? `${API_URL}/api/auth/register`
        : `${API_URL}/api/auth/login`;

      const payload = isRegister
        ? { name, email, password }
        : { email, password };

      const response = await axios.post(url, payload);

      localStorage.setItem("token", response.data.token);
      localStorage.setItem("user", JSON.stringify(response.data.user));

      onLoginSuccess(response.data.user);
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="h-screen flex items-center justify-center text-white relative overflow-hidden"
      style={{
        background:
          "radial-gradient(circle at 20% 20%, #2a2a35 0%, transparent 50%), radial-gradient(circle at 80% 0%, #1f2937 0%, transparent 50%), radial-gradient(circle at 50% 100%, #18181b 0%, transparent 60%), #0a0a0a",
      }}
    >
      <div className="flex flex-col items-center">
        {/* Brand */}
        <div className="flex items-center gap-2 mb-8">
          <div className="w-10 h-10 rounded-2xl bg-white/8 border border-white/10 backdrop-blur-xl flex items-center justify-center">
            <Sparkles size={18} className="text-zinc-200" />
          </div>
          <span className="text-xl font-semibold tracking-tight">
            CreatorOS
          </span>
        </div>

        <form
          onSubmit={handleSubmit}
          className="
            w-96 p-8
            rounded-3xl
            bg-white/6
            backdrop-blur-2xl backdrop-saturate-150
            border border-white/10
            shadow-[0_8px_32px_rgba(0,0,0,0.35)]
            flex flex-col gap-4
          "
        >
          <div className="mb-2">
            <h1 className="text-2xl font-semibold tracking-tight">
              {isRegister ? "Create account" : "Welcome back"}
            </h1>
            <p className="text-zinc-500 text-sm mt-1">
              {isRegister
                ? "Start writing your next documentary."
                : "Sign in to continue to your projects."}
            </p>
          </div>

          {isRegister && (
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Name"
              className="
                bg-white/5 border border-white/10 rounded-2xl p-3
                outline-none placeholder:text-zinc-500
                focus:border-white/25 focus:bg-white/[0.07]
                transition-all duration-200
              "
              required
            />
          )}

          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            className="
              bg-white/5 border border-white/10 rounded-2xl p-3
              outline-none placeholder:text-zinc-500
              focus:border-white/25 focus:bg-white/[0.07]
              transition-all duration-200
            "
            required
          />

          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            className="
              bg-white/5 border border-white/10 rounded-2xl p-3
              outline-none placeholder:text-zinc-500
              focus:border-white/25 focus:bg-white/[0.07]
              transition-all duration-200
            "
            required
          />

          {error && (
            <p className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-xl px-3 py-2">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="
              bg-white text-black
              rounded-2xl p-3 font-semibold
              hover:scale-[1.02] active:scale-95
              transition-all duration-200
              disabled:opacity-60
              mt-1
            "
          >
            {loading
              ? "Please wait..."
              : isRegister
                ? "Create account"
                : "Sign in"}
          </button>

          <p
            onClick={() => setIsRegister(!isRegister)}
            className="text-zinc-500 text-sm text-center cursor-pointer hover:text-zinc-300 transition-colors duration-200 mt-1"
          >
            {isRegister
              ? "Already have an account? Sign in"
              : "New here? Create an account"}
          </p>
        </form>
      </div>
    </div>
  );
}
