import { useState } from "react";
import { useAppContext } from "../context/AppContext";
import { toast } from "react-hot-toast";
import { assets } from "../assets/assets";

function Login() {
  const [state, setState] = useState("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { axios, setToken, navigate } = useAppContext();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const url = state === "login" ? "/api/user/login" : "/api/user/register";
    try {
      const { data } = await axios.post(url, { email, password, name });
      if (data.success) {
        setToken(data.token);
        localStorage.setItem("token", data.token);
        toast.success(data.message);
        navigate("/");
      } else {
        toast.error(data.message || "Something went wrong");
      }
    } catch (error) {
      toast.error(error.message || "Something went wrong");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center w-full px-4">
      {/* Logo */}
      <img
        src={assets.logo_full}
        alt="NovaChat"
        className="w-44 mb-8 opacity-90"
      />
      <form
        className="flex flex-col gap-5 items-start p-8 py-10 w-full max-w-sm rounded-2xl border border-[#80609F]/30 bg-[#1a1020]/70 backdrop-blur-xl shadow-2xl shadow-purple-900/20"
        onSubmit={handleSubmit}
      >
        <p className="text-2xl font-semibold m-auto text-white">
          {state === "login" ? "Welcome Back" : "Create Account"}
        </p>
        <p className="text-sm text-[#B1A6C0] m-auto -mt-3">
          {state === "login"
            ? "Sign in to continue with NovaChat"
            : "Join NovaChat today"}
        </p>

        {state === "register" && (
          <div className="w-full">
            <label className="text-sm text-[#B1A6C0] mb-1 block">Name</label>
            <input
              onChange={(e) => setName(e.target.value)}
              value={name}
              placeholder="Enter your name"
              className="border border-[#80609F]/30 bg-[#2a1a3a]/60 rounded-lg w-full p-2.5 text-sm text-white outline-none focus:border-purple-500/60 transition-colors placeholder:text-[#7a6a8a]"
              type="text"
              required
            />
          </div>
        )}

        <div className="w-full">
          <label className="text-sm text-[#B1A6C0] mb-1 block">Email</label>
          <input
            onChange={(e) => setEmail(e.target.value)}
            value={email}
            placeholder="Enter your email"
            className="border border-[#80609F]/30 bg-[#2a1a3a]/60 rounded-lg w-full p-2.5 text-sm text-white outline-none focus:border-purple-500/60 transition-colors placeholder:text-[#7a6a8a]"
            type="email"
            required
          />
        </div>

        <div className="w-full">
          <label className="text-sm text-[#B1A6C0] mb-1 block">Password</label>
          <input
            onChange={(e) => setPassword(e.target.value)}
            value={password}
            placeholder="Enter your password"
            className="border border-[#80609F]/30 bg-[#2a1a3a]/60 rounded-lg w-full p-2.5 text-sm text-white outline-none focus:border-purple-500/60 transition-colors placeholder:text-[#7a6a8a]"
            type="password"
            required
          />
        </div>

        {state === "register" ? (
          <p className="text-sm text-[#B1A6C0]">
            Already have an account?{" "}
            <span
              onClick={() => setState("login")}
              className="text-purple-400 cursor-pointer hover:text-purple-300 transition-colors font-medium"
            >
              Sign in
            </span>
          </p>
        ) : (
          <p className="text-sm text-[#B1A6C0]">
            Don't have an account?{" "}
            <span
              onClick={() => setState("register")}
              className="text-purple-400 cursor-pointer hover:text-purple-300 transition-colors font-medium"
            >
              Create one
            </span>
          </p>
        )}

        <button
          type="submit"
          className="bg-gradient-to-r from-[#A456F7] to-[#3D81F6] hover:opacity-90 transition-all text-white w-full py-2.5 rounded-lg cursor-pointer font-medium text-sm"
        >
          {state === "register" ? "Create Account" : "Sign In"}
        </button>
      </form>
    </div>
  );
}
export default Login;
