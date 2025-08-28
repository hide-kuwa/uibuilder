module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  roots: ['<rootDir>/src'],
  collectCoverageFrom: ['src/PageRenderer.tsx', 'src/applyPageDiff.ts'],
  globals: {
    'ts-jest': { tsconfig: 'tsconfig.json' },
  },
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/web/$1',
  },
};
