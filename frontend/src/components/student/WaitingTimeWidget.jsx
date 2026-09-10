import React from 'react';
import { motion } from 'framer-motion';
import { Clock, Flame, Users, Sparkles, CheckCircle2, Cpu } from 'lucide-react';

export default function WaitingTimeWidget({ prediction, loading }) {
  if (loading) {
    return (
      <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm animate-pulse">
        <div className="h-5 w-40 bg-gray-200 rounded mb-3"></div>
        <div className="h-10 w-32 bg-gray-200 rounded mb-4"></div>
        <div className="h-3 w-full bg-gray-200 rounded"></div>
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

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="bg-white border border-orange-100 rounded-3xl p-5 shadow-xl shadow-orange-500/5 relative overflow-hidden group hover:border-orange-300 transition-all"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-gradient-to-tr from-orange-500 to-amber-500 rounded-xl text-white font-bold shadow-md shadow-orange-500/20">
            <Cpu className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h4 className="text-sm font-black text-slate-900 flex items-center gap-1.5">
              ML Smart Wait Prediction
              <Sparkles className="w-3.5 h-3.5 text-orange-500" />
            </h4>
            <p className="text-xs text-slate-500 font-medium">Random Forest Ensemble Model</p>
          </div>
        </div>

        <span className="text-xs px-3 py-1 rounded-full font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
          {queueStatus} Queue
        </span>
      </div>

      {/* Main Wait Time Display */}
      <div className="grid grid-cols-2 gap-4 mb-4 bg-orange-50/60 border border-orange-100 rounded-2xl p-4">
        <div>
          <span className="text-xs text-slate-500 font-bold block mb-1">Est. Pickup Wait</span>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-black text-orange-600">
              {formattedRange}
            </span>
          </div>
          <span className="text-[10px] text-slate-400 font-medium block mt-0.5">Based on active kitchen orders</span>
        </div>

        <div className="border-l border-orange-200/80 pl-4 flex flex-col justify-center">
          <span className="text-xs text-slate-500 font-bold block mb-1">Kitchen Prep Time</span>
          <div className="flex items-center gap-2 text-slate-800">
            <Clock className="w-4 h-4 text-orange-500" />
            <span className="text-lg font-black">~{predictedPrepTime} mins</span>
          </div>
          <span className="text-[10px] text-slate-400 font-medium">Pure cooking duration</span>
        </div>
      </div>

      {/* Breakdown Details */}
      <div className="grid grid-cols-3 gap-2 mb-4 text-center">
        <div className="bg-gray-50 border border-gray-100 rounded-xl p-2.5">
          <div className="flex items-center justify-center gap-1 text-slate-500 text-[11px] font-bold mb-0.5">
            <Users className="w-3 h-3 text-sky-500" />
            <span>Ahead</span>
          </div>
          <span className="text-sm font-black text-slate-800">{featureBreakdown.queueLength || 0} orders</span>
        </div>

        <div className="bg-gray-50 border border-gray-100 rounded-xl p-2.5">
          <div className="flex items-center justify-center gap-1 text-slate-500 text-[11px] font-bold mb-0.5">
            <Flame className="w-3 h-3 text-orange-500" />
            <span>Rush Hour</span>
          </div>
          <span className={`text-sm font-black ${featureBreakdown.isPeakHour ? 'text-orange-600' : 'text-emerald-600'}`}>
            {featureBreakdown.isPeakHour ? 'Peak Rush' : 'Normal'}
          </span>
        </div>

        <div className="bg-gray-50 border border-gray-100 rounded-xl p-2.5">
          <div className="flex items-center justify-center gap-1 text-slate-500 text-[11px] font-bold mb-0.5">
            <CheckCircle2 className="w-3 h-3 text-emerald-500" />
            <span>Accuracy</span>
          </div>
          <span className="text-sm font-black text-slate-800">{Math.round(confidenceScore * 100)}%</span>
        </div>
      </div>

      {/* Confidence Bar */}
      <div>
        <div className="flex justify-between text-[11px] text-slate-500 font-bold mb-1">
          <span>AI Model Accuracy</span>
          <span className="text-orange-600">{Math.round(confidenceScore * 100)}% Match</span>
        </div>
        <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${confidenceScore * 100}%` }}
            transition={{ duration: 0.8 }}
            className="h-full bg-gradient-to-r from-orange-500 to-amber-500 rounded-full"
          ></motion.div>
        </div>
      </div>
    </motion.div>
  );
}
