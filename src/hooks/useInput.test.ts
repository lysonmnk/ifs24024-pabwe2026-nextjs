import { describe, it, expect } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useInput } from "./useInput";
import { ChangeEvent } from "react";

describe("useInput", () => {
  it("should initialize with default value", () => {
    const { result } = renderHook(() => useInput("initial"));
    const [value] = result.current;
    expect(value).toBe("initial");
    expect(result.current.value).toBe("initial");
  });

  it("should initialize with empty string when no argument passed", () => {
    const { result } = renderHook(() => useInput());
    const [value] = result.current;
    expect(value).toBe("");
  });

  it("should update value via change event", () => {
    const { result } = renderHook(() => useInput(""));

    act(() => {
      const event = {
        target: { value: "hello" },
      } as ChangeEvent<HTMLInputElement>;
      result.current.onChange(event);
    });

    expect(result.current[0]).toBe("hello");
    expect(result.current.value).toBe("hello");
  });

  it("should update value via direct string input to onChange", () => {
    const { result } = renderHook(() => useInput(""));

    act(() => {
      result.current.onChange("direct text");
    });

    expect(result.current[0]).toBe("direct text");
    expect(result.current.value).toBe("direct text");
  });

  it("should update value via setValue directly", () => {
    const { result } = renderHook(() => useInput("old"));

    act(() => {
      result.current.setValue("new value");
    });

    expect(result.current[0]).toBe("new value");
    expect(result.current.value).toBe("new value");
  });

  it("should reset value to initial value on reset", () => {
    const { result } = renderHook(() => useInput("start"));

    act(() => {
      result.current.setValue("changed");
    });
    expect(result.current.value).toBe("changed");

    act(() => {
      result.current.reset();
    });
    expect(result.current.value).toBe("start");
  });
});
