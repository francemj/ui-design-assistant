import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Sparkles, GitCompare, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { UploadZone } from "@/components/upload-zone";
import { AnalysisResults } from "@/components/analysis-results";
import { ThemeToggle } from "@/components/theme-toggle";
import { useToast } from "@/hooks/use-toast";
import { analysisRequestSchema, type AnalysisResult, type AnalysisRequest } from "@shared/schema";

interface SavedAnalysis {
  id: string;
  description: string;
  result: AnalysisResult;
  imageUrl: string;
  timestamp: number;
}

export default function Home() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [originalImageUrl, setOriginalImageUrl] = useState<string | null>(null);
  const [savedAnalyses, setSavedAnalyses] = useState<SavedAnalysis[]>([]);
  const [viewMode, setViewMode] = useState<'single' | 'compare'>('single');
  const [currentDescription, setCurrentDescription] = useState<string>("");
  const { toast } = useToast();

  const form = useForm<AnalysisRequest>({
    resolver: zodResolver(analysisRequestSchema),
    defaultValues: {
      description: "",
    },
  });

  const analyzeMutation = useMutation({
    mutationFn: async (data: AnalysisRequest) => {
      if (!selectedFile) {
        throw new Error("Please upload an image");
      }

      const formData = new FormData();
      formData.append("image", selectedFile);
      formData.append("description", data.description);

      const response = await fetch("/api/analyze", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Analysis failed");
      }

      return response.json();
    },
    onSuccess: (data: AnalysisResult) => {
      setResult(data);
      if (selectedFile) {
        setOriginalImageUrl(URL.createObjectURL(selectedFile));
      }
    },
    onError: (error: Error) => {
      toast({
        title: "Analysis failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: AnalysisRequest) => {
    if (!selectedFile) {
      toast({
        title: "Missing image",
        description: "Please upload a UI screenshot first",
        variant: "destructive",
      });
      return;
    }

    setCurrentDescription(data.description);
    analyzeMutation.mutate(data);
  };

  const saveToComparison = () => {
    if (!result || !originalImageUrl) return;

    const isDuplicate = savedAnalyses.some(
      a => a.description === currentDescription && a.imageUrl === originalImageUrl
    );

    if (isDuplicate) {
      toast({
        title: "Already saved",
        description: "This analysis is already in your comparison list",
        variant: "destructive",
      });
      return;
    }

    const newAnalysis: SavedAnalysis = {
      id: Date.now().toString(),
      description: currentDescription,
      result,
      imageUrl: originalImageUrl,
      timestamp: Date.now(),
    };

    setSavedAnalyses(prev => [...prev, newAnalysis]);
    toast({
      title: "Added to comparison",
      description: "Analysis saved for side-by-side comparison",
    });
  };

  const removeFromComparison = (id: string) => {
    const analysisToRemove = savedAnalyses.find(a => a.id === id);
    if (analysisToRemove) {
      URL.revokeObjectURL(analysisToRemove.imageUrl);
    }
    setSavedAnalyses(prev => prev.filter(a => a.id !== id));
  };

  const handleReset = () => {
    setSelectedFile(null);
    form.reset();
    setResult(null);
    setOriginalImageUrl(null);
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <h1 className="text-lg font-semibold text-foreground" data-testid="text-app-title">
            UI Placement Assistant
          </h1>
          <ThemeToggle />
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-12">
        {!result ? (
          <div className="max-w-4xl mx-auto space-y-8">
            <div className="text-center space-y-4">
              <div className="inline-flex items-center justify-center p-3 rounded-xl bg-primary/10 mb-4">
                <Sparkles className="h-8 w-8 text-primary" />
              </div>
              <h2 className="text-3xl font-semibold text-foreground" data-testid="text-hero-title">
                AI-Powered UI Analysis
              </h2>
              <p className="text-base text-muted-foreground max-w-2xl mx-auto" data-testid="text-hero-description">
                Upload a screenshot of your UI, describe what element you want to add,
                and get intelligent placement suggestions powered by GPT-4o vision.
              </p>
            </div>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div>
                  <FormLabel className="text-base font-medium mb-4 block" data-testid="label-upload">
                    UI Screenshot
                  </FormLabel>
                  <UploadZone
                    onFileSelect={setSelectedFile}
                    selectedFile={selectedFile}
                    onClear={() => setSelectedFile(null)}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-base font-medium" data-testid="label-description">
                        What do you want to add?
                      </FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="e.g., Add a Save Draft button for this form, Show a new chart with user activity, Add a notification bell icon to the header..."
                          className="min-h-32 text-base resize-none"
                          data-testid="textarea-description"
                          {...field}
                        />
                      </FormControl>
                      <p className="mt-2 text-xs text-muted-foreground" data-testid="text-char-count">
                        {field.value.length} characters
                      </p>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  disabled={!selectedFile || analyzeMutation.isPending}
                  className="w-full h-12 text-base"
                  data-testid="button-analyze"
                >
                  {analyzeMutation.isPending ? (
                    <>
                      <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                      <span data-testid="text-analyzing">Analyzing your layout...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-5 w-5 mr-2" />
                      <span data-testid="text-analyze">Analyze Layout</span>
                    </>
                  )}
                </Button>
              </form>
            </Form>
          </div>
        ) : viewMode === 'single' ? (
          <div className="space-y-8">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <h2 className="text-2xl font-semibold text-foreground" data-testid="text-results-title">
                Analysis Results
              </h2>
              <div className="flex items-center gap-2">
                <Button
                  variant="secondary"
                  onClick={saveToComparison}
                  data-testid="button-save-to-compare"
                >
                  <GitCompare className="h-4 w-4 mr-2" />
                  Save to Compare
                </Button>
                {savedAnalyses.length > 0 && (
                  <Button
                    variant="outline"
                    onClick={() => setViewMode('compare')}
                    data-testid="button-view-comparison"
                  >
                    <GitCompare className="h-4 w-4 mr-2" />
                    View Comparison ({savedAnalyses.length})
                  </Button>
                )}
                <Button
                  variant="outline"
                  onClick={handleReset}
                  data-testid="button-analyze-another"
                >
                  Analyze Another
                </Button>
              </div>
            </div>
            {originalImageUrl && (
              <AnalysisResults result={result} originalImage={originalImageUrl} />
            )}
          </div>
        ) : (
          <div className="space-y-8">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <h2 className="text-2xl font-semibold text-foreground" data-testid="text-comparison-title">
                Comparison View ({savedAnalyses.length} {savedAnalyses.length === 1 ? 'Analysis' : 'Analyses'})
              </h2>
              <Button
                variant="outline"
                onClick={() => setViewMode('single')}
                data-testid="button-back-to-single"
              >
                <X className="h-4 w-4 mr-2" />
                Back to Results
              </Button>
            </div>

            {savedAnalyses.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground" data-testid="text-no-comparisons">
                  No analyses saved for comparison yet. Save an analysis to get started.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6" data-testid="container-comparison-grid">
                {savedAnalyses.map((analysis) => (
                  <div key={analysis.id} className="border border-border rounded-lg p-4 space-y-4" data-testid={`comparison-card-${analysis.id}`}>
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate" data-testid={`comparison-desc-${analysis.id}`}>
                          {analysis.description}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {new Date(analysis.timestamp).toLocaleString()}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeFromComparison(analysis.id)}
                        data-testid={`button-remove-${analysis.id}`}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    <div className="rounded-lg border border-border overflow-hidden">
                      <img
                        src={analysis.imageUrl}
                        alt="Analysis screenshot"
                        className="w-full h-auto max-h-48 object-contain bg-muted"
                        data-testid={`comparison-img-${analysis.id}`}
                      />
                    </div>

                    <div className="space-y-2">
                      <p className="text-xs font-medium text-muted-foreground uppercase">Placements</p>
                      {analysis.result.placements.slice(0, 2).map((placement, idx) => (
                        <div key={idx} className="text-sm space-y-1" data-testid={`comparison-placement-${analysis.id}-${idx}`}>
                          <p className="font-medium text-foreground">{placement.region}</p>
                          <p className="text-xs text-muted-foreground line-clamp-2">{placement.reason}</p>
                        </div>
                      ))}
                      {analysis.result.placements.length > 2 && (
                        <p className="text-xs text-muted-foreground">
                          +{analysis.result.placements.length - 2} more placement{analysis.result.placements.length - 2 !== 1 ? 's' : ''}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
