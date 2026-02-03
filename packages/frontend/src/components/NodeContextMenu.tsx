import React, { useState, useRef, useEffect } from 'react';
import { MoreVertical, Copy, Trash2, Settings } from 'lucide-react';

interface NodeContextMenuProps {
  onDuplicate: () => void;
  onDelete: () => void;
  onShowDetails: () => void;
}

export const NodeContextMenu: React.FC<NodeContextMenuProps> = ({
  onDuplicate,
  onDelete,
  onShowDetails,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        menuRef.current &&
        buttonRef.current &&
        !menuRef.current.contains(event.target as Node) &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [isOpen]);

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsOpen(!isOpen);
  };

  const handleAction = (action: () => void) => (e: React.MouseEvent) => {
    e.stopPropagation();
    action();
    setIsOpen(false);
  };

  return (
    <div className="relative">
      {/* Three dots button */}
      <button
        ref={buttonRef}
        onClick={handleToggle}
        className="hover:bg-white/20 p-1.5 rounded-lg transition-colors"
        title="More options"
      >
        <MoreVertical size={14} />
      </button>

      {/* Dropdown menu */}
      {isOpen && (
        <div
          ref={menuRef}
          className="absolute right-0 top-full mt-1 w-48 bg-white rounded-lg shadow-xl border border-gray-200 py-1 z-50 animate-slide-in"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Show Details */}
          <button
            onClick={handleAction(onShowDetails)}
            className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 flex items-center gap-2 transition-colors"
          >
            <Settings size={16} />
            <span>Show Details</span>
          </button>

          {/* Duplicate */}
          <button
            onClick={handleAction(onDuplicate)}
            className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-green-50 hover:text-green-700 flex items-center gap-2 transition-colors"
          >
            <Copy size={16} />
            <span>Duplicate</span>
          </button>

          {/* Separator */}
          <div className="border-t border-gray-200 my-1"></div>

          {/* Delete */}
          <button
            onClick={handleAction(onDelete)}
            className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 transition-colors"
          >
            <Trash2 size={16} />
            <span>Delete</span>
          </button>
        </div>
      )}
    </div>
  );
};
