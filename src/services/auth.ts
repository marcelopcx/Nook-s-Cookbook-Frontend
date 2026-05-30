import { apiFetch, parseErrorMessage } from "./api";

type LoginRequest = {
  email: string;
  password: string;
};

type RegisterRequest = {
  fullName: string;
  email: string;
  password: string;
};

type Usuario = {
  id: number;
  username: string;
  public: boolean;
  id_persona: number;
};

type LoginResponse = {
  token: string;
  user: Usuario;
};

type RegisterResponse = {
  user: Usuario;
};

function splitFullName(fullName: string): {
  nombre: string;
  apellido: string | null;
} {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  const nombre = parts[0] || "";
  const apellido = parts.length > 1 ? parts.slice(1).join(" ") : null;
  return { nombre, apellido };
}

export async function login(request: LoginRequest): Promise<LoginResponse> {
  const response = await apiFetch("/auth/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      username: request.email,
      password: request.password,
    }),
  });

  if (!response.ok) {
    throw new Error(await parseErrorMessage(response));
  }

  return (await response.json()) as LoginResponse;
}

export async function register(
  request: RegisterRequest,
): Promise<RegisterResponse> {
  const { nombre, apellido } = splitFullName(request.fullName);

  const response = await apiFetch("/auth/register", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      username: request.email,
      password: request.password,
      nombre,
      apellido,
      correo: request.email,
      telefono: null,
    }),
  });

  if (!response.ok) {
    throw new Error(await parseErrorMessage(response));
  }

  return (await response.json()) as RegisterResponse;
}
