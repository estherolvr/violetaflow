# 📅 VioletaFlow - Agenda Digital

Sistema de agenda digital para estudantes universitários, com calendário mensal, quadro Kanban e autenticação segura.

<p align="center">
  <img src="images/dashbord.png" alt="Dashboard Global Cannoli" width="1000">
</p>

<p align="center">
  <img src="images/dashbord.png" alt="Dashboard Global Cannoli" width="1000">
</p>

<h3 align="center">
  <a href="https://frontend-cannoli.vercel.app/" target="_blank">
    👉 Clique aqui para acessar a aplicação
  </a>
</h3>
</h1>
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
node server.js
✅ O servidor estará rodando em `http://localhost:3001`

```

### 3️⃣ Frontend
```bash
cd frontend
npm install
npm start
✅ A aplicação estará disponível em `http://localhost:5173`
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

## ✨ Funcionalidades

- 🔐 Login e cadastro com autenticação JWT
- 📅 Calendário mensal com feriados nacionais
- ➕ Criação, edição e exclusão de compromissos
- 📋 Quadro Kanban com colunas: A Fazer, Em Andamento e Concluído
- 📊 Painel de produtividade com percentual de tarefas concluídas

---

### 📊 Resumo Conceitos Aplicados

| Categoria | Padrão | Localização |
|-----------|--------|-------------|
| Criacional | Singleton | `config/database.js` |
| Criacional | Factory Method | `authController.js`, `Kanban.jsx` |
| Criacional | Builder | `Kanban.jsx` |
| Estrutural | Adapter | `Calendario.jsx` |
| Estrutural | Facade | `services/api.js` |
| Comportamental | Observer | `useEffect` hooks |
| Comportamental | Command | Ações de CRUD |

---

