import { useEffect, useRef, useState } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { CheckCircle2, XCircle, Scan } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface ScannerProps {
  onScan: (decodedText: string) => { success: boolean; message: string; student?: any };
}

export default function Scanner({ onScan }: ScannerProps) {
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);

  useEffect(() => {
    // Only initialize if the element exists and scanner isn't already running
    const config = {
      fps: 10,
      qrbox: { width: 250, height: 250 },
      aspectRatio: 1.0,
    };

    scannerRef.current = new Html5QrcodeScanner('qr-reader', config, false);

    scannerRef.current.render(
      (decodedText) => {
        const result = onScan(decodedText);
        setFeedback({
          type: result.success ? 'success' : 'error',
          message: result.message,
        });

        // Clear feedback after 3 seconds
        setTimeout(() => setFeedback(null), 3000);
      },
      (error) => {
        // Quietly handle scan errors (no QR found in frame)
      }
    );

    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear().catch(console.error);
      }
    };
  }, [onScan]);

  return (
    <div className="flex flex-col items-center gap-6 p-4 max-w-md mx-auto">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-slate-900 flex items-center justify-center gap-2">
          <Scan className="w-6 h-6 text-indigo-600" />
          Scan Absensi
        </h2>
        <p className="text-slate-500 text-sm mt-1">Arahkan kamera ke QR Code siswa</p>
      </div>

      <div className="w-full bg-slate-100 rounded-3xl overflow-hidden shadow-inner border border-slate-200 relative aspect-square">
        <div id="qr-reader" className="w-full h-full"></div>
        
        <AnimatePresence>
          {feedback && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className={`absolute inset-x-4 bottom-4 p-4 rounded-2xl flex items-center gap-3 shadow-xl backdrop-blur-md ${
                feedback.type === 'success' 
                  ? 'bg-emerald-500/90 text-white' 
                  : 'bg-rose-500/90 text-white'
              }`}
            >
              {feedback.type === 'success' ? (
                <CheckCircle2 className="w-6 h-6 shrink-0" />
              ) : (
                <XCircle className="w-6 h-6 shrink-0" />
              )}
              <span className="font-medium">{feedback.message}</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="bg-indigo-50 p-4 rounded-2xl border border-indigo-100 w-full overflow-hidden">
        <img 
          src="/src/assets/images/attendance_hero_1793322172260.jpg" 
          alt="Classroom" 
          className="w-full h-32 object-cover rounded-xl mb-3 opacity-80"
        />
        <h4 className="text-indigo-900 font-semibold text-sm mb-1 uppercase tracking-wider">Tips</h4>
        <p className="text-indigo-700 text-sm leading-relaxed">
          Pastikan pencahayaan cukup dan QR Code terlihat jelas di dalam kotak scan.
        </p>
      </div>
    </div>
  );
}
