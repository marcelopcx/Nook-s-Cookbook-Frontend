import { z } from "zod";

export const pasoSchema = z.object({
  numero_paso: z.number().int().positive(),
  instruccion: z.string().trim().min(1, "La instrucción es obligatoria"),
});

export const ingredienteRecetaSchema = z.object({
  id_ingrediente: z.number().int().positive(),
  cantidad: z.string().nullable(),
});

export const utensilioRecetaSchema = z.object({
  id_utensilio: z.number().int().positive(),
  cantidad: z.string().nullable(),
});

export const crearRecetaSchema = z.object({
  nombre: z.string().trim().min(1, "El nombre es obligatorio"),
  descripcion: z.string().nullable().optional(),
  raciones: z.number().int().positive().nullable().optional(),
  tiempo: z.string().nullable().optional(),
  dificultad: z.string().nullable().optional(),
  imagen: z.string().url().nullable().optional(),
  pasos: z.array(pasoSchema).min(1, "Agregá al menos un paso"),
  ingredientes: z
    .array(ingredienteRecetaSchema)
    .min(1, "Agregá al menos un ingrediente"),
  utensilios: z.array(utensilioRecetaSchema).optional(),
});

export type CrearRecetaInput = z.infer<typeof crearRecetaSchema>;
