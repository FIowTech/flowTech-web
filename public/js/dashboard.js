let nomeUsuario = sessionStorage.getItem("USER_NAME");
let fkEmpresa = sessionStorage.getItem("EMPRESA_ID");

if (nomeUsuario != null) {
  document.getElementById("nomeUsuario").innerHTML = nomeUsuario;
}

function sair() {
  sessionStorage.clear();

  window.location.href = "../login-cadastro.html";
}

function exibirPainel(id, acaoTexto, cor) {
  document.getElementById(id).classList.remove("hidden");
  document.getElementById("textoAcao").innerHTML = acaoTexto;
  document.getElementById("botaoAcao").className =
    "w-fit border-1 p-1 rounded-sm";
  document
    .getElementById("botaoAcao")
    .classList.add(`bg-${cor}-600/50`, `border-${cor}-600`);

  if (acaoTexto == "Editar") {
    document
      .getElementById("botaoAcao")
      .setAttribute("onclick", "editarPortico()");
  } else {
    document
      .getElementById("botaoAcao")
      .setAttribute("onclick", "cadastrarPortico()");
  }
}

function exibirDelete(id, idPortico) {
  document.getElementById(id).classList.remove("hidden");
  document.getElementById("botaoExcluir").setAttribute("data-id", idPortico);
}

function fecharPainel(id) {
  document.getElementById(id).classList.add("hidden");
}

function cadastrarPortico() {
  let nome = document.getElementById("ipt_nome").value;
  let uuid = document.getElementById("ipt_uuid").value;
  let portico = document.getElementById("ipt_portico").value;
  let rodovia = document.getElementById("ipt_rodovia").value;
  let km = document.getElementById("ipt_km").value;
  let sentido = document.getElementById("sel_sentido").value;
  let uf = document.getElementById("sel_uf").value;
  let status = document.getElementById("sel_status").value;

  if (fkEmpresa == null) {
    alert("Empresa não encontrada!");
  } else if (nome == "") {
    alert("Preencha o nome do embarcado!");
  } else if (uuid == "") {
    alert("Preencha o UUID!");
  } else if (portico == "") {
    alert("Preencha o código do pórtico!");
  } else if (rodovia == "") {
    alert("Preencha a rodovia!");
  } else if (km == "") {
    alert("Preencha o KM!");
  } else if (sentido == "") {
    alert("Selecione o sentido!");
  } else if (uf == "") {
    alert("Selecione a UF!");
  } else {
    fetch("/crud/cadastrarPortico", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        fkEmpresaServer: fkEmpresa,
        nomeServer: nome,
        uuidServer: uuid,
        porticoServer: portico,
        rodoviaServer: rodovia,
        kmServer: km,
        sentidoServer: sentido,
        ufServer: uf,
        statusServer: status,
      }),
    })
      .then(function (resposta) {
        if (resposta.ok) {
          alert("Embarcado cadastrado com sucesso!");
          fecharPainel("painelCRUD");
          listarPortico();
        } else {
          resposta.text().then(function (texto) {
            alert(texto);
          });
        }
      })
      .catch(function (erro) {
        console.log(erro);
        alert("Erro ao cadastrar o embarcado!");
      });
  }
}

function listarPortico() {
  let fkEmpresa = sessionStorage.getItem("EMPRESA_ID");

  fetch(`/crud/listarPortico/${fkEmpresa}`)
    .then(function (resposta) {
      if (resposta.ok) {
        return resposta.json();
      } else {
        console.log("Erro ao buscar embarcados!");
      }
    })
    .then(function (dados) {
      console.log("Embarcados cadastrados:", dados);

      let container_embarcados = document.getElementById(
        "container_embarcados",
      );

      container_embarcados.innerHTML = "";

      for (let i = 0; i < dados.length; i++) {
        let embarcado = dados[i];
        let status = "";

        if (embarcado.status == 1) {
          status = "Ativo";
        } else {
          status = "Inativo";
        }

        container_embarcados.innerHTML += `
                
                    <div id="card_embarcado" class="flex flex-col m-2 card_container_portico">
                        <div class="flex flex-row flex-wrap gap-7 h-fit bg-gray-300 p-6.5 rounded-t-sm justify-center items-center">
                            <div> <b>Nome:</b> ${embarcado.nome}</div>
                            <div> <b>Pórtico:</b> ${embarcado.codigo_identificacao}</div>
                            <div> <b>Status:</b> ${status}</div>

                            <button class="bg-yellow-600/50 border-1 border-yellow-600 p-1.5 rounded-sm"
                                onclick="exibirPainel('painelCRUD', 'Editar', 'yellow'); document.getElementById('botaoAcao').setAttribute('data-id', ${embarcado.id})">Editar
                            </button>

                            <button class="bg-red-600/50 border-1 border-red-600 p-1.5 rounded-sm"
                                onclick="exibirDelete('painelDelete', ${embarcado.id})">Apagar
                            </button>

                        </div>

                        <div class="flex flex-col gap-2 h-fit bg-gray-200 pt-3.5 pb-3.5 pr-6.5 pl-6.5 rounded-b-sm justify-center">
                            <h5 class="font-bold">
                                Componentes monitorados:
                            </h5>
                            <div class="flex flex-col sm:flex-row justify-around">
                                <div class="flex flex-col border-1 rounded-sm bg-gray-100">
                                    <div class="flex flex-row border-b-1 p-1">
                                        ${embarcado.componente}
                                    </div>
                                    <p class="p-1">
                                        Mínimo: <span>${embarcado.valor_minimo}</span>
                                    </p>
                                    <p class="p-1">
                                        Máximo: <span>${embarcado.valor_maximo}</span>
                                    </p>
                                    <p class="p-1">
                                        Unidade: <span>${embarcado.unidade_medida}</span>
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                `;
      }
    })
    .catch(function (erro) {
      console.log(erro);
    });
}

function filtrarPortico() {
  const nome = document
    .getElementById("nomePortico")
    .value.toLowerCase()
    .trim();

  const uuid = document
    .getElementById("uuidPortico")
    .value.toLowerCase()
    .trim();

  const codigo = document
    .getElementById("codigoPortico")
    .value.toLowerCase()
    .trim();

  const rodovia = document
    .getElementById("rodoviaPortico")
    .value.toLowerCase()
    .trim();

  const km = document.getElementById("kmPortico")
  .value.toLowerCase()
  .trim();

  const uf = document.getElementById("ufPortico").value
  .toLowerCase()
  .trim();

  const status = document
    .getElementById("statusPortico")
    .value.toLowerCase()
    .trim();

  const cards = document.querySelectorAll(".card_container_portico");

  cards.forEach((card) => {
    const texto = card.textContent.toLowerCase();
    const corresponde =
      (!nome || texto.includes(nome)) &&
      (!uuid || texto.includes(uuid)) &&
      (!codigo || texto.includes(codigo)) &&
      (!rodovia || texto.includes(rodovia)) &&
      (!km || texto.includes(km)) &&
      (!uf || texto.includes(uf)) &&
      (!status || texto.includes(status));
    card.style.display = corresponde ? "" : "none";
  });
}

function apagarPortico() {
  let idPortico = document
    .getElementById("botaoExcluir")
    .getAttribute("data-id");

  if (idPortico == null) {
    alert("Pórtico não encontrado!");
  } else {
    fetch("/crud/apagarPortico", {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        idPorticoServer: idPortico,
      }),
    })
      .then(function (resposta) {
        if (resposta.ok) {
          alert("Pórtico excluído com sucesso!");
          fecharPainel("painelDelete");
          document.getElementById("botaoExcluir").removeAttribute("data-id");
          listarPortico();
        } else {
          resposta.text().then(function (texto) {
            alert(texto);
          });
        }
      })
      .catch(function (erro) {
        console.log(erro);
        alert("Erro ao excluir o pórtico!");
      });
  }
}

function editarPortico() {
  let idEmbarcado = document
    .getElementById("botaoAcao")
    .getAttribute("data-id");

  let nome = document.getElementById("ipt_nome").value;
  let uuid = document.getElementById("ipt_uuid").value;
  let portico = document.getElementById("ipt_portico").value;
  let rodovia = document.getElementById("ipt_rodovia").value;
  let km = document.getElementById("ipt_km").value;
  let sentido = document.getElementById("sel_sentido").value;
  let uf = document.getElementById("sel_uf").value;
  let status = document.getElementById("sel_status").value;

  fetch("/crud/editarPortico", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      idPorticoServer: idEmbarcado,
      nomeServer: nome,
      uuidServer: uuid,
      porticoServer: portico,
      rodoviaServer: rodovia,
      kmServer: km,
      sentidoServer: sentido,
      ufServer: uf,
      statusServer: status,
    }),
  })
    .then(function (resposta) {
      if (resposta.ok) {
        alert("Pórtico editado com sucesso!");
        fecharPainel("painelCRUD");
        document.getElementById("botaoAcao").removeAttribute("data-id");
        listarEmbarcados();
      } else {
        resposta.text().then(function (texto) {
          alert(texto);
        });
      }
    })
    .catch(function (erro) {
      console.log(erro);
      alert("Erro ao editar o pórtico!");
    });
}
