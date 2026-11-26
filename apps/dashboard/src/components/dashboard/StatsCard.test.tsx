// @vitest-environment jsdom
import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import StatsCard from "./StatsCard";

afterEach(cleanup);

describe("StatsCard", () => {
  it("shows the whole name, without hyphenation, apart from the animal", () => {
    render(<StatsCard label="JACKELYN ESPINOZA" value="RD$100" icon="🐼" sensitive visible={false} />);
    const name = screen.getByText("JACKELYN ESPINOZA");
    expect(name.className).not.toMatch(/hyphens/);
    expect(name.textContent).toBe("JACKELYN ESPINOZA");
  });

  it("opens the digitador's services when tapped (or with Enter), but not from the eye button", () => {
    const open = vi.fn();
    render(<StatsCard label="ISRAEL" value="RD$100" sensitive visible={false} onClick={open} actionLabel="Ver los servicios de ISRAEL" />);
    fireEvent.click(screen.getByTitle("Mostrar monto"));
    expect(open).not.toHaveBeenCalled();
    const card = screen.getByRole("button", { name: "Ver los servicios de ISRAEL" });
    fireEvent.click(card);
    fireEvent.keyDown(card, { key: "Enter" });
    expect(open).toHaveBeenCalledTimes(2);
  });

  it("is not a button when there is nothing to open", () => {
    render(<StatsCard label="TOTAL" value="RD$100" />);
    expect(screen.queryByRole("button")).toBeNull();
  });
});

describe("StatsCard con el PIN de ganancias", () => {
  it("bloqueada: el monto queda oculto y el ojito pide el PIN en vez de mostrarlo", () => {
    const onRequestUnlock = vi.fn();
    render(<StatsCard label="TOTAL" value="RD$ 9,999" sensitive visible locked onRequestUnlock={onRequestUnlock} />);
    expect(screen.queryByText("RD$ 9,999")).toBeNull();
    fireEvent.click(screen.getByTitle("Desbloquear con PIN"));
    expect(onRequestUnlock).toHaveBeenCalled();
    expect(screen.queryByText("RD$ 9,999")).toBeNull();
  });

  it("desbloqueada funciona como siempre", () => {
    render(<StatsCard label="TOTAL" value="RD$ 9,999" sensitive visible={false} locked={false} />);
    fireEvent.click(screen.getByTitle("Mostrar monto"));
    expect(screen.getByText("RD$ 9,999")).toBeTruthy();
  });
});
