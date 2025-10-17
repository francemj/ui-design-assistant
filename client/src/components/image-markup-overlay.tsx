import { useState, useRef, useEffect } from "react";
import type { Placement } from "@shared/schema";

interface ImageMarkupOverlayProps {
  imageUrl: string;
  placements: Placement[];
  activePlacementIndex: number | null;
  onPlacementHover: (index: number | null) => void;
}

const COLORS = [
  "rgb(59, 130, 246)",  // blue
  "rgb(168, 85, 247)",  // purple
  "rgb(236, 72, 153)",  // pink
  "rgb(34, 197, 94)",   // green
];

export function ImageMarkupOverlay({
  imageUrl,
  placements,
  activePlacementIndex,
  onPlacementHover,
}: ImageMarkupOverlayProps) {
  const [imageDimensions, setImageDimensions] = useState({ width: 0, height: 0 });
  const imgRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const updateDimensions = () => {
      if (imgRef.current) {
        setImageDimensions({
          width: imgRef.current.clientWidth,
          height: imgRef.current.clientHeight,
        });
      }
    };

    const img = imgRef.current;
    if (img) {
      if (img.complete) {
        updateDimensions();
      } else {
        img.addEventListener("load", updateDimensions);
      }
    }

    window.addEventListener("resize", updateDimensions);

    return () => {
      window.removeEventListener("resize", updateDimensions);
      if (img) {
        img.removeEventListener("load", updateDimensions);
      }
    };
  }, [imageUrl]);

  const placementsWithCoordinates = placements.filter(p => p.coordinates);

  return (
    <div ref={containerRef} className="relative inline-block w-full">
      <img
        ref={imgRef}
        src={imageUrl}
        alt="UI Screenshot with placement suggestions"
        className="w-full h-auto rounded-lg border border-border"
        data-testid="img-markup-original"
      />
      
      {imageDimensions.width > 0 && placementsWithCoordinates.length > 0 && (
        <svg
          className="absolute top-0 left-0 w-full h-full"
          viewBox={`0 0 ${imageDimensions.width} ${imageDimensions.height}`}
          data-testid="svg-markup-overlay"
        >
          {placementsWithCoordinates.map((placement, index) => {
            if (!placement.coordinates) return null;

            const actualIndex = placements.indexOf(placement);
            const color = COLORS[actualIndex % COLORS.length];
            const isActive = activePlacementIndex === actualIndex;
            const opacity = activePlacementIndex === null || isActive ? 0.3 : 0.1;

            const x = (placement.coordinates.x / 100) * imageDimensions.width;
            const y = (placement.coordinates.y / 100) * imageDimensions.height;
            const width = (placement.coordinates.width / 100) * imageDimensions.width;
            const height = (placement.coordinates.height / 100) * imageDimensions.height;

            return (
              <g key={actualIndex}>
                <rect
                  x={x}
                  y={y}
                  width={width}
                  height={height}
                  fill={color}
                  fillOpacity={opacity}
                  stroke={color}
                  strokeWidth={isActive ? 3 : 2}
                  strokeOpacity={isActive ? 1 : 0.6}
                  className="pointer-events-auto transition-all cursor-pointer"
                  onMouseEnter={() => onPlacementHover(actualIndex)}
                  onMouseLeave={() => onPlacementHover(null)}
                  data-testid={`markup-box-${actualIndex}`}
                />
                <circle
                  cx={x + 20}
                  cy={y + 20}
                  r={16}
                  fill={color}
                  fillOpacity={isActive ? 1 : 0.9}
                  className="pointer-events-auto cursor-pointer"
                  onMouseEnter={() => onPlacementHover(actualIndex)}
                  onMouseLeave={() => onPlacementHover(null)}
                  data-testid={`markup-badge-${actualIndex}`}
                />
                <text
                  x={x + 20}
                  y={y + 20}
                  textAnchor="middle"
                  dominantBaseline="central"
                  className="fill-white text-sm font-semibold pointer-events-none select-none"
                  data-testid={`markup-number-${actualIndex}`}
                >
                  {actualIndex + 1}
                </text>
              </g>
            );
          })}
        </svg>
      )}
    </div>
  );
}
