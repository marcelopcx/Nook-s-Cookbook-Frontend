export type Usuario = {
  id: number;
  username: string;
  public: boolean;
  id_persona: number;
};

export type PerfilResponse = {
  id: number;
  username: string;
  public: boolean;
  nombre: string;
  apellido: string | null;
  correo: string;
  telefono: string | null;
};

export type PerfilPublicoResponse = {
  id: number;
  username: string;
  nombre: string;
  apellido: string | null;
};

export type RecetaListItem = {
  id: number;
  nombre: string;
  descripcion: string | null;
  raciones: number | null;
  tiempo: string | null;
  promedio_puntuacion: number | null;
  dificultad: string | null;
  imagen: string | null;
  id_usuario_creador: number;
};

export type PasoResponse = {
  numero_paso: number;
  instruccion: string;
};

export type IngredienteRecetaResponse = {
  id_ingrediente: number;
  nombre: string;
  cantidad: string | null;
  tipo_nombre: string | null;
};

export type UtensilioRecetaResponse = {
  id_utensilio: number;
  nombre: string;
  cantidad: string | null;
  tipo_nombre: string | null;
};

export type RecetaDetalleResponse = RecetaListItem & {
  creador_username: string;
  pasos: PasoResponse[];
  ingredientes: IngredienteRecetaResponse[];
  utensilios: UtensilioRecetaResponse[];
};

export type PasoInput = {
  numero_paso: number;
  instruccion: string;
};

export type IngredienteRecetaInput = {
  id_ingrediente: number;
  cantidad: string | null;
};

export type UtensilioRecetaInput = {
  id_utensilio: number;
  cantidad: string | null;
};

export type CreateRecetaRequest = {
  nombre: string;
  descripcion?: string | null;
  raciones?: number | null;
  tiempo?: string | null;
  dificultad?: string | null;
  imagen?: string | null;
  pasos: PasoInput[];
  ingredientes: IngredienteRecetaInput[];
  utensilios: UtensilioRecetaInput[];
};

export type UpdateRecetaRequest = CreateRecetaRequest;

export type PuntuacionResponse = {
  id: number;
  puntuacion: number;
  comentario: string | null;
  id_usuario: number;
  username: string;
  id_receta: number;
};

export type CreatePuntuacionRequest = {
  puntuacion: number;
  comentario?: string | null;
};

export type UpdatePuntuacionRequest = {
  puntuacion?: number | null;
  comentario?: string | null;
};

export type GrupoListItem = {
  id: number;
  nombre: string;
  descripcion: string | null;
  publico: boolean;
  fecha_creacion: string;
  id_usuario_creador: number;
  creador_username: string;
  num_seguidores: number;
  num_recetas: number;
};

export type GrupoDetalleResponse = GrupoListItem & {
  sigue: boolean;
};

export type CreateGrupoRequest = {
  nombre: string;
  descripcion?: string | null;
  publico?: boolean;
};

export type UpdateGrupoRequest = {
  nombre?: string | null;
  descripcion?: string | null;
  publico?: boolean | null;
};

export type SeguidorResponse = {
  id: number;
  username: string;
  fecha_seguido: string;
};

export type LogroResponse = {
  id: number;
  nombre: string;
  descripcion: string | null;
};

export type UsuarioLogroResponse = {
  id_logro: number;
  nombre: string;
  descripcion: string | null;
  fecha_obtenido: string;
};

export type IngredienteResponse = {
  id: number;
  nombre: string;
  id_tipo_ingrediente: number | null;
  tipo_nombre: string | null;
};

export type UtensilioResponse = {
  id: number;
  nombre: string;
  id_tipo_utensilio: number | null;
  tipo_nombre: string | null;
};

export type TipoIngredienteResponse = {
  id: number;
  nombre: string;
};

export type TipoUtensilioResponse = {
  id: number;
  nombre: string;
};

export type ImagenUploadResponse = {
  secure_url: string;
};
