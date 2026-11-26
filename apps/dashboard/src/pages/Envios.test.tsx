// @vitest-environment jsdom
// Envíos (Jay, 2026-11-26): el bot recoge los datos y aquí se organizan por estado. Sin montos.
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render as rtlRender, screen, fireEvent, cleanup, waitFor, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import type { ReactElement } from "react";

const render = (ui: ReactElement, url = "/envios") => rtlRender(<MemoryRouter initialEntries={[url]}>{ui}</MemoryRouter>);

const { deliveriesAPI } = vi.hoisted(() => ({
  deliveriesAPI: { list: vi.fn(), create: vi.fn(), update: vi.fn(), setStatus: vi.fn() },
}));
vi.mock("../services/api", () => ({ deliveriesAPI }));

import Envios from "./Envios";

const ana = {
  id: 7, status: "por_enviar", client_name: "Ana Pérez", client_phone: "18095550101", document: "Contrato de alquiler",
  address: "C/ Duarte 10, Gazcue", reference: "frente al colmado", recipient_name: "Ana Pérez", recipient_phone: "8095550101",
  note: null, source: "whatsapp", created_at: "2026-11-26T15:00:00Z", case_number: "C-1",
};
const counts = { por_enviar: 1, enviado: 2, entregado: 0, cancelado: 0 };

beforeEach(() => {
  Object.values(deliveriesAPI).forEach((f) => f.mockReset());
  deliveriesAPI.list.mockResolvedValue({ data: { deliveries: [ana], counts } });
});
afterEach(cleanup);

describe("Envíos", () => {
  it("muestra las pestañas con su contador y los envíos por enviar", async () => {
    render(<Envios />);
    expect(await screen.findByText("C/ Duarte 10, Gazcue")).toBeTruthy();
    expect(deliveriesAPI.list).toHaveBeenCalledWith("por_enviar");
    expect(screen.getByRole("tab", { name: /por enviar\s*1/i })).toBeTruthy();
    expect(screen.getByRole("tab", { name: /enviado\s*2/i })).toBeTruthy();
    expect(screen.getByText(/frente al colmado/)).toBeTruthy();
    expect(screen.getByText("Contrato de alquiler")).toBeTruthy();
  });

  it("cambiar de pestaña pide ese estado", async () => {
    render(<Envios />);
    await screen.findByText("C/ Duarte 10, Gazcue");
    fireEvent.click(screen.getByRole("tab", { name: /entregado/i }));
    await waitFor(() => expect(deliveriesAPI.list).toHaveBeenLastCalledWith("entregado"));
  });

  it("marcar como enviado cambia el estado y recarga", async () => {
    deliveriesAPI.setStatus.mockResolvedValue({ data: { delivery: { ...ana, status: "enviado" } } });
    render(<Envios />);
    await screen.findByText("C/ Duarte 10, Gazcue");
    fireEvent.click(screen.getByRole("button", { name: /marcar enviado/i }));
    await waitFor(() => expect(deliveriesAPI.setStatus).toHaveBeenCalledWith(7, "enviado"));
    await waitFor(() => expect(deliveriesAPI.list).toHaveBeenCalledTimes(2));
  });

  it("crear un envío a mano pide la dirección", async () => {
    deliveriesAPI.create.mockResolvedValue({ data: { delivery: { ...ana, id: 8 } } });
    render(<Envios />);
    await screen.findByText("C/ Duarte 10, Gazcue");
    fireEvent.click(screen.getByRole("button", { name: /nuevo envío/i }));
    const dialog = screen.getByRole("dialog");
    fireEvent.click(within(dialog).getByRole("button", { name: /guardar/i }));
    expect(await within(dialog).findByText(/falta la dirección/i)).toBeTruthy();
    expect(deliveriesAPI.create).not.toHaveBeenCalled();
    fireEvent.change(within(dialog).getByLabelText(/^dirección/i), { target: { value: "C/ El Conde 3" } });
    fireEvent.change(within(dialog).getByLabelText(/quién recibe/i), { target: { value: "Luis" } });
    fireEvent.click(within(dialog).getByRole("button", { name: /guardar/i }));
    await waitFor(() => expect(deliveriesAPI.create).toHaveBeenCalledWith(expect.objectContaining({ address: "C/ El Conde 3", recipient_name: "Luis" })));
  });

  it("editar un envío guarda los cambios", async () => {
    deliveriesAPI.update.mockResolvedValue({ data: { delivery: ana } });
    render(<Envios />);
    await screen.findByText("C/ Duarte 10, Gazcue");
    fireEvent.click(screen.getByRole("button", { name: /editar/i }));
    const dialog = screen.getByRole("dialog");
    expect((within(dialog).getByLabelText(/^dirección/i) as HTMLInputElement).value).toBe("C/ Duarte 10, Gazcue");
    fireEvent.change(within(dialog).getByLabelText(/nota/i), { target: { value: "Llamar antes" } });
    fireEvent.click(within(dialog).getByRole("button", { name: /guardar/i }));
    await waitFor(() => expect(deliveriesAPI.update).toHaveBeenCalledWith(7, expect.objectContaining({ note: "Llamar antes" })));
  });

  it("desde la campanita (?envio=7) resalta ese envío", async () => {
    render(<Envios />, "/envios?envio=7");
    const card = await screen.findByTestId("envio-7");
    expect(card.className).toMatch(/ring/);
  });
});
