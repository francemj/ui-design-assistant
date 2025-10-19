import { Card, CardContent } from "@/components/ui/card";
import type { Placement } from "@shared/schema";

interface PlacementCardProps {
  placement: Placement;
  index: number;
  isActive?: boolean;
  onHover?: (index: number | null) => void;
}

const COLORS = [
  "rgb(59, 130, 246)",  // blue
  "rgb(168, 85, 247)",  // purple
  "rgb(236, 72, 153)",  // pink
  "rgb(34, 197, 94)",   // green
];

export function PlacementCard({ placement, index, isActive = false, onHover }: PlacementCardProps) {
  const color = COLORS[index % COLORS.length];
  const hasCoordinates = !!placement.coordinates;

  return (
    <Card
      className={`hover-elevate transition-all ${isActive ? 'ring-2' : ''}`}
      style={isActive ? { '--tw-ring-color': color } as React.CSSProperties : {}}
      data-testid={`card-placement-${index}`}
      onMouseEnter={() => hasCoordinates && onHover?.(index)}
      onMouseLeave={() => hasCoordinates && onHover?.(null)}
    >
      <CardContent className="p-6">
        <div className="flex items-start gap-3">
          <div
            className="mt-1 flex items-center justify-center w-8 h-8 rounded-md font-semibold text-white text-sm"
            style={{ backgroundColor: color }}
          >
            {index + 1}
          </div>
          <div className="flex-1">
            <h3
              className="text-base font-medium text-foreground mb-2"
              data-testid={`text-region-${index}`}
            >
              {placement.region}
            </h3>
            <p
              className="text-sm text-muted-foreground leading-relaxed"
              data-testid={`text-reason-${index}`}
            >
              {placement.reason}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
