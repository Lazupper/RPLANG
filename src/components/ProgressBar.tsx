import React from 'react';

interface ProgressBarProps {
  progress: number; // 0 to 100
  color?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({ progress, color = 'bg-emerald-500' }) => {
  return (
    <div className="w-full h-4 bg-gray-100 rounded-full overflow-hidden border border-gray-200">
      <div 
        className={`h-full ${color} transition-all duration-500 ease-out rounded-full`}
        style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
      />
    </div>
  );
};
