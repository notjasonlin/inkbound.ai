const nextJest = require('next/jest');

const createJestConfig = nextJest({
  // Provide the path to your Next.js app to load next.config.js and .env files
  dir: './',
});

// Add any custom Jest configuration options here
const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  moduleNameMapper: {
    // Handle module aliases (if any)
    '^@/(.*)$': '<rootDir>/$1',
    // Mock CSS and other static files
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
    // Mock image imports
    '\\.(png|jpg|jpeg|gif|webp|svg)$': '<rootDir>/__mocks__/fileMock.js',
  },
  testEnvironment: 'jest-environment-jsdom',
  transform: {
    '^.+\\.(js|jsx|ts|tsx)$': 'babel-jest',
  },
};

module.exports = createJestConfig(customJestConfig);
