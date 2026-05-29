/** @type {import('jest').Config} */
module.exports = {
  clearMocks: true,
  collectCoverageFrom: [
    'app/**/*.{ts,tsx}',
    'server/**/*.ts',
    'backend/src/**/*.{js,ts}',
    '!app/**/*.d.ts',
    '!app/main.tsx',
  ],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
  moduleNameMapper: {
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
    '\\.(jpg|jpeg|png|gif|webp|avif|svg)$': '<rootDir>/test/__mocks__/fileMock.cjs',
  },
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  testEnvironment: 'jsdom',
  testMatch: ['<rootDir>/**/*.test.{ts,tsx,js}'],
  transform: {
    '^.+\\.(ts|tsx)$': [
      'ts-jest',
      {
        tsconfig: {
          esModuleInterop: true,
          ignoreDeprecations: '6.0',
          jsx: 'react-jsx',
          module: 'CommonJS',
          moduleResolution: 'Node10',
        },
      },
    ],
  },
};
