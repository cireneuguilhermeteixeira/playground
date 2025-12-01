/** @type {import('jest').Config} */
module.exports = {
  testEnvironment: 'jsdom',

  testMatch: ['**/__tests__/**/*.(test|spec).[jt]s?(x)', '**/?(*.)+(spec|test).[tj]s?(x)'],

  transform: {
    '^.+\\.[tj]sx?$': 'babel-jest',
  },

  moduleNameMapper: {
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
  },

  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],

  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
};
