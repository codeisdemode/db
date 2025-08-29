// Custom Memory Icon for Low Memory Usage
import React from 'react';

interface MemoryIconProps {
  className?: string;
  size?: number;
}

export function MemoryIcon({ className = "w-6 h-6", size = 24 }: MemoryIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      {/* Memory chip outline */}
      <rect x="4" y="6" width="16" height="12" rx="2" />
      {/* Memory slots */}
      <line x1="6" y1="8" x2="18" y2="8" />
      <line x1="6" y1="11" x2="18" y2="11" />
      <line x1="6" y1="14" x2="18" y2="14" />
      {/* Efficiency indicators */}
      <circle cx="8" cy="9.5" r="0.5" fill="currentColor" />
      <circle cx="12" cy="12.5" r="0.5" fill="currentColor" />
      <circle cx="16" cy="9.5" r="0.5" fill="currentColor" />
      {/* Connection pins */}
      <line x1="4" y1="10" x2="2" y2="10" strokeWidth="1.5" />
      <line x1="4" y1="14" x2="2" y2="14" strokeWidth="1.5" />
      <line x1="20" y1="10" x2="22" y2="10" strokeWidth="1.5" />
      <line x1="20" y1="14" x2="22" y2="14" strokeWidth="1.5" />
    </svg>
  );
}