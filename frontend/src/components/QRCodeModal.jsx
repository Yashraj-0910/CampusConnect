import React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Download, QrCode, Calendar, MapPin, CheckCircle } from 'lucide-react';

export default function QRCodeModal({ isOpen, onClose, event, registration }) {
  if (!isOpen || !event) return null;

  const ticketToken = registration?.ticket_token || event.ticket_token || 'TOKEN-UNVERIFIED';
  const qrData = JSON.stringify({
    eventId: event.id,
    ticketToken,
    eventName: event.title
  });

  const downloadQR = () => {
    const svg = document.getElementById('event-qr-svg');
    if (!svg) return;
    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    img.onload = () => {
      canvas.width = img.width + 40;
      canvas.height = img.height + 40;
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 20, 20);
      const pngFile = canvas.toDataURL('image/png');
      const downloadLink = document.createElement('a');
      downloadLink.download = `${event.title.replace(/\s+/g, '_')}_Ticket_QR.png`;
      downloadLink.href = pngFile;
      downloadLink.click();
    };
    img.src = 'data:image/svg+xml;base64,' + btoa(svgData);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="relative w-full max-w-md p-6 overflow-hidden rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl text-white"
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-lg bg-slate-800/80 hover:bg-slate-700 transition"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Header */}
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2.5 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
              <QrCode className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white leading-tight">Official Event Entry Pass</h3>
              <p className="text-xs text-slate-400">Scan at entrance for fast check-in</p>
            </div>
          </div>

          {/* Event Mini Info */}
          <div className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700/60 mb-5">
            <h4 className="font-semibold text-white text-sm line-clamp-1">{event.title}</h4>
            <div className="flex items-center space-x-4 mt-2 text-xs text-slate-300">
              <div className="flex items-center space-x-1 text-indigo-300">
                <Calendar className="w-3.5 h-3.5" />
                <span>{new Date(event.event_date).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center space-x-1 text-slate-400">
                <MapPin className="w-3.5 h-3.5" />
                <span className="truncate max-w-[140px]">{event.venue || 'Campus Venue'}</span>
              </div>
            </div>
          </div>

          {/* QR Container */}
          <div className="flex flex-col items-center justify-center p-6 rounded-2xl bg-white text-slate-900 shadow-inner">
            <QRCodeSVG
              id="event-qr-svg"
              value={ticketToken}
              size={190}
              level="H"
              includeMargin={false}
            />
            <span className="mt-3 text-[11px] font-mono tracking-widest text-slate-600 uppercase">
              PASS: {ticketToken.slice(0, 13)}...
            </span>
          </div>

          {/* Status Badge */}
          <div className="flex items-center justify-center space-x-2 mt-4 text-xs font-medium text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 py-2 rounded-lg">
            <CheckCircle className="w-4 h-4" />
            <span>Verified Confirmed Registration</span>
          </div>

          {/* Action Buttons */}
          <div className="mt-5 flex space-x-3">
            <button
              onClick={downloadQR}
              className="flex-1 flex items-center justify-center space-x-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-sm transition shadow-lg shadow-indigo-600/30"
            >
              <Download className="w-4 h-4" />
              <span>Save Pass</span>
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium text-sm transition"
            >
              Done
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
