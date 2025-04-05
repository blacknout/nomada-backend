module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  clearMocks: true,
  setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
  testMatch: ['**/__tests__/**/*.test.ts'], // or your preferred test pattern
  moduleFileExtensions: ['ts', 'js', 'json', 'node'],
};