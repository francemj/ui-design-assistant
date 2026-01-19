import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { HelpCircle, AlertCircle } from "lucide-react"
import { PlacementCard } from "./placement-card"
import { ImageMarkupOverlay } from "./image-markup-overlay"
import type { AnalysisResult } from "@shared/schema"

interface AnalysisResultsProps {
  result: AnalysisResult
  originalImage: string
}

export function AnalysisResults({
  result,
  originalImage,
}: AnalysisResultsProps) {
  const [activePlacementIndex, setActivePlacementIndex] = useState<
    number | null
  >(null)

  const hasCoordinates = result.placements.some((p) => p.coordinates)
  const missingCoordinates = result.placements.some((p) => !p.coordinates)

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <div className="lg:sticky lg:top-8 lg:self-start space-y-4">
        <div>
          <h2
            className="text-xl font-semibold text-foreground mb-4"
            data-testid="text-visual-reference"
          >
            Visual Reference
          </h2>
          <ImageMarkupOverlay
            imageUrl={originalImage}
            placements={result.placements}
            activePlacementIndex={activePlacementIndex}
            onPlacementHover={setActivePlacementIndex}
          />
        </div>

        {missingCoordinates && (
          <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50 border border-border">
            <AlertCircle className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
            <p className="text-sm text-muted-foreground">
              {hasCoordinates
                ? "Some placement suggestions don't have visual markers. Refer to the text descriptions on the right."
                : "Visual markers are not available for this analysis. Refer to the text descriptions on the right."}
            </p>
          </div>
        )}
      </div>

      <div className="space-y-6">
        <div>
          <h2
            className="text-xl font-semibold text-foreground mb-4"
            data-testid="text-placements-title"
          >
            Placement Suggestions
          </h2>
          <div className="space-y-4" data-testid="container-placements">
            {result.placements.map((placement, index) => (
              <PlacementCard
                key={index}
                placement={placement}
                index={index}
                isActive={activePlacementIndex === index}
                onHover={setActivePlacementIndex}
              />
            ))}
          </div>
        </div>

        {result.clarifyingQuestions &&
          result.clarifyingQuestions.length > 0 && (
            <Card className="bg-muted/50" data-testid="card-questions">
              <CardHeader className="pb-4">
                <CardTitle
                  className="flex items-center gap-2 text-base"
                  data-testid="text-questions-title"
                >
                  <HelpCircle className="h-5 w-5 text-primary" />
                  Clarifying Questions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {result.clarifyingQuestions.map((question, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-2 text-sm text-foreground"
                    data-testid={`text-question-${index}`}
                  >
                    <span className="text-primary font-medium">•</span>
                    <span>{question}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
      </div>
    </div>
  )
}
