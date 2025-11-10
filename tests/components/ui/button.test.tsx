import { fireEvent,render, screen } from "@testing-library/react";

import { Button } from "@/components/ui/button";

describe("Button", () => {
  it("renders children correctly", () => {
    render(<Button>Test Button</Button>);
    expect(screen.getByText("Test Button")).toBeInTheDocument();
  });

  it("handles click events", () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Clickable</Button>);

    fireEvent.click(screen.getByText("Clickable"));
    expect(handleClick).toHaveBeenCalled();
  });

  it("can be disabled", () => {
    render(<Button disabled>Disabled Button</Button>);
    expect(screen.getByText("Disabled Button")).toBeDisabled();
  });

  it("applies custom className", () => {
    render(<Button className="custom-class">Custom Button</Button>);
    expect(screen.getByText("Custom Button")).toHaveClass("custom-class");
  });
});
