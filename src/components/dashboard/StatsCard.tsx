import React from "react";
import { motion } from "framer-motion";
import { Eye, EyeOff } from "lucide-react";

interface StatsCardProps {
  label: string;
  value: string;
  subValue?: string;
  color?: string;
  delay?: number;
  sensitive?: boolean;
  visible?: boolean;
  onToggleVisibility?: () => void;
}

const StatsCard: React.FC<StatsCardProps> = ({
  label,
  value,
  subValue,
  color = "text-white",
  delay = 0,
  sensitive = false,
  visible = true,
  onToggleVisibility,
}) => {
  const hiddenValue = "••••••";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="group relative overflow-hidden rounded-xl border-4 border-[#000080] bg-[#0000FF] p-4 shadow-[6px_6px_0px_0px_rgba(0,0,128,1)] transition-all duration-200 hover:-translate-y-1 hover:shadow-[8px_8px_0px_0px_rgba(0,0,128,1)] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none sm:p-5"
    >
      {/* Top row: label + eye toggle */}
      <div className="mb-3 flex items-start justify-between">
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/70">
          {label}
        </p>
        {sensitive && onToggleVisibility && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleVisibility();
            }}
            className="rounded border border-white/20 bg-white/10 p-1 text-white/80 transition-all hover:bg-white/20 hover:text-white"
            title={visible ? "Ocultar monto" : "Mostrar monto"}
          >
            {visible ? <Eye size={14} /> : <EyeOff size={14} />}
          </button>
        )}
      </div>

      {/* Value */}
      <h3
        className={`font-display text-2xl font-black tracking-tight sm:text-3xl ${color} ${!visible && sensitive ? "tracking-widest" : ""}`}
      >
        {visible || !sensitive ? value : hiddenValue}
      </h3>

      {/* Subvalue */}
      {subValue && (
        <div className="mt-2">
          <span className="inline-block rounded border border-white/30 bg-white/10 px-2 py-0.5 text-[9px] font-black uppercase tracking-wider text-white/80">
            {subValue}
          </span>
        </div>
      )}

      {/* Decorative number watermark */}
      <div className="pointer-events-none absolute -right-2 -bottom-4 text-6xl font-black text-white/5 select-none">
        {label.charAt(0)}
      </div>
    </motion.div>
  );
};

export default StatsCard;
