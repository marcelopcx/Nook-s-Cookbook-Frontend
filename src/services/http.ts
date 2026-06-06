import { apiUrl } from "./api";
import { getToken } from "./auth";

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

async function parseErrorMessage(response: Response): Promise<string> {
  try {
    const data = (await response.json()) as { error?: string };
    if (data?.error) return data.error;
  } catch {}
  return `Error de servidor (${response.status})`;
}

type ApiFetchOptions = RequestInit & {
  auth?: boolean;
  parseJson?: boolean;
};

export async function apiFetch<T = void>(
  path: string,
  options: ApiFetchOptions = {},
): Promise<T> {
  const { auth = true, parseJson = true, headers, ...rest } = options;

  const requestHeaders: Record<string, string> = {
    Accept: "application/json",
    ...(headers as Record<string, string>),
  };

  if (auth) {
    const token = await getToken();
    if (token) {
      requestHeaders.Authorization = `Bearer ${token}`;
    }
  }

  const hasJsonBody =
    rest.body !== undefined &&
    !(rest.body instanceof FormData) &&
    !requestHeaders["Content-Type"];

  if (hasJsonBody) {
    requestHeaders["Content-Type"] = "application/json";
  }

  const response = await fetch(apiUrl(path), {
    ...rest,
    headers: requestHeaders,
  });

  if (!response.ok) {
    throw new ApiError(await parseErrorMessage(response), response.status);
  }

  if (response.status === 204 || !parseJson) {
    return undefined as T;
  }

  return (await response.json()) as T;
}
