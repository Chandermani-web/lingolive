import React from "react";
import { useContext } from "react";
import AppContext from "./Context/UseContext.jsx";
import 'remixicon/fonts/remixicon.css';

const ShowVideo = () => {
  const { showVideo, setShowVideo } = useContext(AppContext);

  return (
    <div>
      {showVideo && (
        <div className="fixed inset-0 bg-black bg-opacity-10 flex items-center justify-center z-50">
          <button 
          className="absolute top-5 right-5 text-4xl pointer-cursor text-white hover:text-gray-300"
          onClick={() => setShowVideo(null)}>
            <i className="ri-close-line"></i>
          </button>
          <video src={showVideo} controls className="max-h-full max-w-full" />
        </div>
      )}
    </div>
  );
};

export default ShowVideo;