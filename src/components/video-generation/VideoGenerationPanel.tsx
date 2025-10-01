"use client";

import { useState, useEffect } from "react";
import { useVideoGeneration } from "@/hooks/useVideoGeneration";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, Upload } from "lucide-react";
import { ModelPicker } from "@/components/ModelPicker";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MediaType } from "@/data/store";

// Default model ID for video generation
const DEFAULT_MODEL_ID = "fal-ai/bytedance/seedance/v1/lite/text-to-video";

type VideoGenerationPanelProps = {
  onVideoGenerated?: (url: string) => void;
};

export function VideoGenerationPanel({ onVideoGenerated }: VideoGenerationPanelProps) {
  const [prompt, setPrompt] = useState("");
  const [negativePrompt, setNegativePrompt] = useState("blurry, distorted, low quality");
  const [modelId, setModelId] = useState(DEFAULT_MODEL_ID);
  const [modelProvider, setModelProvider] = useState<"fal" | "replicate" | "bytedance">("fal");
  const [startImage, setStartImage] = useState<string | null>(null);
  const [endImage, setEndImage] = useState<string | null>(null);
  const [showImageInputs, setShowImageInputs] = useState(false);
  
  const { state, generateVideo } = useVideoGeneration();
  const { isGenerating, progress, error, result } = state;
  
  // Check if the selected model requires image inputs
  useEffect(() => {
    setShowImageInputs(modelId.includes("image-to-video"));
  }, [modelId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;
    
    // For image-to-video models, check if images are provided
    if (showImageInputs && (!startImage || !endImage)) {
      alert("Please provide both start and end images");
      return;
    }

    try {
      const input: Record<string, any> = {
        prompt,
        negative_prompt: negativePrompt,
        num_inference_steps: 30,
        width: 1024,
        height: 576,
        num_frames: 24,
        fps: 8,
        guidance_scale: 7.5,
      };
      
      // Add images if required by the model
      if (showImageInputs) {
        input.start_image = startImage;
        input.end_image = endImage;
      }
      
      const videoUrl = await generateVideo(modelId, input);

      if (videoUrl) {
        onVideoGenerated?.(videoUrl);
      }
    } catch (err) {
      console.error("Failed to generate video:", err);
    }
  };
  
  // Handle model selection
  const handleModelChange = (id: string, provider: "fal" | "replicate" | "bytedance") => {
    setModelId(id);
    setModelProvider(provider);
  };
  
  // Handle image upload
  const handleImageUpload = (type: "start" | "end", e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (event) => {
      if (type === "start") {
        setStartImage(event.target?.result as string);
      } else {
        setEndImage(event.target?.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-4 p-4 border rounded-lg bg-card">
      <h2 className="text-lg font-semibold">Generate Video</h2>
      
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="model">Model</Label>
          <ModelPicker 
            mediaType="video"
            value={`${modelProvider}:${modelId}`}
            onValueChange={handleModelChange}
            className="w-full"
          />
        </div>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="prompt">Prompt</Label>
          <Input
            id="prompt"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Describe the video you want to generate..."
            disabled={isGenerating}
            className="w-full"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="negative_prompt">Negative Prompt</Label>
          <Input
            id="negative_prompt"
            value={negativePrompt}
            onChange={(e) => setNegativePrompt(e.target.value)}
            placeholder="What to avoid in the video..."
            disabled={isGenerating}
            className="w-full"
          />
        </div>
        
        {showImageInputs && (
          <div className="space-y-4 p-4 border rounded-md">
            <h3 className="text-md font-medium">Image Inputs</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="start_image">Start Image</Label>
                <div className="flex flex-col items-center justify-center border-2 border-dashed rounded-md p-4 h-40">
                  {startImage ? (
                    <img src={startImage} alt="Start" className="max-h-full" />
                  ) : (
                    <div className="flex flex-col items-center">
                      <Upload className="h-10 w-10 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground mt-2">Upload start image</span>
                    </div>
                  )}
                  <Input
                    id="start_image"
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageUpload("start", e)}
                    className="hidden"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="mt-2"
                    onClick={() => document.getElementById("start_image")?.click()}
                  >
                    {startImage ? "Change" : "Upload"}
                  </Button>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="end_image">End Image</Label>
                <div className="flex flex-col items-center justify-center border-2 border-dashed rounded-md p-4 h-40">
                  {endImage ? (
                    <img src={endImage} alt="End" className="max-h-full" />
                  ) : (
                    <div className="flex flex-col items-center">
                      <Upload className="h-10 w-10 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground mt-2">Upload end image</span>
                    </div>
                  )}
                  <Input
                    id="end_image"
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageUpload("end", e)}
                    className="hidden"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="mt-2"
                    onClick={() => document.getElementById("end_image")?.click()}
                  >
                    {endImage ? "Change" : "Upload"}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {isGenerating && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Generating video...</span>
              <span>{progress}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        )}

        {result && (
          <div className="mt-4">
            <video
              src={result}
              controls
              className="w-full rounded-md border"
              autoPlay
              loop
              muted
            />
          </div>
        )}

        <Button 
          type="submit" 
          disabled={isGenerating || !prompt.trim()}
          className="w-full"
        >
          {isGenerating ? "Generating..." : "Generate Video"}
        </Button>
      </form>
    </div>
  );
}
