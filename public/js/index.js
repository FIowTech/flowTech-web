async function completarCampos(cep) {
    let cepTratado = cep.replace(/\D/g, "")

    let resposta = await fetch(`https://viacep.com.br/ws/${cepTratado}/json/`);
    let dadosJSON = await resposta.json();

    if (dadosJSON.erro) {
        alert('CEP Inválido')
        return
    }
    document.getElementById('ipt_logradouro').value = dadosJSON.logradouro;
    document.getElementById('ipt_localidade').value = dadosJSON.localidade;
    document.getElementById('ipt_uf').value = dadosJSON.uf;
    document.getElementById('ipt_bairro').value = dadosJSON.bairro;
}

function gerarCodigoAleatorio() {
    let caracteres = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let codigo = '';

    for (let i = 0; i < 5; i++) {
        let indiceAleatorio = Math.floor(Math.random() * caracteres.length);
        codigo += caracteres[indiceAleatorio];
    }

    return codigo;
}

function cadastrarEmpresa() {
    let cnpj = document.getElementById('ipt_cnpj').value;
    let razao_social = document.getElementById('ipt_razao_social').value;
    let nome_fantasia = document.getElementById('ipt_nome_fantasia').value;
    let cep = document.getElementById('ipt_cep').value;
    let logradouro = document.getElementById('ipt_logradouro').value;
    let bairro = document.getElementById('ipt_bairro').value;
    let localidade = document.getElementById('ipt_localidade').value;
    let uf = document.getElementById('ipt_uf').value;
    let numero = document.getElementById('ipt_numero').value;
    let complemento = document.getElementById('ipt_complemento').value;
    let email = document.getElementById('ipt_email').value;
    let codigoEmpresa = gerarCodigoAleatorio();

    fetch('/empresas/cadastrarEmpresa', {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            cnpj: cnpj,
            razao_social: razao_social,
            nome_fantasia: nome_fantasia,
            cep: cep,
            logradouro: logradouro,
            bairro: bairro,
            localidade: localidade,
            uf: uf,
            numero: numero,
            complemento: complemento,
            email: email,
            codigo_autenticacao: codigoEmpresa
        })
    })

    document.getElementById('div-cadastro-empresa').innerHTML = `
                <div class="flex flex-row gap-3">
                <div class="flex flex-col gap-3">
                  <div class="flex p-3 border border-gray-300 rounded-lg">
                    <div class="flex justify-center items-center flex-col min-h-[35dvh] py-6">
                        <h3 class=" text-4xl md:text-5xl font-bold">Empresa cadastrada com sucesso!</h3>
                        <div class="h-10"></div>
                        <span>Seu código de ativação é:</span>
                        <h3 class=" text-4xl md:text-5xl font-bold">${codigoEmpresa}</h3>
                        <div class="h-10"></div>
                        <span class="w-4/5 text-xl">Clique no botão abaixo e cadastre seu usuário:</span>
                        <button
                          class="w-fit font-semibold text-white rounded-lg bg-green-900 transition delay-50 duration-300 ease-in-out hover:-translate-y-1 hover:scale-110 hover:bg-green-500 py-3.5 px-6.5 mt-4"
                          onclick="window.location.href='login-cadastro.html'">
                          Seguir para cadastro
                        </button>
                    </div>
                  </div>
                </div>
                <div class="h-10"></div>
              </div>
    `;
}