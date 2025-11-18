"use client";
import { useEffect, useState } from "react";
import { myPhotos } from "../../lib/api";
import { Images, X, Calendar, Loader2 } from "lucide-react";
import AuthGuard from "../../components/AuthGuard";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

type Photo = { id: string; url: string; createdAt: string };

function GalleryPageContent() {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await myPhotos();
        setPhotos(res.photos || []);
      } catch (e: any) {
        setError(e?.message || "Failed to load photos");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-pink-400 animate-spin mx-auto mb-4" />
          <p className="text-gray-300">Loading your photos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-white mb-2 drop-shadow-lg flex items-center gap-3">
            <Images size={32} className="text-pink-400" />
            My Gallery
          </h1>
          <p className="text-gray-300">
            {photos.length} {photos.length === 1 ? "photo" : "photos"} in your
            collection
          </p>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-500/20 border border-red-500/50 rounded-lg text-red-200">
          {error}
        </div>
      )}

      {photos.length === 0 ? (
        <div className="text-center py-16 relative z-10 bg-black/50 backdrop-blur-lg rounded-2xl border border-white/20">
          <Images size={64} className="mx-auto mb-4 text-gray-400" />
          <p className="text-xl text-gray-300 mb-2">No photos yet</p>
          <p className="text-gray-400 mb-6">
            Start by uploading your first photo!
          </p>
          <a
            href="/upload"
            className="inline-flex items-center gap-2 px-6 py-3 bg-pink-500 hover:bg-pink-600 text-white font-semibold rounded-lg transition-all duration-200 shadow-lg hover:scale-105"
          >
            Upload Photos
          </a>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {photos.map((photo) => (
            <div
              key={photo.id}
              onClick={() => setSelectedPhoto(photo)}
              className="group relative aspect-square rounded-lg overflow-hidden bg-gray-800 cursor-pointer transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              <img
                src={`${API}${photo.url}`}
                alt="Photo"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors duration-200"></div>
            </div>
          ))}
        </div>
      )}

      {selectedPhoto && (
        <div
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setSelectedPhoto(null)}
        >
          <div className="relative max-w-5xl max-h-[90vh] w-full">
            <button
              onClick={() => setSelectedPhoto(null)}
              className="absolute top-4 right-4 z-10 p-2 bg-black/50 hover:bg-white/20 text-white rounded-full backdrop-blur-md transition-colors"
            >
              <X size={24} />
            </button>
            <div className="bg-black/50 backdrop-blur-lg rounded-2xl overflow-hidden border border-white/20">
              <img
                src={`${API}${selectedPhoto.url}`}
                alt="Photo"
                className="w-full h-auto max-h-[70vh] object-contain"
                onClick={(e) => e.stopPropagation()}
              />
              <div className="p-4 border-t border-white/20">
                <div className="flex items-center gap-2 text-gray-300">
                  <Calendar size={16} />
                  <span className="text-sm">
                    {formatDate(selectedPhoto.createdAt)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function GalleryPage() {
  return (
    <AuthGuard>
      <GalleryPageContent />
    </AuthGuard>
  );
}
