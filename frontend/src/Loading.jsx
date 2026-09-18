import React from "react";

const Loading = () => {
  return (
    <div className="min-h-screen bg-[#05070A] flex items-center justify-center relative overflow-hidden">
      {/* Ambient glows */}
      <div className="absolute inset-0 pointer-events-none">
        <div
          className="absolute top-1/4 left-1/4 w-[400px] h-[400px] rounded-full blur-3xl opacity-40"
          style={{
            background: "radial-gradient(circle, rgba(124,58,237,0.15), transparent 65%)",
          }}
        />
        <div
          className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] rounded-full blur-3xl opacity-40"
          style={{
            background: "radial-gradient(circle, rgba(37,99,235,0.12), transparent 65%)",
          }}
        />
      </div>

      <div className="relative z-10 flex flex-col items-center">
        {/* Logo mark */}
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#7C3AED] to-[#3B82F6] flex items-center justify-center mb-6 shadow-2xl shadow-purple-500/20">
          <svg
            width="28"
            height="28"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-white"
          >
            <path d="M3 12h3l3-8 4 16 3-8h5" />
          </svg>
        </div>

        {/* Spinner */}
        <div className="w-10 h-10 border-2 border-[#18202B] border-t-[#7C3AED] rounded-full animate-spin mb-4" />

        <p className="text-sm text-[#A1A1AA]">Loading LingoLive...</p>
      </div>
    </div>
  );
};

export default Loading;