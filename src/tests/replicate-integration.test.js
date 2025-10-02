import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { generateWithReplicate, getPrediction } from "../lib/replicate";
import { useReplicateJobCreator } from "../data/replicateMutations";

// Create a wrapper for the components that need React Query
const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });
  return ({ children }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

// Mock the hooks
jest.mock("../data/replicateMutations", () => ({
  useReplicateJobCreator: jest.fn(),
}));

describe("Replicate Integration", () => {
  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();

    // Mock the useReplicateJobCreator hook
    useReplicateJobCreator.mockReturnValue({
      mutateAsync: jest.fn().mockResolvedValue({ id: "mock-prediction-id" }),
      isLoading: false,
      isError: false,
      error: null,
    });
  });

  test("generateWithReplicate should call replicate.run with correct parameters", async () => {
    const modelId = "stability-ai/sdxl";
    const version =
      "39ed52f2a78e934b3ba6e2a89f5b1c712de7dfea535525255b1aa35c5565e08b";
    const input = { prompt: "test prompt" };

    const result = await generateWithReplicate(modelId, version, input);

    expect(result).toEqual({ id: "mock-prediction-id", output: "mock-output" });
  });

  test("getPrediction should call replicate.predictions.get with correct parameters", async () => {
    const predictionId = "mock-prediction-id";

    const result = await getPrediction(predictionId);

    expect(result).toEqual({ status: "succeeded", output: "mock-output" });
  });

  test("useReplicateJobCreator should return a mutation function", async () => {
    const { mutateAsync } = useReplicateJobCreator();

    const result = await mutateAsync({
      modelId: "stability-ai/sdxl",
      version:
        "39ed52f2a78e934b3ba6e2a89f5b1c712de7dfea535525255b1aa35c5565e08b",
      input: { prompt: "test prompt" },
    });

    expect(result).toEqual({ id: "mock-prediction-id" });
    expect(useReplicateJobCreator).toHaveBeenCalled();
  });
});
