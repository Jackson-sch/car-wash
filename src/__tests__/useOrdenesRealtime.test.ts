// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useOrdenesRealtime } from "@/app/(dashboard)/ordenes/hooks/useOrdenesRealtime";

// Mock the Supabase client module at module level
// Use vi.hoisted() to ensure mock variables are initialized before vi.mock() runs
const { mockUnsubscribe, mockOn, mockSubscribe, mockChannel, mockGetOrdenById } = vi.hoisted(() => {
  const mockUnsubscribe = vi.fn();
  const mockOn = vi.fn().mockReturnThis();
  const mockSubscribe = vi.fn().mockReturnValue({ unsubscribe: mockUnsubscribe });
  const mockChannel = vi.fn(() => ({
    on: mockOn,
    subscribe: mockSubscribe,
    unsubscribe: mockUnsubscribe,
  }));
  const mockGetOrdenById = vi.fn();
  return { mockUnsubscribe, mockOn, mockSubscribe, mockChannel, mockGetOrdenById };
});

vi.mock("@/lib/client", () => ({
  createClient: vi.fn(() => ({
    channel: mockChannel,
  })),
}));

vi.mock("@/lib/actions/ordenes", () => ({
  getOrdenById: (...args: unknown[]) => mockGetOrdenById(...args),
}));

// Helper: create a sample order detail returned by getOrdenById
function createSampleDetail(id: string, overrides: Record<string, unknown> = {}) {
  return {
    id,
    nroTicket: `TKT-${id}`,
    estado: "pendiente",
    prioridad: 0,
    total: "45.00",
    notas: null,
    createdAt: new Date("2026-01-15T10:00:00Z"),
    placa: "ABC-123",
    vehiculoMarca: "Toyota",
    vehiculoModelo: "Corolla",
    vehiculoTipo: "sedan",
    clienteNombre: "Juan",
    clienteApellido: "Pérez",
    lavadorNombre: null,
    lavadorApellido: null,
    comprobanteTipo: null,
    comprobanteSerie: null,
    comprobanteNumero: null,
    ...overrides,
  };
}

describe("useOrdenesRealtime", () => {
  let setOrdenes: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();
    setOrdenes = vi.fn();
  });

  it("creates a Supabase channel subscription on mount", () => {
    renderHook(() => useOrdenesRealtime(setOrdenes));

    expect(mockChannel).toHaveBeenCalledWith("ordenes-realtime");
    expect(mockOn).toHaveBeenCalledWith(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "ordenes",
      },
      expect.any(Function)
    );
    expect(mockSubscribe).toHaveBeenCalledTimes(1);
  });

  it("unsubscribes from the channel on unmount (cleanup)", () => {
    const { unmount } = renderHook(() => useOrdenesRealtime(setOrdenes));

    expect(mockSubscribe).toHaveBeenCalledTimes(1);

    unmount();

    expect(mockUnsubscribe).toHaveBeenCalledTimes(1);
  });

  it("handles DELETE payload by filtering out the deleted order", () => {
    renderHook(() => useOrdenesRealtime(setOrdenes));

    const handlers = mockOn.mock.calls;
    const onHandler = handlers[0][2];

    const prevState = [
      { id: "1", nroTicket: "TKT-1" },
      { id: "2", nroTicket: "TKT-2" },
    ];

    act(() => {
      onHandler({ eventType: "DELETE", old: { id: "1" }, new: {} });
    });

    // setOrdenes should have been called with an updater function
    const updaterFn = setOrdenes.mock.calls[0][0];
    const result = updaterFn(prevState);
    expect(result).toEqual([{ id: "2", nroTicket: "TKT-2" }]);
  });

  it("handles INSERT payload by fetching detail and prepending the new order", async () => {
    renderHook(() => useOrdenesRealtime(setOrdenes));

    const handlers = mockOn.mock.calls;
    const onHandler = handlers[0][2];

    const detail = createSampleDetail("new-1");
    mockGetOrdenById.mockResolvedValue(detail);

    const prevState = [{ id: "1", nroTicket: "TKT-1" }];

    await act(async () => {
      await onHandler({ eventType: "INSERT", new: { id: "new-1" }, old: {} });
    });

    expect(mockGetOrdenById).toHaveBeenCalledWith("new-1");

    const updaterFn = setOrdenes.mock.calls[0][0];
    const result = updaterFn(prevState);
    expect(result).toHaveLength(2);
    // New order should be prepended
    expect(result[0].id).toBe("new-1");
    expect(result[0].nroTicket).toBe("TKT-new-1");
  });

  it("handles UPDATE payload by updating the existing order in place", async () => {
    renderHook(() => useOrdenesRealtime(setOrdenes));

    const handlers = mockOn.mock.calls;
    const onHandler = handlers[0][2];

    const detail = createSampleDetail("1", { estado: "completado" });
    mockGetOrdenById.mockResolvedValue(detail);

    const prevState = [
      { id: "1", nroTicket: "TKT-1", estado: "pendiente" },
      { id: "2", nroTicket: "TKT-2", estado: "en_proceso" },
    ];

    await act(async () => {
      await onHandler({ eventType: "UPDATE", new: { id: "1" }, old: {} });
    });

    expect(mockGetOrdenById).toHaveBeenCalledWith("1");

    const updaterFn = setOrdenes.mock.calls[0][0];
    const result = updaterFn(prevState);
    expect(result).toHaveLength(2);
    // Updated order should keep its position
    expect(result[0].id).toBe("1");
    expect(result[0].estado).toBe("completado");
    expect(result[1].id).toBe("2");
  });

  it("ignores INSERT payload when component is unmounted (isMountedRef guard)", async () => {
    const { unmount } = renderHook(() => useOrdenesRealtime(setOrdenes));

    const handlers = mockOn.mock.calls;
    const onHandler = handlers[0][2];

    // Unmount first
    unmount();

    const detail = createSampleDetail("stale-1");
    mockGetOrdenById.mockResolvedValue(detail);

    setOrdenes.mockClear();

    await act(async () => {
      await onHandler({ eventType: "INSERT", new: { id: "stale-1" }, old: {} });
    });

    // Should not call setOrdenes after unmount
    expect(setOrdenes).not.toHaveBeenCalled();
  });

  it("ignores DELETE payload when component is unmounted (isMountedRef guard)", () => {
    const { unmount } = renderHook(() => useOrdenesRealtime(setOrdenes));

    const handlers = mockOn.mock.calls;
    const onHandler = handlers[0][2];

    unmount();

    setOrdenes.mockClear();

    act(() => {
      onHandler({ eventType: "DELETE", old: { id: "1" }, new: {} });
    });

    expect(setOrdenes).not.toHaveBeenCalled();
  });

  it("handles errors from getOrdenById gracefully", async () => {
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    renderHook(() => useOrdenesRealtime(setOrdenes));

    const handlers = mockOn.mock.calls;
    const onHandler = handlers[0][2];

    mockGetOrdenById.mockRejectedValue(new Error("Network error"));

    await act(async () => {
      await onHandler({ eventType: "INSERT", new: { id: "error-1" }, old: {} });
    });

    expect(consoleSpy).toHaveBeenCalledWith(
      "Error fetching realtime order detail:",
      expect.any(Error)
    );
    expect(setOrdenes).not.toHaveBeenCalled();

    consoleSpy.mockRestore();
  });

  it("does not update state when getOrdenById returns null", async () => {
    renderHook(() => useOrdenesRealtime(setOrdenes));

    const handlers = mockOn.mock.calls;
    const onHandler = handlers[0][2];

    mockGetOrdenById.mockResolvedValue(null);

    await act(async () => {
      await onHandler({ eventType: "INSERT", new: { id: "null-1" }, old: {} });
    });

    expect(mockGetOrdenById).toHaveBeenCalledWith("null-1");
    expect(setOrdenes).not.toHaveBeenCalled();
  });
});
