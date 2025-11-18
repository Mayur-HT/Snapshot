"use client";
import { useState, useRef, useEffect } from "react";
import { register as apiRegister, saveToken, getToken } from "../../lib/api";
import BackButton from "../../components/BackButton";
import { User, Mail, Lock, Camera, AlertCircle, UserPlus } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [selfie, setSelfie] = useState<File | null>(null);
  const [selfiePreview, setSelfiePreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
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

  const handleSelfieChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setSelfie(file);
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setSelfiePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setSelfiePreview(null);
    }
  };

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!selfie) {
      setError("Please upload a selfie photo");
      return;
    }
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append("email", email);
      fd.append("name", name);
      fd.append("password", password);
      fd.append("selfie", selfie);
      if (inviteToken) {
        fd.append("inviteToken", inviteToken);
      }
      const res = await apiRegister(fd);
      saveToken(res.token);
      if (inviteToken) {
        window.location.href = `/groups/accept/${inviteToken}`;
      } else {
        window.location.href = "/";
      }
    } catch (err: any) {
      setError(err?.message || "Registration failed. Please try again.");
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
              Create Account
            </h1>
            <p className="text-gray-300">
              {inviteToken
                ? "Create an account to accept the group invite"
                : "Join Snapshot and start sharing memories"}
            </p>
          </div>

          <form className="space-y-5" onSubmit={onSubmit}>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Full Name
              </label>
              <div className="relative">
                <User
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  size={20}
                />
                <input
                  className="w-full pl-10 pr-4 py-3 bg-black/50 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
            </div>

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

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Profile Photo (Selfie)
              </label>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleSelfieChange}
              />
              <div
                onClick={() => fileInputRef.current?.click()}
                className="cursor-pointer border-2 border-dashed border-white/30 rounded-lg p-6 bg-white/5 hover:bg-black/50 transition-colors"
              >
                {selfiePreview ? (
                  <div className="flex flex-col items-center gap-3">
                    <img
                      src={selfiePreview}
                      alt="Selfie preview"
                      className="w-24 h-24 rounded-full object-cover border-2 border-white/30"
                    />
                    <p className="text-sm text-gray-300">
                      Click to change photo
                    </p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-3">
                    <div className="p-4 bg-black/50 rounded-full">
                      <Camera className="text-gray-400" size={32} />
                    </div>
                    <p className="text-sm text-gray-300">
                      Click to upload your selfie
                    </p>
                  </div>
                )}
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
                  <span>Creating account...</span>
                </>
              ) : (
                <>
                  <UserPlus size={20} />
                  <span>Create Account</span>
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-400 text-sm">
              Already have an account?{" "}
              <a
                href={
                  inviteToken ? `/login?inviteToken=${inviteToken}` : "/login"
                }
                className="text-pink-400 hover:text-pink-300 font-medium underline"
              >
                Sign in
              </a>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
