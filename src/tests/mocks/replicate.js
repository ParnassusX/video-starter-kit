// Mock implementation of the Replicate client for testing
const mockReplicate = {
  run: jest.fn().mockResolvedValue({
    id: 'mock-prediction-id',
    status: 'succeeded',
    output: 'https://example.com/mock-output.mp4',
  }),
  predictions: {
    get: jest.fn().mockResolvedValue({
      id: 'mock-prediction-id',
      status: 'succeeded',
      output: 'https://example.com/mock-output.mp4',
    }),
  },
};

const Replicate = jest.fn().mockImplementation(() => mockReplicate);

export default Replicate;
export { mockReplicate };