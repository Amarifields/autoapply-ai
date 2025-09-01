"use client";

import { useRef, useState, ChangeEvent } from "react";

export default function Home() {
  const [jobDescription, setJobDescription] = useState("");
  const [resumeText, setResumeText] = useState("");
  const [resumeFileName, setResumeFileName] = useState("");
  const [uploadStatus, setUploadStatus] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleFileUpload(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    if (file.type !== "application/pdf" && file.type !== "text/plain") {
      alert("Please upload a PDF or text file");
      return;
    }
    setResumeFileName(file.name);
    setUploadStatus("Processing file...");
    const formData = new FormData();
    formData.append("resume", file);
    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      if (!res.ok) {
        setUploadStatus("Error processing file");
        return;
      }
      const data = await res.json();
      setResumeText(data.text || "");
      setUploadStatus("File processed successfully");
    } catch (e) {
      setUploadStatus("Error uploading file");
    }
  }

  async function handleSubmit() {
    if (!jobDescription.trim() || !resumeText.trim()) return;
    setIsLoading(true);
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobDescription, userResume: resumeText }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({} as any));
        alert(`Error: ${err.error || "Failed to generate application"}`);
        return;
      }

      const data = await res.json();

      if (!data.coverLetter || !data.resumeSnippet) {
        console.error("Invalid response data:", data);
        alert("Error: Received incomplete response from server");
        return;
      }

      const coverLetter = encodeURIComponent(data.coverLetter);
      const resumeSnippet = encodeURIComponent(data.resumeSnippet);
      window.location.href = `/result?coverLetter=${coverLetter}&resumeSnippet=${resumeSnippet}`;
    } catch (e) {
      console.error("Error:", e);
      alert("Error: Failed to generate application. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
      <div className="w-full max-w-3xl mx-auto p-6">
        <div className="text-center mb-12">
          <h1 className="text-6xl font-bold text-white mb-6 tracking-tight">
            AutoApply AI
          </h1>
          <p className="text-2xl text-slate-300 max-w-3xl mx-auto leading-relaxed">
            Transform your resume into interview-winning applications with
            personalized,
            <span className="text-blue-400 font-semibold">
              {" "}
              AI-powered optimization
            </span>
          </p>
        </div>

        <div className="space-y-8">
          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-8 shadow-2xl">
            <div className="flex items-center space-x-4 mb-6">
              <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-blue-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
              <div>
                <h3 className="text-white font-semibold text-xl">
                  Job Description
                </h3>
                <p className="text-slate-400 text-sm">
                  Paste the job posting you want to apply for
                </p>
              </div>
            </div>
            <textarea
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              placeholder="Paste the job posting or description here..."
              className="w-full h-48 bg-slate-900/50 border border-slate-600 rounded-xl p-6 text-white placeholder-slate-400 resize-none focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all text-base leading-relaxed"
            />

            <div className="mt-8 border-t border-slate-700 pt-8">
              <div className="flex items-center space-x-4 mb-6">
                <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center">
                  <svg
                    className="w-6 h-6 text-green-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                    />
                  </svg>
                </div>
                <div>
                  <h3 className="text-white font-semibold text-xl">
                    Upload Your Resume
                  </h3>
                  <p className="text-slate-400 text-sm">
                    PDF format recommended for best results
                  </p>
                </div>
              </div>
              <div className="text-center">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,application/pdf"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="px-8 py-4 bg-slate-700 hover:bg-slate-600 text-white font-semibold rounded-xl border border-slate-600 hover:border-slate-500 transition-all duration-300 shadow-lg hover:shadow-xl flex items-center space-x-3 mx-auto"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                    />
                  </svg>
                  <span>Upload PDF Resume</span>
                </button>
                {uploadStatus && (
                  <p className="text-sm text-slate-400 mt-4">{uploadStatus}</p>
                )}
                {resumeFileName && (
                  <div className="inline-flex items-center space-x-2 text-sm text-green-400 mt-4 bg-green-500/10 border border-green-500/20 rounded-full px-4 py-2">
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    <span>{resumeFileName}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="text-center mt-10">
          <button
            onClick={handleSubmit}
            disabled={isLoading || !jobDescription.trim() || !resumeText.trim()}
            className="px-12 py-5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-lg rounded-xl transition-all duration-300 shadow-2xl hover:shadow-blue-500/25 transform hover:scale-105 disabled:transform-none"
          >
            {isLoading ? (
              <div className="flex items-center space-x-3">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Generating Your Application...</span>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
                <span>Generate Tailored Application</span>
              </div>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
