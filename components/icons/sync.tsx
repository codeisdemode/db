// Custom Sync Icon for Cross-Device Synchronization
import React from 'react';

interface SyncIconProps {
  className?: string;
  size?: number;
}

export function SyncIcon({ className = "w-6 h-6", size = 24 }: SyncIconProps) {
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
      {/* Circular arrows representing sync */}
      <path d="M21 12a9 9 0 0 1-9 9m9-9a9 9 0 0 0-9-9m9 9H15m-6 0H3" />
      <path d="M3 12a9 9 0 0 1 9-9m-9 9a9 9 0 0 0 9 9m-9-9h6m6 0h6" />
      {/* Connection dots */}
      <circle cx="12" cy="3" r="1" fill="currentColor" />
      <circle cx="12" cy="21" r="1" fill="currentColor" />
      <circle cx="3" cy="12" r="1" fill="currentColor" />
      <circle cx="21" cy="12" r="1" fill="currentColor" />
    </svg>
  );
}