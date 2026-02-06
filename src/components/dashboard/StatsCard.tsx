import React from "react";
import { motion } from "framer-motion";

interface StatsCardProps {
  label: string;
  value: string;
  subValue?: string;
  color: string;
  delay?: number;
}

const StatsCard: React.FC<StatsCardProps> = ({
  label,
  value,
  subValue,
  color,
  delay = 0,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="group relative overflow-hidden rounded-2xl border border-slate-700/50 bg-[#151E32] p-6 shadow-lg transition-all duration-300 hover:border-blue-500/30"
    >
      <div className="absolute top-0 right-0 p-2 opacity-50">
        {subValue && (
          <span className="rounded border border-slate-700 bg-slate-800 px-2 py-1 text-[10px] font-bold tracking-wider text-slate-400 uppercase">
            {subValue}
          </span>
        )}
      </div>
      <p className="mb-3 text-xs font-bold tracking-widest text-slate-400 uppercase">
        {label}
      </p>
      <h3
        className={`font-display text-3xl font-bold ${color} drop-shadow-[0_0_8px_rgba(0,0,0,0.5)]`}
      >
        {value}
      </h3>

      {/* Decorative Glow */}
      <div className="absolute -right-10 -bottom-10 h-24 w-24 rounded-full bg-blue-500/10 blur-3xl transition-all duration-500 group-hover:bg-blue-500/20" />

      {/* Accent Line */}
      <div
        className={`absolute top-0 left-0 h-full w-1 opacity-0 transition-opacity duration-300 group-hover:opacity-100 ${color.replace("text-", "bg-")}`}
      />
    </motion.div>
  );
};

export default StatsCard;
