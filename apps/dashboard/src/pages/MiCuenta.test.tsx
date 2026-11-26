// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup, waitFor } from "@testing-library/react";

const { authAPI, avatarsAPI, refreshUser, auth } = vi.hoisted(() => ({
  authAPI: { updateAppearance: vi.fn(), changePassword: vi.fn(), updateProfile: vi.fn(), setEarningsPin: vi.fn() },
  avatarsAPI: { getEnabled: vi.fn(), setEnabled: vi.fn() },
  refreshUser: vi.fn(),
  auth: { isAdmin: false, avatar: null as string | null },
}));
vi.mock("../services/api", () => ({ authAPI, avatarsAPI }));
vi.mock("../context/AuthContext", () => ({
  useAuth: () => ({ user: { id: 2, username: "hengi", name: "Hengi", role: auth.isAdmin ? "admin" : "digitador", color: "green", avatar: auth.avatar, birthDate: "1990-05-12" }, refreshUser, isAdmin: auth.isAdmin }),
}));
vi.mock("../context/UserColorsContext", () => ({
  useUserColors: () => ({ refresh: vi.fn(), users: [{ id: 5, name: "Marleni", username: "marleni", avatar: "cow", color: "pink" }] }),
}));

import MiCuenta from "./MiCuenta";

beforeEach(() => {
  Object.values(authAPI).forEach((f) => f.mockReset());
  refreshUser.mockReset();
  authAPI.updateProfile.mockResolvedValue({ data: {} });
  avatarsAPI.getEnabled.mockResolvedValue({ data: { enabled: ["cow", "sheep"] } });
  auth.isAdmin = false;
  auth.avatar = null;
});
afterEach(cleanup);

describe("Mi cuenta — fecha de nacimiento", () => {
  it("shows the current birth date and saves a new one", async () => {
    render(<MiCuenta />);
    const input = screen.getByLabelText(/fecha de nacimiento/i) as HTMLInputElement;
    expect(input.value).toBe("1990-05-12");
    fireEvent.change(input, { target: { value: "1990-06-01" } });
    fireEvent.click(screen.getByRole("button", { name: /guardar fecha/i }));
    await waitFor(() => expect(authAPI.updateProfile).toHaveBeenCalledWith({ birthDate: "1990-06-01" }));
    expect(refreshUser).toHaveBeenCalled();
    expect(await screen.findByText(/fecha guardada/i)).toBeTruthy();
  });
});

describe("Mi cuenta — animales disponibles", () => {
  it("an employee only sees the animals the admin enabled, plus their own", async () => {
    auth.avatar = "goat"; // disabled later, but it's theirs
    render(<MiCuenta />);
    expect(await screen.findByTitle("Oveja")).toBeTruthy();
    expect(screen.getByTitle(/Vaca/)).toBeTruthy();
    expect(screen.getByTitle("Cabra")).toBeTruthy();
    expect(screen.queryByTitle("Elefante")).toBeNull();
  });

  it("the admin sees every animal", async () => {
    auth.isAdmin = true;
    render(<MiCuenta />);
    expect(await screen.findByTitle("Elefante")).toBeTruthy();
    expect(screen.getByTitle("Búho")).toBeTruthy();
  });
});

describe("Mi cuenta — tomar un animal", () => {
  it("the admin can take an employee's animal after confirming", async () => {
    auth.isAdmin = true;
    authAPI.updateAppearance.mockResolvedValue({ data: {} });
    render(<MiCuenta />);
    fireEvent.click(await screen.findByTitle("Vaca · lo tiene Marleni"));
    const dialog = await screen.findByRole("dialog");
    expect(dialog.textContent).toMatch(/Marleni/);
    fireEvent.click(screen.getByRole("button", { name: /sí, quitárselo/i }));
    fireEvent.click(screen.getByRole("button", { name: /^guardar$/i }));
    await waitFor(() => expect(authAPI.updateAppearance).toHaveBeenCalledWith({ avatar: "cow", force: true, label: "Vaca" }));
  });

  it("cancelling keeps the admin's current animal", async () => {
    auth.isAdmin = true;
    render(<MiCuenta />);
    fireEvent.click(await screen.findByTitle("Vaca · lo tiene Marleni"));
    fireEvent.click(await screen.findByRole("button", { name: /cancelar/i }));
    expect(screen.queryByRole("dialog")).toBeNull();
    expect((screen.getByTitle("Vaca · lo tiene Marleni") as HTMLButtonElement).className).not.toMatch(/ring-4/);
  });

  it("for employees a taken animal stays blocked", async () => {
    render(<MiCuenta />);
    expect((await screen.findByTitle("Vaca · lo tiene Marleni")).hasAttribute("disabled")).toBe(true);
  });
});

describe("Mi cuenta — otro color (paleta libre)", () => {
  it("saves any color picked from the system palette", async () => {
    authAPI.updateAppearance.mockResolvedValue({ data: {} });
    render(<MiCuenta />);
    fireEvent.change(screen.getByLabelText(/otro color/i), { target: { value: "#a1b2c3" } });
    fireEvent.click(screen.getByRole("button", { name: /^guardar$/i }));
    await waitFor(() => expect(authAPI.updateAppearance).toHaveBeenCalledWith({ color: "#a1b2c3" }));
  });
  it("shows why a color too close to someone else's was refused", async () => {
    authAPI.updateAppearance.mockRejectedValue({ response: { status: 409, data: { error: "Se parece mucho al color de Marleni; escoge otro", code: "COLOR_TOO_CLOSE" } } });
    render(<MiCuenta />);
    fireEvent.change(screen.getByLabelText(/otro color/i), { target: { value: "#ec4890" } });
    fireEvent.click(screen.getByRole("button", { name: /^guardar$/i }));
    expect(await screen.findByText(/se parece mucho al color de marleni/i)).toBeTruthy();
  });
});

describe("Mi cuenta — PIN de ganancias (solo admin)", () => {
  const fill = (label: RegExp, value: string) => fireEvent.change(screen.getByLabelText(label), { target: { value } });

  it("un digitador no ve la sección", () => {
    render(<MiCuenta />);
    expect(screen.queryByText(/PIN de ganancias/i)).toBeNull();
  });

  it("el admin crea su PIN con la contraseña actual", async () => {
    auth.isAdmin = true;
    authAPI.setEarningsPin.mockResolvedValue({ data: {} });
    render(<MiCuenta />);
    fill(/contraseña para el pin/i, "secret1");
    fill(/^pin nuevo/i, "4821");
    fill(/repite el pin/i, "4821");
    fireEvent.click(screen.getByRole("button", { name: /guardar pin/i }));
    await waitFor(() => expect(authAPI.setEarningsPin).toHaveBeenCalledWith("secret1", "4821"));
    expect(await screen.findByText(/PIN guardado/i)).toBeTruthy();
    expect(refreshUser).toHaveBeenCalled();
  });

  it("no guarda si el PIN no es de 4 números o no coincide", async () => {
    auth.isAdmin = true;
    render(<MiCuenta />);
    fill(/contraseña para el pin/i, "secret1");
    fill(/^pin nuevo/i, "4821");
    fill(/repite el pin/i, "4822");
    fireEvent.click(screen.getByRole("button", { name: /guardar pin/i }));
    expect(await screen.findByText(/no coinciden/i)).toBeTruthy();
    fill(/^pin nuevo/i, "48");
    fill(/repite el pin/i, "48");
    fireEvent.click(screen.getByRole("button", { name: /guardar pin/i }));
    expect(await screen.findByText(/debe tener 4 números/i)).toBeTruthy();
    expect(authAPI.setEarningsPin).not.toHaveBeenCalled();
  });

  it("muestra el error del servidor (contraseña equivocada)", async () => {
    auth.isAdmin = true;
    authAPI.setEarningsPin.mockRejectedValue({ response: { status: 400, data: { error: "La contraseña actual es incorrecta" } } });
    render(<MiCuenta />);
    fill(/contraseña para el pin/i, "mala");
    fill(/^pin nuevo/i, "4821");
    fill(/repite el pin/i, "4821");
    fireEvent.click(screen.getByRole("button", { name: /guardar pin/i }));
    expect(await screen.findByText("La contraseña actual es incorrecta")).toBeTruthy();
  });
});
