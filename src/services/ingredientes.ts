import { apiFetch, parseErrorMessage } from "./api";

export type Ingrediente = {
  id: number;
  nombre: string;
  id_tipo_ingrediente: number | null;
  tipo_nombre: string | null;
};

export async function listarIngredientes(): Promise<Ingrediente[]> {
  const response = await apiFetch("/ingredientes");
  if (!response.ok) {
    throw new Error(await parseErrorMessage(response));
  }
  return (await response.json()) as Ingrediente[];
}
