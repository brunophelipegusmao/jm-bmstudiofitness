import { formatCPF } from "../../src/lib/utils";

describe("Utils Functions", () => {
  describe("formatCPF", () => {
    it("should format valid CPF correctly", () => {
      expect(formatCPF("12345678901")).toBe("123.456.789-01");
      expect(formatCPF("98765432100")).toBe("987.654.321-00");
    });

    it("should handle CPF with existing formatting", () => {
      expect(formatCPF("123.456.789-01")).toBe("123.456.789-01");
      expect(formatCPF("123.456.789.01")).toBe("123.456.789-01");
    });

    it("should handle partial CPF", () => {
      expect(formatCPF("123")).toBe("123");
      expect(formatCPF("12345")).toBe("12345");
      expect(formatCPF("12345678")).toBe("12345678");
    });

    it("should handle empty or invalid input", () => {
      expect(formatCPF("")).toBe("");
      expect(formatCPF("abc")).toBe("");
      expect(formatCPF("123abc")).toBe("123");
    });

    it("should handle CPF longer than expected", () => {
      // A função só formata os primeiros 11 dígitos
      expect(formatCPF("123456789012345")).toBe("123.456.789-012345");
    });
  });
});
