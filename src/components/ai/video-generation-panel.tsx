"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Wand2, Loader2 } from "lucide-react";
import { ModelPicker } from "@/components/ModelPicker";
import { VoiceSelector } from "@/components/playht/voice-selector";
import CameraMovement from "@/components/camera-control";
import VideoFrameSelector from "@/components/video-frame-selector";
import { type GenerateData, type MediaType } from "@/data/store";
import { useProjectMediaItems } from "@/data/queries";
import { useProjectId } from "@/data/store";

interface VideoGenerationPanelProps {
  mediaType: MediaType;
  generateData: GenerateData;
  isGenerating: boolean;
  onMediaTypeChange: (value: MediaType) => void;
  onModelPickerChange: (modelId: string, provider: string) => void;
  onPromptChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onDurationChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onVoiceChange: (value: string) => void;
  onCameraControlChange: (value: any) => void;
  onFrameChange: (value: any) => void;
  onGenerate: () => void;
}

export function VideoGenerationPanel({
  mediaType,
  generateData,
  isGenerating,
  onMediaTypeChange,
  onModelPickerChange,
  onPromptChange,
  onDurationChange,
  onVoiceChange,
  onCameraControlChange,
  onFrameChange,
  onGenerate,
}: VideoGenerationPanelProps) {
  const projectId = useProjectId();
  const { data: mediaItems = [] } = useProjectMediaItems(projectId);

  return (
    <div className="space-y-4">
      {/* Media Type Selector */}
      <div className="space-y-2">
        <Label>Media Type</Label>
        <Select value={mediaType} onValueChange={onMediaTypeChange}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="video">Video</SelectItem>
            <SelectItem value="image">Image</SelectItem>
            <SelectItem value="music">Music</SelectItem>
            <SelectItem value="voiceover">Voiceover</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Model Picker */}
      <div className="space-y-2">
        <Label>Model</Label>
        <ModelPicker
          mediaType={mediaType}
          onValueChange={onModelPickerChange}
        />
      </div>

      {/* Prompt Input */}
      <div className="space-y-2">
        <Label>Prompt</Label>
        <Textarea
          placeholder="Describe what you want to generate..."
          value={generateData.prompt}
          onChange={onPromptChange}
          rows={3}
        />
      </div>

      {/* Duration Input for Video/Audio */}
      {(mediaType === "video" || mediaType === "music" || mediaType === "voiceover") && (
        <div className="space-y-2">
          <Label>Duration (seconds)</Label>
          <Input
            type="number"
            min="1"
            max="30"
            value={generateData.duration || 5}
            onChange={onDurationChange}
          />
        </div>
      )}

      {/* Voice Selector for Voiceover */}
      {mediaType === "voiceover" && (
        <div className="space-y-2">
          <Label>Voice</Label>
          <VoiceSelector
            value={generateData.voice || "default"}
            onValueChange={onVoiceChange}
          />
        </div>
      )}

      {/* Advanced Controls */}
      <Tabs defaultValue="basic" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="basic">Basic</TabsTrigger>
          <TabsTrigger value="advanced">Advanced</TabsTrigger>
        </TabsList>
        
        <TabsContent value="basic" className="space-y-4">
          {/* Basic controls are already above */}
        </TabsContent>
        
        <TabsContent value="advanced" className="space-y-4">
          {/* Camera Control for Video */}
          {mediaType === "video" && (
            <div className="space-y-2">
              <Label>Camera Movement</Label>
              <CameraMovement
                value={generateData.advanced_camera_control}
                onChange={onCameraControlChange}
              />
            </div>
          )}

          {/* Frame Selector for Video */}
          {mediaType === "video" && (
            <div className="space-y-2">
              <Label>Key Frames</Label>
              <VideoFrameSelector
                mediaItems={mediaItems}
                onChange={onFrameChange}
              />
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Generate Button */}
      <Button
        onClick={onGenerate}
        disabled={isGenerating || !generateData.prompt}
        className="w-full"
      >
        {isGenerating ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Generating...
          </>
        ) : (
          <>
            <Wand2 className="mr-2 h-4 w-4" />
            Generate {mediaType}
          </>
        )}
      </Button>
    </div>
  );
}
