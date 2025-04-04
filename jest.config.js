module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  clearMocks: true,
  setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
};