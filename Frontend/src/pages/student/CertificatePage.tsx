import React, { useRef } from "react";
import { useParams, useLocation } from "react-router-dom";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { Button } from "@/components/ui";
import logo from "@/assets/Learn2codehub.png";
import { useAuthStore } from "@/store/authStore";
import { useApi } from "@/hooks/useApi";
import { coursesApi } from "@/api/courses";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import type { CourseDetail } from "@/types";

export const CertificatePage: React.FC = () => {
  const certificateRef = useRef<HTMLDivElement>(null);

  const { courseId } = useParams<{ courseId: string }>();
  const user = useAuthStore((state) => state.user);
  const location = useLocation();
  const params = new URLSearchParams(location.search);

  const { data: course, isLoading } = useApi<CourseDetail>(
    () => coursesApi.getCourseById(String(courseId)),
    [courseId]
  );

  let resolvedName = "Student Name";
  if (user?.firstName || user?.lastName) {
    resolvedName = `${user.firstName || ""} ${user.lastName || ""}`.trim();
  } else if (user?.email) {
    resolvedName = user.email.split("@")[0];
  } else if (params.get("name")) {
    resolvedName = params.get("name")!;
  }

  const studentName = resolvedName;
  const courseTitle = course ? course.title : params.get("course") || "Course Title";
  const completionDate = params.get("date") || new Date().toLocaleDateString();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-[#0B0F19] py-12 flex items-center justify-center">
        <LoadingSpinner size="lg" text="Generating your certificate..." />
      </div>
    );
  }

  const downloadPDF = async () => {
    if (!certificateRef.current) return;

    try {
      const canvas = await html2canvas(certificateRef.current, {
        scale: 3,
        useCORS: true,
        backgroundColor: "#fdfbf7",
        logging: false,
        onclone: (clonedDoc) => {
          clonedDoc.querySelectorAll('style, link[rel="stylesheet"]').forEach(el => el.remove());
          
          const resetStyle = clonedDoc.createElement('style');
          resetStyle.innerHTML = `
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
          `;
          clonedDoc.head.appendChild(resetStyle);
        },
      });

      const imgData = canvas.toDataURL("image/jpeg", 1.0);

      const pdf = new jsPDF({
        orientation: "landscape",
        unit: "mm",
        format: "a4",
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();

      pdf.addImage(imgData, "JPEG", 0, 0, pdfWidth, pdfHeight);
      pdf.save(`${courseTitle.replace(/\s+/g, "_")}_Certificate.pdf`);
    } catch (err) {
      console.error("PDF generation failed:", err);
      alert("Failed to generate PDF. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0B0F19] py-12 px-4 sm:px-6 lg:px-8 flex flex-col items-center">

      {/* Top Bar */}
      <div className="w-full max-w-[1123px] mx-auto flex flex-col sm:flex-row justify-between items-center mb-8 gap-4 bg-white dark:bg-[#1C1F26] p-6 rounded-[2rem] border border-gray-200 dark:border-gray-800 shadow-sm">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white tracking-tight">
            Your Certificate
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Congratulations on completing your course! Download your official certificate below.
          </p>
        </div>
        <Button
          onClick={downloadPDF}
          size="lg"
          className="shrink-0 bg-indigo-600 hover:bg-indigo-700 text-white shadow-xl shadow-indigo-500/20 rounded-xl transition-transform hover:scale-105 active:scale-95"
        >
          Download PDF
        </Button>
      </div>

      {/* Certificate Preview */}
      <div className="w-full overflow-x-auto flex justify-center pb-12 hide-scrollbar">
        <div
          ref={certificateRef}
          style={{
            width: "1123px",
            height: "794px",
            backgroundColor: "#fdfbf7",
            backgroundImage: "radial-gradient(circle at center, #ffffff 0%, #fdfbf7 100%)",
            color: "#0f172a",
            position: "relative",
            fontFamily: "'Georgia', serif",
            boxSizing: "border-box",
            overflow: "hidden",
            boxShadow: "0 25px 50px -12px rgba(0,0,0,0.25)",
            flexShrink: 0,
          }}
        >
          {/* Background pattern */}
          <div
            style={{
              position: "absolute",
              top: 0, left: 0, right: 0, height: "100%",
              opacity: 0.04,
              pointerEvents: "none",
              backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M54.627 0l.83.83-54.627 54.627-.83-.83L54.627 0zm-14.142 0l.83.83-40.485 40.485-.83-.83L40.485 0zm-14.142 0l.83.83-26.343 26.343-.83-.83L26.343 0zm-14.142 0l.83.83-12.2 12.2-.83-.83L12.201 0zM60 5.373l-.83-.83L5.373 60l.83.83L60 5.373zm0 14.142l-.83-.83L19.515 60l.83.83L60 19.515zm0 14.142l-.83-.83L33.657 60l.83.83L60 33.657zm0 14.142l-.83-.83L47.8 60l.83.83L60 47.799z' fill='%231e3a8a' fill-opacity='1' fill-rule='evenodd'/%3E%3C/svg%3E\")",
            }}
          />

          {/* Outer navy border */}
          <div style={{ position: "absolute", inset: "24px", border: "12px solid #1e3a8a", zIndex: 1 }} />
          {/* Inner gold border */}
          <div style={{ position: "absolute", inset: "40px", border: "2px solid #ca8a04", zIndex: 1 }} />

          {/* Corner ornaments */}
          <div style={{ position: "absolute", top: "36px", left: "36px", width: "30px", height: "30px", borderTop: "4px solid #ca8a04", borderLeft: "4px solid #ca8a04", zIndex: 2 }} />
          <div style={{ position: "absolute", top: "36px", right: "36px", width: "30px", height: "30px", borderTop: "4px solid #ca8a04", borderRight: "4px solid #ca8a04", zIndex: 2 }} />
          <div style={{ position: "absolute", bottom: "36px", left: "36px", width: "30px", height: "30px", borderBottom: "4px solid #ca8a04", borderLeft: "4px solid #ca8a04", zIndex: 2 }} />
          <div style={{ position: "absolute", bottom: "36px", right: "36px", width: "30px", height: "30px", borderBottom: "4px solid #ca8a04", borderRight: "4px solid #ca8a04", zIndex: 2 }} />

          {/* Content */}
          <div
            style={{
              position: "relative", zIndex: 10,
              display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
              height: "100%", padding: "60px",
            }}
          >
            {/* Logo */}
            <div style={{ marginBottom: "24px", backgroundColor: "#1e3a8a", padding: "12px 32px", borderRadius: "100px", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)" }}>
              <img src={logo} alt="LearnToCodeHub Logo" style={{ height: "40px", objectFit: "contain" }} crossOrigin="anonymous" />
            </div>

            <h1 style={{ fontSize: "56px", fontWeight: "900", color: "#1e3a8a", marginBottom: "16px", letterSpacing: "2px", textTransform: "uppercase", fontFamily: "serif", lineHeight: "1.2" }}>
              Certificate of Completion
            </h1>

            <p style={{ fontSize: "16px", color: "#ca8a04", letterSpacing: "8px", textTransform: "uppercase", marginBottom: "48px", fontWeight: "700", lineHeight: "1.2" }}>
              This is proudly presented to
            </p>

            <div style={{ display: "inline-block", marginBottom: "40px", textAlign: "center" }}>
              <h2 style={{ fontSize: "76px", fontStyle: "italic", fontWeight: "bold", color: "#0f172a", whiteSpace: "nowrap", lineHeight: "1", padding: "0 80px" }}>
                {studentName}
              </h2>
              <div style={{ width: "100%", height: "3px", backgroundColor: "#cbd5e1", marginTop: "12px" }}></div>
            </div>

            <p style={{ fontSize: "22px", color: "#475569", marginBottom: "24px", fontStyle: "italic", fontWeight: "500", lineHeight: "1.2" }}>
              for successfully completing the course
            </p>

            <h3 style={{ fontSize: "42px", fontWeight: "bold", color: "#1e3a8a", marginBottom: "80px", textAlign: "center", maxWidth: "800px", lineHeight: "1.2" }}>
              {courseTitle}
            </h3>

            {/* Footer */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", width: "85%", position: "absolute", bottom: "80px" }}>

              {/* Date */}
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                <div style={{ minWidth: "220px", display: "flex", flexDirection: "column", alignItems: "center" }}>
                  <p style={{ fontSize: "24px", fontWeight: "bold", color: "#1e293b", textAlign: "center", lineHeight: "1" }}>
                    {completionDate}
                  </p>
                  <div style={{ width: "100%", height: "2px", backgroundColor: "#94a3b8", marginTop: "8px" }}></div>
                </div>
                <p style={{ fontSize: "14px", color: "#64748b", marginTop: "12px", textTransform: "uppercase", letterSpacing: "2px", fontWeight: "600", lineHeight: "1.2" }}>
                  Date of Completion
                </p>
              </div>
              
              {/* Signature */}
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                <div style={{ minWidth: "220px", display: "flex", flexDirection: "column", alignItems: "center" }}>
                  <div style={{ fontSize: "32px", fontFamily: "cursive", color: "#1e293b", textAlign: "center", fontStyle: "italic", lineHeight: "1" }}>
                    LearnToCodeHub
                  </div>
                  <div style={{ width: "100%", height: "2px", backgroundColor: "#94a3b8", marginTop: "8px" }}></div>
                </div>
                <p style={{ fontSize: "14px", color: "#64748b", marginTop: "12px", textTransform: "uppercase", letterSpacing: "2px", fontWeight: "600", lineHeight: "1.2" }}>
                  Official Signature
                </p>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
};