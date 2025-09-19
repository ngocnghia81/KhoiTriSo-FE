'use client';

import React, { useState, useRef, useEffect } from 'react';

interface ResizablePanelProps {
  children: React.ReactNode;
  initialWidth: number;
  minWidth: number;
  maxWidth: number;
  onWidthChange: (width: number) => void;
  className?: string;
}

export default function ResizablePanel({
  children,
  initialWidth,
  minWidth,
  maxWidth,
  onWidthChange,
  className = ''
}: ResizablePanelProps) {
  const [width, setWidth] = useState(initialWidth);
  const [isResizing, setIsResizing] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const startX = useRef(0);
  const startWidth = useRef(0);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsResizing(true);
    startX.current = e.clientX;
    startWidth.current = width;
    
    // Prevent text selection during resize
    document.body.style.userSelect = 'none';
    document.body.style.cursor = 'col-resize';
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isResizing) return;

    const deltaX = e.clientX - startX.current;
    const newWidth = Math.min(maxWidth, Math.max(minWidth, startWidth.current + deltaX));
    
    setWidth(newWidth);
    onWidthChange(newWidth);
  };

  const handleMouseUp = () => {
    setIsResizing(false);
    document.body.style.userSelect = '';
    document.body.style.cursor = '';
  };

  useEffect(() => {
    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isResizing, handleMouseMove, handleMouseUp]);

  return (
    <div 
      ref={panelRef}
      className={`relative ${className}`}
      style={{ width: `${width}px` }}
    >
      {children}
      
      {/* Resize handle */}
      <div
        className={`
          absolute top-0 right-0 w-2 h-full cursor-col-resize bg-transparent hover:bg-blue-500/20 transition-colors duration-200 group z-10
          ${isResizing ? 'bg-blue-500/30' : ''}
        `}
        onMouseDown={handleMouseDown}
      >
        {/* Visual indicator */}
        <div className={`
          absolute top-1/2 right-0 transform translate-x-1/2 -translate-y-1/2 w-4 h-12 bg-white border border-gray-300 rounded-lg shadow-md
          opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center
          ${isResizing ? 'opacity-100' : ''}
        `}>
          <div className="flex flex-col space-y-1">
            <div className="w-0.5 h-3 bg-gray-400 rounded-full"></div>
            <div className="w-0.5 h-3 bg-gray-400 rounded-full"></div>
            <div className="w-0.5 h-3 bg-gray-400 rounded-full"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
