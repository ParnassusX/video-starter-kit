// Mock implementation of the RightPanel component for testing

import React, { useEffect } from "react";
import { useReplicateJobCreator } from "../../data/replicateMutations";
import { videoProjectStore } from "./video-project-store";

const MockRightPanel = () => {
  // Call the hook to ensure it's registered
  useReplicateJobCreator();

  // Simulate component mounting and potentially calling the hook
  useEffect(() => {
    // This simulates the component using the hook
    if (videoProjectStore.generateData.provider === "replicate") {
      // Just accessing the hook is enough for the test
    }
  }, []);

  return <div data-testid="right-panel">Mocked Right Panel</div>;
};

export default MockRightPanel;
