"use client";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

interface BackButtonProps {
  className?: string;
  fallbackPath?: string;
}

export default function BackButton({
  className = "",
  fallbackPath = "/",
}: BackButtonProps) {
  const router = useRouter();

  const handleBack = () => {
    if (window.history.length > 1) {
      router.back();
    } else {
      router.push(fallbackPath);
    }
  };

  return (
    <button
      onClick={handleBack}
      className={`
        inline-flex items-center gap-2 px-4 py-2 
        bg-black/50 backdrop-blur-md 
        text-white font-medium rounded-lg 
        border border-white/20 
        hover:bg-white/20 hover:scale-105 hover:text-black
        transition-all duration-200 ease-in-out
        shadow-lg
        ${className}
      `}
      aria-label="Go back"
    >
      <ArrowLeft size={20} />
      <span>Back</span>
    </button>
  );
}
