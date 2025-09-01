"use client";

import { useEffect, useState, useRef } from "react";
import { useSearchParams } from "next/navigation";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

export default function Result() {
  const searchParams = useSearchParams();
  const [coverLetter, setCoverLetter] = useState("");
  const [resumeSnippet, setResumeSnippet] = useState("");
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const coverLetterRef = useRef<HTMLDivElement>(null);
  const resumeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const coverLetterParam = searchParams.get("coverLetter");
    const resumeSnippetParam = searchParams.get("resumeSnippet");

    if (coverLetterParam) {
      try {
        setCoverLetter(decodeURIComponent(coverLetterParam));
      } catch (e) {
        setCoverLetter(coverLetterParam);
      }
    }
    if (resumeSnippetParam) {
      try {
        setResumeSnippet(decodeURIComponent(resumeSnippetParam));
      } catch (e) {
        setResumeSnippet(resumeSnippetParam);
      }
    }
  }, [searchParams]);

  const generateFileName = (type: string): string => {
    const timestamp = new Date().toISOString().slice(0, 10);
    const randomId = Math.random().toString(36).substring(2, 6);
    const personName = extractPersonName();
    const jobTitle = extractJobTitle();
    const cleanJobTitle = jobTitle.replace(/[^a-zA-Z0-9]/g, "_").toLowerCase();
    return `${personName}_${cleanJobTitle}_${type}_${timestamp}_${randomId}`;
  };

  const extractPersonName = (): string => {
    const resumeText = resumeSnippet || coverLetter;
    const lines = resumeText.split("\n");

    for (const line of lines) {
      const trimmedLine = line.trim();
      if (
        trimmedLine &&
        !trimmedLine.toLowerCase().includes("resume") &&
        !trimmedLine.toLowerCase().includes("experience") &&
        !trimmedLine.toLowerCase().includes("skills") &&
        !trimmedLine.toLowerCase().includes("education") &&
        !trimmedLine.toLowerCase().includes("summary") &&
        !trimmedLine.toLowerCase().includes("objective") &&
        !trimmedLine.toLowerCase().includes("phone") &&
        !trimmedLine.toLowerCase().includes("email") &&
        !trimmedLine.toLowerCase().includes("address") &&
        !trimmedLine.toLowerCase().includes("linkedin") &&
        trimmedLine.length > 2 &&
        trimmedLine.length < 50
      ) {
        const words = trimmedLine.split(" ").filter((word) => word.length > 0);
        if (words.length >= 2) {
          const firstName = words[0].toLowerCase().replace(/[^a-z]/g, "");
          const lastName = words[words.length - 1]
            .toLowerCase()
            .replace(/[^a-z]/g, "");
          if (
            firstName &&
            lastName &&
            firstName !== lastName &&
            firstName.length > 1 &&
            lastName.length > 1
          ) {
            return `${firstName}_${lastName}`;
          }
        }
      }
    }

    return "march_fields";
  };

  const extractJobTitle = (): string => {
    const jobText = coverLetter.toLowerCase();
    if (jobText.includes("software engineer")) return "software_engineer";
    if (jobText.includes("developer")) return "developer";
    if (jobText.includes("manager")) return "manager";
    if (jobText.includes("analyst")) return "analyst";
    if (jobText.includes("designer")) return "designer";
    if (jobText.includes("consultant")) return "consultant";
    if (jobText.includes("specialist")) return "specialist";
    if (jobText.includes("coordinator")) return "coordinator";
    if (jobText.includes("assistant")) return "assistant";
    if (jobText.includes("director")) return "director";
    if (jobText.includes("executive")) return "executive";
    if (jobText.includes("lead")) return "lead";
    if (jobText.includes("senior")) return "senior";
    if (jobText.includes("junior")) return "junior";
    return "professional";
  };

  const copyToClipboard = async (
    content: string,
    type: string,
    event: React.MouseEvent<HTMLButtonElement>
  ) => {
    try {
      await navigator.clipboard.writeText(content);
      const button = event.currentTarget;
      const originalText = button.innerHTML;
      button.innerHTML = `
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
        </svg>
        <span>Copied!</span>
      `;
      button.classList.add("bg-green-600", "hover:bg-green-700");
      button.classList.remove("bg-slate-600", "hover:bg-slate-500");

      setTimeout(() => {
        button.innerHTML = originalText;
        button.classList.remove("bg-green-600", "hover:bg-green-700");
        button.classList.add("bg-slate-600", "hover:bg-slate-500");
      }, 2000);
    } catch (err) {
      console.error("Failed to copy: ", err);
      alert("Failed to copy to clipboard. Please try again.");
    }
  };

  const generatePDF = async (
    content: string,
    type: string,
    ref: React.RefObject<HTMLDivElement>
  ) => {
    if (!ref.current) return;

    setIsGeneratingPDF(true);
    try {
      const canvas = await html2canvas(ref.current, {
        scale: 3,
        useCORS: true,
        backgroundColor: "#ffffff",
        width: 794,
        height: ref.current.scrollHeight,
        windowWidth: 794,
        windowHeight: ref.current.scrollHeight,
        logging: false,
        allowTaint: true,
        scrollX: 0,
        scrollY: 0,
        foreignObjectRendering: true,
      });

      const imgData = canvas.toDataURL("image/png", 1.0);
      const pdf = new jsPDF("p", "pt", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = pdfWidth - 60;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;

      let position = 30;

      pdf.addImage(imgData, "PNG", 30, position, imgWidth, imgHeight);
      heightLeft -= (pdfHeight - 60);

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight + 30;
        pdf.addPage();
        pdf.addImage(imgData, "PNG", 30, position, imgWidth, imgHeight);
        heightLeft -= (pdfHeight - 60);
      }

      const fileName = generateFileName(type);
      pdf.save(`${fileName}.pdf`);
    } catch (error) {
      console.error("PDF generation error:", error);
      alert("Error generating PDF. Please try again.");
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const downloadAsText = (content: string, type: string): void => {
    const element = document.createElement("a");
    const formattedContent = content.replace(/\n\n/g, "\n\n").trim();
    const file = new Blob([formattedContent], {
      type: "text/plain;charset=utf-8",
    });
    element.href = URL.createObjectURL(file);
    element.download = `${generateFileName(type)}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="max-w-7xl mx-auto p-6 space-y-8">
        <div className="text-center space-y-6">
          <h1 className="text-5xl font-bold text-white tracking-tight">
            Your Tailored Application
          </h1>
          <p className="text-xl text-slate-300 max-w-2xl mx-auto">
            Professionally crafted to maximize your interview chances
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-2">
          <div className="space-y-6">
            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-8 shadow-2xl">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-4">
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
                      Cover Letter
                    </h3>
                    <p className="text-slate-400 text-sm">
                      Personalized for your target role
                    </p>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={(e) =>
                      copyToClipboard(coverLetter, "cover_letter", e)
                    }
                    className="px-4 py-2 bg-slate-600 hover:bg-slate-500 text-white text-sm rounded-lg transition-all duration-200 border border-slate-500 hover:border-slate-400 flex items-center space-x-2"
                  >
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
                        d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                      />
                    </svg>
                    <span>Copy</span>
                  </button>
                  <button
                    onClick={() => downloadAsText(coverLetter, "cover_letter")}
                    className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white text-sm rounded-lg transition-all duration-200 border border-slate-600 hover:border-slate-500"
                  >
                    TXT
                  </button>
                  <button
                    onClick={() =>
                      generatePDF(coverLetter, "cover_letter", coverLetterRef)
                    }
                    disabled={isGeneratingPDF}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm rounded-lg transition-all duration-200 flex items-center space-x-2"
                  >
                    {isGeneratingPDF ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>PDF</span>
                      </>
                    ) : (
                      <>
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
                            d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                          />
                        </svg>
                        <span>PDF</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
              <div
                ref={coverLetterRef}
                className="bg-white rounded-xl shadow-inner"
                style={{
                  fontFamily: "Georgia, serif",
                  fontSize: "12px",
                  lineHeight: "1.8",
                  minHeight: "500px",
                  padding: "50px",
                  margin: "0",
                  width: "100%",
                  boxSizing: "border-box",
                  color: "#2d3748",
                  letterSpacing: "0.3px",
                }}
              >
                <div
                  className="whitespace-pre-wrap leading-relaxed"
                  style={{ 
                    margin: "0",
                    textAlign: "justify",
                    wordSpacing: "1px"
                  }}
                >
                  {coverLetter}
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-8 shadow-2xl">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-4">
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
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-white font-semibold text-xl">
                      Tailored Resume
                    </h3>
                    <p className="text-slate-400 text-sm">
                      Optimized for your target position
                    </p>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={(e) => copyToClipboard(resumeSnippet, "resume", e)}
                    className="px-4 py-2 bg-slate-600 hover:bg-slate-500 text-white text-sm rounded-lg transition-all duration-200 border border-slate-500 hover:border-slate-400 flex items-center space-x-2"
                  >
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
                        d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                      />
                    </svg>
                    <span>Copy</span>
                  </button>
                  <button
                    onClick={() => downloadAsText(resumeSnippet, "resume")}
                    className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white text-sm rounded-lg transition-all duration-200 border border-slate-600 hover:border-slate-500"
                  >
                    TXT
                  </button>
                  <button
                    onClick={() =>
                      generatePDF(resumeSnippet, "resume", resumeRef)
                    }
                    disabled={isGeneratingPDF}
                    className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm rounded-lg transition-all duration-200 flex items-center space-x-2"
                  >
                    {isGeneratingPDF ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>PDF</span>
                      </>
                    ) : (
                      <>
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
                            d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                          />
                        </svg>
                        <span>PDF</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
              <div
                ref={resumeRef}
                className="bg-white rounded-xl shadow-inner"
                style={{
                  fontFamily: "Calibri, Arial, sans-serif",
                  fontSize: "11px",
                  lineHeight: "1.4",
                  minHeight: "600px",
                  padding: "45px",
                  margin: "0",
                  width: "100%",
                  boxSizing: "border-box",
                  color: "#1a202c",
                  letterSpacing: "0.2px",
                }}
              >
                <div
                  className="whitespace-pre-wrap leading-relaxed"
                  style={{ 
                    margin: "0",
                    textAlign: "left",
                    wordSpacing: "0.5px"
                  }}
                >
                  {resumeSnippet}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="text-center space-y-6">
          <div className="flex justify-center space-x-4">
            <button
              onClick={() => (window.location.href = "/")}
              className="px-8 py-4 bg-slate-700 hover:bg-slate-600 text-white font-semibold rounded-xl border border-slate-600 hover:border-slate-500 transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              Generate Another Application
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
