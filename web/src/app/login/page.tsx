"use client";
import { useState, useEffect } from "react";
import { login as apiLogin, saveToken, getToken } from "../../lib/api";
import BackButton from "../../components/BackButton";
import { Mail, Lock, LogIn, AlertCircle } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const inviteToken = searchParams?.get("inviteToken");

  useEffect(() => {
    // Redirect if already authenticated
    const token = getToken();
    if (token) {
      if (inviteToken) {
        // If there's an invite token, redirect to accept page
        router.push(`/groups/accept/${inviteToken}`);
      } else {
        router.push("/");
      }
    }
  }, [router, inviteToken]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const body: { email: string; password: string; inviteToken?: string } = {
        email,
        password,
      };
      if (inviteToken) {
        body.inviteToken = inviteToken;
      }
      const res = await apiLogin(email, password, inviteToken || undefined);
      saveToken(res.token);
      if (inviteToken) {
        window.location.href = `/groups/accept/${inviteToken}`;
      } else {
        window.location.href = "/";
      }
    } catch (err: any) {
      setError(err?.message || "Login failed. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <div className="mb-4">
        <BackButton />
      </div>
      <div className="min-h-[80vh] flex items-center justify-center p-4">
        <div className="relative z-10 w-full max-w-md p-8 md:p-12 bg-black/50 backdrop-blur-lg rounded-3xl shadow-2xl border border-white/20">
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight mb-2">
              Welcome Back
            </h1>
            <p className="text-gray-300">
              {inviteToken
                ? "Sign in to accept the group invite"
                : "Sign in to your account"}
            </p>
          </div>

          <form className="space-y-5" onSubmit={onSubmit}>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Email
              </label>
              <div className="relative">
                <Mail
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  size={20}
                />
                <input
                  className="w-full pl-10 pr-4 py-3 bg-black/50 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  placeholder="your@email.com"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  size={20}
                />
                <input
                  className="w-full pl-10 pr-4 py-3 bg-black/50 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  placeholder="••••••••"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            {error && (
              <div className="p-3 bg-red-500/20 border border-red-500/50 rounded-lg flex items-center gap-2 text-red-200">
                <AlertCircle size={18} />
                <span className="text-sm">{error}</span>
              </div>
            )}

            <button
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-pink-500 hover:bg-pink-600 text-white font-semibold py-3 px-4 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:scale-105"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Signing in...</span>
                </>
              ) : (
                <>
                  <LogIn size={20} />
                  <span>Login</span>
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-400 text-sm">
              Don't have an account?{" "}
              <a
                href={
                  inviteToken
                    ? `/register?inviteToken=${inviteToken}`
                    : "/register"
                }
                className="text-pink-400 hover:text-pink-300 font-medium underline"
              >
                Sign up
              </a>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
