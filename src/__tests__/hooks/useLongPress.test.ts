import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useLongPress } from "@/hooks/useLongPress";

// Mock requestAnimationFrame to use setTimeout for testability
let rafCallbacks: Array<(time: number) => void> = [];
let rafId = 0;
let mockTime = 0;

beforeEach(() => {
  rafCallbacks = [];
  rafId = 0;
  mockTime = 0;

  vi.spyOn(globalThis, "requestAnimationFrame").mockImplementation((cb) => {
    rafCallbacks.push(cb);
    return ++rafId;
  });

  vi.spyOn(globalThis, "cancelAnimationFrame").mockImplementation(() => {
    rafCallbacks = [];
  });

  vi.spyOn(performance, "now").mockImplementation(() => mockTime);
});

afterEach(() => {
  vi.restoreAllMocks();
});

function flushRAF() {
  const cbs = [...rafCallbacks];
  rafCallbacks = [];
  cbs.forEach((cb) => cb(mockTime));
}

function createPointerEvent(button = 0) {
  return { button } as React.PointerEvent;
}

describe("useLongPress", () => {
  it("has correct initial state", () => {
    const { result } = renderHook(() => useLongPress({ duration: 5000 }));

    expect(result.current.progress).toBe(0);
    expect(result.current.isPressed).toBe(false);
  });

  it("sets isPressed on pointer down", () => {
    const { result } = renderHook(() => useLongPress({ duration: 5000 }));

    act(() => {
      result.current.handlers.onPointerDown(createPointerEvent());
    });

    expect(result.current.isPressed).toBe(true);
  });

  it("resets on pointer up before completion", () => {
    const onComplete = vi.fn();
    const { result } = renderHook(() =>
      useLongPress({ duration: 5000, onComplete })
    );

    act(() => {
      result.current.handlers.onPointerDown(createPointerEvent());
    });

    // Advance time halfway
    mockTime = 2500;
    act(() => flushRAF());

    expect(result.current.progress).toBeGreaterThan(0);
    expect(result.current.progress).toBeLessThan(1);

    // Release before completion
    act(() => {
      result.current.handlers.onPointerUp();
    });

    expect(result.current.progress).toBe(0);
    expect(result.current.isPressed).toBe(false);
    expect(onComplete).not.toHaveBeenCalled();
  });

  it("fires onComplete after full duration", () => {
    const onComplete = vi.fn();
    const { result } = renderHook(() =>
      useLongPress({ duration: 5000, onComplete })
    );

    act(() => {
      result.current.handlers.onPointerDown(createPointerEvent());
    });

    // Advance to completion
    mockTime = 5000;
    act(() => flushRAF());

    expect(result.current.progress).toBe(1);
    expect(result.current.isPressed).toBe(false);
    expect(onComplete).toHaveBeenCalledTimes(1);
  });

  it("fires onComplete only once", () => {
    const onComplete = vi.fn();
    const { result } = renderHook(() =>
      useLongPress({ duration: 5000, onComplete })
    );

    act(() => {
      result.current.handlers.onPointerDown(createPointerEvent());
    });

    mockTime = 5000;
    act(() => flushRAF());

    // Try to flush again — should not fire twice
    mockTime = 6000;
    act(() => flushRAF());

    expect(onComplete).toHaveBeenCalledTimes(1);
  });

  it("resets on pointer leave", () => {
    const { result } = renderHook(() => useLongPress({ duration: 5000 }));

    act(() => {
      result.current.handlers.onPointerDown(createPointerEvent());
    });

    mockTime = 1000;
    act(() => flushRAF());

    act(() => {
      result.current.handlers.onPointerLeave();
    });

    expect(result.current.progress).toBe(0);
    expect(result.current.isPressed).toBe(false);
  });

  it("ignores non-primary button", () => {
    const { result } = renderHook(() => useLongPress({ duration: 5000 }));

    act(() => {
      result.current.handlers.onPointerDown(createPointerEvent(2)); // right-click
    });

    expect(result.current.isPressed).toBe(false);
    expect(result.current.progress).toBe(0);
  });

  it("reset allows re-press after completion", () => {
    const onComplete = vi.fn();
    const { result } = renderHook(() =>
      useLongPress({ duration: 5000, onComplete })
    );

    // First press to completion
    act(() => {
      result.current.handlers.onPointerDown(createPointerEvent());
    });
    mockTime = 5000;
    act(() => flushRAF());
    expect(onComplete).toHaveBeenCalledTimes(1);

    // Reset
    act(() => {
      result.current.reset();
    });
    expect(result.current.progress).toBe(0);

    // Second press
    mockTime = 5001; // new start time
    act(() => {
      result.current.handlers.onPointerDown(createPointerEvent());
    });
    mockTime = 10001;
    act(() => flushRAF());

    expect(onComplete).toHaveBeenCalledTimes(2);
  });

  it("keeps callback ref fresh", () => {
    const onComplete1 = vi.fn();
    const onComplete2 = vi.fn();

    const { result, rerender } = renderHook(
      ({ onComplete }) => useLongPress({ duration: 5000, onComplete }),
      { initialProps: { onComplete: onComplete1 } }
    );

    // Update the callback
    rerender({ onComplete: onComplete2 });

    // Press to completion — should call the updated callback
    act(() => {
      result.current.handlers.onPointerDown(createPointerEvent());
    });
    mockTime = 5000;
    act(() => flushRAF());

    expect(onComplete1).not.toHaveBeenCalled();
    expect(onComplete2).toHaveBeenCalledTimes(1);
  });
});
