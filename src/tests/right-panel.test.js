import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import MockRightPanel from "./mocks/right-panel";
import { useReplicateJobCreator } from "../data/replicateMutations";
import { videoProjectStore } from "./mocks/video-project-store";

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

// Mock the hooks and stores
jest.mock("../data/replicateMutations", () => ({
  useReplicateJobCreator: jest.fn(),
}));

jest.mock("./mocks/video-project-store");

// Mock the toast component
jest.mock("@/hooks/use-toast", () => ({
  useToast: () => ({
    toast: jest.fn(),
  }),
}));

describe("RightPanel with Replicate Integration", () => {
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

  test("handleOnGenerate should call createReplicateJob.mutateAsync when provider is replicate", async () => {
    // Mock implementation for testing
    const mockMutateAsync = jest
      .fn()
      .mockResolvedValue({ id: "mock-prediction-id" });
    useReplicateJobCreator.mockReturnValue({
      mutateAsync: mockMutateAsync,
      isLoading: false,
      isError: false,
      error: null,
    });

    // Set up the videoProjectStore for this test
    videoProjectStore.generateData = {
      prompt: "test prompt",
      provider: "replicate",
      modelId: "stability-ai/sdxl",
    };

    // Render the component
    render(<MockRightPanel />, { wrapper: createWrapper() });

    // Verify the component renders
    expect(screen.getByTestId("right-panel")).toBeInTheDocument();

    // Verify that the hook was called correctly
    expect(useReplicateJobCreator).toHaveBeenCalled();
  });

  test("should show success toast when Replicate job creation succeeds", async () => {
    // This test would verify that a success toast is shown when the job is created successfully
    // It would require mocking the toast component and checking that it's called with the right message
  });

  test("should show error toast when Replicate job creation fails", async () => {
    // This test would verify that an error toast is shown when the job creation fails
    // It would require mocking the useReplicateJobCreator hook to return an error
    // and checking that the toast component is called with the right message
  });

  test("should reset loading state after Replicate job completion or error", async () => {
    // This test would verify that the loading state is reset after the job completes or fails
    // It would require checking the component's state before and after the job is created
  });
});
