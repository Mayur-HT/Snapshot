"use client";
import { useState, useRef, DragEvent } from "react";
import { uploadPhotos } from "../../lib/api";
import {
  Upload,
  X,
  Image as ImageIcon,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { useRouter } from "next/navigation";
import AuthGuard from "../../components/AuthGuard";
import BackButton from "../../components/BackButton";

function UploadPageContent() {
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [status, setStatus] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const handleFileSelect = (selectedFiles: FileList | null) => {
    if (!selectedFiles) return;
    const fileArray = Array.from(selectedFiles);
    setFiles((prev) => [...prev, ...fileArray]);

    // Create previews
    fileArray.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviews((prev) => [...prev, e.target?.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
    setPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    handleFileSelect(e.dataTransfer.files);
  };

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus(null);
    if (files.length === 0) {
      setStatus({ type: "error", message: "Please select at least one image" });
      return;
    }
    setLoading(true);
    try {
      const res = await uploadPhotos(files);
      setStatus({
        type: "success",
        message: `Successfully uploaded ${res.count} photo${res.count > 1 ? "s" : ""
          }!`,
      });
      setFiles([]);
      setPreviews([]);
      setTimeout(() => {
        router.push("/gallery");
      }, 1500);
    } catch (err: any) {
      setStatus({
        type: "error",
        message: err?.message || "Upload failed. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">

      <div className="text-center mb-8">
        <h1 className="text-3xl md:text-4xl font-extrabold text-white mb-2 drop-shadow-lg">
          Upload Photos
        </h1>
        <p className="text-gray-200">
          Share your memories with friends and family
        </p>
      </div>

      <form onSubmit={onSubmit} className="space-y-6">
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`
            relative z-10 p-12 border-2 border-dashed rounded-2xl
            bg-black/50 backdrop-blur-lg
            transition-all duration-200
            ${isDragging
              ? "border-pink-400 bg-pink-500/20 scale-105"
              : "border-white/30"
            }
            ${files.length > 0 ? "border-solid" : ""}
          `}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(e) => handleFileSelect(e.target.files)}
          />

          {files.length === 0 ? (
            <div className="text-center">
              <Upload size={64} className="mx-auto mb-4 text-gray-300" />
              <p className="text-xl text-white mb-2 font-medium">
                Drag and drop your photos here
              </p>
              <p className="text-gray-300 mb-4">or</p>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-6 py-3 bg-pink-500 hover:bg-pink-600 text-white font-semibold rounded-lg transition-all duration-200 shadow-lg hover:scale-105"
              >
                Browse Files
              </button>
              <p className="text-sm text-gray-400 mt-4">
                Supports JPG, PNG, GIF, and more
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-4">
                <p className="text-white font-medium">
                  {files.length} photo{files.length > 1 ? "s" : ""} selected
                </p>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="text-sm text-pink-400 hover:text-pink-300 underline"
                >
                  Add More
                </button>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {previews.map((preview, index) => (
                  <div key={index} className="relative group">
                    <div className="aspect-square rounded-lg overflow-hidden bg-gray-800">
                      <img
                        src={preview}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => removeFile(index)}
                      className="absolute top-2 right-2 p-1.5 bg-red-500 hover:bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X size={16} />
                    </button>
                    <p className="mt-1 text-xs text-gray-300 truncate">
                      {files[index].name}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {status && (
          <div
            className={`
              p-4 rounded-lg flex items-center gap-3
              ${status.type === "success"
                ? "bg-green-500/20 border border-green-500/50"
                : "bg-red-500/20 border border-red-500/50"
              }
            `}
          >
            {status.type === "success" ? (
              <CheckCircle className="text-green-400" size={20} />
            ) : (
              <AlertCircle className="text-red-400" size={20} />
            )}
            <p
              className={
                status.type === "success" ? "text-green-200" : "text-red-200"
              }
            >
              {status.message}
            </p>
          </div>
        )}

        {files.length > 0 && (
          <div className="flex justify-center">
            <button
              disabled={loading}
              className="px-8 py-3 bg-pink-500 hover:bg-pink-600 text-white font-semibold rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:scale-105 flex items-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Uploading...</span>
                </>
              ) : (
                <>
                  <Upload size={20} />
                  <span>
                    Upload {files.length} Photo{files.length > 1 ? "s" : ""}
                  </span>
                </>
              )}
            </button>
          </div>
        )}
      </form>
    </div>
  );
}

export default function UploadPage() {
  return (
    <AuthGuard>
      <UploadPageContent />
    </AuthGuard>
  );
}
