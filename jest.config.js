// eslint-disable-next-line @typescript-eslint/no-require-imports
const nextJest = require("next/jest");

const createJestConfig = nextJest({
  // Provide the path to your Next.js app to load next.config.js and .env files
  dir: "./",
});

// Add any custom config to be passed to Jest
const customJestConfig = {
  setupFilesAfterEnv: ["<rootDir>/tests/setup/jest.setup.js"],
  testEnvironment: "jest-environment-jsdom",
  testPathIgnorePatterns: ["<rootDir>/.next/", "<rootDir>/node_modules/"],
  testMatch: [
    "<rootDir>/tests/**/*.test.(js|jsx|ts|tsx)",
    "<rootDir>/tests/**/*.spec.(js|jsx|ts|tsx)",
  ],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
  },
  transform: {
    "^.+\\.(js|jsx|ts|tsx)$": [
      "ts-jest",
      {
        tsconfig: {
          jsx: "react-jsx",
        },
      },
    ],
  },
  transformIgnorePatterns: ["node_modules/(?!(jose)/)"],
  collectCoverageFrom: [
    "src/**/*.{js,jsx,ts,tsx}",
    "!src/**/*.d.ts",
    "!src/**/index.ts",
    "!src/app/**/layout.tsx",
    "!src/app/**/loading.tsx",
    "!src/app/**/not-found.tsx",
    "!src/app/**/error.tsx",
    "!src/app/**/page.tsx",
  ],
  coverageDirectory: "coverage",
  coverageReporters: ["text", "lcov", "html", "json-summary"],
  coverageThreshold: {
    global: {
      statements: 60,
      branches: 50,
      functions: 60,
      lines: 60,
    },
    // Thresholds específicos para arquivos de segurança críticos
    "./src/lib/auth-*.ts": {
      statements: 90,
      branches: 85,
      functions: 90,
      lines: 90,
    },
    "./src/lib/check-permission.ts": {
      statements: 90,
      branches: 85,
      functions: 90,
      lines: 90,
    },
    "./src/middleware.ts": {
      statements: 85,
      branches: 80,
      functions: 85,
      lines: 85,
    },
    "./src/actions/auth/*.ts": {
      statements: 85,
      branches: 80,
      functions: 85,
      lines: 85,
    },
  },
  testTimeout: 10000,
  // Desabilitar watch mode por padrão - execução manual apenas
  watchman: false,
  watch: false,
  watchAll: false,
  // Não executar testes automaticamente
  passWithNoTests: true,
  silent: false,
  verbose: true,
};

// createJestConfig is exported this way to ensure that next/jest can load the Next.js config which is async
module.exports = createJestConfig(customJestConfig);
