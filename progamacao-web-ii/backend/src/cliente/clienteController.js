import prisma from "../database.js";

//Verifica se os campos obrigatórios (NOT NULL) do cliente foram preenchidos
function verificarDadosCliente(dados) {
    const obrigatorios = [
        "nome",
        "cpf_cnpj",
        "data_nascimento",
        "telefone",
        "url_comprovante_residencia",
        "logradouro",
        "numero",
        "bairro",
        "cidade",
        "uf",
        "cep",
        "estado_civil"
    ];
     let faltando = [];

    for (const obrigatorio of obrigatorios) {
        let dado = dados[obrigatorio];

        if (dado === null || dado === "") {
            faltando.push(obrigatorio);
        }
    }

    return faltando;
}

async function cadastrarCliente(req, res) {
    const dados = req.body;
    verificarDadosCliente(dados);

    let conjuge_cpf;
    let conjuge_nome;
    let regime_bens;
    let conjuge_data_nascimento;
    let url_comprovante_uniao;
    let data_casamento;
    let casamento_ativo;
    let data_fim_casamento;

    let casado = false;
    if (dados.estado_civil === "casado") {
        casado = true;

        conjuge_cpf = dados.conjuge_cpf;
        conjuge_nome = dados.conjuge_nome;
        regime_bens = dados.regime_bens;
        conjuge_data_nascimento = dados.conjuge_data_nascimento;
        url_comprovante_uniao = dados.url_comprovante_uniao;
        data_casamento = dados.data_casamento;
        casamento_ativo = dados.casamento_ativo;
        data_fim_casamento = dados.data_fim_casamento;
    }

    const cliente = await prisma.cliente.create({
        data: {
            nome: dados.nome,
            cpf_cnpj: dados.cpf_cnpj,
            data_nascimento: dados.data_nascimento,
            telefone: dados.telefone,
            email: dados.email,
            url_comprovante_residencia: dados.url_comprovante_residencia,
            logradouro: dados.logradouro,
            numero: dados.numero,
            bairro: dados.bairro,
            complemento: dados.complemento,
            cidade: dados.cidade,
            uf: dados.uf,
            cep: dados.cep,
            estado_civil: dados.estado_civil
        }
    });

    let id_cliente = cliente.id_cliente;

    if (casado) {
        await prisma.conjuge.create({
            data: {
                cpf: conjuge_cpf,
                nome: conjuge_nome,
                regime_bens,
                data_nascimento: conjuge_data_nascimento,
                url_comprovante_uniao,
                data_casamento,
                casamento_ativo,
                data_fim_casamento,
                id_cliente
            }
        });
    }
}