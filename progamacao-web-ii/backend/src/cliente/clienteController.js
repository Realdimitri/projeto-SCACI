import prisma from "../database.js";

/**
 * @author Matheus Pereira Rodrigues
 * 
 * Verifica se os campos obrigatórios (NOT NULL) do cliente foram devidamente preenchidos.
 * 
 * @param {Object} dados - Objeto contendo os dados do cliente a serem verificados.
 * @param {boolean} casado - boolean que verifica se cliente é casado (true) ou não (false).
 * @returns {Array} faltando - array contendo os nomes dos campos obrigatórios que não foram preenchidos.
 */
function verificarDadosCliente(dados, casado) {
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

    if (casado) {
        obrigatorios.push(
            "conjuge_cpf",
            "conjuge_nome",
            "regime_bens",
            "url_comprovante_uniao",
            "data_casamento",
            "casamento_ativo"
        );
    }
    
     let faltando = [];

    for (const obrigatorio of obrigatorios) {
        const dado = dados[obrigatorio];

        if (dado === null || dado === "") {
            faltando.push(obrigatorio);
        }
    }

    return faltando;
}

/**
 * @author Matheus Pereira Rodrigues
 * 
 * Insere um novo cliente no banco de dados.
 * 
 * @param {Object} req - Objeto de requisição do Express (contém body).
 * @param {Object} res - Objeto de resposta do Express.
 * @returns {Object} Retorna o cliente inserido ou uma mensagem de erro.
 */
async function cadastrarCliente(req, res) {
    const dados = req.body;

    let casado = false;
    if (dados.estado_civil === "casado") {
        casado = true;
    }

    let faltando = verificarDadosCliente(dados, casado);

    if (faltando.length === 0) {

        try {

            const clienteCpfExistente = await prisma.cliente.findUnique({
                where: {
                    cpf_cnpj: dados.cpf_cnpj
                }
            });

            if (clienteCpfExistente) {
                return res.status(400).json({erro: 'Existe um cliente cadastrado com esses dados!'});
            }

            if (dados.email != null) {
                const clienteEmailExistente = await prisma.cliente.findUnique({
                    where: {
                        email: dados.email
                    }
                })

                if (clienteEmailExistente) {
                    return res.status(400).json({erro: 'Existe um cliente cadastrado com esses dados!'});
                }
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

            const id_cliente = cliente.id_cliente;

            if (casado) {
                await cadastrarConjuge(dados, id_cliente);
            }

            return res.status(200).json({cliente});

        } catch (error) {
             return res.status(500).json({ erro: 'Erro ao inserir no banco', detalhes: error.message });
        }

    } else {
        return res.status(400).json({erro: `Preencha todos os campos obrigatórios! (${faltando.join(", ")})`});
    }
}

/**
 * @author Matheus Pereira Rodrigues
 * 
 * Cadastra um cônjuge no banco de dados. 
 *  
 * @param {Object} dados - Objeto contendo os dados do cônjuge a serem inseridos. 
 * @param {number} id_cliente -  ID do cliente ao qual o cônjuge está vinculado.
 */
async function cadastrarConjuge(dados, id_cliente) {

    await prisma.conjuge.create({
        data: {
            cpf: dados.conjuge_cpf,
            nome: dados.conjuge_nome,
            regime_bens: dados.regime_bens,
            data_nascimento: dados.conjuge_data_nascimento,
            url_comprovante_uniao: dados.url_comprovante_uniao,
            data_casamento: dados.data_casamento,
            casamento_ativo: dados.casamento_ativo,
            data_fim_casamento: dados.data_fim_casamento,
            id_cliente: id_cliente
         }
    });
}

/**
 * @author Pedro Lucas Dos Santos Xavier
 * Valida os dados recebidos para a edição de um cliente. Garantindo que a requisição não esteja vazia e que nenhum campo venha em branco ou nulo.
 * @param {Object} dados - Objeto contendo os campos do cliente a serem atualizados (req.body).
 * @returns {string|null} Retorna uma mensagem de erro em texto caso haja problema, ou null se estiver válido.
 */
function verificarDadosEdicaoCliente(dados){
    if(!dados|| Object.keys(dados).length === 0){
        return "Forneça pelo menos um campo para atualizar"
    }else{
        for(const[campo,valor]of Object.entries(dados)){
            if(valor=== null|| valor=== undefined||(typeof valor ==='string' && valor.trim()==='')){
                return `o campo ${campo} não pode ser vazio`
            }
        }
    }
    return null
}

/**
 * @author Pedro Lucas Dos Santos Xavier 
 * Atualiza os dados de um cliente existente.
 * @param {Object} req - Objeto de requisição do Express (contém params e body).
 * @param {Object} res - Objeto de resposta do Express.
 * @returns {Object} Retorna o cliente atualizado ou uma mensagem de erro.
 */
async function editarCliente(req,res){
const{id}=req.params;
const dadosAtuais= req.body;
if (isNaN(Number(id))) {
        return res.status(400).json({ mensagem: "O ID fornecido deve ser um número válido." });
    }
const erro=verificarDadosEdicaoCliente(dadosAtuais);
if(erro){
    return res.status(400).json({mensagem: erro});
}
try{
    const clienteAtualizado= await prisma.cliente.update({
        where: {id_cliente: Number(id)},
        data: dadosAtuais
    });
    return res.status(200).json(clienteAtualizado);
}catch (error) {
    return res.status(500).json({ erro: 'Erro ao atualizar no banco', detalhes: error.message });
  }
}

export { cadastrarCliente, editarCliente }