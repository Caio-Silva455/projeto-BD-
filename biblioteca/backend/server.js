const express = require('express');
const sql = require('mssql');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// ─── CONFIGURAÇÃO DO BANCO DE DADOS ──────────────────────────────────────────
const config = {
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    server: process.env.DB_SERVER,
    port: parseInt(process.env.DB_PORT) || 1433,
    database: process.env.DB_NAME,
    options: { encrypt: true, trustServerCertificate: true }
};
let pool;
async function getPool() {
    if (!pool) pool = await sql.connect(config);
    return pool;
}

async function execSP(spName, paramsFn) {
    const pool = await getPool();
    const req = pool.request();
    if (paramsFn) paramsFn(req);
    return await req.execute(spName);
}

app.get('/autores', async (req, res) => {
    try {
        const pool = await getPool();

        const termo = req.query.busca || req.query.nome;

        let querySQL = 'SELECT id, nome FROM Autor';

        const request = pool.request();

        if (termo) {
            querySQL += ' WHERE nome LIKE @filtro';
            request.input('filtro', sql.VarChar, `%${termo}%`);
        }

        querySQL += ' ORDER BY id DESC';

        const result = await request.query(querySQL);

        res.json(result.recordset);

    } catch (err) {
        console.error(err);
        res.status(500).json({ erro: err.message });
    }
});

app.get('/exemplares', async (req, res) => {
    try {
        const pool = await getPool();
        const termo = req.query.busca;
        let querySQL = `
            SELECT 
                e.id, 
                e.numero_exemplar, 
                e.idLivro, 
                l.titulo AS titulo_livro
                e.status AS status_exemplar
           select * from Area_Conhecimento ac  FROM Exemplar e
            INNER JOIN Livro l ON e.idLivro = l.id
        `;
        const request = pool.request();
        if (termo) {
            querySQL += ' WHERE l.titulo LIKE @filtro';
            request.input('filtro', sql.VarChar, `%${termo}%`);
        }
        querySQL += ' ORDER BY e.id DESC';
        const result = await request.query(querySQL);
        res.json(result.recordset);
    } catch (err) {
        res.status(500).json({ erro: err.message });
    }
});

app.get('/aluno', async (req, res) => {
    try {
        const pool = await getPool();
        const termo = req.query.busca;
        let querySQL = 'SELECT id, nome, cpf, telefone, email, turma, dataNascimento, idEndereco FROM Aluno';
        const request = pool.request();
        if (termo) {
            querySQL += ' WHERE nome LIKE @filtro OR cpf LIKE @filtro';
            request.input('filtro', sql.VarChar, `%${termo}%`);
        }
        querySQL += ' ORDER BY id DESC';
        const result = await request.query(querySQL);
        res.json(result.recordset);
    } catch (err) {
        res.status(500).json({ erro: err.message });
    }
});

app.get('/livro', async (req, res) => {
    try {
        const pool = await getPool();
        const termo = req.query.busca;
        let querySQL = 'SELECT id, titulo, idioma, isbn, idEditora FROM Livro';
        const request = pool.request();
        if (termo) {
            querySQL += ' WHERE titulo LIKE @filtro OR isbn LIKE @filtro';
            request.input('filtro', sql.VarChar, `%${termo}%`);
        }
        querySQL += ' ORDER BY id DESC';
        const result = await request.query(querySQL);
        res.json(result.recordset);
    } catch (err) {
        res.status(500).json({ erro: err.message });
    }
});

app.get('/cidades', async (req, res) => {
    try {
        const pool = await getPool();
        const termo = req.query.busca;
        let querySQL = 'SELECT id, nome, idEstado FROM Cidade';
        const request = pool.request();
        if (termo) {
            querySQL += ' WHERE nome LIKE @filtro';
            request.input('filtro', sql.VarChar, `%${termo}%`);
        }
        querySQL += ' ORDER BY nome ASC';
        const result = await request.query(querySQL);
        res.json(result.recordset);
    } catch (err) {
        res.status(500).json({ erro: err.message });
    }
});

app.get('/estados', async (req, res) => {
    try {
        const pool = await getPool();
        const termo = req.query.busca;
        let querySQL = 'SELECT id, nome FROM Estado';
        const request = pool.request();
        if (termo) {
            querySQL += ' WHERE nome LIKE @filtro';
            request.input('filtro', sql.VarChar, `%${termo}%`);
        }
        querySQL += ' ORDER BY nome ASC';
        const result = await request.query(querySQL);
        res.json(result.recordset);
    } catch (err) {
        res.status(500).json({ erro: err.message });
    }
});

app.get('/editoras', async (req, res) => {
    try {
        const pool = await getPool();
        const termo = req.query.busca;
        let querySQL = 'SELECT id, nome FROM Editora';
        const request = pool.request();
        if (termo) {
            querySQL += ' WHERE nome LIKE @filtro';
            request.input('filtro', sql.VarChar, `%${termo}%`);
        }
        querySQL += ' ORDER BY id DESC';
        const result = await request.query(querySQL);
        res.json(result.recordset);
    } catch (err) {
        res.status(500).json({ erro: err.message });
    }
});

app.get('/area-conhecimento', async (req, res) => {
    try {
        const pool = await getPool();
        const termo = req.query.busca;
        let querySQL = 'SELECT id, nome FROM Area_Conhecimento';
        const request = pool.request();
        if (termo) {
            querySQL += ' WHERE nome LIKE @filtro';
            request.input('filtro', sql.VarChar, `%${termo}%`);
        }
        querySQL += ' ORDER BY id DESC';
        const result = await request.query(querySQL);
        res.json(result.recordset);
    } catch (err) {
        res.status(500).json({ erro: err.message });
    }
});

app.get('/enderecos', async (req, res) => {
    try {
        const pool = await getPool();
        const result = await pool.request().query('SELECT id, cep, logradouro, bairro, complemento, idCidade FROM Endereco ORDER BY id DESC');
        res.json(result.recordset);
    } catch (err) {
        res.status(500).json({ erro: err.message });
    }
});

app.get('/historico', async (req, res) => {
    try {
        const pool = await getPool();
        const termo = req.query.busca;
        let querySQL = `
            SELECT 
                h.id, 
                h.data_emprestimo, 
                h.data_devolucao, 
                h.data_pagamento_multa, 
                h.descricao, 
                h.idExemplarEmprestado,
                al.nome AS nome_aluno, 
                liv.titulo AS titulo_livro
            FROM Historico h
            INNER JOIN Exemplar_Emprestado ee ON h.idExemplarEmprestado = ee.id
            INNER JOIN Aluno al ON ee.idAluno = al.id
            INNER JOIN Exemplar ex ON ee.idExemplar = ex.id
            INNER JOIN Livro liv ON ex.idLivro = liv.id
        `;
        const request = pool.request();
        if (termo) {
            querySQL += ' WHERE al.nome LIKE @filtro OR liv.titulo LIKE @filtro';
            request.input('filtro', sql.VarChar, `%${termo}%`);
        }
        querySQL += ' ORDER BY h.id DESC';
        const result = await request.query(querySQL);
        res.json(result.recordset);
    } catch (err) {
        res.status(500).json({ erro: err.message });
    }
});

// ─── POSTs ────────────────────────────────────────────────────────────────────
app.post('/livro', async (req, res) => {
    const { titulo, idioma, anoPublicacao, isbn, idEditora } = req.body;
    console.log(anoPublicacao);
    if (!titulo) return res.status(400).json({ erro: 'titulo é obrigatório' });
    try {
        await execSP('sp_InserirLivro', r =>
            r.input('titulo', sql.VarChar(255), titulo)
             .input('idioma', sql.VarChar(100), idioma ?? null)
             .input('anoPublicacao', sql.Date, anoPublicacao ?? null)
             .input('isbn', sql.VarChar(13), isbn ?? null)
             .input('idEditora', sql.Int, idEditora ?? null)
        );
        res.status(201).json({ mensagem: `Livro '${titulo}' cadastrado com sucesso!` });
    } catch (err) {
        res.status(500).json({ erro: err.message });
    }
});

app.post('/autor-livro', async (req, res) => {
    const { idAutor, idLivro } = req.body;
    if (!idAutor || !idLivro) return res.status(400).json({ erro: 'idAutor e idLivro são obrigatórios' });
    try {
        await execSP('sp_InserirAutorLivro', r =>
            r.input('idAutor', sql.Int, idAutor)
             .input('idLivro', sql.Int, idLivro)
        );
        res.status(201).json({ mensagem: 'Autor vinculado ao livro com sucesso!' });
    } catch (err) {
        res.status(500).json({ erro: err.message });
    }
});
 
app.post('/area-livro', async (req, res) => {
    const { idArea, idLivro } = req.body;
    if (!idArea || !idLivro) return res.status(400).json({ erro: 'idArea e idLivro são obrigatórios' });
    try {
        await execSP('sp_InserirAreaLivro', r =>
            r.input('idArea', sql.Int, idArea)
             .input('idLivro', sql.Int, idLivro)
        );
        res.status(201).json({ mensagem: 'Área vinculada ao livro com sucesso!' });
    } catch (err) {
        res.status(500).json({ erro: err.message });
    }
});

app.post('/autores', async (req, res) => {
    const nome = req.body.nome || req.body.nome_autor;
    if (!nome) return res.status(400).json({ erro: 'O campo nome é obrigatório' });
    try {
        await execSP('sp_InserirAutor', r =>
            r.input('nome_autor', sql.VarChar(255), nome)
        );
        res.status(201).json({ mensagem: `Autor '${nome}' inserido com sucesso!` });
    } catch (err) {
        res.status(500).json({ erro: err.message });
    }
});

app.post('/aluno', async (req, res) => {
    const { nome, cpf, telefone, email, turma, dataNascimento, idEndereco } = req.body;
    console.log('dataNascimento recebida:', dataNascimento);
    try {
        await execSP('sp_InserirAluno', r =>
            r.input('nome', sql.VarChar(100), nome)
             .input('cpf', sql.VarChar(14), cpf)
             .input('telefone', sql.VarChar(20), telefone)
             .input('email', sql.VarChar(100), email ?? null)
             .input('turma', sql.VarChar(15), turma ?? null)
             .input('dataNascimento', sql.Date, dataNascimento)
             .input('idEndereco', sql.Int, idEndereco)
        );
        res.status(201).json({ mensagem: 'Aluno cadastrado com sucesso!' });
    } catch (err) {
        res.status(500).json({ erro: err.message });
    }
});

app.post('/areas-conhecimento', async (req, res) => {
    const { nome } = req.body;
    if (!nome) return res.status(400).json({ erro: 'nome é obrigatório' });
    try {
        await execSP('sp_InserirAreaConhecimento', r =>
            r.input('nome', sql.VarChar(50), nome)
        );
        res.status(201).json({ mensagem: `Área de conhecimento '${nome}' inserida com sucesso!` });
    } catch (err) {
        res.status(500).json({ erro: err.message });
// ─── POSTs ─────────────────────────────────
    }
});

app.post('/estados', async (req, res) => {
    const { nome } = req.body;
    if (!nome) return res.status(400).json({ erro: 'nome é obrigatório' });
    try {
        await execSP('sp_InserirEstado', r =>
            r.input('nome', sql.VarChar(100), nome)
        );
        res.status(201).json({ mensagem: `Estado '${nome}' inserido com sucesso!` });
    } catch (err) {
        res.status(500).json({ erro: err.message });
    }
});

app.post('/cidades', async (req, res) => {
    const { nome, idEstado } = req.body;
    if (!nome || !idEstado) return res.status(400).json({ erro: 'nome e idEstado são obrigatórios' });
    try {
        await execSP('sp_InserirCidade', r =>
            r.input('nome', sql.VarChar(200), nome)
             .input('idEstado', sql.Int, idEstado)
        );
        res.status(201).json({ mensagem: `Cidade '${nome}' inserida com sucesso!` });
    } catch (err) {
        res.status(500).json({ erro: err.message });
    }
});

app.post('/enderecos', async (req, res) => {
    const { cep, logradouro, bairro, complemento } = req.body;
    const idcidade = req.body.idCidade || req.body.idcidade;
    if (!cep || !logradouro || !bairro || !idcidade)
        return res.status(400).json({ erro: 'cep, logradouro, bairro e idCidade são obrigatórios' });
    try {
        await execSP('sp_InserirEndereco', r =>
            r.input('cep', sql.VarChar(8), cep)
             .input('logradouro', sql.VarChar(100), logradouro)
             .input('bairro', sql.VarChar(50), bairro)
             .input('complemento', sql.VarChar(50), complemento ?? null)
             .input('idcidade', sql.Int, idcidade)
        );
        res.status(201).json({ mensagem: 'Endereço cadastrado com sucesso!' });
    } catch (err) {
        res.status(500).json({ erro: err.message });
    }
});

app.post('/editoras', async (req, res) => {
    const { nome } = req.body;
    if (!nome) return res.status(400).json({ erro: 'nome é obrigatório' });
    try {
        await execSP('sp_InserirEditora', r =>
            r.input('nome', sql.VarChar(100), nome)
        );
        res.status(201).json({ mensagem: `Editora '${nome}' inserida com sucesso!` });
    } catch (err) {
        res.status(500).json({ erro: err.message });
    }
});

app.post('/historico', async (req, res) => {
    const { data_emprestimo, data_devolucao, data_pagamento_multa, descricao, idExemplarEmprestado } = req.body;
    if (!data_emprestimo || !idExemplarEmprestado)
        return res.status(400).json({ erro: 'data_emprestimo e idExemplarEmprestado são obrigatórios' });
    try {
        await execSP('sp_InserirHistorico', r =>
            r.input('data_emprestimo', sql.Date, data_emprestimo)
             .input('data_devolucao', sql.Date, data_devolucao ?? null)
             .input('data_pagamento_multa', sql.Date, data_pagamento_multa ?? null)
             .input('descricao', sql.VarChar(255), descricao ?? null)
             .input('idExemplarEmprestado', sql.Int, idExemplarEmprestado)
        );
        res.status(201).json({ mensagem: 'Registro de histórico inserido com sucesso!' });
    } catch (err) {
        res.status(500).json({ erro: err    .message });
    }
});

app.listen(4000, () => console.log(' Servidor rodando na porta 4000 com suporte a buscas!'));