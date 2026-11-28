// @vitest-environment jsdom
// Respuestas como en WhatsApp: si el mensaje responde a otro, la burbuja muestra una miniatura del citado
// y con un clic lleva a él. Así se sabe a qué audio (o foto, o texto) le están respondiendo.
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

const { botAPI, auth } = vi.hoisted(() => {
  const fns: Record<string, ReturnType<typeof vi.fn>> = {};
  const botAPI = new Proxy(fns, {
    get: (t, k: string) => (t[k] ??= vi.fn().mockResolvedValue({ data: {} })),
  });
  return { botAPI, auth: { isAdmin: false, user: { id: 5, username: "hengi", role: "digitador" } } };
});
vi.mock("../services/botApi", () => ({ botAPI, getBotApiBaseURL: () => "http://api", catalogUnitPrice: () => 0 }));
vi.mock("../context/AuthContext", () => ({ useAuth: () => auth }));
vi.mock("../context/UserColorsContext", async () => {
  const { toAppearance } = await import("../lib/userColors");
  return { useUserColors: () => ({ users: [], refresh: vi.fn(), appearanceOf: () => toAppearance(undefined), appearanceOfColumn: () => toAppearance(undefined) }) };
});

import BotMessages from "./BotMessages";

const AUDIO = { id: 1, direction: "inbound", content: "[📎 audio]", media_url: "/api/media/7/download" };
const history = [
  { id: 3, phone: "18095550101", direction: "inbound", content: "Y esto?", created_at: "2026-10-05T15:03:00Z", reply_to: { id: null } },
  { id: 2, phone: "18095550101", direction: "outbound", content: "Sí, le escuché", created_at: "2026-10-05T15:02:00Z", reply_to: AUDIO },
  { ...AUDIO, phone: "18095550101", created_at: "2026-10-05T15:00:00Z" },
];

beforeEach(() => {
  vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("sin red"))); // el audio no se descarga en la prueba
  Element.prototype.scrollIntoView = vi.fn();
  botAPI.getMessages.mockResolvedValue({ data: { conversations: [{
    phone: "18095550101", client_name: "Ana Gómez", client_id: 1, client_assigned_to: 5, profile_pic_url: null,
    last_message: "Y esto?", last_message_at: "2026-10-05T15:03:00Z", message_count: "3", botActive: false,
  }] } });
  botAPI.getStatus.mockResolvedValue({ data: {} });
  botAPI.getPhoneMessages.mockResolvedValue({ data: history });
});
afterEach(() => { cleanup(); vi.unstubAllGlobals(); });

const openChat = async () => {
  render(<MemoryRouter><BotMessages /></MemoryRouter>);
  fireEvent.click((await screen.findByText("Ana Gómez")).closest("button")!);
  await screen.findByText("Sí, le escuché");
};

describe("Mensajes — respuestas a otro mensaje", () => {
  it("la respuesta a un audio muestra la miniatura del audio y lleva a él con un clic", async () => {
    await openChat();
    const bubble = document.getElementById("msg-2")!;
    const quote = within(bubble).getByRole("button", { name: /ir al mensaje citado/i });
    expect(quote.textContent).toMatch(/cliente/i);
    expect(quote.textContent).toMatch(/audio/i);
    const target = document.getElementById("msg-1")!;
    const scroll = vi.fn();
    target.scrollIntoView = scroll;
    fireEvent.click(quote);
    expect(scroll).toHaveBeenCalled();
  });

  it("si el mensaje citado no está en el panel, lo dice y no es un botón", async () => {
    await openChat();
    const bubble = document.getElementById("msg-3")!;
    expect(within(bubble).getByText(/mensaje que no está en el panel/i)).toBeTruthy();
    expect(within(bubble).queryByRole("button", { name: /ir al mensaje citado/i })).toBeNull();
  });
});
