import { memo, useState } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { MoreVertical, Play } from 'lucide-react';

export const StartNode = memo(({ }: NodeProps) => {
  const [menuOpen, setMenuOpen] = useState(false);

  const handleMenuAction = (action: string) => {
    console.log(`${action} for Start node`);
    setMenuOpen(false);
  };

  return (
    <div className="relative bg-white rounded-lg shadow-md border-2 border-gray-200 min-w-[220px]">
      {/* Header with three-dot menu */}
      <div className="absolute top-3 right-3 z-10">
        <button
          onClick={(e) => {
            e.stopPropagation();
            setMenuOpen(!menuOpen);
          }}
          className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded"
          title="More options"
        >
          <MoreVertical size={16} />
        </button>

        {/* Dropdown menu */}
        {menuOpen && (
          <>
            <div 
              className="fixed inset-0 z-20"
              onClick={() => setMenuOpen(false)}
            />
            
            <div className="absolute right-0 top-8 z-30 bg-white border border-gray-200 rounded-lg shadow-lg py-1 min-w-[180px]">
              <button
                onClick={() => handleMenuAction('rename')}
                className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
              >
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M11.334 2.00004C11.5091 1.82494 11.7169 1.68605 11.9457 1.59129C12.1745 1.49653 12.4197 1.44775 12.6673 1.44775C12.9149 1.44775 13.1601 1.49653 13.3889 1.59129C13.6177 1.68605 13.8256 1.82494 14.0007 2.00004C14.1758 2.17513 14.3146 2.383 14.4094 2.61178C14.5042 2.84055 14.5529 3.08575 14.5529 3.33337C14.5529 3.58099 14.5042 3.82619 14.4094 4.05497C14.3146 4.28374 14.1758 4.49161 14.0007 4.66671L5.00065 13.6667L1.33398 14.6667L2.33398 11L11.334 2.00004Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Rename
              </button>
              <button
                onClick={() => handleMenuAction('test')}
                className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
              >
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M6 2L2 6L6 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M10 6L14 10L10 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Test in Sandbox
              </button>
              <button
                onClick={() => handleMenuAction('delete')}
                className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
              >
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M2 4H3.33333H14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M5.33398 4.00004V2.66671C5.33398 2.31309 5.47446 1.97395 5.72451 1.7239C5.97456 1.47385 6.3137 1.33337 6.66732 1.33337H9.33398C9.68761 1.33337 10.0267 1.47385 10.2768 1.7239C10.5268 1.97395 10.6673 2.31309 10.6673 2.66671V4.00004M12.6673 4.00004V13.3334C12.6673 13.687 12.5268 14.0261 12.2768 14.2762C12.0267 14.5262 11.6876 14.6667 11.334 14.6667H4.66732C4.3137 14.6667 3.97456 14.5262 3.72451 14.2762C3.47446 14.0261 3.33398 13.687 3.33398 13.3334V4.00004H12.6673Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Delete
              </button>
            </div>
          </>
        )}
      </div>

      {/* Content */}
      <div className="px-6 py-8 text-center">
        <div className="mb-3 flex justify-center">
          <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
            <Play size={24} className="text-green-600 ml-1" />
          </div>
        </div>
        <div className="text-lg font-semibold text-gray-900 mb-1">Start</div>
        <div className="text-sm text-gray-500">Add your trigger</div>
      </div>

      {/* Output handle */}
      <Handle
        type="source"
        position={Position.Right}
        id="output"
        className="!w-3 !h-3 !bg-green-500 !border-2 !border-white"
      />
    </div>
  );
});

StartNode.displayName = 'StartNode';
