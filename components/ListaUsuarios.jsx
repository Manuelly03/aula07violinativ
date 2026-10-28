import { useEffect, useState } from "react";
import FormUsuario from "./FormUsuario";
import { apiGet, apiPut, apiDelete, mensagemDeErro, ehAbort } from "../src/api";

export default function ListaUsuarios() {
  const [usuarios, setUsuarios] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(null);
  const [editando, setEditando] = useState(null);
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    const controle = new AbortController();
    async function carregar() {
      try {
        const dados = await apiGet('/users', { signal: controle.signal });
        setUsuarios(dados);
      } catch (e) {
        if (!ehAbort(e)) setErro(mensagemDeErro(e));
      } finally {
        if (!controle.signal.aborted) setCarregando(false);
      }
    }
    carregar();
    return () => controle.abort();
  }, []);

  async function excluirUsuario(id) {
    const anterior = usuarios;
    setErro(null);
    setUsuarios(usuarios.filter((u) => u.id !== id));
    try {
      await apiDelete(`/users/${id}`);
      console.log(`Usuário ${id} excluído`);
    } catch (e) {
      setUsuarios(anterior);
      setErro(mensagemDeErro(e));
    }
  }

  async function salvarEdicao(dados) {
    const id = editando.id;
    const anterior = usuarios;
    setErro(null);
    setSalvando(true);
    setUsuarios(usuarios.map((u) => (u.id === id ? { ...u, ...dados } : u)));
    try {
      const resposta = await apiPut(`/users/${id}`, { ...editando, ...dados });
      setUsuarios((atual) => atual.map((u) => (u.id === id ? { ...u, ...resposta } : u)));
      setEditando(null);
      console.log(`Usuário ${id} atualizado`);
    } catch (e) {
      setUsuarios(anterior);
      setErro(mensagemDeErro(e));
    } finally {
      setSalvando(false);
    }
  }

  if (carregando) return <p>Carregando...</p>;

  return (
    <div>
      <h2>Lista de usuários (Exercícios 1–4)</h2>
      {erro && <p>Erro: {erro}</p>}

      {editando && (
        <FormUsuario
          key={editando.id}
          inicial={editando}
          rotulo="Salvar"
          enviando={salvando}
          onSalvar={salvarEdicao}
          onCancelar={() => setEditando(null)}
        />
      )}

      <ul>
        {usuarios.map((u) => (
          <li key={u.id}>
            {u.name} — {u.email}{' '}
            <button onClick={() => setEditando(u)}>Editar</button>{' '}
            <button onClick={() => excluirUsuario(u.id)}>Excluir</button>
          </li>
        ))}
      </ul>
    </div>
  );
}
