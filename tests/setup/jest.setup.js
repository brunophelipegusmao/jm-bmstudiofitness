import "@testing-library/jest-dom";

// Polyfill TextEncoder/TextDecoder for Jest (Node environment)
if (typeof global.TextEncoder === "undefined") {
  // util.TextEncoder exists in Node.js
   
  const { TextEncoder, TextDecoder } = require("util");
  global.TextEncoder = TextEncoder;
  global.TextDecoder = TextDecoder;
}

// Mock jose (JWT library for Edge Runtime)
jest.mock("jose", () => ({
  SignJWT: jest.fn().mockImplementation(() => ({
    setProtectedHeader: jest.fn().mockReturnThis(),
    setIssuedAt: jest.fn().mockReturnThis(),
    setExpirationTime: jest.fn().mockReturnThis(),
    sign: jest.fn().mockResolvedValue("mocked-jwt-token"),
  })),
  jwtVerify: jest.fn().mockResolvedValue({
    payload: {
      userId: "mock-user-id",
      email: "mock@example.com",
      role: "aluno",
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60,
    },
  }),
}));

// Robust mock for '@/db' to ensure chainable `select().from().innerJoin().where().limit()` behavior
// and that tests can call jest methods on `db.select` such as mockReturnValue/mockRejectedValue.
(() => {
  const createChain = (resolved = []) => {
    const mockLimit = jest.fn().mockResolvedValue(resolved);
    const mockWhere = jest.fn().mockReturnValue({ limit: mockLimit });
    const mockInnerJoin = jest.fn().mockReturnValue({ where: mockWhere });
    const mockFrom = jest.fn().mockReturnValue({ innerJoin: mockInnerJoin });

    return {
      mockLimit,
      mockWhere,
      mockInnerJoin,
      mockFrom,
      chain: { from: mockFrom },
    };
  };

  const base = createChain([]);

  const select = jest.fn().mockImplementation(() => base.chain);

  const dbMock = {
    select,
    // Utility to adjust default resolved value across tests if desired
    __setDefaultResult: (res) => {
      const next = createChain(res);
      select.mockImplementation(() => next.chain);
    },
  };

  jest.mock("@/db", () => ({ db: dbMock }));
})();

// Mock next/router
jest.mock("next/router", () => ({
  useRouter() {
    return {
      route: "/",
      pathname: "/",
      query: {},
      asPath: "/",
      push: jest.fn(),
      pop: jest.fn(),
      reload: jest.fn(),
      back: jest.fn(),
      prefetch: jest.fn().mockResolvedValue(undefined),
      beforePopState: jest.fn(),
      events: {
        on: jest.fn(),
        off: jest.fn(),
        emit: jest.fn(),
      },
      isFallback: false,
    };
  },
}));

// Mock next/navigation
jest.mock("next/navigation", () => ({
  useRouter() {
    return {
      push: jest.fn(),
      replace: jest.fn(),
      back: jest.fn(),
      forward: jest.fn(),
      refresh: jest.fn(),
      prefetch: jest.fn(),
    };
  },
  usePathname: () => "/",
  useSearchParams: () => new URLSearchParams(),
}));

// Mock Framer Motion
jest.mock("framer-motion", () => ({
  motion: {
    div: "div",
    button: "button",
    span: "span",
    p: "p",
    h1: "h1",
    h2: "h2",
    h3: "h3",
    section: "section",
    article: "article",
  },
  AnimatePresence: ({ children }) => children,
  useAnimation: () => ({
    start: jest.fn(),
    stop: jest.fn(),
    set: jest.fn(),
  }),
}));

// Mock react-toastify
jest.mock("react-toastify", () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
    info: jest.fn(),
    warning: jest.fn(),
  },
  ToastContainer: () => null,
}));

// Global test timeout
jest.setTimeout(10000);
