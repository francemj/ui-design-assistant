import { useCallback, useState } from "react";
import { Upload, X, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

interface UploadZoneProps {
  onFileSelect: (file: File) => void;
  selectedFile: File | null;
  onClear: () => void;
}

export function UploadZone({ onFileSelect, selectedFile, onClear }: UploadZoneProps) {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);

      const file = e.dataTransfer.files[0];
      if (file && (file.type === "image/png" || file.type === "image/jpeg")) {
        onFileSelect(file);
      }
    },
    [onFileSelect]
  );

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        onFileSelect(file);
      }
    },
    [onFileSelect]
  );

  const previewUrl = selectedFile ? URL.createObjectURL(selectedFile) : null;

  if (selectedFile && previewUrl) {
    return (
      <div className="relative w-full">
        <div className="relative rounded-lg border border-border overflow-hidden">
          <img
            src={previewUrl}
            alt="Uploaded UI screenshot"
            className="w-full h-auto max-h-96 object-contain bg-muted"
            data-testid="img-uploaded-preview"
          />
        </div>
        <div className="mt-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <ImageIcon className="h-4 w-4" />
            <span data-testid="text-filename">{selectedFile.name}</span>
            <span className="text-xs">
              ({(selectedFile.size / 1024).toFixed(1)} KB)
            </span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClear}
            data-testid="button-clear-image"
          >
            <X className="h-4 w-4 mr-2" />
            Remove
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`
        relative min-h-64 rounded-xl border-2 border-dashed transition-colors
        ${isDragging ? "border-primary bg-primary/5" : "border-border"}
      `}
      data-testid="dropzone-upload"
    >
      <label className="flex flex-col items-center justify-center h-full min-h-64 cursor-pointer p-12">
        <Upload
          className={`h-12 w-12 mb-4 transition-colors ${
            isDragging ? "text-primary" : "text-muted-foreground"
          }`}
        />
        <p className="text-base font-medium text-foreground mb-2">
          Drop your UI screenshot here
        </p>
        <p className="text-sm text-muted-foreground mb-4">
          or click to browse files
        </p>
        <p className="text-xs text-muted-foreground">
          Supports PNG and JPG images
        </p>
        <input
          type="file"
          className="hidden"
          accept="image/png,image/jpeg"
          onChange={handleFileInput}
          data-testid="input-file-upload"
        />
      </label>
    </div>
  );
}
