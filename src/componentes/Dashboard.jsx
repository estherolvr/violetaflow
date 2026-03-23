import React, { useState, useEffect } from 'react';
import Calendario from './Calendar';
import Kanban from './Kanban';
import { tarefasAPI, eventosAPI } from '../services/api';

const Dashboard = ({ onLogout }) => {
  const [eventos, setEventos] = useState([]);
  const [tarefas, setTarefas] = useState({ fazer: [], andamento: [], concluido: [] });
  const [dataAtual, setDataAtual] = useState(new Date());
  const [dataSelecionada, setDataSelecionada] = useState(new Date().toISOString().slice(0, 10));
  const [usuario, setUsuario] = useState(null);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    const usuarioSalvo = localStorage.getItem('violetaflow_usuario') || sessionStorage.getItem('violetaflow_usuario');
    if (usuarioSalvo) {
      setUsuario(JSON.parse(usuarioSalvo));
    }
    carregarDados();
  }, []);

  const carregarDados = async () => {
    setCarregando(true);
    try {
      console.log('📥 Carregando dados...');
      
      // Carregar tarefas
      const tarefasResponse = await tarefasAPI.getAll();
      console.log('📦 Tarefas carregadas:', tarefasResponse);
      if (tarefasResponse.success) {
        setTarefas(tarefasResponse.tarefas);
      }

      // Carregar eventos
      const eventosResponse = await eventosAPI.getAll();
      console.log('📦 Eventos carregados:', eventosResponse);
      if (eventosResponse.success) {
        setEventos(eventosResponse.eventos);
      }
    } catch (error) {
      console.error('❌ Erro ao carregar dados:', error);
    } finally {
      setCarregando(false);
    }
  };

  // Adicionar evento
  const adicionarEvento = async (titulo, data, horario) => {
    if (!titulo.trim() || !data) return false;
    
    console.log('📤 Adicionando evento:', { titulo, data, horario });
    
    try {
      const response = await eventosAPI.create({ titulo, data, horario });
      console.log('✅ Resposta do servidor:', response);
      
      if (response.success) {
        await carregarDados();
        // Força a atualização da data selecionada
        setDataSelecionada(data);
        return true;
      }
      return false;
    } catch (error) {
      console.error('❌ Erro ao adicionar evento:', error);
      return false;
    }
  };

  // Deletar evento
  const deletarEvento = async (id) => {
    console.log('🗑️ Deletando evento:', id);
    const response = await eventosAPI.delete(id);
    if (response.success) await carregarDados();
  };

  // Atualizar evento
  const atualizarEvento = async (id, novoTitulo, novaData, novoHorario) => {
    console.log('✏️ Atualizando evento:', { id, novoTitulo, novaData, novoHorario });
    const response = await eventosAPI.update(id, { titulo: novoTitulo, data: novaData, horario: novoHorario });
    if (response.success) await carregarDados();
  };

  const handleLogout = () => {
    localStorage.removeItem('violetaflow_token');
    localStorage.removeItem('violetaflow_usuario');
    localStorage.removeItem('violetaflow_logado');
    sessionStorage.removeItem('violetaflow_token');
    sessionStorage.removeItem('violetaflow_usuario');
    sessionStorage.removeItem('violetaflow_logado');
    if (onLogout) onLogout();
  };

  const totalEventos = eventos.length;
  const tarefasPendentes = tarefas.fazer.length + tarefas.andamento.length;
  const tarefasConcluidas = tarefas.concluido.length;
  const totalTarefas = tarefasPendentes + tarefasConcluidas;
  const produtividadePercentual = totalTarefas === 0 ? 0 : Math.round((tarefasConcluidas / totalTarefas) * 100);

  const dataAtualFormatada = new Date().toLocaleDateString('pt-BR', { 
    weekday: 'long', 
    day: 'numeric', 
    month: 'long' 
  });

  if (carregando) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#f8f3fe]">
        <div className="text-center">
          <i className="fas fa-spinner fa-spin text-4xl text-[#5E2A8C] mb-4" />
          <p className="text-[#5E2A8C]">Carregando seus dados...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-[#f8f3fe]">
      {/* Sidebar */}
      <aside className="w-20 md:w-72 bg-[#5E2A8C]/90 backdrop-blur-lg border-r border-[#F9D949]/30 p-4 md:p-6 flex flex-col gap-6">
        <div className="flex items-center justify-center md:justify-start gap-3">
          <div className="w-10 h-10 md:w-12 md:h-12 bg-[#F9D949] rounded-xl flex items-center justify-center">
            <i className="fas fa-calendar-alt text-[#5E2A8C] text-lg md:text-xl" />
          </div>
          <h2 className="hidden md:block text-white text-xl font-bold">Violeta<span className="text-[#F9D949]">Flow</span></h2>
        </div>
        
        <div className="hidden md:block bg-white/10 rounded-2xl p-4">
          <p className="text-white/80 text-sm">
            <i className="fas fa-smile-wink" /> Olá, <span className="font-semibold text-white">{usuario?.nome || 'estudante'}</span>
          </p>
          <h4 className="text-[#F9D949] font-bold mt-1">🎓 Organize sua rotina</h4>
        </div>
        
        <nav className="flex flex-col gap-2">
          {[
            { icone: 'fas fa-chalkboard-user', label: 'Painel' },
            { icone: 'fas fa-calendar-week', label: 'Minha Agenda' },
            { icone: 'fas fa-tasks', label: 'Kanban' }
          ].map((item, i) => (
            <button key={i} className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${i === 0 ? 'bg-[#F9D949] text-[#3C096C]' : 'text-white/80 hover:bg-white/10'}`}>
              <i className={item.icone} />
              <span className="hidden md:inline">{item.label}</span>
            </button>
          ))}
        </nav>
        
        <button
          onClick={handleLogout}
          className="mt-auto flex items-center gap-3 px-4 py-3 rounded-xl text-white/80 hover:bg-red-500/20 hover:text-red-400 transition-all duration-300"
        >
          <i className="fas fa-sign-out-alt text-lg" />
          <span className="hidden md:inline">Sair</span>
        </button>
        
        <div className="hidden md:block bg-black/20 rounded-2xl p-4 text-center">
          <p className="text-white/70 text-sm"><i className="fas fa-chart-line" /> Produtividade</p>
          <div className="text-2xl font-bold text-[#F9D949]">{produtividadePercentual}%</div>
          <div className="h-2 bg-[#3C096C] rounded-full mt-2 overflow-hidden">
            <div className="h-full bg-[#F9D949] rounded-full transition-all" style={{ width: `${produtividadePercentual}%` }} />
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-4 md:p-6">
        <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
          <div>
            <h1 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-[#5E2A8C] to-[#9B51E0] bg-clip-text text-transparent">
              <i className="fas fa-sparkles text-[#F9D949] mr-2" />
              Bem-vindo ao seu espaço
            </h1>
            <p className="text-[#6F42A1] text-sm">gerencie compromissos e tarefas com um toque de magia</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="bg-white px-4 py-2 rounded-full shadow-sm">
              <i className="far fa-calendar-alt text-[#5E2A8C] mr-2" />
              {dataAtualFormatada}
            </div>
            <button
              onClick={handleLogout}
              className="md:hidden bg-red-500/10 text-red-500 px-3 py-2 rounded-full hover:bg-red-500/20 transition"
            >
              <i className="fas fa-sign-out-alt" />
            </button>
          </div>
        </div>

        {/* Cards de estatísticas */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          {[
            { label: 'COMPROMISSOS', valor: totalEventos, icone: 'fas fa-calendar-check' },
            { label: 'TAREFAS PENDENTES', valor: tarefasPendentes, icone: 'fas fa-list-ul' },
            { label: 'CONCLUÍDAS', valor: tarefasConcluidas, icone: 'fas fa-check-circle' }
          ].map((stat, i) => (
            <div key={i} className="bg-white rounded-2xl p-4 flex justify-between items-center shadow-sm">
              <div>
                <h4 className="text-[#8B6EB0] text-xs tracking-wider">{stat.label}</h4>
                <div className="text-2xl md:text-3xl font-bold text-[#3C096C]">{stat.valor}</div>
              </div>
              <i className={`${stat.icone} text-2xl text-[#AE7BEC]`} />
            </div>
          ))}
        </div>

        {/* Calendário */}
        <div className="mb-6">
          <Calendario
            eventos={eventos}
            dataSelecionada={dataSelecionada}
            setDataSelecionada={setDataSelecionada}
            dataAtual={dataAtual}
            setDataAtual={setDataAtual}
            adicionarEvento={adicionarEvento}
            deletarEvento={deletarEvento}
            atualizarEvento={atualizarEvento}
          />
        </div>

        {/* Kanban */}
        <div>
          <Kanban
            tarefas={tarefas}
            setTarefas={setTarefas}
          />
        </div>
      </main>
    </div>
  );
};

export default Dashboard;