import { toast } from "react-toastify";

import {
  showErrorToast,
  showInfoToast,
  showSuccessToast,
  ToastProvider,
} from "../../src/components/ToastProvider";
import { render, screen } from "../utils/test-utils";

// Mock do react-toastify
jest.mock("react-toastify", () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
    info: jest.fn(),
  },
  ToastContainer: ({ children }: { children?: React.ReactNode }) => (
    <div data-testid="toast-container">{children}</div>
  ),
}));

describe("ToastProvider", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Component Rendering", () => {
    it("should render ToastContainer", () => {
      render(<ToastProvider />);

      const toastContainer = screen.getByTestId("toast-container");
      expect(toastContainer).toBeInTheDocument();
    });
  });

  describe("Toast Functions", () => {
    it("should call toast.success with correct parameters", () => {
      const message = "Operação realizada com sucesso!";

      showSuccessToast(message);

      expect(toast.success).toHaveBeenCalledWith(message, {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        className:
          "!bg-gradient-to-r !from-[#C2A537] !to-[#D4B547] !text-black !font-medium",
        progressClassName: "!bg-black/20",
      });
    });

    it("should call toast.error with correct parameters", () => {
      const message = "Erro ao processar operação!";

      showErrorToast(message);

      expect(toast.error).toHaveBeenCalledWith(message, {
        position: "top-right",
        autoClose: 4000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        className:
          "!bg-gradient-to-r !from-red-600 !to-red-700 !text-white !font-medium",
        progressClassName: "!bg-white/20",
      });
    });

    it("should call toast.info with correct parameters", () => {
      const message = "Informação importante!";

      showInfoToast(message);

      expect(toast.info).toHaveBeenCalledWith(message, {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        className:
          "!bg-gradient-to-r !from-blue-600 !to-blue-700 !text-white !font-medium",
        progressClassName: "!bg-white/20",
      });
    });
  });

  describe("Toast Configuration", () => {
    it("should have correct autoClose times", () => {
      showSuccessToast("success");
      showErrorToast("error");
      showInfoToast("info");

      // Verifica se success e info têm 3000ms
      expect(toast.success).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({ autoClose: 3000 }),
      );
      expect(toast.info).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({ autoClose: 3000 }),
      );

      // Verifica se error tem 4000ms
      expect(toast.error).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({ autoClose: 4000 }),
      );
    });

    it("should have consistent positioning", () => {
      showSuccessToast("test");
      showErrorToast("test");
      showInfoToast("test");

      const expectedPosition = "top-right";

      expect(toast.success).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({ position: expectedPosition }),
      );
      expect(toast.error).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({ position: expectedPosition }),
      );
      expect(toast.info).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({ position: expectedPosition }),
      );
    });

    it("should have theme-specific styling", () => {
      showSuccessToast("success");
      showErrorToast("error");
      showInfoToast("info");

      // Success - golden theme
      expect(toast.success).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          className:
            "!bg-gradient-to-r !from-[#C2A537] !to-[#D4B547] !text-black !font-medium",
        }),
      );

      // Error - red theme
      expect(toast.error).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          className:
            "!bg-gradient-to-r !from-red-600 !to-red-700 !text-white !font-medium",
        }),
      );

      // Info - blue theme
      expect(toast.info).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          className:
            "!bg-gradient-to-r !from-blue-600 !to-blue-700 !text-white !font-medium",
        }),
      );
    });
  });
});
