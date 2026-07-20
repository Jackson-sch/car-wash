// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, act } from "@testing-library/react";
import { ThemeProvider, useTheme } from "@/components/shared/theme-provider";

// Mock browser APIs that jsdom doesn't implement
beforeEach(() => {
  // Mock window.matchMedia (not implemented in jsdom)
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    value: vi.fn().mockImplementation((query: string) => ({
      matches: true,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });

  // Mock requestAnimationFrame to fire synchronously
  let rafId = 0;
  window.requestAnimationFrame = vi.fn().mockImplementation((cb: FrameRequestCallback) => {
    cb(++rafId);
    return rafId;
  });
  window.cancelAnimationFrame = vi.fn();

  // Clean up DOM between tests
  document.documentElement.classList.remove("dark", "preload");
  localStorage.clear();
});

// Wrapper component to test useTheme
function TestConsumer() {
  const { theme, toggleTheme } = useTheme();
  return (
    <div>
      <span data-testid="theme-value">{theme}</span>
      <button data-testid="toggle-btn" onClick={toggleTheme}>
        Toggle
      </button>
    </div>
  );
}

describe("ThemeProvider", () => {
  it("renders children correctly", () => {
    render(
      <ThemeProvider>
        <div data-testid="child">Hello</div>
      </ThemeProvider>
    );
    expect(screen.getByTestId("child")).toBeDefined();
    expect(screen.getByText("Hello")).toBeDefined();
  });

  it("initializes with 'dark' theme by default when no localStorage or system preference", () => {
    render(
      <ThemeProvider>
        <TestConsumer />
      </ThemeProvider>
    );
    expect(screen.getByTestId("theme-value").textContent).toBe("dark");
  });

  it("reads theme from localStorage if available", () => {
    localStorage.setItem("theme", "light");
    render(
      <ThemeProvider>
        <TestConsumer />
      </ThemeProvider>
    );
    expect(screen.getByTestId("theme-value").textContent).toBe("light");
  });

  it("adds 'dark' class to documentElement when theme is dark", () => {
    render(
      <ThemeProvider>
        <TestConsumer />
      </ThemeProvider>
    );
    expect(document.documentElement.classList.contains("dark")).toBe(true);
  });

  it("removes 'dark' class from documentElement when theme is light", () => {
    localStorage.setItem("theme", "light");
    render(
      <ThemeProvider>
        <TestConsumer />
      </ThemeProvider>
    );
    expect(document.documentElement.classList.contains("dark")).toBe(false);
  });

  it("toggleTheme switches from dark to light and updates localStorage", () => {
    render(
      <ThemeProvider>
        <TestConsumer />
      </ThemeProvider>
    );
    expect(screen.getByTestId("theme-value").textContent).toBe("dark");

    act(() => {
      screen.getByTestId("toggle-btn").click();
    });

    expect(screen.getByTestId("theme-value").textContent).toBe("light");
    expect(localStorage.getItem("theme")).toBe("light");
    expect(document.documentElement.classList.contains("dark")).toBe(false);
  });

  it("toggleTheme switches from light to dark and updates localStorage", () => {
    localStorage.setItem("theme", "light");
    render(
      <ThemeProvider>
        <TestConsumer />
      </ThemeProvider>
    );
    expect(screen.getByTestId("theme-value").textContent).toBe("light");

    act(() => {
      screen.getByTestId("toggle-btn").click();
    });

    expect(screen.getByTestId("theme-value").textContent).toBe("dark");
    expect(localStorage.getItem("theme")).toBe("dark");
    expect(document.documentElement.classList.contains("dark")).toBe(true);
  });

  it("removes 'preload' class after mounting (via mocked requestAnimationFrame)", () => {
    document.documentElement.classList.add("preload");
    render(
      <ThemeProvider>
        <div />
      </ThemeProvider>
    );
    // rAF is mocked to fire synchronously, so preload should be removed immediately
    expect(document.documentElement.classList.contains("preload")).toBe(false);
  });
});

describe("useTheme", () => {
  it("throws an error when used outside ThemeProvider", () => {
    // Suppress console.error for the expected React error
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    function BrokenComponent() {
      useTheme();
      return null;
    }

    expect(() => render(<BrokenComponent />)).toThrow(
      "useTheme must be used within a ThemeProvider"
    );

    consoleSpy.mockRestore();
  });
});
