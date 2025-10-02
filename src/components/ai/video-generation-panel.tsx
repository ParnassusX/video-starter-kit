"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Wand2, Loader2, X, Info } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import {
  generateVideo,
  cancelVideoGeneration,
  type VideoGenerationParams,
} from "@/app/actions/video-generation";

// Latest AI video models for 2025
const VIDEO_MODELS = [
  {
    id: "fal-ai/svd-xt-2025",
    name: "SVD-XT 2025",
    description:
      "Latest stable video diffusion model with extended capabilities",
  },
  {
    id: "fal-ai/motion-canvas-xl",
    name: "Motion Canvas XL",
    description: "High-resolution motion generation optimized for animations",
  },
  {
    id: "fal-ai/video-lora-personalization",
    name: "Video LoRA Personalization",
    description: "Personalized video generation with custom style adaptation",
  },
  {
    id: "fal-ai/real-time-video-diffusion",
    name: "Real-Time Video Diffusion",
    description: "Ultra-fast video generation optimized for WebGPU",
  },
  {
    id: "fal-ai/neural-video-compression",
    name: "Neural Video Compression",
    description: "High-quality video generation with neural compression",
  },
];

interface VideoGenerationPanelProps {
  onVideoGenerated?: (videoUrl: string) => void;
}

export function VideoGenerationPanel({
  onVideoGenerated,
}: VideoGenerationPanelProps) {
  const router = useRouter();
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationId, setGenerationId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("basic");

  // Form state
  const [prompt, setPrompt] = useState("");
  const [negativePrompt, setNegativePrompt] = useState("");
  const [modelId, setModelId] = useState(VIDEO_MODELS[0].id);
  const [numFrames, setNumFrames] = useState(24);
  const [fps, setFps] = useState(8);
  const [width, setWidth] = useState(512);
  const [height, setHeight] = useState(512);
  const [guidance, setGuidance] = useState(7.5);
  const [seed, setSeed] = useState<number | undefined>();

  const handleGenerate = async () => {
    if (!prompt) {
      setError("Please enter a prompt");
      return;
    }

    if (!modelId) {
      setError("Please select a model");
      return;
    }

    setIsGenerating(true);
    setError(null);
    setVideoUrl(null);

    try {
      const params: VideoGenerationParams = {
        prompt,
        modelId,
        numFrames,
        fps,
        width,
        height,
        guidance,
        seed,
      };

      const result = await generateVideo(params);

      if (result.error) {
        setError(
          typeof result.error === "string"
            ? result.error
            : "Failed to generate video",
        );
        return;
      }

      setGenerationId(result.data.id);
      setVideoUrl(result.data.videoUrl);

      if (onVideoGenerated) {
        onVideoGenerated(result.data.videoUrl);
      }

      router.refresh();
    } catch (err) {
      setError("An unexpected error occurred");
      console.error(err);
    } finally {
      setIsGenerating(false);
      setGenerationId(null);
    }
  };

  const handleCancel = async () => {
    if (!generationId) return;

    try {
      await cancelVideoGeneration(generationId);
      setIsGenerating(false);
      setGenerationId(null);
    } catch (err) {
      console.error("Error canceling generation:", err);
    }
  };

  const handleRandomSeed = () => {
    setSeed(Math.floor(Math.random() * 1000000));
  };

  const handleClearSeed = () => {
    setSeed(undefined);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Wand2 className="mr-2 h-5 w-5" />
          AI Video Generation
        </CardTitle>
        <CardDescription>
          Generate videos using state-of-the-art AI models
        </CardDescription>
      </CardHeader>

      <CardContent>
        {error && (
          <div className="bg-destructive/15 text-destructive p-3 rounded-md mb-4 text-sm">
            {error}
          </div>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="basic">Basic</TabsTrigger>
            <TabsTrigger value="advanced">Advanced</TabsTrigger>
          </TabsList>

          <TabsContent value="basic" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="prompt">Prompt</Label>
              <Textarea
                id="prompt"
                placeholder="Describe the video you want to generate..."
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                rows={3}
                className="resize-none"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="model">Model</Label>
              <Select value={modelId} onValueChange={setModelId}>
                <SelectTrigger id="model">
                  <SelectValue placeholder="Select a model" />
                </SelectTrigger>
                <SelectContent>
                  {VIDEO_MODELS.map((model) => (
                    <SelectItem key={model.id} value={model.id}>
                      <div className="flex flex-col">
                        <span>{model.name}</span>
                        <span className="text-xs text-muted-foreground">
                          {model.description}
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </TabsContent>

          <TabsContent value="advanced" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="num-frames">Frames</Label>
                  <span className="text-sm text-muted-foreground">
                    {numFrames}
                  </span>
                </div>
                <Slider
                  id="num-frames"
                  min={8}
                  max={120}
                  step={1}
                  value={[numFrames]}
                  onValueChange={(value) => setNumFrames(value[0])}
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="fps">FPS</Label>
                  <span className="text-sm text-muted-foreground">{fps}</span>
                </div>
                <Slider
                  id="fps"
                  min={1}
                  max={30}
                  step={1}
                  value={[fps]}
                  onValueChange={(value) => setFps(value[0])}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="width">Width</Label>
                  <span className="text-sm text-muted-foreground">
                    {width}px
                  </span>
                </div>
                <Slider
                  id="width"
                  min={256}
                  max={1024}
                  step={64}
                  value={[width]}
                  onValueChange={(value) => setWidth(value[0])}
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="height">Height</Label>
                  <span className="text-sm text-muted-foreground">
                    {height}px
                  </span>
                </div>
                <Slider
                  id="height"
                  min={256}
                  max={1024}
                  step={64}
                  value={[height]}
                  onValueChange={(value) => setHeight(value[0])}
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Label htmlFor="guidance" className="mr-2">
                    Guidance Scale
                  </Label>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="h-4 w-4 text-muted-foreground" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="max-w-xs">
                          Controls how closely the video follows your prompt.
                          Higher values follow the prompt more closely but may
                          produce less realistic results.
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <span className="text-sm text-muted-foreground">
                  {guidance}
                </span>
              </div>
              <Slider
                id="guidance"
                min={1}
                max={20}
                step={0.1}
                value={[guidance]}
                onValueChange={(value) => setGuidance(value[0])}
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="seed">Seed</Label>
                <div className="flex space-x-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleRandomSeed}
                  >
                    Random
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleClearSeed}
                  >
                    Clear
                  </Button>
                </div>
              </div>
              <Input
                id="seed"
                type="number"
                placeholder="Leave empty for random seed"
                value={seed !== undefined ? seed : ""}
                onChange={(e) =>
                  setSeed(e.target.value ? parseInt(e.target.value) : undefined)
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="negative-prompt">Negative Prompt</Label>
              <Textarea
                id="negative-prompt"
                placeholder="Elements to avoid in the generated video..."
                value={negativePrompt}
                onChange={(e) => setNegativePrompt(e.target.value)}
                rows={2}
                className="resize-none"
              />
            </div>
          </TabsContent>
        </Tabs>

        {videoUrl && (
          <div className="mt-4">
            <video
              src={videoUrl}
              controls
              autoPlay
              loop
              className="w-full rounded-md"
            />
          </div>
        )}
      </CardContent>

      <CardFooter className="flex justify-between">
        {isGenerating ? (
          <>
            <Button variant="outline" onClick={handleCancel}>
              <X className="mr-2 h-4 w-4" />
              Cancel
            </Button>
            <Button disabled>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Generating...
            </Button>
          </>
        ) : (
          <>
            <Button variant="outline" onClick={() => router.refresh()}>
              Reset
            </Button>
            <Button onClick={handleGenerate}>
              <Wand2 className="mr-2 h-4 w-4" />
              Generate Video
            </Button>
          </>
        )}
      </CardFooter>
    </Card>
  );
}
