// Custom Performance Icon for Speed and Efficiency
import React from 'react';

interface PerformanceIconProps {
  className?: string;
  size?: number;
}

export function PerformanceIcon({ className = "w-6 h-6", size = 24 }: PerformanceIconProps) {
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
      {/* Lightning bolt for speed */}
      <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
      {/* Performance indicators */}
      <path d="M8 6h2" strokeWidth="1.5" />
      <path d="M14 18h2" strokeWidth="1.5" />
      <circle cx="4" cy="10" r="0.5" fill="currentColor" />
      <circle cx="20" cy="14" r="0.5" fill="currentColor" />
    </svg>
  );
}