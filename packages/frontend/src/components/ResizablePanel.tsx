import React, { useState, useEffect, useRef, useCallback } from 'react';

interface ResizablePanelProps {
  side: 'left' | 'right';
  minWidth?: number;
  maxWidth?: number;
  defaultWidth?: number;
  storageKey: string;
  children: React.ReactNode;
  className?: string;
}

const ResizablePanel: React.FC<ResizablePanelProps> = ({
  side,
  minWidth = 240,
  maxWidth = 600,
  defaultWidth = 320,
  storageKey,
  children,
  className = '',
}) => {
  const [width, setWidth] = useState<number>(() => {
    // Load from localStorage on mount
    try {
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        const parsed = parseInt(stored, 10);
        // Validate stored value
        if (!isNaN(parsed) && parsed >= minWidth && parsed <= maxWidth) {
          return parsed;
        }
      }
    } catch (error) {
      console.error('Error loading panel width from localStorage:', error);
    }
    return defaultWidth;
  });

  const [isDragging, setIsDragging] = useState(false);
  const startXRef = useRef<number>(0);
  const startWidthRef = useRef<number>(0);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    startXRef.current = e.clientX;
    startWidthRef.current = width;
  }, [width]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging) return;

    const delta = side === 'left' ? e.clientX - startXRef.current : startXRef.current - e.clientX;
    const newWidth = startWidthRef.current + delta;

    // Clamp width between min and max
    const clampedWidth = Math.max(minWidth, Math.min(maxWidth, newWidth));
    setWidth(clampedWidth);
  }, [isDragging, side, minWidth, maxWidth]);

  const handleMouseUp = useCallback(() => {
    if (isDragging) {
      setIsDragging(false);

      // Save to localStorage
      try {
        localStorage.setItem(storageKey, width.toString());
      } catch (error) {
        console.error('Error saving panel width to localStorage:', error);
      }
    }
  }, [isDragging, storageKey, width]);

  // Add/remove event listeners for mouse move and up
  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);

      // Prevent text selection while dragging
      document.body.style.userSelect = 'none';
      document.body.style.cursor = 'col-resize';

      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
        document.body.style.userSelect = '';
        document.body.style.cursor = '';
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

  // Adjust max width based on window size
  const responsiveMaxWidth = Math.min(maxWidth, window.innerWidth * 0.4);
  const effectiveWidth = Math.min(width, responsiveMaxWidth);

  return (
    <div
      className={`relative ${className}`}
      style={{ width: `${effectiveWidth}px`, flexShrink: 0 }}
    >
      {children}

      {/* Resize Handle */}
      <div
        className={`
          absolute top-0 h-full
          ${side === 'left' ? 'right-0 -mr-1' : 'left-0 -ml-1'}
          ${isDragging ? 'w-2' : 'w-1'}
          ${isDragging ? 'bg-blue-600' : 'bg-gray-300 hover:bg-blue-500'}
          transition-all duration-150
          cursor-col-resize
          group
          z-10
        `}
        onMouseDown={handleMouseDown}
        title="Drag to resize"
      >
        {/* Hover indicator */}
        <div
          className={`
            absolute top-0 h-full w-full
            ${side === 'left' ? 'right-0' : 'left-0'}
            ${isDragging ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}
            transition-opacity duration-150
          `}
        />
      </div>
    </div>
  );
};

export default ResizablePanel;
