import { useContext, useEffect } from "react";
import { X } from "lucide-react";
import AppContext from "./Context/UseContext.jsx";

const ShowImage = () => {
  const { showImage, setShowImage } = useContext(AppContext);

  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === "Escape") setShowImage(null);
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [setShowImage]);

  if (!showImage) return null;

  return (
    <div
      className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn"
      onClick={() => setShowImage(null)}
    >
      {/* Close Button */}
      <button
        className="absolute top-5 right-5 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/10 flex items-center justify-center transition-all hover:scale-110"
        onClick={(e) => {
          e.stopPropagation();
          setShowImage(null);
        }}
        aria-label="Close"
      >
        <X className="w-5 h-5 text-white" />
      </button>

      {/* Image */}
      <img
        src={showImage}
        alt="Preview"
        className="max-h-[90vh] max-w-[90vw] object-contain rounded-lg shadow-2xl animate-scaleIn"
        onClick={(e) => e.stopPropagation()}
      />
    </div>
  );
};

export default ShowImage;