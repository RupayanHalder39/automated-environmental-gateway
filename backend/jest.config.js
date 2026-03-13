// Jest config for TypeScript + Supertest integration tests.
// Keeps tests simple and runs directly against the Express app.

module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  roots: ["<rootDir>/tests"],
  testMatch: ["**/*.test.ts"],
  verbose: true,
};
