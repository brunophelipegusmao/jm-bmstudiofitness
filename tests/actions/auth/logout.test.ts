import { logoutAction } from "@/actions/auth/logout-action";

const mockSet = jest.fn();

// Mock do next/headers
jest.mock("next/headers", () => ({
  cookies: () => ({
    set: mockSet,
  }),
}));

describe("logoutAction", () => {
  beforeEach(() => {
    mockSet.mockClear();
  });

  it("should return success on successful logout", async () => {
    const result = await logoutAction();
    expect(result).toEqual({ success: true });
  });

  it("should clear auth-token cookie", async () => {
    await logoutAction();
    expect(mockSet).toHaveBeenCalledWith(
      "auth-token",
      "",
      expect.objectContaining({
        maxAge: 0,
        expires: new Date(0),
      }),
    );
  });

  it("should clear other auth related cookies", async () => {
    await logoutAction();
    expect(mockSet).toHaveBeenCalledWith(
      "user",
      "",
      expect.objectContaining({
        maxAge: 0,
        expires: new Date(0),
      }),
    );
  });
});
