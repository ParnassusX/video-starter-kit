// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
import '@testing-library/jest-dom';

// Add TextEncoder and TextDecoder polyfills for Node.js environment
global.TextEncoder = require('util').TextEncoder;
global.TextDecoder = require('util').TextDecoder;

// Mock the next/router
jest.mock('next/router', () => ({
  useRouter: () => ({
    push: jest.fn(),
    pathname: '/',
    query: {},
  }),
}));

// Mock the replicate client
jest.mock('replicate', () => {
  return {
    __esModule: true,
    default: jest.fn().mockImplementation(() => ({
      run: jest.fn().mockResolvedValue({ id: 'mock-prediction-id', output: 'mock-output' }),
      predictions: {
        get: jest.fn().mockResolvedValue({ status: 'succeeded', output: 'mock-output' }),
      },
    })),
  };
});

// Mock the environment variables
process.env.NEXT_PUBLIC_REPLICATE_API_KEY = 'test-api-key';