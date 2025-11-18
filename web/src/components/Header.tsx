"use client";
import { useEffect, useState, useRef } from "react";
import { getToken, me, removeToken } from "../lib/api";
import {
  Camera,
  Upload,
  Images,
  Users,
  Share2,
  LogOut,
  User,
} from "lucide-react";
import { useRouter } from "next/navigation";
import BackButton from "./BackButton";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

export default function Header() {
  const [authed, setAuthed] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [showMenu, setShowMenu] = useState(false);
  const router = useRouter();
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const checkAuth = async () => {
      const token = getToken();
      if (!token) {
        setAuthed(false);
        setUser(null);
        return;
      }

      try {
        const userData = await me();
        setAuthed(true);
        setUser(userData);
      } catch {
        // Token is invalid or expired
        removeToken();
        setAuthed(false);
        setUser(null);
      }
    };

    checkAuth();

    const handleAuthChange = () => {
      const token = getToken();
      if (!token) {
        setAuthed(false);
        setUser(null);
      } else {
        checkAuth();
      }
    };
    window.addEventListener("auth-change", handleAuthChange);
    const handleStorage = () => checkAuth();
    window.addEventListener("storage", handleStorage);
    const handleFocus = () => checkAuth();
    window.addEventListener("focus", handleFocus);

    return () => {
      window.removeEventListener("auth-change", handleAuthChange);
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener("focus", handleFocus);
    };
  }, []);

  const handleLogout = (e?: React.MouseEvent) => {
    console.log("handleLogout called");
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    // Close menu first
    setShowMenu(false);
    // Remove token
    removeToken();
    // Update state
    setAuthed(false);
    setUser(null);
    // Small delay to ensure state updates, then redirect
    setTimeout(() => {
      window.location.href = "/";
    }, 100);
  };

  // Handle clicks outside the menu
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    };

    if (showMenu) {
      // Use setTimeout to avoid immediate closure
      setTimeout(() => {
        document.addEventListener("mousedown", handleClickOutside);
      }, 0);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showMenu]);

  if (!authed) return null;

  return (
    <header className="relative z-10 border-b bg-white/90 backdrop-blur-md shadow-sm">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between gap-6">
        <div className="justify-start">
          <BackButton />
        </div>
        <a
          href="/"
          className="flex items-center gap-2 font-bold text-xl text-gray-800 hover:text-gray-900"
        >
          <Camera size={24} className="text-pink-500" />
          <span>Snapshot</span>
        </a>

        <nav className="hidden md:flex text-sm text-gray-700 items-center gap-1">
          <a
            className="flex items-center gap-1 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
            href="/upload"
          >
            <Upload size={16} />
            <span>Upload</span>
          </a>
          <a
            className="flex items-center gap-1 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
            href="/gallery"
          >
            <Images size={16} />
            <span>Gallery</span>
          </a>
          <a
            className="flex items-center gap-1 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
            href="/shared"
          >
            <Share2 size={16} />
            <span>Shared</span>
          </a>
          <a
            className="flex items-center gap-1 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
            href="/groups"
          >
            <Users size={16} />
            <span>Groups</span>
          </a>
        </nav>

        <div className="relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            {user?.selfieUrl ? (
              <img
                src={`${API}${user.selfieUrl}`}
                alt={user.name}
                className="w-8 h-8 rounded-full object-cover border-2 border-gray-300"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center">
                <User size={16} className="text-gray-600" />
              </div>
            )}
            <span className="hidden md:inline text-sm font-medium text-gray-700">
              {user?.name || "User"}
            </span>
          </button>
          <div className="flex">
            {showMenu && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  style={{ pointerEvents: "auto" }}
                ></div>
                <div
                  ref={menuRef}
                  className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50"
                >
                  <div className="px-4 py-2 border-b border-gray-200">
                    <p className="text-sm font-medium text-gray-900">
                      {user?.name}
                    </p>
                    <p className="text-xs text-gray-500">{user?.email}</p>
                  </div>

                </div>
              </>
            )}

            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log("Logout button clicked");
                handleLogout(e);
              }}
              className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors text-left"
            >
              <LogOut size={16} />
              <span>Logout</span>
            </button>
          </div>


        </div>
      </div>
    </header>
  );
}
