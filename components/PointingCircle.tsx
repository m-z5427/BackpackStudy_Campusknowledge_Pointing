
import * as React from 'react';
import { getAngleFromPoint } from '../utils/math.ts';

interface PointingCircleProps {
  startingLabel: string;   // where you are standing
  facingLabel: string;     // what you're facing (shown at top of circle)
  targetLabel: string;     // what you should point to
  onAngleChange: (angle: number) => void;
  onInteract?: () => void;
  currentAngle: number;
}

const PointingCircle: React.FC<PointingCircleProps> = ({ 
  startingLabel, 
  facingLabel, 
  targetLabel,
  onAngleChange,
  onInteract,
  currentAngle 
}) => {
  const svgRef = React.useRef<SVGSVGElement>(null);
  const [isDragging, setIsDragging] = React.useState(false);

  const handlePointerDown = (e: React.PointerEvent) => {
    setIsDragging(true);
    if (onInteract) onInteract();
    handleUpdateAngle(e);
  };

  const handlePointerMove = React.useCallback((e: PointerEvent) => {
    if (!isDragging) return;
    // Prevent touch scrolling while interacting
    e.preventDefault();
    handleUpdateAngle(e);
  }, [isDragging]);

  const handlePointerUp = React.useCallback(() => {
    setIsDragging(false);
  }, []);

  React.useEffect(() => {
    window.addEventListener('pointermove', handlePointerMove, { passive: false });
    window.addEventListener('pointerup', handlePointerUp);
    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };
  }, [handlePointerMove, handlePointerUp]);

  const handleUpdateAngle = (e: React.PointerEvent | PointerEvent) => {
    if (!svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const angle = getAngleFromPoint(e.clientX, e.clientY, cx, cy);
    onAngleChange(angle);
  };

  const radius = 140;
  const strokeWidth = 3;
  const centerX = 200;
  const centerY = 200;

  const armRad = (currentAngle - 90) * (Math.PI / 180);
  const armX = centerX + radius * Math.cos(armRad);
  const armY = centerY + radius * Math.sin(armRad);

  return (
    <div className="flex flex-col items-center select-none w-full touch-none">
      <div className="mb-6 text-center h-20 flex flex-col justify-center">
        {targetLabel && (
          <div className="flex flex-col items-center gap-1">
            <span className="text-gray-400 font-bold uppercase tracking-tight text-xs md:text-sm">Target:</span>
            <span className="text-2xl md:text-3xl font-black text-indigo-600 uppercase tracking-wide">
              {targetLabel}
            </span>
          </div>
        )}
      </div>

      <div className="relative">
        <svg
          ref={svgRef}
          width="360"
          height="360"
          viewBox="0 0 400 400"
          className="cursor-crosshair touch-none overflow-visible"
          onPointerDown={handlePointerDown}
          style={{ touchAction: 'none' }}
        >
          <circle
            cx={centerX}
            cy={centerY}
            r={radius}
            fill="none"
            stroke="#f1f5f9"
            strokeWidth={strokeWidth}
          />

          <line
            x1={centerX}
            y1={centerY}
            x2={centerX}
            y2={centerY - radius}
            stroke="#cbd5e1"
            strokeWidth={2}
            strokeDasharray="4 4"
          />
          
          <line
            x1={centerX}
            y1={centerY}
            x2={armX}
            y2={armY}
            stroke="#4f46e5"
            strokeWidth={8}
            strokeLinecap="round"
          />
          
          <g transform={`rotate(${currentAngle}, ${armX}, ${armY})`}>
             <path
              d={`M ${armX - 14} ${armY + 22} L ${armX} ${armY} L ${armX + 14} ${armY + 22}`}
              fill="#4f46e5"
            />
          </g>

          <circle cx={centerX} cy={centerY} r={10} fill="#1e293b" />
        </svg>

        {facingLabel && (
          <div 
            className="absolute left-1/2 top-[10px] -translate-x-1/2 -translate-y-1/2 bg-slate-700 text-white px-5 py-2 rounded-xl text-base md:text-lg font-black shadow-lg whitespace-nowrap z-10 border-2 border-white"
          >
            {facingLabel}
          </div>
        )}

        {startingLabel && (
          <div
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-orange-500 text-white px-5 py-2 rounded-xl text-base md:text-lg font-black shadow-lg whitespace-nowrap z-10 border-2 border-white"
          >
            {startingLabel}
          </div>
        )}
      </div>
    </div>
  );
};

export default PointingCircle;
