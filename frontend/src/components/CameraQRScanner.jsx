import React, { useEffect, useRef, useState } from 'react';
import jsQR from 'jsqr';
import { Camera, CameraOff, Upload, AlertCircle, X, Sparkles, CheckCircle2 } from 'lucide-react';

export default function CameraQRScanner({ onScanSuccess, onClose }) {
  const [isScanning, setIsScanning] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [scannedCode, setScannedCode] = useState(null);

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const animationFrameId = useRef(null);
  const streamRef = useRef(null);

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  const startCamera = async () => {
    setErrorMsg('');
    setScannedCode(null);

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera access is not supported by your browser.');
      }

      // Request camera stream (prefer back camera on mobile, or standard webcam on desktop)
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment',
          width: { ideal: 640 },
          height: { ideal: 480 }
        }
      });

      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.setAttribute('playsinline', 'true');
        await videoRef.current.play();
        setIsScanning(true);
        animationFrameId.current = requestAnimationFrame(scanQRCode);
      }
    } catch (err) {
      console.error('Camera initialization failed:', err);
      setErrorMsg(
        err.name === 'NotAllowedError'
          ? 'Camera permission was denied. Please allow camera permissions in your browser address bar.'
          : err.name === 'NotFoundError'
          ? 'No camera device found on this system.'
          : 'Unable to access camera. You can upload a QR image instead.'
      );
      setIsScanning(false);
    }
  };

  const stopCamera = () => {
    if (animationFrameId.current) {
      cancelAnimationFrame(animationFrameId.current);
      animationFrameId.current = null;
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    setIsScanning(false);
  };

  const scanQRCode = () => {
    if (!videoRef.current || videoRef.current.readyState !== videoRef.current.HAVE_ENOUGH_DATA) {
      animationFrameId.current = requestAnimationFrame(scanQRCode);
      return;
    }

    const canvas = canvasRef.current || document.createElement('canvas');
    const ctx = canvas.getContext('2d', { willReadFrequently: true });

    const video = videoRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

    const code = jsQR(imageData.data, imageData.width, imageData.height, {
      inversionAttempts: 'dontInvert'
    });

    if (code && code.data) {
      handleExtractedToken(code.data);
      return;
    }

    animationFrameId.current = requestAnimationFrame(scanQRCode);
  };

  const handleExtractedToken = (rawText) => {
    let cleanToken = rawText.trim();
    // Check if JSON payload
    if (cleanToken.startsWith('{')) {
      try {
        const parsed = JSON.parse(cleanToken);
        if (parsed.ticketToken) {
          cleanToken = parsed.ticketToken;
        }
      } catch (e) {
        // use raw text
      }
    }

    setScannedCode(cleanToken);
    stopCamera();

    // Trigger success callback
    if (onScanSuccess) {
      onScanSuccess(cleanToken);
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setErrorMsg('');
    const reader = new FileReader();

    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        ctx.drawImage(img, 0, 0);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

        const code = jsQR(imageData.data, imageData.width, imageData.height);
        if (code && code.data) {
          handleExtractedToken(code.data);
        } else {
          setErrorMsg('No QR code detected in the uploaded image. Please try a clearer screenshot.');
        }
      };
      img.src = event.target.result;
    };

    reader.readAsDataURL(file);
  };

  return (
    <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 text-white shadow-xl relative overflow-hidden">
      {onClose && (
        <button
          onClick={() => {
            stopCamera();
            onClose();
          }}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white bg-slate-800 transition"
        >
          <X className="w-5 h-5" />
        </button>
      )}

      {/* Header */}
      <div className="flex items-center space-x-3 mb-4">
        <div className="p-2.5 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
          <Camera className="w-6 h-6" />
        </div>
        <div>
          <h3 className="font-bold text-base text-white">Live Camera QR Scanner</h3>
          <p className="text-xs text-slate-400">Point webcam or phone camera at the student's entry pass</p>
        </div>
      </div>

      {errorMsg && (
        <div className="mb-4 p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Scanner Viewport */}
      <div className="flex flex-col items-center justify-center">
        <div className="w-full max-w-[340px] aspect-square rounded-2xl overflow-hidden bg-slate-950 border-2 border-slate-700 relative flex items-center justify-center shadow-inner">
          {/* Direct Video Element */}
          <video
            ref={videoRef}
            className={`w-full h-full object-cover ${isScanning ? 'block' : 'hidden'}`}
            playsInline
            muted
          />

          {/* Offscreen Canvas used for frame decoding */}
          <canvas ref={canvasRef} className="hidden" />

          {/* Laser Scanning Animation Overlay */}
          {isScanning && (
            <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-6">
              {/* Corner targeting reticles */}
              <div className="flex justify-between">
                <div className="w-6 h-6 border-t-2 border-l-2 border-emerald-400" />
                <div className="w-6 h-6 border-t-2 border-r-2 border-emerald-400" />
              </div>

              {/* Animated laser line */}
              <div className="w-full h-0.5 bg-gradient-to-r from-transparent via-emerald-400 to-transparent animate-bounce shadow-lg shadow-emerald-400/50" />

              <div className="flex justify-between">
                <div className="w-6 h-6 border-b-2 border-l-2 border-emerald-400" />
                <div className="w-6 h-6 border-b-2 border-r-2 border-emerald-400" />
              </div>
            </div>
          )}

          {/* Idle State */}
          {!isScanning && !scannedCode && (
            <div className="text-center p-6 text-slate-500">
              <Camera className="w-12 h-12 mx-auto mb-2 text-slate-600" />
              <p className="text-xs font-semibold text-slate-400">Camera is ready</p>
              <p className="text-[11px] text-slate-500 mt-1">Click "Start Camera" to begin scanning</p>
            </div>
          )}

          {/* Scanned Success Preview */}
          {scannedCode && !isScanning && (
            <div className="text-center p-6 text-emerald-400 space-y-2">
              <CheckCircle2 className="w-12 h-12 mx-auto text-emerald-400 animate-pulse" />
              <p className="text-xs font-bold text-white">QR Code Recognized!</p>
              <p className="text-[10px] font-mono text-emerald-300 truncate max-w-[240px]">{scannedCode}</p>
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="mt-5 flex flex-wrap gap-3 w-full justify-center">
          {!isScanning ? (
            <button
              onClick={startCamera}
              className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition shadow-lg shadow-indigo-600/30"
            >
              <Camera className="w-4 h-4" />
              <span>Start Camera Scanner</span>
            </button>
          ) : (
            <button
              onClick={stopCamera}
              className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition shadow-lg shadow-rose-600/30"
            >
              <CameraOff className="w-4 h-4" />
              <span>Stop Camera</span>
            </button>
          )}

          {/* Upload Image fallback */}
          <label className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition cursor-pointer border border-slate-700">
            <Upload className="w-4 h-4" />
            <span>Upload QR Image</span>
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageUpload}
            />
          </label>
        </div>
      </div>
    </div>
  );
}
