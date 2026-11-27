// @vitest-environment jsdom
// Biblioteca legal (Leandro, 2026-11-27): lo que el bot puede citar. Todos leen y prueban; el admin escribe temas.
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup, waitFor, within } from "@testing-library/react";

const { legalAPI, auth } = vi.hoisted(() => ({
  legalAPI: { laws: vi.fn(), topics: vi.fn(), search: vi.fn(), createTopic: vi.fn(), updateTopic: vi.fn() },
  auth: { isAdmin: true },
}));
vi.mock("../services/api", () => ({ legalAPI }));
vi.mock("../context/AuthContext", () => ({ useAuth: () => ({ isAdmin: auth.isAdmin, user: { id: 1 } }) }));

import BibliotecaLegal from "./BibliotecaLegal";

const tema = { id: 1, kind: "tema", title: "Persona desaparecida: presunción de ausencia", keywords: "ausencia", body: "Explicación del equipo.", legal_basis: "Código Civil, arts. 112 al 143", url: null, active: true, source: "seed" };
const jce = { id: 2, kind: "institucion", title: "Junta Central Electoral (JCE)", keywords: "actas", body: "Actas y cédulas.", legal_basis: null, url: "https://jce.gob.do", active: true, source: "seed" };
const ley = { code: "codigo-civil", short: "Código Civil", title: "Código Civil de la República Dominicana", source_name: "WIPO Lex", source_url: "https://www.wipo.int/x", fetched_at: "2026-11-27", article_count: 2279 };

beforeEach(() => {
  Object.values(legalAPI).forEach((f) => f.mockReset());
  legalAPI.topics.mockResolvedValue({ data: { topics: [tema, jce] } });
  legalAPI.laws.mockResolvedValue({ data: { laws: [ley] } });
  auth.isAdmin = true;
});
afterEach(cleanup);

describe("Biblioteca legal", () => {
  it("muestra los temas y, en sus pestañas, las instituciones y las leyes con su fuente", async () => {
    render(<BibliotecaLegal />);
    expect(await screen.findByText("Persona desaparecida: presunción de ausencia")).toBeTruthy();
    expect(screen.getByText(/Código Civil, arts. 112 al 143/)).toBeTruthy();
    expect(screen.queryByText("Junta Central Electoral (JCE)")).toBeNull();
    fireEvent.click(screen.getByRole("tab", { name: /instituciones/i }));
    expect(screen.getByText("Junta Central Electoral (JCE)")).toBeTruthy();
    fireEvent.click(screen.getByRole("tab", { name: /leyes/i }));
    expect(screen.getByText("Código Civil")).toBeTruthy();
    expect(screen.getByText(/2279 artículos/)).toBeTruthy();
    expect((screen.getByRole("link", { name: /WIPO Lex/ }) as HTMLAnchorElement).href).toBe("https://www.wipo.int/x");
  });

  it("probar la búsqueda muestra lo que encontraría el bot", async () => {
    legalAPI.search.mockResolvedValue({ data: { temas: [], articulos: [{ ley: "Código Civil", articulo: "112", seccion: null, texto: "Si hay necesidad de proveer…", fuente: null }] } });
    render(<BibliotecaLegal />);
    await screen.findByText("Persona desaparecida: presunción de ausencia");
    fireEvent.change(screen.getByLabelText(/probar/i), { target: { value: "presuncion de ausencia" } });
    fireEvent.click(screen.getByRole("button", { name: /buscar/i }));
    await waitFor(() => expect(legalAPI.search).toHaveBeenCalledWith("presuncion de ausencia"));
    expect(await screen.findByText(/Código Civil, art\. 112/)).toBeTruthy();
  });

  it("el admin agrega un tema", async () => {
    legalAPI.createTopic.mockResolvedValue({ data: { topic: { ...tema, id: 9 } } });
    render(<BibliotecaLegal />);
    await screen.findByText("Persona desaparecida: presunción de ausencia");
    fireEvent.click(screen.getByRole("button", { name: /nuevo tema/i }));
    const dialog = screen.getByRole("dialog");
    fireEvent.change(within(dialog).getByLabelText(/^título/i), { target: { value: "Salida de menores" } });
    fireEvent.change(within(dialog).getByLabelText(/explicación/i), { target: { value: "Necesitan permiso." } });
    fireEvent.click(within(dialog).getByRole("button", { name: /guardar/i }));
    await waitFor(() => expect(legalAPI.createTopic).toHaveBeenCalledWith(expect.objectContaining({ kind: "tema", title: "Salida de menores", body: "Necesitan permiso." })));
  });

  it("el admin desactiva un tema", async () => {
    legalAPI.updateTopic.mockResolvedValue({ data: { topic: { ...tema, active: false } } });
    render(<BibliotecaLegal />);
    await screen.findByText("Persona desaparecida: presunción de ausencia");
    fireEvent.click(screen.getByRole("button", { name: /desactivar/i }));
    await waitFor(() => expect(legalAPI.updateTopic).toHaveBeenCalledWith(1, { active: false }));
  });

  it("un digitador lee y prueba, pero no edita", async () => {
    auth.isAdmin = false;
    render(<BibliotecaLegal />);
    await screen.findByText("Persona desaparecida: presunción de ausencia");
    expect(screen.queryByRole("button", { name: /nuevo tema/i })).toBeNull();
    expect(screen.queryByRole("button", { name: /editar/i })).toBeNull();
  });
});
