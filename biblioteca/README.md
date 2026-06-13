# 📚 Sistema de Biblioteca Escolar

Sistema web fullstack para gerenciamento de uma biblioteca escolar, com cadastro de alunos, livros, autores, editoras, empréstimos e histórico de multas.

---

## 🛠️ Tecnologias

| Camada | Tecnologia |
|--------|-----------|
| Banco de dados | Microsoft SQL Server 2022 (Linux/Ubuntu 22.04) |
| Backend | Node.js + Express |
| Frontend | HTML + Tailwind CSS (via CDN) |
| Gerenciador de BD | DBeaver 26 |

---

## 📁 Estrutura do Projeto

```
trabalhoWeb/
├── backend/
│   ├── server.js         # API REST (Express)
│   ├── .env              # Variáveis de ambiente (não versionar)
│   ├── package.json
│   └── node_modules/
└── frontend/
    ├── index.html        # Dashboard
    ├── script.js         # Lógica de busca global
    ├── style.css
    └── pages/
        ├── aluno.html
        ├── livro.html
        ├── area_conhecimento.html
        ├── editora.html
        ├── cidade.html
        ├── endereco.html
        └── historico.html
```

---

## 🗄️ Banco de Dados

**Nome:** `Biblioteca_Escola_Saber`  
**Esquema:** `dbo`  
**Porta:** `1433`

### Tabelas

```
Estado → Cidade → Endereco → Aluno
Editora → Livro ← Autor  (via Autor_Livro)
                ← Area_Conhecimento (via Area_Livro)
Livro → Exemplar → Exemplar_Emprestado → Historico
```

| Tabela | Descrição |
|--------|-----------|
| `Estado` | Estados do Brasil |
| `Cidade` | Cidades vinculadas a estados |
| `Endereco` | Endereços vinculados a cidades |
| `Aluno` | Cadastro de alunos |
| `Autor` | Cadastro de autores |
| `Editora` | Editoras dos livros |
| `Livro` | Catálogo de livros |
| `Exemplar` | Cópias físicas dos livros |
| `Autor_Livro` | Relacionamento N:N Autor ↔ Livro |
| `Area_Conhecimento` | Categorias de conhecimento |
| `Area_Livro` | Relacionamento N:N Área ↔ Livro |
| `Exemplar_Emprestado` | Empréstimos ativos |
| `Historico` | Histórico de devoluções e multas |

---

## ⚙️ Configuração

### 1. Pré-requisitos

- Node.js v18+
- SQL Server 2022 rodando localmente na porta 1433
- DBeaver (opcional, para gerenciar o banco)

### 2. Variáveis de ambiente

Crie o arquivo `backend/.env`:

```env
DB_USER=sa
DB_PASSWORD=SuaSenha
DB_SERVER=localhost
DB_PORT=1433
DB_NAME=Biblioteca_Escola_Saber
```

### 3. Instalar dependências

```bash
cd backend
npm install
```

### 4. Iniciar o servidor

```bash
node server.js
# 🚀 Servidor rodando na porta 4000
```

### 5. Abrir o frontend

Abra o `frontend/index.html` com o Live Server do VS Code (porta 5500) ou qualquer servidor estático.

---

## 🌐 API — Endpoints

### GETs (listagem com filtro opcional `?busca=termo`)

| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/autores` | Lista autores |
| GET | `/alunos` | Lista alunos |
| GET | `/livros` | Lista livros |
| GET | `/editoras` | Lista editoras |
| GET | `/cidades` | Lista cidades |
| GET | `/estados` | Lista estados |
| GET | `/areas-conhecimento` | Lista áreas |
| GET | `/enderecos` | Lista endereços |
| GET | `/historico` | Histórico com joins (aluno + livro) |

### POSTs (criação via Stored Procedures)

| Método | Rota | Body |
|--------|------|------|
| POST | `/autores` | `{ nome }` |
| POST | `/alunos` | `{ nome, cpf, telefone, email, turma, dataNascimento, idEndereco }` |
| POST | `/livros` | `{ titulo, idioma, isbn, anoPublicacao, idEditora }` |
| POST | `/editoras` | `{ nome }` |
| POST | `/cidades` | `{ nome, idEstado }` |
| POST | `/estados` | `{ nome }` |
| POST | `/enderecos` | `{ cep, logradouro, bairro, complemento, idCidade }` |
| POST | `/areas-conhecimento` | `{ nome }` |
| POST | `/autor-livro` | `{ idAutor, idLivro }` |
| POST | `/area-livro` | `{ idArea, idLivro }` |

---

## 📋 Fluxo de Cadastro

### Aluno
```
1. Estado → 2. Cidade → 3. Endereço → 4. Aluno
```

### Livro
```
1. Editora → 2. Livro → 3. Autor (+ vínculo) → 4. Área (+ vínculo)
```

---

## 🔧 Stored Procedures

Todas as operações de escrita usam Stored Procedures no SQL Server:

- `sp_InserirAluno` / `sp_AlterarAluno` / `sp_ExcluirAluno`
- `sp_InserirLivro`
- `sp_InserirAutor` / `sp_AlterarAutor` / `sp_ExcluirAutor`
- `sp_InserirAutorLivro`
- `sp_InserirAreaLivro`
- `sp_InserirEditora` / `sp_AlterarEditora` / `sp_ExcluirEditora`
- `sp_InserirCidade` / `sp_AlterarCidade` / `sp_ExcluirCidade`
- `sp_InserirEstado` / `sp_AlterarEstado` / `sp_ExcluirEstado`
- `sp_InserirEndereco` / `sp_AlterarEndereco` / `sp_ExcluirEndereco`
- `sp_InserirAreaConhecimento` / `sp_AlterarAreaConhecimento` / `sp_ExcluirAreaConhecimento`

---

## 👤 Autor

Desenvolvido por **Caio Silva** — estudante de Análise e Desenvolvimento de Sistemas (ADS) na FATEC São Paulo.