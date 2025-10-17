import { Card, CardContent } from "@/components/ui/card";
import { MapPin } from "lucide-react";
import type { Placement } from "@shared/schema";

interface PlacementCardProps {
  placement: Placement;
  index: number;
}

export function PlacementCard({ placement, index }: PlacementCardProps) {
  return (
    <Card className="hover-elevate" data-testid={`card-placement-${index}`}>
      <CardContent className="p-6">
        <div className="flex items-start gap-3">
          <div className="mt-1 p-2 rounded-md bg-primary/10">
            <MapPin className="h-4 w-4 text-primary" />
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
