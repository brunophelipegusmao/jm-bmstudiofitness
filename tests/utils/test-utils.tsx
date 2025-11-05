import { render, RenderOptions } from "@testing-library/react";
import { ReactElement } from "react";

// Mock do ToastProvider para testes
const MockToastProvider = ({ children }: { children: React.ReactNode }) => {
  return <>{children}</>;
};

// Wrapper customizado para renderização de testes
const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  return <MockToastProvider>{children}</MockToastProvider>;
};

// Função customizada de render
const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, "wrapper">,
) => render(ui, { wrapper: AllTheProviders, ...options });

// Re-export tudo
export * from "@testing-library/react";

// Override render method
export { customRender as render };
