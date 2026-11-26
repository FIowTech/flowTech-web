async function buscarChamadosEquipe(empresa) {
  const {
    jira_email,
    jira_api_key,
    jira_base_url,
    jira_project_key,
  } = empresa;

  if (!jira_email || !jira_api_key || !jira_base_url || !jira_project_key) {
    throw new Error("Credenciais Jira incompletas.");
  }

  const baseUrl = jira_base_url.replace(/\/+$/, "");

  const autenticacao = Buffer.from(
    `${jira_email}:${jira_api_key}`
  ).toString("base64");

  const jql = `project = "${jira_project_key}" AND statusCategory != Done ORDER BY created DESC`;

  const chamados = [];
  let nextPageToken = null;

  do {
    const response = await fetch(`${baseUrl}/rest/api/3/search/jql`, {
      method: "POST",
      headers: {
        Authorization: `Basic ${autenticacao}`,
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        jql,
        fields: ["assignee", "summary", "status"],
        maxResults: 100,
        ...(nextPageToken ? { nextPageToken } : {}),
      }),
    });

    console.log("Status retornado pelo Jira:", response.status);

    if (!response.ok) {
      const erroJira = await response.text();
      console.error("Resposta de erro do Jira:", erroJira);

      throw new Error(`Falha na consulta Jira: HTTP ${response.status}`);
    }

    const resultado = await response.json();

    console.log(
      "Chamados recebidos nesta página:",
      resultado.issues?.length
    );

    chamados.push(...(resultado.issues || []));
    nextPageToken = resultado.nextPageToken || null;
  } while (nextPageToken);

  return chamados;
}

module.exports = {
  buscarChamadosEquipe,
};