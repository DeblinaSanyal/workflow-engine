import React from 'react';
import { EdgeProps, getBezierPath, EdgeLabelRenderer } from 'reactflow';
import { Plus } from 'lucide-react';

interface RegularPlusButtonEdgeProps extends EdgeProps {
  data?: {
    onPlusClick?: (edgeId: string, position: { x: number; y: number }) => void;
  };
}

export const RegularPlusButtonEdge: React.FC<RegularPlusButtonEdgeProps> = ({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  markerEnd,
  data,
}) => {
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  const handlePlusClick = (event: React.MouseEvent) => {
    event.stopPropagation();
    if (data?.onPlusClick) {
      // Position the menu at the midpoint of the edge
      data.onPlusClick(id, { x: labelX, y: labelY });
    }
  };

  return (
    <>
      <path
        id={id}
        style={style}
        className="react-flow__edge-path"
        d={edgePath}
        markerEnd={markerEnd}
      />

      <EdgeLabelRenderer>
        <div
          style={{
            position: 'absolute',
            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
            pointerEvents: 'all',
          }}
          className="nodrag nopan"
        >
          <button
            onClick={handlePlusClick}
            className="group relative flex items-center justify-center w-8 h-8 bg-gradient-to-br from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-full border-2 border-white shadow-md transition-all hover:scale-125 active:scale-110"
            title="Insert node here"
          >
            <Plus size={18} strokeWidth={3} />
            <span className="absolute inset-0 rounded-full bg-green-400 opacity-0 group-hover:opacity-30 group-hover:scale-150 transition-all duration-500"></span>
          </button>
        </div>
      </EdgeLabelRenderer>
    </>
  );
};
