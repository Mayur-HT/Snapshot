"use client";
import { useState, useEffect } from "react";
import { Share2, Images, Users, Loader2 } from "lucide-react";
import AuthGuard from "../../components/AuthGuard";
import { sharedPhotos } from "../../lib/api";

interface Photo {
  id: string;
  url: string;
  owner: {
    id: string;
    name: string;
    email: string;
    selfieUrl: string;
  };
  faces?: Array<{
    id: string;
    matchedUser?: {
      id: string;
      name: string;
      email: string;
      selfieUrl: string;
    };
  }>;
  createdAt: string;
}

function SharedPageContent() {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadSharedPhotos();
  }, []);

  async function loadSharedPhotos() {
    try {
      setLoading(true);
      const data = await sharedPhotos();
      setPhotos(data.shares || []);
    } catch (err: any) {
      setError(err.message || "Failed to load shared photos");
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="animate-spin text-pink-500" size={48} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl md:text-4xl font-extrabold text-white mb-2 drop-shadow-lg flex items-center gap-3">
          <Share2 size={32} className="text-pink-400" />
          Shared With Me
        </h1>
        <p className="text-gray-300">
          Photos that others have shared with you via groups or face matching
        </p>
      </div>

      {error && (
        <div className="bg-red-500/20 border border-red-500 text-red-200 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {photos.length === 0 ? (
        <div className="relative z-10 bg-black/50 backdrop-blur-lg rounded-2xl border border-white/20 p-12 text-center">
          <Share2 size={64} className="mx-auto mb-4 text-gray-400" />
          <h2 className="text-xl font-semibold text-white mb-2">
            No shared photos yet
          </h2>
          <p className="text-gray-400 mb-6 max-w-md mx-auto">
            When someone shares photos with you through groups or when you're
            identified in photos, they will appear here. You can also create
            groups to automatically share photos with friends and family.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/groups"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-purple-500 hover:bg-purple-600 text-white font-semibold rounded-lg transition-all duration-200 shadow-lg hover:scale-105"
            >
              <Users size={20} />
              <span>Manage Groups</span>
            </a>
            <a
              href="/gallery"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-black/50 hover:bg-white/20 text-white font-semibold rounded-lg border border-white/20 transition-all duration-200 hover:scale-105"
            >
              <Images size={20} />
              <span>View My Gallery</span>
            </a>
          </div>
        </div>
      ) : (
        <div>
          <div className="mb-4 text-gray-300">
            {photos.length} {photos.length === 1 ? "photo" : "photos"} shared
            with you
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {photos.map((photo) => (
              <div
                key={photo.id}
                className="group relative bg-black/50 backdrop-blur-lg rounded-xl border border-white/20 overflow-hidden hover:border-pink-500/50 transition-all duration-200"
              >
                <img
                  src={photo.url}
                  alt="Shared photo"
                  className="w-full h-64 object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <img
                        src={photo.owner.selfieUrl}
                        alt={photo.owner.name}
                        className="w-6 h-6 rounded-full object-cover"
                      />
                      <span className="text-white text-sm font-medium">
                        {photo.owner.name}
                      </span>
                    </div>
                    {photo.faces && photo.faces.length > 0 && (
                      <div className="text-xs text-gray-300">
                        {photo.faces.length}{" "}
                        {photo.faces.length === 1 ? "face" : "faces"} detected
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function SharedPage() {
  return (
    <AuthGuard>
      <SharedPageContent />
    </AuthGuard>
  );
}
