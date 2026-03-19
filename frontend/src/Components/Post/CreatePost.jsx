import { useState, useRef, useEffect } from 'react';

const CreatePost = () => {
  const [content, setContent] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef(null);

  // Cleanup file preview on unmount to prevent memory leaks
  useEffect(() => {
    return () => {
      if (filePreview) {
        URL.revokeObjectURL(filePreview);
      }
    };
  }, [filePreview]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 50 * 1024 * 1024) { // 50MB limit
        alert("File too large! Max 50MB allowed.");
        return;
      }
      setSelectedFile(file);
      const previewUrl = URL.createObjectURL(file);
      setFilePreview(previewUrl);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (
      file &&
      (file.type.startsWith('image/') ||
        file.type.startsWith('video/') ||
        file.type === 'application/pdf')
    ) {
      if (file.size > 10 * 1024 * 1024) {
        alert("File too large! Max 10MB allowed.");
        return;
      }
      setSelectedFile(file);
      setFilePreview(URL.createObjectURL(file));
    }
  };

  const handleClear = () => {
    setContent('');
    setSelectedFile(null);
    if (filePreview) {
      URL.revokeObjectURL(filePreview);
    }
    setFilePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim() && !selectedFile) return;

    setLoading(true);
    const formData = new FormData();
    formData.append('content', content);
    if (selectedFile) {
      formData.append('file', selectedFile);
    }

    try {
      const res = await fetch("https://lingolive.onrender.com/api/posts", {
        method: "POST",
        body: formData,
        credentials: "include",
      });
      const data = await res.json();
      ("Post created:", data);
      handleClear();
    } catch (err) {
      console.error("Error creating post:", err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-primary)] py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-[var(--color-highlight)] bg-clip-text text-transparent mb-3">
            Create New Post
          </h1>
          <p className="text-[var(--color-muted)] text-sm">Share your thoughts with the world</p>
        </div>

        {/* Main Card */}
        <div className="bg-[var(--color-secondary)]/50 backdrop-blur-xl rounded-2xl border border-[var(--color-secondary)]/50 shadow-2xl overflow-hidden">
          <div className="p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Content Section */}
              <div className="space-y-3">
                <label htmlFor="content" className="block text-sm font-medium text-[var(--color-muted)]">
                  What's on your mind?
                </label>
                <div className="relative">
                  <textarea
                    name="content"
                    id="content"
                    rows="6"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Share your thoughts, ideas, or stories..."
                    className="w-full p-4 rounded-xl bg-[var(--color-secondary)]/50 border border-[var(--color-secondary)]/50 text-[var(--color-text)] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[var(--color-highlight)]/50 focus:border-transparent transition-all duration-300 resize-none"
                  />
                  <div className="absolute bottom-3 right-3 text-xs text-[var(--color-muted)]">
                    {content.length}/500
                  </div>
                </div>
              </div>

              {/* File Upload Section */}
              <div className="space-y-4">
                <label className="block text-sm font-medium text-[var(--color-muted)]">Add Media</label>
                {/* Drag & Drop Area */}
                <div
                  className={`border-2 border-dashed rounded-xl p-6 text-center transition-all duration-300 cursor-pointer ${
                    isDragging
                      ? 'border-blue-400 bg-[var(--color-secondary)]/10'
                      : 'border-[var(--color-secondary)] hover:border-gray-500 bg-[var(--color-secondary)]/30'
                  }`}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <div className="space-y-3">
                    <div className="w-12 h-12 mx-auto bg-gradient-to-r from-[var(--color-secondary)] to-[var(--color-highlight)] rounded-full flex items-center justify-center">
                      <svg className="w-6 h-6 text-[var(--color-text)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-[var(--color-muted)] font-medium">Drop your files here</p>
                      <p className="text-[var(--color-muted)] text-sm mt-1">or click to browse</p>
                    </div>
                    <p className="text-xs text-[var(--color-muted)]">Supports images, videos, and PDF files</p>
                  </div>

                  <input
                    ref={fileInputRef}
                    type="file"
                    id="file"
                    name="file"
                    accept="image/*,video/*,application/pdf"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </div>

                {/* File Preview */}
                {filePreview && (
                  <div className="mt-4">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm font-medium text-[var(--color-muted)]">Preview</span>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedFile(null);
                          URL.revokeObjectURL(filePreview);
                          setFilePreview(null);
                        }}
                        className="text-xs text-red-400 hover:text-red-300 transition-colors"
                      >
                        Remove
                      </button>
                    </div>

                    <div className="rounded-lg overflow-hidden border border-[var(--color-secondary)]/50 bg-[var(--color-secondary)]/30">
                      {selectedFile?.type.startsWith('image/') && (
                        <img src={filePreview} alt="Preview" className="w-full h-64 object-cover" />
                      )}
                      {selectedFile?.type.startsWith('video/') && (
                        <video src={filePreview} controls className="w-full h-64 object-cover" />
                      )}
                      {selectedFile?.type === 'application/pdf' && (
                        <div className="p-6 text-center">
                          <div className="w-16 h-16 mx-auto mb-3 bg-red-500 rounded-lg flex items-center justify-center">
                            <svg className="w-8 h-8 text-[var(--color-text)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                          </div>
                          <p className="text-[var(--color-muted)] font-medium">{selectedFile.name}</p>
                          <p className="text-[var(--color-muted)] text-sm">PDF Document</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={handleClear}
                  className="px-6 py-3 rounded-xl bg-[var(--color-secondary)]/75 hover:bg-[var(--color-secondary)]/60 text-[var(--color-text)] font-medium transition-all duration-300 hover:scale-105 active:scale-95"
                >
                  Clear All
                </button>
                <button
                  type="submit"
                  disabled={!content.trim() && !selectedFile || loading}
                  className="px-8 py-3 rounded-xl bg-gradient-to-r from-[var(--color-secondary)] to-[var(--color-highlight)] hover:from-[var(--color-secondary)] hover:to-[var(--color-accent)] text-[var(--color-text)] font-medium transition-all duration-300 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  {loading ? "Posting..." : "Create Post"}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Features Indicator */}
        <div className="mt-6 text-center">
          <div className="inline-flex items-center gap-6 text-sm text-[var(--color-muted)]">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
              <span>Image Support</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-[var(--color-highlight)] rounded-full"></div>
              <span>Video Support</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-[var(--color-highlight)]/80 rounded-full"></div>
              <span>PDF Support</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreatePost;
