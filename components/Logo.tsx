import React from 'react';

export const Logo: React.FC<{ className?: string }> = ({ className = "w-8 h-8" }) => {
  return (
    <svg 
      viewBox="0 0 40 40" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg" 
      className={className}
    >
      <defs>
        <linearGradient id="logoGradient" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
          <stop stopColor="#6366f1" /> {/* Indigo-500 */}
          <stop offset="1" stopColor="#a855f7" /> {/* Purple-500 */}
        </linearGradient>
      </defs>
      
      {/* Background Shape - Soft Rounded Square representing a screen/app */}
      <rect x="2" y="2" width="36" height="36" rx="10" stroke="url(#logoGradient)" strokeWidth="3" fill="transparent" />
      
      {/* Central Element - Play Button merging with AI Circuit */}
      <path 
        d="M14 12V28L28 20L14 12Z" 
        fill="url(#logoGradient)" 
      />
      
      {/* AI Spark/Node element indicating transformation */}
      <circle cx="28" cy="12" r="3" fill="#fff" className="animate-pulse" />
      <path d="M28 15V20" stroke="url(#logoGradient)" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
};