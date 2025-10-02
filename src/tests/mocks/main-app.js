// Mock implementation of the main App component for testing

import React from "react";
import { useReplicateJobCreator } from "../../data/replicateMutations";
import { videoProjectStore } from "./video-project-store";

export function App({ projectId, queryClient }) {
  // Call the hook to ensure it's registered
  const createReplicateJob = useReplicateJobCreator({
    projectId,
    modelId: videoProjectStore.generateData.modelId || "stability-ai/sdxl",
    mediaType: "image",
    input: {
      prompt: videoProjectStore.generateData.prompt,
    },
  });

  const handleGenerate = async () => {
    try {
      // Set loading state
      videoProjectStore.setIsGenerating(true);

      // Call mutateAsync and then manually call the onSuccess callback
      const result = await createReplicateJob.mutateAsync({
        modelId: videoProjectStore.generateData.modelId || "stability-ai/sdxl",
        input: {
          prompt: videoProjectStore.generateData.prompt,
        },
      });

      // Simulate the onSuccess callback
      const { db } = require("../../data/db");
      await db.media.create({
        projectId,
        createdAt: Date.now(),
        mediaType: "image",
        kind: "generated",
        endpointId: `replicate:${videoProjectStore.generateData.modelId || "stability-ai/sdxl"}`,
        requestId: result.id,
        status: "pending",
        input: {
          prompt: videoProjectStore.generateData.prompt,
        },
      });

      // Invalidate queries to refresh UI
      if (queryClient && queryClient.invalidateQueries) {
        queryClient.invalidateQueries(["projectMediaItems", projectId]);
      }

      // Show success toast
      const { toast } = require("../../hooks/use-toast");
      toast({
        title: "Job submitted successfully",
        description: "Your generation job has been submitted successfully.",
        status: "success",
      });

      // Reset loading state
      videoProjectStore.setIsGenerating(false);
    } catch (error) {
      console.error("Error generating with Replicate:", error);
      // Reset loading state on error
      videoProjectStore.setIsGenerating(false);
    }
  };

  const handleFileUpload = async (e) => {
    try {
      const file = e.target.files[0];
      if (!file) return;

      // Create object URL for preview
      const url = URL.createObjectURL(file);

      // Simulate file upload
      const { db } = require("../../data/db");
      await db.media.create({
        projectId,
        createdAt: Date.now(),
        mediaType: "image",
        kind: "uploaded",
        url,
        status: "completed",
      });

      // Invalidate queries to refresh UI
      if (queryClient && queryClient.invalidateQueries) {
        queryClient.invalidateQueries(["projectMediaItems", projectId]);
      }

      // Show success toast
      const { toast } = require("../../hooks/use-toast");
      toast({
        title: "File uploaded successfully",
        description: "Your file has been uploaded successfully.",
        status: "success",
      });
    } catch (error) {
      console.error("Error uploading file:", error);
    }
  };

  return (
    <div data-testid="main-app">
      <header data-testid="app-header">App Header</header>
      <main>
        <div data-testid="left-panel">Left Panel</div>
        <div data-testid="video-preview">Video Preview</div>
        <div data-testid="right-panel">
          <h2>Generate Content</h2>
          <textarea
            data-testid="prompt-input"
            placeholder="Enter your prompt"
            value={videoProjectStore.generateData.prompt}
            onChange={(e) =>
              videoProjectStore.setGenerateData({ prompt: e.target.value })
            }
          />
          <button
            data-testid="generate-button"
            onClick={handleGenerate}
            disabled={videoProjectStore.isGenerating}
          >
            Generate
          </button>
          {videoProjectStore.isGenerating && (
            <div data-testid="loading-indicator">Loading...</div>
          )}
          <div>
            <input
              type="file"
              data-testid="file-upload-input"
              onChange={handleFileUpload}
              accept="image/*,video/*"
            />
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
