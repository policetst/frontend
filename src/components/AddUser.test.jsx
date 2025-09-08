import React from "react";
import { render, fireEvent, screen, waitFor } from "@testing-library/react";
import AddUser from "./AddUser";
import { vi, expect, beforeAll, afterAll, describe, beforeEach, it } from "vitest";

// Mock de createUser
vi.mock("../funcs/Users", () => ({
  createUser: vi.fn(),
}));
import { createUser } from "../funcs/Users";

// Guarda el location original
const originalLocation = window.location;

beforeAll(() => {
  window.alert = vi.fn();
  // Mockea window.location entera
  delete window.location;
  window.location = { ...originalLocation, reload: vi.fn() };
});

afterAll(() => {
  if (window.alert.mockRestore) window.alert.mockRestore();
  // Restaura el original
  window.location = originalLocation;
});

describe("AddUser", () => {
  beforeEach(() => {
    createUser.mockClear();
    if (window.alert.mockClear) window.alert.mockClear();
    if (window.location.reload && window.location.reload.mockClear) window.location.reload.mockClear();
  });

  it("El botón Plus/Mius abre y cierra el formulario", () => {
    render(<AddUser />);
    expect(screen.queryByText("Crear usuario")).toBeNull();

    fireEvent.click(screen.getByRole("button"));
    expect(screen.getByText("Crear usuario")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button"));
    expect(screen.queryByText("Crear usuario")).toBeNull();
  });

  it("No permite enviar si hay campos vacíos", async () => {
    render(<AddUser />);
    fireEvent.click(screen.getByRole("button"));
    fireEvent.click(screen.getByText("Agregar Usuario"));

    await waitFor(() => {
      expect(window.alert).toHaveBeenCalledWith("Por favor, completa todos los campos.");
    });
    expect(createUser).not.toHaveBeenCalled();
  });

  it("Crea usuario correctamente y recarga la página si la creación es exitosa", async () => {
    createUser.mockResolvedValueOnce({ ok: true });

    render(<AddUser />);
    fireEvent.click(screen.getByRole("button"));

    fireEvent.change(screen.getByLabelText(/Código/i), { target: { value: "001" } });
    fireEvent.change(screen.getByLabelText(/Email/i), { target: { value: "test@example.com" } });
    fireEvent.change(screen.getByLabelText(/Contraseña/i), { target: { value: "123456" } });
    fireEvent.change(screen.getByLabelText(/Rol/i), { target: { value: "Administrator" } });

    fireEvent.click(screen.getByText("Agregar Usuario"));

    await waitFor(() => {
      expect(createUser).toHaveBeenCalledWith({
        code: "001",
        email: "test@example.com",
        password: "123456",
        role: "Administrator",
        status: "Active",
      });
      expect(window.alert).toHaveBeenCalledWith("Usuario creado correctamente.");
      expect(window.location.reload).toHaveBeenCalled();
    });
  });

  it("Muestra mensaje de error si la creación falla", async () => {
    createUser.mockResolvedValueOnce({ ok: false, message: "Error del backend" });

    render(<AddUser />);
    fireEvent.click(screen.getByRole("button"));
    fireEvent.change(screen.getByLabelText(/Código/i), { target: { value: "001" } });
    fireEvent.change(screen.getByLabelText(/Email/i), { target: { value: "test@example.com" } });
    fireEvent.change(screen.getByLabelText(/Contraseña/i), { target: { value: "123456" } });
    fireEvent.change(screen.getByLabelText(/Rol/i), { target: { value: "Administrator" } });

    fireEvent.click(screen.getByText("Agregar Usuario"));

    await waitFor(() => {
      expect(createUser).toHaveBeenCalled();
      expect(window.alert).toHaveBeenCalledWith(
        "Error al crear el usuario: Error del backend"
      );
    });
  });
});
