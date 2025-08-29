// Custom AI Brain Icon for MCP Integration
import React from 'react';

interface AIBrainIconProps {
  className?: string;
  size?: number;
}

export function AIBrainIcon({ className = "w-6 h-6", size = 24 }: AIBrainIconProps) {
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
      {/* Brain outline */}
      <path d="M12 5a3 3 0 1 0-5.997.125a3 3 0 0 0 2.997 2.875a3 3 0 0 0 3-3Z" />
      <path d="M12 5a3 3 0 1 1 5.997.125A3 3 0 0 1 15 8a3 3 0 0 1-3-3Z" />
      <path d="M12 11v3" />
      {/* Neural connections */}
      <path d="m8 16l2-2l2 2" />
      <path d="m16 16l-2-2l-2 2" />
      {/* AI elements */}
      <circle cx="12" cy="14" r="1" fill="currentColor" />
      <circle cx="8" cy="10" r="0.5" fill="currentColor" />
      <circle cx="16" cy="10" r="0.5" fill="currentColor" />
    </svg>
  );
}