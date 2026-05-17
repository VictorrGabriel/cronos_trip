import type { Config } from "jest";

const config: Config = {
  verbose: true,
  preset: "ts-jest",
  testEnvironment: "node",
  injectGlobals: true,
  collectCoverage: true,
  extensionsToTreatAsEsm: [".ts"],
  collectCoverageFrom: [
    "src/modules/**/*.ts",
    "!src/modules/**/*.contract.ts",
    "!src/modules/**/index.ts",
    "!src/modules/**/tests/**/*.spec.ts",
    "!**/node_modules/**",
    "!**/vendor/**",
  ],
  transform: {
    "^.+\\.(ts|js)$": ["ts-jest", { useESM: true }],
  },
  transformIgnorePatterns: ["node_modules/(?!(nanoid)/)"],
  testMatch: ["**/**/tests/**/*.spec.ts"],
  coverageDirectory: "coverage",
  coverageProvider: "v8",
  reporters: ["default"],
  setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
  rootDir: "./",
  moduleFileExtensions: ["ts", "js", "json", "node"],
  moduleNameMapper: {
    "@/(.*)$": "<rootDir>/src/$1",
    "@lib/(.*)$": "<rootDir>/lib/$1",
    "@modules/(.*)$": "<rootDir>/src/modules/$1",
    "@shared/(.*)$": "<rootDir>/src/shared/$1",
  },
};

export default config;
