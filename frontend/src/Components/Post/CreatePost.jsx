import { useContext, useEffect, useRef, useState } from "react";
import { ImagePlus, X, Send, FileText } from "lucide-react";
import { toast, ToastContainer } from "react-toastify";
import AppContext from "../../Context/UseContext";

const CreatePost = () => {
  const [content, setContent] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef(null);
  const { BASE_URL } = useContext(AppContext);

  useEffect(() => {
    return () => {
      if (filePreview) URL.revokeObjectURL(filePreview);
    };
  }, [filePreview]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 50 * 1024 * 1024) {
      toast.error("File too large. Max 50MB");
      return;
    }
    setSelectedFile(file);
    setFilePreview(URL.createObjectURL(file));
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (
      file &&
      (file.type.startsWith("image/") ||
        file.type.startsWith("video/") ||
        file.type === "application/pdf")
    ) {
      setSelectedFile(file);
      setFilePreview(URL.createObjectURL(file));
    }
  };

  const handleClear = () => {
    setContent("");
    setSelectedFile(null);
    if (filePreview) URL.revokeObjectURL(filePreview);
    setFilePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim() && !selectedFile) return;
    setLoading(true);
    const formData = new FormData();
    formData.append("content", content);
    if (selectedFile) formData.append("file", selectedFile);

    try {
      const res = await fetch(`${BASE_URL}/api/posts`, {
        method: "POST",
        body: formData,
        credentials: "include",
      });
      if (res.ok) {
        toast.success("Post published");
        handleClear();
      } else {
        toast.error("Failed to create post");
      }
    } catch (err) {
      toast.error("Error creating post");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-app relative overflow-hidden py-8 px-4">
      <div className="bg-app-fixed" />
      <div className="glow-purple" style={{ top: "-200px", left: "-200px" }} />
      <div className="glow-blue" style={{ bottom: "-200px", right: "-200px" }} />

      <div className="relative z-10 max-w-2xl mx-auto animate-fadeUp">
        {/* Header */}
        <div className="mb-6">
          <h1 className="heading-xl text-white mb-1">Create Post</h1>
          <p className="text-secondary text-sm">
            Share your thoughts with the community
          </p>
        </div>

        <div className="card-static p-6 md:p-7">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Content */}
            <div>
              <label className="block text-xs font-medium text-secondary mb-2 uppercase tracking-wide">
                Content
              </label>
              <div className="relative">
                <textarea
                  rows="6"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="What's on your mind?"
                  maxLength={500}
                  className="input resize-none"
                />
                <div className="absolute bottom-3 right-3 text-[10px] text-muted">
                  <span className={content.length > 450 ? "text-[#F59E0B]" : ""}>
                    {content.length}
                  </span>
                  /500
                </div>
              </div>
            </div>

            {/* Upload */}
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
                isDragging
                  ? "border-[#8B5CF6] bg-[#8B5CF6]/5"
                  : "border-[#18202B] hover:border-[#293445] bg-[#0B1017]"
              }`}
            >
              <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-[#0F141C] border border-[#18202B] flex items-center justify-center">
                <ImagePlus className="w-5 h-5 text-[#8B5CF6]" />
              </div>
              <p className="text-sm font-medium text-white mb-1">
                Click to upload or drag and drop
              </p>
              <p className="text-xs text-muted">
                Images, videos or PDFs up to 50MB
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,video/*,application/pdf"
                onChange={handleFileChange}
                className="hidden"
              />
            </div>

            {/* Preview */}
            {filePreview && (
              <div className="animate-fadeUp">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-secondary">Preview</span>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedFile(null);
                      URL.revokeObjectURL(filePreview);
                      setFilePreview(null);
                    }}
                    className="text-xs text-[#F43F5E] hover:text-[#F87171] flex items-center gap-1 transition-colors"
                  >
                    <X className="w-3 h-3" />
                    Remove
                  </button>
                </div>
                <div className="rounded-xl overflow-hidden border border-[#18202B]">
                  {selectedFile?.type.startsWith("image/") && (
                    <img src={filePreview} alt="" className="w-full max-h-64 object-cover" />
                  )}
                  {selectedFile?.type.startsWith("video/") && (
                    <video src={filePreview} controls className="w-full max-h-64" />
                  )}
                  {selectedFile?.type === "application/pdf" && (
                    <div className="p-8 text-center bg-[#0F141C]">
                      <FileText className="w-10 h-10 text-[#F43F5E] mx-auto mb-2" />
                      <p className="text-sm text-white">{selectedFile.name}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={handleClear}
                className="btn-secondary"
              >
                Clear
              </button>
              <button
                type="submit"
                disabled={(!content.trim() && !selectedFile) || loading}
                className="btn-primary flex-1"
              >
                {loading ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    Publishing...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Publish Post
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      <ToastContainer position="top-right" theme="dark" />
    </div>
  );
};

export default CreatePost;