import React, { useState, useRef, useEffect } from 'react';
import { Camera, RefreshCw, X, Check, Image as ImageIcon, Sparkles, AlertCircle } from 'lucide-react';
import { Button } from '../ui/Button';

export default function CameraCaptureModal({ isOpen, onClose, onCapture }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [stream, setStream] = useState(null);
  const [capturedImage, setCapturedImage] = useState(null);
  const [cameraError, setCameraError] = useState(null);
  const [facingMode] = useState('environment');

  useEffect(() => {
    if (isOpen && !capturedImage) {
      startCamera();
    } else {
      stopCamera();
    }

    return () => {
      stopCamera();
    };
  }, [isOpen, facingMode, capturedImage]);

  const startCamera = async () => {
    setCameraError(null);
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera device API is not supported in this browser.');
      }

      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: facingMode,
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      });

      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err) {
      console.warn('Camera stream error:', err.message);
      setCameraError(
        'Unable to access camera hardware. You can upload an image file directly or use a sample photo.'
      );
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
  };

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;

    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
    setCapturedImage(dataUrl);
    stopCamera();
  };

  const retakePhoto = () => {
    setCapturedImage(null);
    startCamera();
  };

  const confirmPhoto = () => {
    if (capturedImage) {
      onCapture(capturedImage);
      onClose();
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setCapturedImage(event.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const useSampleFoodPhoto = () => {
    const sampleUrl = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&auto=format&fit=crop&q=80';
    setCapturedImage(sampleUrl);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-3xl bg-white border border-slate-200 p-6 shadow-2xl space-y-4 relative overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100">
              <Camera className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Live Food Quality Camera</h3>
              <p className="text-[11px] text-slate-500 font-mono">FoodAgent Visual Freshness Scanner</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-50 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Viewfinder Canvas / Video */}
        <div className="relative rounded-2xl bg-slate-950 border border-slate-200 aspect-video overflow-hidden flex items-center justify-center shadow-inner">
          {capturedImage ? (
            /* Captured Snapshot Preview */
            <div className="relative w-full h-full">
              <img
                src={capturedImage}
                alt="Captured food preview"
                className="w-full h-full object-cover"
              />
              <div className="absolute top-3 left-3 px-2.5 py-1 rounded-lg bg-slate-900/80 border border-emerald-500/50 text-emerald-300 text-[10px] font-bold flex items-center gap-1.5 backdrop-blur-sm">
                <Sparkles className="w-3 h-3 text-emerald-400" />
                Snapshot Ready for AI Scan
              </div>
            </div>
          ) : cameraError ? (
            /* Camera Permission Fallback */
            <div className="p-6 text-center space-y-3 max-w-sm">
              <AlertCircle className="w-10 h-10 text-amber-400 mx-auto" />
              <p className="text-xs text-slate-200">{cameraError}</p>
              <div className="flex flex-wrap gap-2 justify-center pt-2">
                <label className="px-3.5 py-2 rounded-xl bg-emerald-600 text-white font-bold text-xs cursor-pointer hover:bg-emerald-700 transition-colors flex items-center gap-1.5 shadow-sm">
                  <ImageIcon className="w-4 h-4" /> Upload Image File
                  <input type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />
                </label>
                <button
                  type="button"
                  onClick={useSampleFoodPhoto}
                  className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs text-slate-200 font-semibold"
                >
                  Use Sample Photo
                </button>
              </div>
            </div>
          ) : (
            /* Live Camera Viewfinder */
            <>
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />

              {/* Viewfinder Target Reticle */}
              <div className="absolute inset-4 border border-emerald-500/40 rounded-xl pointer-events-none flex items-center justify-center">
                <div className="w-16 h-16 border-2 border-emerald-400/60 rounded-lg border-dashed animate-pulse" />
                <div className="absolute top-2 left-2 text-[10px] font-mono text-emerald-300 bg-slate-950/70 px-2 py-0.5 rounded">
                  SCANNING VISUAL TEXTURE
                </div>
              </div>
            </>
          )}

          <canvas ref={canvasRef} className="hidden" />
        </div>

        {/* Action Controls */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-100">
          {!capturedImage ? (
            <>
              <label className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-800 cursor-pointer font-medium">
                <ImageIcon className="w-4 h-4" />
                <span>Upload file</span>
                <input type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />
              </label>

              <button
                type="button"
                onClick={capturePhoto}
                disabled={!!cameraError}
                className="px-6 py-2.5 rounded-full bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-xs shadow-md shadow-emerald-500/20 flex items-center gap-2"
              >
                <Camera className="w-4 h-4" />
                Capture Snapshot
              </button>
            </>
          ) : (
            <>
              <Button variant="secondary" size="sm" icon={RefreshCw} onClick={retakePhoto}>
                Retake Photo
              </Button>

              <Button
                variant="primary"
                size="sm"
                icon={Check}
                onClick={confirmPhoto}
                className="px-6 shadow-md shadow-emerald-500/20"
              >
                Attach & Analyze
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
