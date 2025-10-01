// Mock implementation for replicateMutations.ts

export const mockMutateAsync = jest.fn().mockResolvedValue({ id: 'mock-prediction-id' });

export const useReplicateJobCreator = jest.fn().mockReturnValue({
  mutateAsync: mockMutateAsync,
  isLoading: false,
  isError: false,
  error: null,
});