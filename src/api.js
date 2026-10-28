export const BASE_URL = 'https://jsonplaceholder.typicode.com';

export class ApiError extends Error {
  constructor(status, statusText) {
    super(statusText || `HTTP ${status}`);
    this.name = 'ApiError';
    this.status = status;
  }
}

export async function requisicao(caminho, { headers: headersDaChamada, ...opcoes } = {}) {
  const resp = await fetch(`${BASE_URL}${caminho}`, {
    ...opcoes,
    headers: { 'Content-Type': 'application/json', ...headersDaChamada },
  });
  if (!resp.ok) throw new ApiError(resp.status, resp.statusText);
  return resp.json();
}

export const apiGet = (caminho, opcoes = {}) =>
  requisicao(caminho, { ...opcoes, method: 'GET' });

export const apiPost = (caminho, dados, opcoes = {}) =>
  requisicao(caminho, { ...opcoes, method: 'POST', body: JSON.stringify(dados) });

export const apiPut = (caminho, dados, opcoes = {}) =>
  requisicao(caminho, { ...opcoes, method: 'PUT', body: JSON.stringify(dados) });

export const apiDelete = (caminho, opcoes = {}) =>
  requisicao(caminho, { ...opcoes, method: 'DELETE' });

export const ehAbort = (e) => e?.name === 'AbortError';

export function mensagemDeErro(e) {
  if (e instanceof ApiError) {
    if (e.status === 404) return 'Recurso não encontrado';
    if (e.status >= 500) return 'Erro no servidor';
    return `Erro ${e.status}`;
  }
  if (e instanceof TypeError) return 'Falha de rede';
  return e.message;
}
