// Custom Search Icon with AI elements
import React from 'react';

interface SearchIconProps {
  className?: string;
  size?: number;
}

export function SearchIcon({ className = "w-6 h-6", size = 24 }: SearchIconProps) {
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
      {/* Magnifying glass */}
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21l-4.3-4.3" />
      {/* AI sparkles */}
      <path d="M16 5h2" strokeWidth="1.5" />
      <path d="M19 2v2" strokeWidth="1.5" />
      <path d="M5 16h2" strokeWidth="1.5" />
      <path d="M2 19v2" strokeWidth="1.5" />
    </svg>
  );
}