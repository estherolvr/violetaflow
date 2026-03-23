# 🌸 VioletaFlow - Agenda Digital

Sistema de agenda digital para estudantes universitários, com calendário mensal, quadro Kanban e autenticação segura.

---

## 🛠️ Tecnologias

**Backend:** Node.js, Express, MySQL, JWT, Bcrypt  
**Frontend:** React, Vite, Tailwind CSS

---

## 🚀 Como Rodar

### 1️⃣ Banco de Dados

Crie o banco no MySQL:
```sql
CREATE DATABASE violetaflow;
```

> Certifique-se de ter as tabelas `users`, `eventos` e `tarefas` criadas antes de rodar.

---

### 2️⃣ Backend
```bash
cd backend
npm install
```

Crie o arquivo `.env` na raiz do backend:
```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=sua_senha
DB_NAME=violetaflow
JWT_SECRET=sua_chave_secreta
PORT=3001
```

Inicie o servidor:
```bash
npm run dev
```

✅ O servidor estará rodando em `http://localhost:3001`

---

### 3️⃣ Frontend
```bash
cd frontend
npm install
npm run dev
```

✅ A aplicação estará disponível em `http://localhost:5173`

---

## 📁 Estrutura do Projeto
```
violetaflow/
├── backend/
│   ├── config/
│   │   └── database.js
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── eventosController.js
│   │   └── tarefasController.js
│   ├── middlewares/
│   │   └── authMiddleware.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── eventosRoutes.js
│   │   └── tarefasRoutes.js
│   ├── .env
│   └── server.js
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── Calendario.jsx
    │   │   └── Kanban.jsx
    │   ├── pages/
    │   │   └── Dashboard.jsx
    │   └── services/
    │       └── api.js
    └── index.html
```

---

## ✨ Funcionalidades

- 🔐 Login e cadastro com autenticação JWT
- 📅 Calendário mensal com feriados nacionais
- ➕ Criação, edição e exclusão de compromissos
- 📋 Quadro Kanban com colunas: A Fazer, Em Andamento e Concluído
- 📊 Painel de produtividade com percentual de tarefas concluídas

---

## 🔗 Endpoints da API

| Método | Rota | Descrição |
|--------|------|-----------|
| POST | `/api/auth/login` | Login do usuário |
| POST | `/api/auth/cadastro` | Cadastro de novo usuário |
| GET | `/api/eventos` | Listar eventos |
| POST | `/api/eventos` | Criar evento |
| PUT | `/api/eventos/:id` | Editar evento |
| DELETE | `/api/eventos/:id` | Deletar evento |
| GET | `/api/tarefas` | Listar tarefas |
| POST | `/api/tarefas` | Criar tarefa |
| PUT | `/api/tarefas/:id` | Editar tarefa |
| PATCH | `/api/tarefas/:id/mover` | Mover tarefa entre colunas |
| DELETE | `/api/tarefas/:id` | Deletar tarefa |

---

## 👩‍💻 Desenvolvido com 💜 para estudantes universitários
