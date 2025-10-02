"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Scissors,
  Wand2,
  Loader2,
  Save,
  Undo,
  Redo,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Layers,
  Palette,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

// AI style transfer models for 2025
const STYLE_MODELS = [
  {
    id: "cinematic",
    name: "Cinematic",
    description: "Professional film-like appearance",
  },
  { id: "anime", name: "Anime", description: "Japanese animation style" },
  { id: "vintage", name: "Vintage", description: "70s/80s retro film look" },
  {
    id: "noir",
    name: "Film Noir",
    description: "Black and white dramatic contrast",
  },
  { id: "neon", name: "Neon", description: "Vibrant cyberpunk aesthetic" },
  {
    id: "watercolor",
    name: "Watercolor",
    description: "Artistic watercolor painting style",
  },
  {
    id: "custom",
    name: "Custom Style",
    description: "Upload reference image for style transfer",
  },
];

// Video effects
const VIDEO_EFFECTS = [
  { id: "none", name: "None", description: "No effects" },
  { id: "blur", name: "Blur", description: "Gaussian blur effect" },
  { id: "sharpen", name: "Sharpen", description: "Enhance details and edges" },
  { id: "grain", name: "Film Grain", description: "Add film grain texture" },
  {
    id: "vignette",
    name: "Vignette",
    description: "Darken the edges of the frame",
  },
  { id: "glitch", name: "Glitch", description: "Digital distortion effect" },
  { id: "dream", name: "Dream", description: "Soft dreamy glow effect" },
];

interface VideoEditorProps {
  videoUrl: string;
  onSave?: (editedVideoUrl: string) => void;
}

export function VideoEditor({ videoUrl, onSave }: VideoEditorProps) {
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeTab, setActiveTab] = useState("trim");
  const [editedVideoUrl, setEditedVideoUrl] = useState<string | null>(null);
  const [history, setHistory] = useState<string[]>([videoUrl]);
  const [historyIndex, setHistoryIndex] = useState(0);

  // Trim state
  const [startTime, setStartTime] = useState(0);
  const [endTime, setEndTime] = useState(0);

  // Style transfer state
  const [selectedStyle, setSelectedStyle] = useState(STYLE_MODELS[0].id);
  const [styleIntensity, setStyleIntensity] = useState(0.75);
  const [customStyleImage, setCustomStyleImage] = useState<string | null>(null);

  // Effects state
  const [selectedEffect, setSelectedEffect] = useState(VIDEO_EFFECTS[0].id);
  const [effectIntensity, setEffectIntensity] = useState(0.5);

  // AI enhancement state
  const [enhanceResolution, setEnhanceResolution] = useState(false);
  const [stabilizeVideo, setStabilizeVideo] = useState(false);
  const [removeNoise, setRemoveNoise] = useState(false);
  const [colorCorrection, setColorCorrection] = useState(false);

  // Scene detection state
  const [detectedScenes, setDetectedScenes] = useState<
    { start: number; end: number; thumbnail: string }[]
  >([]);
  const [selectedScene, setSelectedScene] = useState<number | null>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleLoadedMetadata = () => {
      setDuration(video.duration);
      setEndTime(video.duration);
    };

    const handleTimeUpdate = () => {
      setCurrentTime(video.currentTime);
    };

    const handlePlay = () => {
      setIsPlaying(true);
    };

    const handlePause = () => {
      setIsPlaying(false);
    };

    video.addEventListener("loadedmetadata", handleLoadedMetadata);
    video.addEventListener("timeupdate", handleTimeUpdate);
    video.addEventListener("play", handlePlay);
    video.addEventListener("pause", handlePause);

    return () => {
      video.removeEventListener("loadedmetadata", handleLoadedMetadata);
      video.removeEventListener("timeupdate", handleTimeUpdate);
      video.removeEventListener("play", handlePlay);
      video.removeEventListener("pause", handlePause);
    };
  }, []);

  // Update video source when history changes
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    video.src = history[historyIndex];
    setEditedVideoUrl(history[historyIndex]);
  }, [history, historyIndex]);

  const handlePlayPause = () => {
    const video = videoRef.current;
    if (!video) return;

    if (isPlaying) {
      video.pause();
    } else {
      video.play();
    }
  };

  const handleSeek = (value: number[]) => {
    const video = videoRef.current;
    if (!video) return;

    const newTime = value[0];
    video.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const handleVolumeChange = (value: number[]) => {
    const video = videoRef.current;
    if (!video) return;

    const newVolume = value[0];
    video.volume = newVolume;
    setVolume(newVolume);
  };

  const handleTrimChange = (type: "start" | "end", value: number[]) => {
    if (type === "start") {
      setStartTime(value[0]);
    } else {
      setEndTime(value[0]);
    }
  };

  const handleSkipBack = () => {
    const video = videoRef.current;
    if (!video) return;

    video.currentTime = Math.max(0, video.currentTime - 5);
  };

  const handleSkipForward = () => {
    const video = videoRef.current;
    if (!video) return;

    video.currentTime = Math.min(video.duration, video.currentTime + 5);
  };

  const handleUndo = () => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1);
    }
  };

  const handleCustomStyleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      setCustomStyleImage(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleDetectScenes = async () => {
    setIsProcessing(true);

    try {
      // Simulate AI scene detection with a timeout
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Mock detected scenes
      const mockScenes = [
        { start: 0, end: 5.2, thumbnail: "/thumbnails/scene1.jpg" },
        { start: 5.2, end: 12.8, thumbnail: "/thumbnails/scene2.jpg" },
        { start: 12.8, end: 18.5, thumbnail: "/thumbnails/scene3.jpg" },
        { start: 18.5, end: duration, thumbnail: "/thumbnails/scene4.jpg" },
      ];

      setDetectedScenes(mockScenes);
    } catch (error) {
      console.error("Error detecting scenes:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSelectScene = (index: number) => {
    setSelectedScene(index);
    const scene = detectedScenes[index];
    setStartTime(scene.start);
    setEndTime(scene.end);

    const video = videoRef.current;
    if (video) {
      video.currentTime = scene.start;
    }
  };

  const handleApplyEdit = async () => {
    setIsProcessing(true);

    try {
      // Simulate processing with a timeout
      await new Promise((resolve) => setTimeout(resolve, 3000));

      // In a real implementation, this would call a server action to process the video
      // For now, we'll just simulate a new video URL
      const newVideoUrl = `${videoUrl}?edited=${Date.now()}`;

      // Add to history
      const newHistory = history.slice(0, historyIndex + 1);
      newHistory.push(newVideoUrl);
      setHistory(newHistory);
      setHistoryIndex(newHistory.length - 1);

      setEditedVideoUrl(newVideoUrl);
    } catch (error) {
      console.error("Error applying edit:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSave = () => {
    if (editedVideoUrl && onSave) {
      onSave(editedVideoUrl);
    }
    router.refresh();
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Scissors className="mr-2 h-5 w-5" />
          AI Video Editor
        </CardTitle>
        <CardDescription>
          Edit your video with advanced AI-powered tools
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="relative aspect-video bg-black rounded-md overflow-hidden">
          <video
            ref={videoRef}
            src={videoUrl}
            className="w-full h-full"
            controls={false}
          />
          <canvas
            ref={canvasRef}
            className="absolute top-0 left-0 w-full h-full pointer-events-none"
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="icon"
              onClick={handleSkipBack}
              disabled={isProcessing}
            >
              <SkipBack className="h-4 w-4" />
            </Button>

            <Button
              variant="outline"
              size="icon"
              onClick={handlePlayPause}
              disabled={isProcessing}
            >
              {isPlaying ? (
                <Pause className="h-4 w-4" />
              ) : (
                <Play className="h-4 w-4" />
              )}
            </Button>

            <Button
              variant="outline"
              size="icon"
              onClick={handleSkipForward}
              disabled={isProcessing}
            >
              <SkipForward className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-sm">
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>
          </div>

          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="icon"
              onClick={handleUndo}
              disabled={historyIndex === 0 || isProcessing}
            >
              <Undo className="h-4 w-4" />
            </Button>

            <Button
              variant="outline"
              size="icon"
              onClick={handleRedo}
              disabled={historyIndex === history.length - 1 || isProcessing}
            >
              <Redo className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="seek">Timeline</Label>
            <span className="text-sm text-muted-foreground">
              {formatTime(currentTime)}
            </span>
          </div>
          <Slider
            id="seek"
            min={0}
            max={duration}
            step={0.01}
            value={[currentTime]}
            onValueChange={handleSeek}
            disabled={isProcessing}
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="volume">Volume</Label>
            <span className="text-sm text-muted-foreground">
              {Math.round(volume * 100)}%
            </span>
          </div>
          <Slider
            id="volume"
            min={0}
            max={1}
            step={0.01}
            value={[volume]}
            onValueChange={handleVolumeChange}
            disabled={isProcessing}
          />
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-4 mb-4">
            <TabsTrigger value="trim">Trim</TabsTrigger>
            <TabsTrigger value="style">Style</TabsTrigger>
            <TabsTrigger value="effects">Effects</TabsTrigger>
            <TabsTrigger value="enhance">Enhance</TabsTrigger>
          </TabsList>

          <TabsContent value="trim" className="space-y-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="start-time">Start Time</Label>
                  <span className="text-sm text-muted-foreground">
                    {formatTime(startTime)}
                  </span>
                </div>
                <Slider
                  id="start-time"
                  min={0}
                  max={endTime}
                  step={0.01}
                  value={[startTime]}
                  onValueChange={(value) => handleTrimChange("start", value)}
                  disabled={isProcessing}
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="end-time">End Time</Label>
                  <span className="text-sm text-muted-foreground">
                    {formatTime(endTime)}
                  </span>
                </div>
                <Slider
                  id="end-time"
                  min={startTime}
                  max={duration}
                  step={0.01}
                  value={[endTime]}
                  onValueChange={(value) => handleTrimChange("end", value)}
                  disabled={isProcessing}
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Scene Detection</Label>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleDetectScenes}
                    disabled={isProcessing}
                  >
                    {isProcessing && activeTab === "trim" ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Detecting...
                      </>
                    ) : (
                      <>
                        <Layers className="mr-2 h-4 w-4" />
                        Detect Scenes
                      </>
                    )}
                  </Button>
                </div>

                {detectedScenes.length > 0 && (
                  <div className="grid grid-cols-4 gap-2 mt-2">
                    {detectedScenes.map((scene, index) => (
                      <div
                        key={index}
                        className={`relative cursor-pointer rounded-md overflow-hidden border-2 ${selectedScene === index ? "border-primary" : "border-transparent"}`}
                        onClick={() => handleSelectScene(index)}
                      >
                        <div className="aspect-video bg-muted">
                          {/* In a real implementation, this would be a thumbnail */}
                          <div className="w-full h-full flex items-center justify-center text-xs">
                            Scene {index + 1}
                          </div>
                        </div>
                        <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-xs p-1">
                          {formatTime(scene.start)} - {formatTime(scene.end)}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="style" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="style-model">Style Transfer</Label>
              <Select value={selectedStyle} onValueChange={setSelectedStyle}>
                <SelectTrigger id="style-model">
                  <SelectValue placeholder="Select a style" />
                </SelectTrigger>
                <SelectContent>
                  {STYLE_MODELS.map((style) => (
                    <SelectItem key={style.id} value={style.id}>
                      <div className="flex flex-col">
                        <span>{style.name}</span>
                        <span className="text-xs text-muted-foreground">
                          {style.description}
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedStyle === "custom" && (
              <div className="space-y-2">
                <Label htmlFor="custom-style">Custom Style Image</Label>
                <Input
                  id="custom-style"
                  type="file"
                  accept="image/*"
                  onChange={handleCustomStyleUpload}
                  disabled={isProcessing}
                />

                {customStyleImage && (
                  <div className="mt-2">
                    <img
                      src={customStyleImage}
                      alt="Custom style"
                      className="max-h-24 rounded-md"
                    />
                  </div>
                )}
              </div>
            )}

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="style-intensity">Style Intensity</Label>
                <span className="text-sm text-muted-foreground">
                  {Math.round(styleIntensity * 100)}%
                </span>
              </div>
              <Slider
                id="style-intensity"
                min={0}
                max={1}
                step={0.01}
                value={[styleIntensity]}
                onValueChange={(value) => setStyleIntensity(value[0])}
                disabled={isProcessing}
              />
            </div>
          </TabsContent>

          <TabsContent value="effects" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="effect">Video Effect</Label>
              <Select value={selectedEffect} onValueChange={setSelectedEffect}>
                <SelectTrigger id="effect">
                  <SelectValue placeholder="Select an effect" />
                </SelectTrigger>
                <SelectContent>
                  {VIDEO_EFFECTS.map((effect) => (
                    <SelectItem key={effect.id} value={effect.id}>
                      <div className="flex flex-col">
                        <span>{effect.name}</span>
                        <span className="text-xs text-muted-foreground">
                          {effect.description}
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedEffect !== "none" && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="effect-intensity">Effect Intensity</Label>
                  <span className="text-sm text-muted-foreground">
                    {Math.round(effectIntensity * 100)}%
                  </span>
                </div>
                <Slider
                  id="effect-intensity"
                  min={0}
                  max={1}
                  step={0.01}
                  value={[effectIntensity]}
                  onValueChange={(value) => setEffectIntensity(value[0])}
                  disabled={isProcessing}
                />
              </div>
            )}
          </TabsContent>

          <TabsContent value="enhance" className="space-y-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex flex-col space-y-1">
                  <Label htmlFor="enhance-resolution">Enhance Resolution</Label>
                  <span className="text-xs text-muted-foreground">
                    Upscale video using AI super-resolution
                  </span>
                </div>
                <Switch
                  id="enhance-resolution"
                  checked={enhanceResolution}
                  onCheckedChange={setEnhanceResolution}
                  disabled={isProcessing}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex flex-col space-y-1">
                  <Label htmlFor="stabilize-video">Stabilize Video</Label>
                  <span className="text-xs text-muted-foreground">
                    Reduce camera shake and jitter
                  </span>
                </div>
                <Switch
                  id="stabilize-video"
                  checked={stabilizeVideo}
                  onCheckedChange={setStabilizeVideo}
                  disabled={isProcessing}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex flex-col space-y-1">
                  <Label htmlFor="remove-noise">Remove Noise</Label>
                  <span className="text-xs text-muted-foreground">
                    Clean up video and audio noise
                  </span>
                </div>
                <Switch
                  id="remove-noise"
                  checked={removeNoise}
                  onCheckedChange={setRemoveNoise}
                  disabled={isProcessing}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex flex-col space-y-1">
                  <Label htmlFor="color-correction">Color Correction</Label>
                  <span className="text-xs text-muted-foreground">
                    Automatically balance colors and exposure
                  </span>
                </div>
                <Switch
                  id="color-correction"
                  checked={colorCorrection}
                  onCheckedChange={setColorCorrection}
                  disabled={isProcessing}
                />
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>

      <CardFooter className="flex justify-between">
        <Button
          variant="outline"
          onClick={() => router.refresh()}
          disabled={isProcessing}
        >
          Cancel
        </Button>

        <div className="flex space-x-2">
          <Button
            variant="secondary"
            onClick={handleApplyEdit}
            disabled={isProcessing}
          >
            {isProcessing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <Wand2 className="mr-2 h-4 w-4" />
                Apply Edit
              </>
            )}
          </Button>

          <Button
            onClick={handleSave}
            disabled={isProcessing || !editedVideoUrl}
          >
            <Save className="mr-2 h-4 w-4" />
            Save
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
