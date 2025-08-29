// Custom Database Icon for Columnar Storage
import React from 'react';

interface DatabaseIconProps {
  className?: string;
  size?: number;
}

export function DatabaseIcon({ className = "w-6 h-6", size = 24 }: DatabaseIconProps) {
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
      {/* Columnar database representation */}
      <rect x="3" y="3" width="18" height="18" rx="2" fill="none" />
      {/* Columns */}
      <line x1="7" y1="7" x2="7" y2="17" />
      <line x1="11" y1="7" x2="11" y2="17" />
      <line x1="15" y1="7" x2="15" y2="17" />
      <line x1="19" y1="7" x2="19" y2="17" />
      {/* Data points */}
      <circle cx="7" cy="10" r="1" fill="currentColor" />
      <circle cx="11" cy="12" r="1" fill="currentColor" />
      <circle cx="15" cy="9" r="1" fill="currentColor" />
      <circle cx="19" cy="14" r="1" fill="currentColor" />
    </svg>
  );
}