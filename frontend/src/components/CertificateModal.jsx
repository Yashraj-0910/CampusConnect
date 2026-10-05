import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { X, Download, Award, Printer, CheckCircle } from 'lucide-react';

export default function CertificateModal({ isOpen, onClose, event, studentName }) {
  const certificateRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      // Trigger festive celebration confetti
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });
    }
  }, [isOpen]);

  if (!isOpen || !event) return null;

  const attendeeName = studentName || 'Student Participant';
  const eventTitle = event.title || 'Campus Event';
  const clubName = event.Club?.name || 'Campus Club Committee';
  const issueDate = event.attended_at
    ? new Date(event.attended_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
    : new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  const certId = `CC-CERT-${(event.registration_id || event.id || '2026').slice(0, 8).toUpperCase()}`;

  const downloadCertificate = () => {
    const certElement = certificateRef.current;
    if (!certElement) return;

    // Create high-res canvas reproduction
    const canvas = document.createElement('canvas');
    canvas.width = 1200;
    canvas.height = 800;
    const ctx = canvas.getContext('2d');

    // Background gradient
    const bgGrad = ctx.createLinearGradient(0, 0, 1200, 800);
    bgGrad.addColorStop(0, '#0f172a');
    bgGrad.addColorStop(1, '#1e1b4b');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, 1200, 800);

    // Gold Outer Border
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 12;
    ctx.strokeRect(30, 30, 1140, 740);

    // Inner subtle border
    ctx.strokeStyle = '#6366f1';
    ctx.lineWidth = 2;
    ctx.strokeRect(45, 45, 1110, 710);

    // Top Header
    ctx.fillStyle = '#94a3b8';
    ctx.font = 'bold 20px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('CAMPUS CONNECT • OFFICIAL RECOGNITION', 600, 110);

    // Certificate Title
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 44px sans-serif';
    ctx.fillText('CERTIFICATE OF PARTICIPATION', 600, 180);

    // Subtitle
    ctx.fillStyle = '#cbd5e1';
    ctx.font = '22px sans-serif';
    ctx.fillText('This is proudly awarded to', 600, 240);

    // Student Name
    ctx.fillStyle = '#38bdf8';
    ctx.font = 'bold 48px sans-serif';
    ctx.fillText(attendeeName, 600, 315);

    // Body Text
    ctx.fillStyle = '#e2e8f0';
    ctx.font = '22px sans-serif';
    ctx.fillText('for successful participation and valuable contribution to', 600, 390);

    // Event Title
    ctx.fillStyle = '#fbbf24';
    ctx.font = 'bold 36px sans-serif';
    ctx.fillText(`"${eventTitle}"`, 600, 450);

    // Organized by
    ctx.fillStyle = '#cbd5e1';
    ctx.font = '22px sans-serif';
    ctx.fillText(`Organized by ${clubName}`, 600, 510);

    // Divider Line
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(250, 580);
    ctx.lineTo(950, 580);
    ctx.stroke();

    // Footer Signatures & Date
    ctx.fillStyle = '#94a3b8';
    ctx.font = '16px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(`DATE OF ISSUE: ${issueDate}`, 120, 680);
    ctx.fillText(`CERTIFICATE ID: ${certId}`, 120, 710);

    ctx.textAlign = 'right';
    ctx.fillText('FACULTY DEAN / CHIEF COORDINATOR', 1080, 680);
    ctx.fillStyle = '#34d399';
    ctx.fillText('✓ Digitally Verified Credential', 1080, 710);

    // Export image
    const image = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.href = image;
    link.download = `Certificate_${eventTitle.replace(/\s+/g, '_')}_${attendeeName.replace(/\s+/g, '_')}.png`;
    link.click();
  };

  const printCertificate = () => {
    window.print();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="relative w-full max-w-3xl my-8 bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden text-white"
        >
          {/* Action Bar */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950">
            <div className="flex items-center space-x-2 text-amber-400">
              <Award className="w-5 h-5" />
              <span className="font-semibold text-sm tracking-wide uppercase">Verified Credential</span>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={downloadCertificate}
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/30 transition"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download High-Res</span>
              </button>
              <button
                onClick={printCertificate}
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print</span>
              </button>
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white bg-slate-800/80 hover:bg-slate-700 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Certificate Viewport */}
          <div className="p-6 md:p-8 flex justify-center bg-slate-950/60">
            <div
              ref={certificateRef}
              className="relative w-full aspect-[1.45/1] rounded-xl border-4 border-amber-500/80 bg-gradient-to-br from-slate-900 via-slate-950 to-indigo-950/80 p-6 md:p-8 flex flex-col justify-between shadow-2xl shadow-amber-500/5 text-center overflow-hidden"
            >
              {/* Decorative Corner Ornaments */}
              <div className="absolute top-2 left-2 w-8 h-8 border-t-2 border-l-2 border-amber-400/80" />
              <div className="absolute top-2 right-2 w-8 h-8 border-t-2 border-r-2 border-amber-400/80" />
              <div className="absolute bottom-2 left-2 w-8 h-8 border-b-2 border-l-2 border-amber-400/80" />
              <div className="absolute bottom-2 right-2 w-8 h-8 border-b-2 border-r-2 border-amber-400/80" />

              {/* Watermark Logo */}
              <div className="absolute inset-0 flex items-center justify-center opacity-5 pointer-events-none">
                <Award className="w-96 h-96 text-white" />
              </div>

              {/* Header */}
              <div className="relative z-10">
                <p className="text-[11px] md:text-xs tracking-[0.25em] text-slate-400 font-semibold uppercase">
                  Campus Connect • Official Certification
                </p>
                <h2 className="mt-2 text-xl md:text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-400 to-yellow-500 tracking-tight font-serif">
                  CERTIFICATE OF PARTICIPATION
                </h2>
                <div className="w-24 h-0.5 bg-gradient-to-r from-transparent via-amber-400 to-transparent mx-auto mt-2" />
              </div>

              {/* Content */}
              <div className="relative z-10 my-auto py-3">
                <p className="text-xs md:text-sm text-slate-400 font-light">This certificate is awarded to</p>
                <h3 className="text-lg md:text-2xl font-bold text-sky-400 mt-1 tracking-wide font-serif">
                  {attendeeName}
                </h3>
                <p className="text-xs md:text-sm text-slate-300 mt-2 font-light max-w-lg mx-auto">
                  for attending and actively participating in the workshop / event:
                </p>
                <p className="text-base md:text-xl font-bold text-amber-300 mt-1">
                  "{eventTitle}"
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  Hosted by <span className="text-slate-200 font-medium">{clubName}</span>
                </p>
              </div>

              {/* Footer */}
              <div className="relative z-10 pt-4 border-t border-slate-800 flex items-end justify-between text-[10px] md:text-xs text-slate-400">
                <div className="text-left">
                  <p className="font-mono text-slate-500">{certId}</p>
                  <p className="text-slate-400 mt-0.5">Issued: {issueDate}</p>
                </div>
                <div className="flex flex-col items-center">
                  <div className="w-8 h-8 rounded-full bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-400 shadow-inner mb-1">
                    <Award className="w-4 h-4" />
                  </div>
                  <span className="text-[10px] uppercase tracking-wider text-amber-400/90 font-semibold">Verified Seal</span>
                </div>
                <div className="text-right">
                  <div className="flex items-center space-x-1 text-emerald-400 font-medium justify-end">
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span>Verified Attendee</span>
                  </div>
                  <p className="text-slate-500 text-[10px] mt-0.5">CampusConnect Dean Office</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
