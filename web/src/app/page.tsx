"use client";
import React, { useEffect, useState } from "react";
import {
  Camera,
  Zap,
  Upload,
  Images,
  Share2,
  Users,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { getToken, myPhotos } from "../lib/api";
import Link from "next/link";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [photoCount, setPhotoCount] = useState(0);

  useEffect(() => {
    const checkAuth = async () => {
      const token = getToken();
      if (token) {
        setIsAuthenticated(true);
        try {
          const res = await myPhotos();
          setPhotoCount(res.photos?.length || 0);
        } catch {
          // Ignore errors
        }
      } else {
        setIsAuthenticated(false);
      }
    };

    checkAuth();
    const handleAuthChange = () => checkAuth();
    window.addEventListener("auth-change", handleAuthChange);
    return () => window.removeEventListener("auth-change", handleAuthChange);
  }, []);

  if (isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="relative z-10 w-full max-w-4xl">
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-4 drop-shadow-lg">
              Welcome to Snapshot
            </h1>
            <p className="text-xl text-gray-200 font-light">
              Your smart photo sharing platform
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <Link
              href="/upload"
              className="group relative z-10 p-8 bg-black/50 backdrop-blur-lg rounded-2xl shadow-2xl border border-white/20 transform hover:scale-105 transition-all duration-300 ease-in-out"
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="p-3 bg-pink-500/20 rounded-xl">
                  <Upload size={32} className="text-pink-400" />
                </div>
                <h2 className="text-2xl font-bold text-white">Upload Photos</h2>
              </div>
              <p className="text-gray-200 mb-4">
                Share your memories by uploading photos to your gallery
              </p>
              <div className="flex items-center text-pink-400 group-hover:translate-x-2 transition-transform">
                <span className="font-medium">Get Started</span>
                <ArrowRight size={20} className="ml-2" />
              </div>
            </Link>

            <Link
              href="/gallery"
              className="group relative z-10 p-8 bg-black/50 backdrop-blur-lg rounded-2xl shadow-2xl border border-white/20 transform hover:scale-105 transition-all duration-300 ease-in-out"
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="p-3 bg-blue-500/20 rounded-xl">
                  <Images size={32} className="text-blue-400" />
                </div>
                <h2 className="text-2xl font-bold text-white">My Gallery</h2>
              </div>
              <p className="text-gray-200 mb-4">
                View and manage your {photoCount > 0 ? `${photoCount} ` : ""}
                photos
              </p>
              <div className="flex items-center text-blue-400 group-hover:translate-x-2 transition-transform">
                <span className="font-medium">View Gallery</span>
                <ArrowRight size={20} className="ml-2" />
              </div>
            </Link>

            <Link
              href="/shared"
              className="group relative z-10 p-8 bg-black/50 backdrop-blur-lg rounded-2xl shadow-2xl border border-white/20 transform hover:scale-105 transition-all duration-300 ease-in-out"
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="p-3 bg-green-500/20 rounded-xl">
                  <Share2 size={32} className="text-green-400" />
                </div>
                <h2 className="text-2xl font-bold text-white">
                  Shared With Me
                </h2>
              </div>
              <p className="text-gray-200 mb-4">
                Photos that others have shared with you
              </p>
              <div className="flex items-center text-green-400 group-hover:translate-x-2 transition-transform">
                <span className="font-medium">View Shared</span>
                <ArrowRight size={20} className="ml-2" />
              </div>
            </Link>

            <Link
              href="/groups"
              className="group relative z-10 p-8 bg-black/50 backdrop-blur-lg rounded-2xl shadow-2xl border border-white/20 transform hover:scale-105 transition-all duration-300 ease-in-out"
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="p-3 bg-purple-500/20 rounded-xl">
                  <Users size={32} className="text-purple-400" />
                </div>
                <h2 className="text-2xl font-bold text-white">Groups</h2>
              </div>
              <p className="text-gray-200 mb-4">
                Create and manage groups for sharing photos
              </p>
              <div className="flex items-center text-purple-400 group-hover:translate-x-2 transition-transform">
                <span className="font-medium">Manage Groups</span>
                <ArrowRight size={20} className="ml-2" />
              </div>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="flex justify-end space-x-4 p-4">
        <a
          href="/login"
          className={`
        inline-flex items-center gap-2 px-4 py-2 
        bg-black/50 backdrop-blur-md 
        text-white font-medium rounded-lg 
        border border-white/20 
        hover:bg-white/20 hover:scale-105 
        transition-all duration-200 ease-in-out
        shadow-lg
      `}
        >
          Login
        </a>
        <a
          href="/register"
          className={`
        inline-flex items-center gap-2 px-4 py-2 
        bg-black/50 backdrop-blur-md 
        text-white font-medium rounded-lg 
        border border-white/20 
        hover:bg-white/20 hover:scale-105 
        transition-all duration-200 ease-in-out
        shadow-lg
      `}
        >
          Register
        </a>
      </div>
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="relative z-10 w-full max-w-lg p-8 md:p-12 bg-black/50 backdrop-blur-lg rounded-3xl shadow-2xl border border-white/20 transform hover:scale-[1.02] transition duration-300 ease-in-out">
          <div className="flex items-center space-x-4 mb-6 border-b border-white/30 pb-4">
            <Camera size={48} className="text-pink-400 drop-shadow-lg" />
            <h1 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight">
              Snapshot
            </h1>
          </div>

          <p className="text-xl text-gray-200 mb-8 font-light">
            A smart photo distribution app. Share memories with friends and
            family.
          </p>

          <div className="space-y-6">
            <h2 className="text-2xl font-semibold text-white flex items-center">
              <Sparkles size={24} className="mr-3 text-yellow-400" />
              Features
            </h2>
            <ul className="list-none space-y-4">
              <li className="flex items-start text-lg text-gray-100">
                <span className="text-xl font-bold text-pink-400 mr-3 mt-0.5">
                  ✨
                </span>
                <span>Upload and organize your photos</span>
              </li>
              <li className="flex items-start text-lg text-gray-100">
                <span className="text-xl font-bold text-pink-400 mr-3 mt-0.5">
                  👥
                </span>
                <span>Share photos with groups</span>
              </li>
              <li className="flex items-start text-lg text-gray-100">
                <span className="text-xl font-bold text-pink-400 mr-3 mt-0.5">
                  🔒
                </span>
                <span>Secure and private sharing</span>
              </li>
            </ul>
          </div>

          <div className="mt-10 text-center">
            <a
              href="/register"
              className="inline-flex items-center gap-2 px-6 py-3 bg-pink-500 hover:bg-pink-600 text-white font-semibold rounded-lg transition-all duration-200 shadow-lg hover:scale-105"
            >
              Get Started
              <ArrowRight size={20} />
            </a>
          </div>

          <div className="mt-10 text-center text-sm text-gray-400 pt-4 border-t border-white/10">
            <Zap size={16} className="inline mr-1 text-yellow-300" />
            Ready to capture the moment.
          </div>
        </div>
      </div>
    </>
  );
};

export default App;
