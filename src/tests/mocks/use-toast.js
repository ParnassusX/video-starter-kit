// Mock implementation of the use-toast hook for testing

export const useToast = jest.fn().mockReturnValue({
  toast: jest.fn(),
  dismiss: jest.fn(),
});