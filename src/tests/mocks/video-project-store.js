// Mock implementation of the video-project-store for testing

export const videoProjectStore = {
  generateData: {
    prompt: 'test prompt',
    provider: 'replicate',
    modelId: 'stability-ai/sdxl',
  },
  setGenerateData: jest.fn(),
  onGenerate: null,
  setOnGenerate: jest.fn(),
  selectedMedia: null,
  setSelectedMedia: jest.fn(),
  isGenerating: false,
  setIsGenerating: jest.fn().mockImplementation(function(value) {
    this.isGenerating = value;
  }),
};