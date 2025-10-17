import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { HelpCircle } from "lucide-react";
import { PlacementCard } from "./placement-card";
import type { AnalysisResult } from "@shared/schema";

interface AnalysisResultsProps {
  result: AnalysisResult;
  originalImage: string;
}

export function AnalysisResults({ result, originalImage }: AnalysisResultsProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <div className="lg:sticky lg:top-8 lg:self-start">
        <h2 className="text-xl font-semibold text-foreground mb-4" data-testid="text-visual-reference">
          Visual Reference
        </h2>
        <Tabs defaultValue="original" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="original" data-testid="tab-original">
              Original
            </TabsTrigger>
            <TabsTrigger
              value="marked"
              disabled={!result.markedUpImageUrl}
              data-testid="tab-marked"
            >
              Marked-up
            </TabsTrigger>
          </TabsList>
          <TabsContent value="original" className="mt-4">
            <div className="rounded-lg border border-border overflow-hidden">
              <img
                src={originalImage}
                alt="Original UI screenshot"
                className="w-full h-auto bg-muted"
                data-testid="img-original"
              />
            </div>
          </TabsContent>
          <TabsContent value="marked" className="mt-4">
            {result.markedUpImageUrl ? (
              <div className="rounded-lg border border-border overflow-hidden">
                <img
                  src={result.markedUpImageUrl}
                  alt="Marked-up UI screenshot"
                  className="w-full h-auto bg-muted"
                  data-testid="img-marked"
                />
              </div>
            ) : (
              <div className="rounded-lg border border-border p-12 text-center">
                <p className="text-sm text-muted-foreground" data-testid="text-no-markup">
                  No marked-up image available
                </p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-semibold text-foreground mb-4" data-testid="text-placements-title">
            Placement Suggestions
          </h2>
          <div className="space-y-4" data-testid="container-placements">
            {result.placements.map((placement, index) => (
              <PlacementCard
                key={index}
                placement={placement}
                index={index}
              />
            ))}
          </div>
        </div>

        {result.clarifyingQuestions && result.clarifyingQuestions.length > 0 && (
          <Card className="bg-muted/50" data-testid="card-questions">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-base" data-testid="text-questions-title">
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
  );
}
