import { useState } from 'react';
import axiosInstance from '../../api/axiosInstance';
import toast from 'react-hot-toast';
import { QrCode, X, CheckCircle, AlertTriangle } from 'lucide-react';

export default function QRScannerModal({ isOpen, onClose, onVerified }) {
  const [tokenInput, setTokenInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  if (!isOpen) return null;

  const handleVerify = async (e) => {
    e.preventDefault();
    if (!tokenInput.trim()) return;

    setLoading(true);
    setResult(null);

    try {
      const res = await axiosInstance.post(
        '/orders/qr-verify',
        { pickupToken: tokenInput.trim() }
      );

      if (res.data.success) {
        setResult({ success: true, message: res.data.message, data: res.data.data });
        toast.success('QR Code Verified Successfully!');
        if (onVerified) onVerified();
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'QR Verification Failed';
      setResult({ success: false, message: msg });
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-xl overflow-hidden animate-in fade-in zoom-in duration-150">
        <div className="bg-gray-900 text-white p-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <QrCode className="w-5 h-5 text-orange-400" />
            <h3 className="font-bold">QR Pickup Verification</h3>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-gray-800 rounded-lg">
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        <div className="p-6">
          <form onSubmit={handleVerify} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
                Scan / Enter Order Token or QR Code
              </label>
              <input
                type="text"
                placeholder="Paste QR payload or Token..."
                value={tokenInput}
                onChange={(e) => setTokenInput(e.target.value)}
                className="w-full border border-gray-300 rounded-xl p-3 text-sm focus:ring-2 focus:ring-orange-500 outline-none font-mono"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-bold transition-colors"
            >
              {loading ? 'Verifying...' : 'Validate Pickup'}
            </button>
          </form>

          {/* Result Alert Box */}
          {result && (
            <div
              className={`mt-4 p-4 rounded-xl border ${
                result.success
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                  : 'bg-red-50 border-red-200 text-red-900'
              }`}
            >
              <div className="flex items-start gap-2">
                {result.success ? (
                  <CheckCircle className="w-5 h-5 text-emerald-600 mt-0.5" />
                ) : (
                  <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5" />
                )}
                <div>
                  <h4 className="font-bold text-sm">{result.success ? 'Verified' : 'Verification Failed'}</h4>
                  <p className="text-xs mt-1">{result.message}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
