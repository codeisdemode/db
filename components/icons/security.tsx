// Custom Security Icon for Privacy Features
import React from 'react';

interface SecurityIconProps {
  className?: string;
  size?: number;
}

export function SecurityIcon({ className = "w-6 h-6", size = 24 }: SecurityIconProps) {
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
      {/* Shield outline */}
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      {/* Lock inside */}
      <rect x="8" y="11" width="8" height="5" rx="1" />
      <circle cx="12" cy="13" r="1" fill="currentColor" />
      {/* Security waves */}
      <path d="M8 7V5a4 4 0 0 1 8 0v2" strokeWidth="1.5" />
    </svg>
  );
}