import { createElement, useState } from "react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { Input } from "@/components/ui/input";

function ControlledInputHarness() {
  const [value, setValue] = useState("");

  return createElement(
    "form",
    null,
    createElement("label", { htmlFor: "input-contract" }, "输入"),
    createElement(Input, {
      id: "input-contract",
      value,
      onChange: (event) => setValue(event.currentTarget.value),
    }),
    createElement(
      "button",
      {
        disabled: value.trim().length < 3,
        type: "submit",
      },
      "提交",
    ),
  );
}

afterEach(() => {
  cleanup();
});

describe("Input", () => {
  it("propagates browser input events through the standard controlled input contract", () => {
    render(createElement(ControlledInputHarness));

    const input = screen.getByLabelText("输入");
    const submitButton = screen.getByRole("button", { name: "提交" });

    expect(submitButton).toBeDisabled();

    fireEvent.input(input, { target: { value: "abc" } });

    expect(input).toHaveValue("abc");
    expect(submitButton).toBeEnabled();
  });
});
