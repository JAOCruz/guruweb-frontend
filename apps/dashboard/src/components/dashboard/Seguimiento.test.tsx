// @vitest-environment jsdom
// Interruptores del seguimiento de cotizaciones (Jay, 2026-11-27): general en el panel del bot (solo el admin) y
// por cliente en el chat de Mensajes.
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup, waitFor } from "@testing-library/react";

const { settingsAPI } = vi.hoisted(() => ({
  settingsAPI: { getSeguimiento: vi.fn(), setSeguimiento: vi.fn(), getClientFollowup: vi.fn(), setClientFollowup: vi.fn() },
}));
vi.mock("../../services/api", () => ({ settingsAPI }));

import { SeguimientoGeneral, SeguimientoCliente } from "./Seguimiento";

beforeEach(() => Object.values(settingsAPI).forEach((f) => f.mockReset()));
afterEach(cleanup);

describe("SeguimientoGeneral", () => {
  it("muestra si está encendido y el admin lo apaga", async () => {
    settingsAPI.getSeguimiento.mockResolvedValue({ data: { activo: true, horas: 22 } });
    settingsAPI.setSeguimiento.mockResolvedValue({ data: { activo: false, horas: 22 } });
    render(<SeguimientoGeneral isAdmin />);
    const sw = await screen.findByRole("switch", { name: /seguimiento automático/i });
    expect(sw.getAttribute("aria-checked")).toBe("true");
    fireEvent.click(sw);
    await waitFor(() => expect(settingsAPI.setSeguimiento).toHaveBeenCalledWith(false));
    await waitFor(() => expect(sw.getAttribute("aria-checked")).toBe("false"));
  });

  it("un digitador lo ve pero no lo cambia", async () => {
    settingsAPI.getSeguimiento.mockResolvedValue({ data: { activo: true, horas: 22 } });
    render(<SeguimientoGeneral isAdmin={false} />);
    const sw = await screen.findByRole("switch", { name: /seguimiento automático/i });
    expect((sw as HTMLButtonElement).disabled).toBe(true);
  });
});

describe("SeguimientoCliente", () => {
  it("lee el del cliente y lo cambia", async () => {
    settingsAPI.getClientFollowup.mockResolvedValue({ data: { followup_off: false } });
    settingsAPI.setClientFollowup.mockResolvedValue({ data: { followup_off: true } });
    render(<SeguimientoCliente clientId={7} />);
    const btn = await screen.findByRole("button", { name: /seguimiento: sí/i });
    fireEvent.click(btn);
    await waitFor(() => expect(settingsAPI.setClientFollowup).toHaveBeenCalledWith(7, true));
    expect(await screen.findByRole("button", { name: /seguimiento: no/i })).toBeTruthy();
  });

  it("sin cliente registrado no muestra nada", () => {
    const { container } = render(<SeguimientoCliente clientId={null} />);
    expect(container.textContent).toBe("");
  });
});
