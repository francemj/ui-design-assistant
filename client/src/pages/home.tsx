import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { UploadZone } from "@/components/upload-zone";
import { AnalysisResults } from "@/components/analysis-results";
import { ThemeToggle } from "@/components/theme-toggle";
import { useToast } from "@/hooks/use-toast";
import { analysisRequestSchema, type AnalysisResult, type AnalysisRequest } from "@shared/schema";

export default function Home() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [originalImageUrl, setOriginalImageUrl] = useState<string | null>(null);
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

    analyzeMutation.mutate(data);
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
        ) : (
          <div className="space-y-8">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-semibold text-foreground" data-testid="text-results-title">
                Analysis Results
              </h2>
              <Button
                variant="outline"
                onClick={handleReset}
                data-testid="button-analyze-another"
              >
                Analyze Another
              </Button>
            </div>
            {originalImageUrl && (
              <AnalysisResults result={result} originalImage={originalImageUrl} />
            )}
          </div>
        )}
      </main>
    </div>
  );
}
