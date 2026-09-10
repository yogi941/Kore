import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, CheckCircle, ChefHat, PackageCheck, AlertCircle, QrCode, Sparkles } from 'lucide-react';

const STAGES = [
  { id: 'pending', label: 'Placed', icon: Clock },
  { id: 'accepted', label: 'Accepted', icon: CheckCircle },
  { id: 'preparing', label: 'Preparing', icon: ChefHat },
  { id: 'ready', label: 'Ready for Pickup', icon: PackageCheck },
];

export default function LiveOrderTracker({ order, onShowQR }) {
  if (!order) return null;

  const currentStatus = order.status || 'pending';
  const isCompleted = currentStatus === 'completed' || currentStatus === 'collected';
  const isCancelled = currentStatus === 'cancelled';

  // Calculate stage index
  const getStageIndex = (status) => {
    switch (status) {
      case 'pending': return 0;
      case 'accepted': return 1;
      case 'preparing': return 2;
      case 'ready':
      case 'completed':
      case 'collected': return 3;
      default: return 0;
    }
  };

  const currentIndex = getStageIndex(currentStatus);

  // Live Countdown logic
  const estimatedMins = order.estimatedWaitMinutes || 12;
  const [secondsRemaining, setSecondsRemaining] = useState(estimatedMins * 60);

  useEffect(() => {
    if (isCompleted || isCancelled || currentStatus === 'ready') return;

    const timer = setInterval(() => {
      setSecondsRemaining((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(timer);
  }, [isCompleted, isCancelled, currentStatus]);

  const mins = Math.floor(secondsRemaining / 60);
  const secs = secondsRemaining % 60;
  const formattedTime = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-slate-900/90 border border-slate-700/80 rounded-2xl p-5 shadow-2xl backdrop-blur-xl mb-6 relative overflow-hidden"
    >
      {/* Dynamic Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30">
              Order #{order.orderNumber || order._id?.substring(18)}
            </span>
            <span className="flex items-center gap-1 text-[11px] text-emerald-400 font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
              Live Sync
            </span>
          </div>
          <h3 className="text-base font-bold text-slate-100 mt-1">
            {order.canteen?.name || 'Kore Canteen'}
          </h3>
        </div>

        {!isCompleted && !isCancelled && (
          <div className="text-right">
            <span className="text-[11px] text-slate-400 block">Est. Remaining</span>
            <div className="text-xl font-black font-mono text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-400">
              {currentStatus === 'ready' ? 'READY NOW!' : formattedTime}
            </div>
          </div>
        )}
      </div>

      {/* Interactive Stage Progress Bar */}
      {!isCancelled ? (
        <div className="relative mb-6 px-2">
          {/* Progress Line */}
          <div className="absolute top-1/2 left-8 right-8 h-1 bg-slate-800 -translate-y-1/2 z-0">
            <motion.div
              initial={{ width: '0%' }}
              animate={{ width: `${(currentIndex / (STAGES.length - 1)) * 100}%` }}
              transition={{ duration: 0.6 }}
              className="h-full bg-gradient-to-r from-amber-500 via-orange-500 to-emerald-400"
            ></motion.div>
          </div>

          {/* Stage Icons */}
          <div className="flex justify-between items-center relative z-10">
            {STAGES.map((stage, idx) => {
              const Icon = stage.icon;
              const isActive = idx <= currentIndex;
              const isCurrent = idx === currentIndex;

              return (
                <div key={stage.id} className="flex flex-col items-center">
                  <motion.div
                    whileHover={{ scale: 1.1 }}
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300 ${
                      isActive
                        ? isCurrent
                          ? 'bg-gradient-to-tr from-amber-500 to-orange-500 text-slate-950 shadow-lg shadow-amber-500/40 ring-4 ring-amber-500/20'
                          : 'bg-emerald-500 text-slate-950'
                        : 'bg-slate-800 text-slate-500 border border-slate-700'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                  </motion.div>
                  <span className={`text-[11px] font-semibold mt-2 ${isActive ? 'text-slate-200' : 'text-slate-500'}`}>
                    {stage.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="bg-rose-500/10 border border-rose-500/30 rounded-xl p-4 text-center text-rose-400 text-sm font-medium mb-4">
          This order was cancelled.
        </div>
      )}

      {/* Footer Action */}
      <div className="flex items-center justify-between bg-slate-950/60 border border-slate-800/80 rounded-xl p-3.5">
        <div className="text-xs text-slate-400">
          <span className="font-medium text-slate-300">Items: </span>
          {order.items?.map((i) => `${i.quantity}x ${i.name || i.menuItem?.name}`).join(', ')}
        </div>

        {order.qrCode && onShowQR && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onShowQR(order)}
            className="px-3.5 py-1.5 bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-bold text-xs rounded-xl shadow-lg shadow-amber-500/20 flex items-center gap-1.5"
          >
            <QrCode className="w-4 h-4" />
            Show QR Token
          </motion.button>
        )}
      </div>
    </motion.div>
  );
}
