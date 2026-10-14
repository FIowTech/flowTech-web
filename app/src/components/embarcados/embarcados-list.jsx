export function EmbarcadosList({ embarcados }) {
  return (
    <div>
      <h1>Embarcados Encontrados: {embarcados.length}</h1>
      <ul>
        {embarcados.length > 0 ? (
          embarcados.map((emb) => <li key={emb.id}>{emb.enderecoMac}</li>)
        ) : (
          <p>Nenhum Embarcado Encontrado.</p>
        )}
      </ul>
    </div>
  );
}
