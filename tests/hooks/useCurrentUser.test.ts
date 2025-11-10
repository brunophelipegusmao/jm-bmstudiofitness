import { act, renderHook, waitFor } from "@testing-library/react";

import { useCurrentUser } from "@/hooks/useCurrentUser";

// Mock do fetch global
const mockFetch = jest.fn();
global.fetch = mockFetch;

describe("useCurrentUser", () => {
  beforeEach(() => {
    mockFetch.mockClear();
  });

  it("should return loading state initially", () => {
    const { result } = renderHook(() => useCurrentUser());

    expect(result.current.loading).toBe(true);
    expect(result.current.user).toBeNull();
  });

  it("should fetch and set user data", async () => {
    const mockUser = {
      name: "Test User",
      email: "test@example.com",
      role: "admin",
    };

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockUser,
    });

    const { result } = renderHook(() => useCurrentUser());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.user).toEqual(mockUser);
  });

  it("should handle fetch error", async () => {
    mockFetch.mockRejectedValueOnce(new Error("Failed to fetch"));

    const { result } = renderHook(() => useCurrentUser());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.user).toBeNull();
  });
});
