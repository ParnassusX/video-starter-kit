"use client";

import { useMemo } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { AVAILABLE_ENDPOINTS } from "@/lib/fal";
import { useReplicateModels } from "@/hooks/useReplicateModels";
import { MediaType } from "@/data/store";
import { BYTEDANCE_MODELS } from "@/lib/bytedance";

type ModelProvider = "fal" | "replicate" | "bytedance";

type ModelType = {
  id: string;
  label: string;
  provider: ModelProvider;
  category: string;
};

type ModelPickerProps = {
  mediaType: MediaType;
  value?: string;
  onValueChange: (value: string, provider: ModelProvider) => void;
  className?: string;
};

export function ModelPicker({
  mediaType,
  value,
  onValueChange,
  className,
}: ModelPickerProps) {
  const { models: replicateModels } = useReplicateModels();

  // Map fal.ai models
  const falModels = useMemo(
    () =>
      AVAILABLE_ENDPOINTS.filter(
        (endpoint) => endpoint.category === mediaType,
      ).map((model) => ({
        id: `fal:${model.endpointId}`,
        label: model.label,
        description: model.description,
        inputAsset: model.inputAsset,
        provider: "fal" as const,
        category: model.category,
      })),
    [mediaType],
  );

  // Map Replicate models
  const replicateModelsFiltered = useMemo(
    () =>
      replicateModels
        .filter((model) => model.category === mediaType)
        .map((model) => ({
          id: `replicate:${model.id}`,
          label: `${model.label} (Replicate)`,
          provider: "replicate" as const,
          category: model.category,
        })),
    [replicateModels, mediaType],
  );

  // Map Bytedance models
  const bytedanceModels = useMemo(
    () =>
      BYTEDANCE_MODELS.filter((model) => model.category === mediaType).map(
        (model) => ({
          id: `bytedance:${model.id}`,
          label: `${model.label} (Bytedance)`,
          provider: "bytedance" as const,
          category: model.category,
        }),
      ),
    [mediaType],
  );

  // Combine all model lists and remove duplicates
  const allModels = useMemo(() => {
    // Create a map to track models by their functionality
    const modelMap = new Map();

    // Process fal models first (they take priority)
    falModels.forEach((model) => {
      // Use a more specific identifier that includes functionality hints from the label
      const modelFunction = model.label.toLowerCase().replace(/\s+/g, "_");
      modelMap.set(modelFunction, model);
    });

    // Add bytedance models if not already present with similar functionality
    bytedanceModels.forEach((model) => {
      // Extract the base functionality without the provider suffix
      const modelFunction = model.label
        .split(" (")[0]
        .toLowerCase()
        .replace(/\s+/g, "_");
      if (!modelMap.has(modelFunction)) {
        modelMap.set(modelFunction, model);
      }
    });

    // Add replicate models if not already present
    replicateModelsFiltered.forEach((model) => {
      // Extract the base functionality without the provider suffix
      const modelFunction = model.label
        .split(" (")[0]
        .toLowerCase()
        .replace(/\s+/g, "_");
      if (!modelMap.has(modelFunction)) {
        modelMap.set(modelFunction, model);
      }
    });

    // Sort models alphabetically by label for better organization
    return Array.from(modelMap.values()).sort((a, b) =>
      a.label.localeCompare(b.label),
    );
  }, [falModels, replicateModelsFiltered, bytedanceModels]);

  // Find the currently selected model to display its name
  const selectedModel = useMemo(() => {
    if (!value) return null;

    // First try to find by exact ID match
    let model = allModels.find((m) => m.id === value);

    // If not found, try to match by the model ID part after the provider prefix
    if (!model) {
      model = allModels.find((m) => {
        // Extract the model ID part (after the provider prefix)
        const modelId = m.id.split(":")[1];
        return modelId === value;
      });
    }

    return model;
  }, [value, allModels]);

  const handleValueChange = (value: string) => {
    const model = allModels.find((m) => m.id === value);
    if (model) {
      // Extract the model ID part (after the provider prefix)
      const modelIdPart = value.split(":")[1];
      onValueChange(modelIdPart, model.provider);
    }
  };

  // Helper function to get provider icon
  const getProviderIcon = (provider: ModelProvider) => {
    switch (provider) {
      case "fal":
        return "";
      case "replicate":
        return "";
      case "bytedance":
        return "";
      default:
        return "";
    }
  };

  return (
    <Select
      value={selectedModel ? selectedModel.id : undefined}
      onValueChange={handleValueChange}
      className={className}
    >
      <SelectTrigger className={`text-base w-full font-semibold ${className}`}>
        <SelectValue placeholder="Select a model">
          {selectedModel && (
            <div className="flex flex-row gap-2 items-center">
              <span className="text-sm">
                {getProviderIcon(selectedModel.provider)}
              </span>
              <div className="font-medium">
                {selectedModel.label.split(" (")[0]}
              </div>
            </div>
          )}
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {allModels.map((model) => (
          <SelectItem key={`${model.provider}-${model.id}`} value={model.id}>
            <div className="flex flex-row gap-2 items-center">
              <span className="text-sm">{getProviderIcon(model.provider)}</span>
              <div className="flex-1">
                <div className="font-medium">{model.label.split(" (")[0]}</div>
                <div className="text-xs text-muted-foreground">
                  {model.provider.charAt(0).toUpperCase() +
                    model.provider.slice(1)}
                </div>
                {model.description && (
                  <div className="text-xs text-muted-foreground">
                    {model.description}
                  </div>
                )}
                {model.inputAsset && model.inputAsset.length > 0 && (
                  <div className="text-xs text-blue-400">
                    Required inputs:{" "}
                    {Array.isArray(model.inputAsset)
                      ? model.inputAsset
                          .map((asset) =>
                            typeof asset === "string"
                              ? asset
                              : `${asset.type}${asset.key ? ` (${asset.key})` : ""}`,
                          )
                          .join(", ")
                      : model.inputAsset}
                  </div>
                )}
              </div>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
