// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup, waitFor } from "@testing-library/react";

const { authAPI } = vi.hoisted(() => ({ authAPI: { verifyEarningsPin: vi.fn() } }));
vi.mock("../../services/api", () => ({ authAPI }));

import EarningsPinDialog from "./EarningsPinDialog";

beforeEach(() => {
  authAPI.verifyEarningsPin.mockReset();
});
afterEach(cleanup);

const type = (v: string) => fireEvent.change(screen.getByLabelText("PIN"), { target: { value: v } });

describe("EarningsPinDialog", () => {
  it("al escribir los 4 dígitos correctos desbloquea", async () => {
    authAPI.verifyEarningsPin.mockResolvedValue({ data: { ok: true } });
    const onUnlocked = vi.fn();
    render(<EarningsPinDialog onUnlocked={onUnlocked} onClose={vi.fn()} />);
    type("48");
    expect(authAPI.verifyEarningsPin).not.toHaveBeenCalled();
    type("4821");
    await waitFor(() => expect(onUnlocked).toHaveBeenCalled());
    expect(authAPI.verifyEarningsPin).toHaveBeenCalledWith("4821");
  });

  it("solo acepta números", () => {
    render(<EarningsPinDialog onUnlocked={vi.fn()} onClose={vi.fn()} />);
    type("4a8b");
    expect((screen.getByLabelText("PIN") as HTMLInputElement).value).toBe("48");
  });

  it("PIN equivocado: avisa, borra y no desbloquea", async () => {
    authAPI.verifyEarningsPin.mockRejectedValue({ response: { status: 400, data: { error: "PIN incorrecto", code: "WRONG_PIN" } } });
    const onUnlocked = vi.fn();
    render(<EarningsPinDialog onUnlocked={onUnlocked} onClose={vi.fn()} />);
    type("0000");
    expect(await screen.findByText("PIN incorrecto")).toBeTruthy();
    expect((screen.getByLabelText("PIN") as HTMLInputElement).value).toBe("");
    expect(onUnlocked).not.toHaveBeenCalled();
  });

  it("muestra la espera tras muchos intentos", async () => {
    authAPI.verifyEarningsPin.mockRejectedValue({ response: { status: 429, data: { error: "Demasiados intentos. Espera 15 min.", code: "TOO_MANY_ATTEMPTS" } } });
    render(<EarningsPinDialog onUnlocked={vi.fn()} onClose={vi.fn()} />);
    type("1111");
    expect(await screen.findByText("Demasiados intentos. Espera 15 min.")).toBeTruthy();
  });
});
