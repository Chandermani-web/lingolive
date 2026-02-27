import React from 'react';
import { Loader } from 'lucide-react';

const Loading = () => {
  return (
    <div className="min-h-screen bg-[#050A15] flex items-center justify-center p-4">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Animated gradient orbs */}
        <div className="absolute -top-20 -left-20 w-72 h-72 bg-blue-500 rounded-full mix-blend-soft-light filter blur-xl opacity-50 animate-blob"></div>
        <div className="absolute -bottom-20 -right-20 w-72 h-72 bg-blue-700 rounded-full mix-blend-soft-light filter blur-xl opacity-50 animate-blob animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-blue-900 rounded-full mix-blend-soft-light filter blur-xl opacity-30 animate-blob animation-delay-4000"></div>
      </div>

      {/* Main Loading Container */}
      <div className="relative z-10 flex flex-col items-center justify-center">
        {/* Loading Icon */}
        <div className="relative mb-8">
          <div className="w-20 h-20 border-4 border-white/20 rounded-full animate-spin"></div>
          <Loader className="w-12 h-12 text-white absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 animate-spin" />
        </div>

        {/* Loading Text */}
        <div className="text-center">
          <h1 className="text-4xl font-bold text-white mb-2">
            Loading
            <span className="inline-block ml-1">
              <span className="animate-bounce">.</span>
              <span className="animate-bounce animation-delay-100">.</span>
              <span className="animate-bounce animation-delay-200">.</span>
            </span>
          </h1>
        </div>
      </div>

      {/* Custom CSS for animations */}
      <style jsx>{`
        @keyframes blob {
          0% {
            transform: translate(0px, 0px) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
          100% {
            transform: translate(0px, 0px) scale(1);
          }
        }
        
        .animate-blob {
          animation: blob 7s infinite;
        }
        
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
};

export default Loading;