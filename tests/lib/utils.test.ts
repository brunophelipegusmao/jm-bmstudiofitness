import { formatCPF } from "@/lib/utils";

describe("Utils", () => {
  describe("formatCPF", () => {
    it("should format a valid CPF string", () => {
      expect(formatCPF("12345678909")).toBe("123.456.789-09");
    });

    it("should handle CPF with existing formatting", () => {
      expect(formatCPF("123.456.789-09")).toBe("123.456.789-09");
    });

    it("should return empty string for invalid input", () => {
      expect(formatCPF("")).toBe("");
      expect(formatCPF("123")).toBe("123");
    });
  });
});
