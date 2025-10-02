"use client";

import { useJobCreator } from "@/data/mutations";
import { useReplicateJobCreator } from "@/data/replicateMutations";
import { config } from "@/lib/config";
import { queryKeys, useProject, useProjectMediaItems } from "@/data/queries";
import type { MediaItem } from "@/data/schema";
import {
  type GenerateData,
  type MediaType,
  useProjectId,
  useVideoProjectStore,
} from "@/data/store";
import { AVAILABLE_ENDPOINTS, type InputAsset } from "@/lib/fal";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useEffect, useMemo, useState } from "react";
import {
  Image,
  Mic,
  Music,
  Loader2,
  Video,
  ArrowLeft,
  Trash,
  Wand2,
  X,
  Scissors,
  Activity,
} from "lucide-react";

// Import AI components
import { VideoGenerationPanel } from "./ai/video-generation-panel";
import { VideoEditor } from "./ai/video-editor";
import { VideoAnalysis } from "./ai/video-analysis";
import { MediaItemRow } from "./media-panel";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { useUploadThing } from "@/lib/uploadthing";
import type { ClientUploadedFileData } from "uploadthing/types";
import { db } from "@/data/db";
import { useMutation } from "@tanstack/react-query";
import {
  assetKeyMap,
  cn,
  getAssetKey,
  getAssetType,
  mapInputKey,
  resolveMediaUrl,
} from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { enhancePrompt } from "@/lib/prompt";
import { WithTooltip } from "./ui/tooltip";
import { Label } from "./ui/label";
import { VoiceSelector } from "./playht/voice-selector";
import { LoadingIcon } from "./ui/icons";
import { getMediaMetadata } from "@/lib/ffmpeg";
import CameraMovement from "./camera-control";
import VideoFrameSelector from "./video-frame-selector";
import { ModelPicker } from "./ModelPicker";

type ModelEndpointPickerProps = {
  mediaType: string;
  onValueChange: (value: MediaType) => void;
} & Parameters<typeof Select>[0];

function ModelEndpointPicker({
  mediaType,
  ...props
}: ModelEndpointPickerProps) {
  const endpoints = useMemo(
    () =>
      AVAILABLE_ENDPOINTS.filter((endpoint) => endpoint.category === mediaType),
    [mediaType],
  );
  return (
    <Select {...props}>
      <SelectTrigger className="text-base w-full minw-56 font-semibold">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {endpoints.map((endpoint) => (
          <SelectItem key={endpoint.endpointId} value={endpoint.endpointId}>
            {endpoint.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

type TabType = "generation" | "media";

export default function RightPanel() {
  const projectId = useProjectId();
  const { data: project } = useProject(projectId);
  const { data: mediaItems } = useProjectMediaItems(projectId);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const videoProjectStore = useVideoProjectStore();

  const rightPanelOpen = useVideoProjectStore((s) => s.rightPanelOpen);
  const setRightPanelOpen = useVideoProjectStore((s) => s.setRightPanelOpen);
  const [tab, setTab] = useState<TabType>("generation");
  const [mediaType, setMediaType] = useState<MediaType>("video");
  const [endpointId, setEndpointId] = useState<string>("");
  const [generateData, setGenerateData] = useState<GenerateData>({
    prompt: "",
  });

  const endpoint = useMemo(
    () => AVAILABLE_ENDPOINTS.find((e) => e.endpointId === endpointId),
    [endpointId],
  );

  const handleOnPromptChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setGenerateData({ ...generateData, prompt: e.target.value });
  };

  const handleOnModelChange = (value: string) => {
    setEndpointId(value);
  };

  const handleOnMediaTypeChange = (value: MediaType) => {
    setMediaType(value);
    setEndpointId("");
  };

  const handleOnVoiceChange = (value: string) => {
    setGenerateData({ ...generateData, voice: value });
  };

  const handleOnDurationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setGenerateData({ ...generateData, duration: Number(e.target.value) });
  };

  const handleOnCameraControlChange = (value: any) => {
    setGenerateData({ ...generateData, advanced_camera_control: value });
  };

  const handleOnFrameChange = (value: any) => {
    setGenerateData({ ...generateData, images: value });
  };

  const handleOnModelPickerChange = (modelId: string, provider: string) => {
    // Construct the full model ID with provider prefix if needed
    const fullModelId = provider ? `${provider}:${modelId}` : modelId;
    setGenerateData({ ...generateData, modelId: fullModelId });
  };

  type InputType = {
    prompt: string;
    image_url?: string;
    video_url?: string;
    audio_url?: string;
    reference_audio_url?: string;
    image_size?: string | { width: number; height: number };
    aspect_ratio?: string;
    seconds_total?: number;
    voice?: string;
    input?: string;
    images?: string[];
    advanced_camera_control?: {
      movement_type: string;
    };
  };

  const aspectRatioMap = {
    "16:9": { image: "landscape_16_9", video: "16:9" },
    "9:16": { image: "portrait_16_9", video: "9:16" },
    "1:1": { image: "square_1_1", video: "1:1" },
  };

  let imageAspectRatio: string | { width: number; height: number } | undefined;
  let videoAspectRatio: string | undefined;

  if (project?.aspectRatio) {
    imageAspectRatio = aspectRatioMap[project.aspectRatio].image;
    videoAspectRatio = aspectRatioMap[project.aspectRatio].video;
  }

  const input: InputType = {
    prompt: generateData.prompt,
    image_url: undefined,
    image_size: imageAspectRatio,
    aspect_ratio: videoAspectRatio,
    seconds_total: generateData.duration ?? undefined,
    voice:
      endpointId === "fal-ai/playht/tts/v3" ? generateData.voice : undefined,
    input:
      endpointId === "fal-ai/playht/tts/v3" ? generateData.prompt : undefined,
  };

  if (generateData.image) {
    input.image_url = generateData.image;
  }
  if (generateData.video_url) {
    input.video_url = generateData.video_url;
  }
  if (generateData.audio_url) {
    input.audio_url = generateData.audio_url;
  }
  if (generateData.reference_audio_url) {
    input.reference_audio_url = generateData.reference_audio_url;
  }

  if (generateData.advanced_camera_control) {
    input.advanced_camera_control = generateData.advanced_camera_control;
  }

  if (generateData.images) {
    input.images = generateData.images;
  }

  const extraInput =
    endpointId === "fal-ai/f5-tts"
      ? {
          gen_text: generateData.prompt,
          ref_audio_url:
            "https://github.com/SWivid/F5-TTS/raw/21900ba97d5020a5a70bcc9a0575dc7dec5021cb/tests/ref_audio/test_en_1_ref_short.wav",
          ref_text: "Some call me nature, others call me mother nature.",
          model_type: "F5-TTS",
          remove_silence: true,
        }
      : {};
  // Determine if we're using a Replicate model
  const isReplicateModel = endpointId.startsWith('replicate:');
  const modelId = isReplicateModel ? endpointId.replace('replicate:', '') : endpointId;

  // Use the appropriate job creator based on the model provider
  const falJob = useJobCreator({
    projectId,
    endpointId:
      generateData.image && mediaType === "video"
        ? `${endpointId}/image-to-video`
        : endpointId,
  });

  // Memoize the parameters for the Replicate job creator to avoid unnecessary recreations
  const replicateJobParams = useMemo(() => ({
    projectId,
    modelId: generateData.modelId || modelId,
    mediaType: mediaType,
    input: {
      prompt: generateData.prompt,
      ...generateData.extraInput,
    },
  }), [projectId, generateData.modelId, modelId, mediaType, generateData.prompt, generateData.extraInput]);
  
  // Initialize the Replicate job creator with memoized parameters
  const createReplicateJob = useReplicateJobCreator(replicateJobParams);

  // Use the appropriate job creators
  const [isGenerating, setIsGenerating] = useState(false);

  const handleOnGenerate = async (genData: GenerateData) => {
    // Use a different variable name to avoid potential conflicts
    const generateData = { ...genData };
    try {
      // Use either the stored modelId in generateData or construct it from endpointId
      const modelIdToUse = generateData.modelId || endpointId;
      
      if (!modelIdToUse) {
        toast({
          title: "Error",
          description: "No model selected",
          variant: "destructive",
        });
        return;
      }
      
      // Ensure generateData has the modelId
      if (!generateData.modelId) {
        setGenerateData({ ...generateData, modelId: modelIdToUse });
      }
      
      // Set loading state
      setIsGenerating(true);

      // Determine the model provider from the modelId
      const modelIdString = generateData.modelId || '';
      const [modelProvider, modelIdPart] = modelIdString.includes(":")
        ? (modelIdString.split(":") as [string, string])
        : ["fal", modelIdString];

      // For fal.ai models, find the endpoint
      const endpoint = modelProvider === "fal"
        ? AVAILABLE_ENDPOINTS.find((e) => e.endpointId === modelIdPart)
        : null;

      if (!endpoint && modelProvider === "fal") {
        throw new Error(`No endpoint found for model: ${modelId}`);
      }
      
      // Set the media type based on the endpoint category
      const mediaType = endpoint?.category === 'image' ? 'image' : 'video';

      // Handle fal.ai models
      if (modelProvider === "fal" && endpoint) {
        try {
          // Prepare the input for fal.ai
          const input = {
            ...(endpoint.initialInput || {}),
            prompt: generateData.prompt,
            ...generateData.extraInput,
          };
          
          // Use the fal.ai client to generate content
          const result = await fal.subscribe(endpoint.endpointId, { input });
          
          // Save the result to the media library
          if (result) {
            const mediaUrl = result.media?.url || result.url;
            
            if (mediaUrl) {
              await db.mediaItems.add({
                id: `fal-${Date.now()}`,
                projectId,
                type: mediaType,
                url: mediaUrl,
                createdAt: new Date().toISOString(),
                metadata: {
                  model: endpoint.endpointId,
                  prompt: generateData.prompt,
                  ...result.metadata,
                },
              });
              
              // Invalidate the media items query to refresh the UI
              queryClient.invalidateQueries({
                queryKey: queryKeys.projectMediaItems(projectId),
              });
              
              toast({
                title: "🎥 Generation completed",
                description: `Your ${mediaType} has been generated successfully!`,
              });
            }
          }
        } catch (error) {
          console.error('Error generating with fal.ai:', error);
          toast({
            title: "Failed to generate content",
            description: error instanceof Error ? error.message : 'An unknown error occurred',
            variant: 'destructive',
          });
          throw error;
        } finally {
          // Reset loading state
          setIsGenerating(false);
        }
        
      } else if (modelProvider === 'replicate') {
        try {
          await createReplicateJob.mutateAsync({
            modelId,
            input: {
              prompt: generateData.prompt,
              ...generateData.extraInput,
            },
          });
          
          // Show success message for Replicate job creation
          toast({
            title: "Job submitted successfully",
            description: "Your content is being generated with Replicate. Check the media library for results.",
          });
        } catch (error) {
          console.error('Error creating Replicate job:', error);
          toast({
            title: 'Failed to create job',
            description: error instanceof Error ? error.message : 'An unknown error occurred',
            variant: 'destructive',
          });
          throw error;
        } finally {
          // Reset loading state
          setIsGenerating(false);
        }
      } else {
        // Handle other model providers or unknown providers
        try {
          // Use the fal.ai job creator as a fallback
          await falJob.mutateAsync({
            input: {
              prompt: enhancePrompt(generateData.prompt),
              ...input,
              ...extraInput,
            },
            onSuccess: () => {
              toast({
                title: "Job submitted successfully",
                description: "Your content is being generated.",
              });
            },
            onError: (error) => {
              console.error("Error creating fal.ai job:", error);
              toast({
                title: "Failed to submit job",
                description: error instanceof Error ? error.message : "An unknown error occurred",
                variant: "destructive",
              });
            },
          });
        } catch (error) {
          console.error('Error creating job:', error);
          toast({
            title: 'Failed to create job',
            description: error instanceof Error ? error.message : 'An unknown error occurred',
            variant: 'destructive',
          });
          throw error;
        } finally {
          // Reset loading state
          setIsGenerating(false);
        }
      }
      
      // Close the panel if needed
      setRightPanelOpen(false);
      
    } catch (error: unknown) {
      // Error handling is done in the individual model handlers
      // This catch block is for any unhandled errors
      console.error("Error in handleOnGenerate:", error);
      toast({
        title: "An error occurred",
        description: error instanceof Error ? error.message : "Please try again later.",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    videoProjectStore.onGenerate = handleOnGenerate;
    // Clean up the onGenerate handler when the component unmounts
    return () => {
      videoProjectStore.onGenerate = undefined;
    };
  }, [handleOnGenerate]);

  const handleSelectMedia = (media: MediaItem) => {
    const asset = endpoint?.inputAsset?.find((item) => {
      const assetType = getAssetType(item);

      if (
        assetType === "audio" &&
        (media.mediaType === "voiceover" || media.mediaType === "music")
      ) {
        return true;
      }
      return assetType === media.mediaType;
    });

    if (!asset) {
      setTab("generation");
      return;
    }

    setGenerateData({ [getAssetKey(asset)]: resolveMediaUrl(media) });
    setTab("generation");
  };

  const { startUpload, isUploading } = useUploadThing("fileUploader");

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    try {
      const uploadedFiles = await startUpload(Array.from(files));
      if (uploadedFiles) {
        await handleUploadComplete(uploadedFiles);
      }
    } catch (err) {
      console.warn(`ERROR! ${err}`);
      toast({
        title: "Failed to upload file",
        description: "Please try again",
      });
    }
  };

  const handleUploadComplete = async (
    files: ClientUploadedFileData<{
      uploadedBy: string;
    }>[],
  ) => {
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const mediaType = file.type.split("/")[0];
      const outputType = mediaType === "audio" ? "music" : mediaType;

      const data: Omit<MediaItem, "id"> = {
        projectId,
        kind: "uploaded",
        createdAt: Date.now(),
        mediaType: outputType as MediaType,
        status: "completed",
        url: file.url,
      };

      setGenerateData({
        ...generateData,
        [assetKeyMap[outputType as keyof typeof assetKeyMap]]: file.url,
      });

      const mediaId = await db.media.create(data);
      const media = await db.media.find(mediaId as string);

      if (media && media.mediaType !== "image") {
        const mediaMetadata = await getMediaMetadata(media as MediaItem);

        await db.media
          .update(media.id, {
            ...media,
            metadata: mediaMetadata?.media || {},
          })
          .finally(() => {
            queryClient.invalidateQueries({
              queryKey: queryKeys.projectMediaItems(projectId),
            });
          });
      }
    }
  };

  return (
    <div
      className={cn(
        "flex flex-col border-l border-border w-[450px] z-50 transition-all duration-300 absolute top-0 h-full bg-background",
        rightPanelOpen ? "right-0" : "-right-[450px]"
      )}
    >
      <div className="flex-1 p-4 flex flex-col gap-4 border-b border-border h-full overflow-y-auto relative">
        <div className="flex flex-row items-center justify-between">
          <h2 className="text-sm text-muted-foreground font-semibold flex-1">
            Generate Media
          </h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setRightPanelOpen(false)}
            className="flex items-center gap-2"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex flex-row gap-2 flex-wrap">
          <Button
            variant={tab === "generation" ? "default" : "outline"}
            size="sm"
            onClick={() => setTab("generation")}
            className="flex-1"
          >
            <Wand2 className="h-4 w-4 mr-2" />
            Generation
          </Button>
          <Button
            variant={tab === "editor" ? "default" : "outline"}
            size="sm"
            onClick={() => setTab("editor")}
            className="flex-1"
          >
            <Scissors className="h-4 w-4 mr-2" />
            AI Editor
          </Button>
          <Button
            variant={tab === "analysis" ? "default" : "outline"}
            size="sm"
            onClick={() => setTab("analysis")}
            className="flex-1"
          >
            <Activity className="h-4 w-4 mr-2" />
            Analysis
          </Button>
          <Button
            variant={tab === "media" ? "default" : "outline"}
            size="sm"
            onClick={() => setTab("media")}
            className="flex-1"
          >
            <Image className="h-4 w-4 mr-2" />
            Media
          </Button>
        </div>

        {tab === "generation" ? (
          <VideoGenerationPanel 
            mediaType={mediaType}
            generateData={generateData}
            isGenerating={isGenerating}
            onMediaTypeChange={handleOnMediaTypeChange}
            onModelPickerChange={handleOnModelPickerChange}
            onPromptChange={handleOnPromptChange}
            onDurationChange={handleOnDurationChange}
            onVoiceChange={handleOnVoiceChange}
            onCameraControlChange={handleOnCameraControlChange}
            onFrameChange={handleOnFrameChange}
            onGenerate={() => videoProjectStore.onGenerate?.(generateData)}
          />
        ) : tab === "editor" ? (
          <VideoEditor />
        ) : tab === "analysis" ? (
          <VideoAnalysis />
        ) : (
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label>Upload Media</Label>
              <Input
                type="file"
                onChange={handleFileUpload}
                accept="image/*,video/*,audio/*"
                disabled={isUploading}
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label>Media Library</Label>
              <div className="flex flex-col gap-2 max-h-[400px] overflow-y-auto">
                {mediaItems?.map((media) => (
                  <MediaItemRow
                    key={media.id}
                    media={media}
                    onClick={() => handleSelectMedia(media)}
                  />
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}