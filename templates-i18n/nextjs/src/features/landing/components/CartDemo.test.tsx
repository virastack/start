import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { CartDemo } from "@/features/landing/components/CartDemo";
import { renderWithProviders } from "@/test/render";

describe("CartDemo", () => {
  it("adds items and enables removing them", async () => {
    const user = userEvent.setup();
    renderWithProviders(<CartDemo />);

    const decrement = screen.getByRole("button", { name: "Decrement" });
    expect(decrement).toBeDisabled();

    await user.click(screen.getByRole("button", { name: "Increment" }));
    await user.click(screen.getByRole("button", { name: "Increment" }));

    expect(screen.getByText("700")).toBeInTheDocument();
    expect(decrement).toBeEnabled();
  });
});
