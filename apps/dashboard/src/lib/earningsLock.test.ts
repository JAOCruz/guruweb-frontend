// @vitest-environment jsdom
// PIN de ganancias (Jay, 2026-11-26): se bloquea tras 1 hora sin usar el dashboard,
// o si la página estuvo cerrada más de 10 minutos.
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { IDLE_LOCK_MS, CLOSED_LOCK_MS, readUnlock, saveUnlock, clearUnlock, isExpired, useEarningsLock } from "./earningsLock";

const MIN = 60_000;

beforeEach(() => localStorage.clear());

describe("isExpired", () => {
  it("con la página abierta aguanta 1 hora sin uso", () => {
    expect(IDLE_LOCK_MS).toBe(60 * MIN);
    expect(isExpired(1000, 1000 + 59 * MIN, "open")).toBe(false);
    expect(isExpired(1000, 1000 + 61 * MIN, "open")).toBe(true);
  });

  it("al volver a abrir la página aguanta 10 minutos", () => {
    expect(CLOSED_LOCK_MS).toBe(10 * MIN);
    expect(isExpired(1000, 1000 + 9 * MIN, "reopened")).toBe(false);
    expect(isExpired(1000, 1000 + 11 * MIN, "reopened")).toBe(true);
  });
});

describe("guardar el desbloqueo por usuario", () => {
  it("sin nada guardado está bloqueado", () => {
    expect(readUnlock(1)).toBeNull();
  });

  it("guarda la última actividad de ese usuario y la borra al bloquear", () => {
    saveUnlock(1, 5000);
    expect(readUnlock(1)).toBe(5000);
    expect(readUnlock(2)).toBeNull();
    clearUnlock(1);
    expect(readUnlock(1)).toBeNull();
  });

  it("un valor dañado cuenta como bloqueado", () => {
    localStorage.setItem("guru.earningsUnlock.1", "basura");
    expect(readUnlock(1)).toBeNull();
  });
});

describe("useEarningsLock", () => {
  afterEach(() => vi.useRealTimers());

  it("sin PIN nunca está bloqueado", () => {
    const { result } = renderHook(() => useEarningsLock(1, false));
    expect(result.current.locked).toBe(false);
  });

  it("con PIN empieza bloqueado; desbloquear y bloquear a mano", () => {
    const { result } = renderHook(() => useEarningsLock(1, true));
    expect(result.current.locked).toBe(true);
    act(() => result.current.unlock());
    expect(result.current.locked).toBe(false);
    act(() => result.current.lock());
    expect(result.current.locked).toBe(true);
    expect(readUnlock(1)).toBeNull();
  });

  it("se bloquea solo tras 1 hora sin usar el dashboard", () => {
    vi.useFakeTimers();
    const { result } = renderHook(() => useEarningsLock(1, true));
    act(() => result.current.unlock());
    act(() => { vi.advanceTimersByTime(30 * MIN); });
    expect(result.current.locked).toBe(false);
    act(() => { vi.advanceTimersByTime(31 * MIN); });
    expect(result.current.locked).toBe(true);
  });

  it("usar el dashboard alarga el desbloqueo", () => {
    vi.useFakeTimers();
    const { result } = renderHook(() => useEarningsLock(1, true));
    act(() => result.current.unlock());
    act(() => { vi.advanceTimersByTime(50 * MIN); });
    act(() => { window.dispatchEvent(new Event("keydown")); });
    act(() => { vi.advanceTimersByTime(50 * MIN); });
    expect(result.current.locked).toBe(false);
  });

  it("al volver a abrir antes de 10 minutos sigue abierto; después, bloqueado", () => {
    saveUnlock(1, Date.now() - 9 * MIN);
    expect(renderHook(() => useEarningsLock(1, true)).result.current.locked).toBe(false);
    saveUnlock(1, Date.now() - 11 * MIN);
    expect(renderHook(() => useEarningsLock(1, true)).result.current.locked).toBe(true);
  });
});

it("si el usuario termina de cargar después, igual respeta el desbloqueo guardado", () => {
  localStorage.clear();
  saveUnlock(1, Date.now() - 2 * MIN);
  const { result, rerender } = renderHook(({ id, on }) => useEarningsLock(id, on), {
    initialProps: { id: undefined as number | undefined, on: false },
  });
  rerender({ id: 1, on: true });
  expect(result.current.locked).toBe(false);
});
