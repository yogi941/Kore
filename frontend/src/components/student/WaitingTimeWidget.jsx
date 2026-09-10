import React from 'react';
import { motion } from 'framer-motion';
import { Clock, Flame, Users, Sparkles, AlertCircle, CheckCircle2, Cpu } from 'lucide-react';

export default function WaitingTimeWidget({ prediction, loading }) {
  if (loading) {
    return (
      <div className="bg-slate-800/80 border border-slate-700/60 rounded-2xl p-5 shadow-xl backdrop-blur-md animate-pulse">
        <div className="h-5 w-40 bg-slate-700 rounded mb-3"></div>
        <div className="h-10 w-32 bg-slate-700 rounded mb-4"></div>
        <div className="h-3 w-full bg-slate-700 rounded"></div>
      </div>
    );
  }

  if (!prediction) return null;

  const {
    predictedPrepTime = 10,
    predictedWaitTime = 12,
    formattedRange = '10 - 15 mins',
    queueStatus = 'Light',
    queueColor = 'emerald',
    confidenceScore = 0.94,
    featureBreakdown = {},
  } = prediction;

  const statusColors = {
    emerald: {
      bg: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400',
      badge: 'bg-emerald-500 text-slate-950',
      glow: 'shadow-emerald-500/20',
    },
    amber: {
      bg: 'bg-amber-500/10 border-amber-500/30 text-amber-400',
      badge: 'bg-amber-500 text-slate-950',
      glow: 'shadow-amber-500/20',
    },
    rose: {
      bg: 'bg-rose-500/10 border-rose-500/30 text-rose-400',
      badge: 'bg-rose-500 text-slate-950',
      glow: 'shadow-rose-500/20',
    },
  };

  const currentTheme = statusColors[queueColor] || statusColors.emerald;

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="bg-gradient-to-br from-slate-900 via-slate-800/90 to-slate-900 border border-slate-700/70 rounded-2xl p-5 shadow-2xl backdrop-blur-xl relative overflow-hidden group hover:border-amber-500/40 transition-all duration-300"
    >
      {/* Background Ambient Glow */}
      <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-amber-500/10 rounded-full blur-3xl group-hover:bg-amber-500/20 transition-all"></div>

      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-gradient-to-tr from-amber-500 to-orange-500 rounded-xl text-slate-950 font-bold shadow-lg shadow-amber-500/20">
            <Cpu className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-slate-200 flex items-center gap-1.5">
              ML Smart Wait Prediction
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            </h4>
            <p className="text-xs text-slate-400">Random Forest Ensemble Algorithm</p>
          </div>
        </div>

        <span className={`text-xs px-2.5 py-1 rounded-full font-semibold border ${currentTheme.bg}`}>
          {queueStatus} Queue
        </span>
      </div>

      {/* Main Wait Time Display */}
      <div className="grid grid-cols-2 gap-4 mb-4 bg-slate-950/60 border border-slate-800/80 rounded-xl p-4">
        <div>
          <span className="text-xs text-slate-400 font-medium block mb-1">Est. Pickup Wait</span>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-orange-400 to-amber-300">
              {formattedRange}
            </span>
          </div>
          <span className="text-[10px] text-slate-500 block mt-0.5">Based on active kitchen orders</span>
        </div>

        <div className="border-l border-slate-800/80 pl-4 flex flex-col justify-center">
          <span className="text-xs text-slate-400 font-medium block mb-1">Kitchen Prep Time</span>
          <div className="flex items-center gap-2 text-slate-200">
            <Clock className="w-4 h-4 text-amber-400" />
            <span className="text-lg font-bold">~{predictedPrepTime} mins</span>
          </div>
          <span className="text-[10px] text-slate-500">Pure cooking duration</span>
        </div>
      </div>

      {/* Breakdown Details */}
      <div className="grid grid-cols-3 gap-2 mb-4 text-center">
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-2">
          <div className="flex items-center justify-center gap-1 text-slate-400 text-[11px] mb-0.5">
            <Users className="w-3 h-3 text-sky-400" />
            <span>Orders Ahead</span>
          </div>
          <span className="text-sm font-bold text-slate-200">{featureBreakdown.queueLength || 0} orders</span>
        </div>

        <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-2">
          <div className="flex items-center justify-center gap-1 text-slate-400 text-[11px] mb-0.5">
            <Flame className="w-3 h-3 text-orange-400" />
            <span>Rush Hour</span>
          </div>
          <span className={`text-sm font-bold ${featureBreakdown.isPeakHour ? 'text-amber-400' : 'text-emerald-400'}`}>
            {featureBreakdown.isPeakHour ? 'Peak Rush' : 'Normal'}
          </span>
        </div>

        <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-2">
          <div className="flex items-center justify-center gap-1 text-slate-400 text-[11px] mb-0.5">
            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
            <span>Accuracy</span>
          </div>
          <span className="text-sm font-bold text-slate-200">{Math.round(confidenceScore * 100)}%</span>
        </div>
      </div>

      {/* Confidence Bar */}
      <div>
        <div className="flex justify-between text-[11px] text-slate-400 mb-1">
          <span>AI Model Confidence Score</span>
          <span className="font-semibold text-amber-400">{Math.round(confidenceScore * 100)}% Match</span>
        </div>
        <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${confidenceScore * 100}%` }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="h-full bg-gradient-to-r from-amber-500 to-emerald-400 rounded-full"
          ></motion.div>
        </div>
      </div>
    </motion.div>
  );
}
