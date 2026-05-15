"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { authApi } from "@/lib/api";
import toast from "react-hot-toast";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!username || !password) return;
    setLoading(true);
    try {
      const data = await authApi.login({ username, password });
      if (data.kind === "supplier") {
        // Supplier → store portal token and go to portal
        localStorage.setItem("supplier_token", data.access_token);
        localStorage.setItem("supplier_name", data.user.name || data.user.username);
        localStorage.setItem("supplier_id", String(data.user.id));
        toast.success(`Welcome, ${data.user.name || data.user.username}!`);
        router.push("/portal/orders");
      } else {
        // Admin/staff → store admin token and go to dashboard
        localStorage.setItem("admin_token", data.access_token);
        localStorage.setItem("admin_user", JSON.stringify(data.user));
        toast.success(`Welcome, ${data.user.username}!`);
        router.push("/");
      }
    } catch (e: any) {
      toast.error(e.response?.data?.detail || "Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 w-full max-w-sm">
        <div className="flex items-center gap-2 mb-6">
          <span className="text-2xl font-bold text-blue-600">Maga</span>
          <span className="text-sm text-gray-400">Fulfillment</span>
        </div>
        <h1 className="text-lg font-semibold text-gray-900 mb-1">Sign in</h1>
        <p className="text-sm text-gray-500 mb-6">Admin or supplier account</p>

        <div className="space-y-4">
          <div>
            <label className="label">Username</label>
            <input
              className="input"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleLogin()}
              autoFocus
            />
          </div>
          <div>
            <label className="label">Password</label>
            <input
              className="input"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleLogin()}
            />
          </div>
          <button
            className="btn-primary w-full justify-center py-2.5 mt-2"
            onClick={handleLogin}
            disabled={loading || !username || !password}
          >
            {loading ? "Signing in…" : "Sign In"}
          </button>
        </div>
      </div>
    </div>
  );
}
