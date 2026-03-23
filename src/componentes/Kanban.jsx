import React, { useState } from 'react';
import { tarefasAPI } from '../services/api';

const Kanban = ({ tarefas, setTarefas }) => {
  const [novaTarefa, setNovaTarefa] = useState({
    titulo: '',
    horario: '',
    descricao: ''
  });
  const [modalAberto, setModalAberto] = useState(false);
  const [tarefaEditando, setTarefaEditando] = useState(null);
  const [animacao, setAnimacao] = useState(false);
  const [descricaoExpandida, setDescricaoExpandida] = useState({});
  const [carregando, setCarregando] = useState(false);

  const colunas = [
    { 
      id: 'fazer', 
      titulo: '📋 A Fazer', 
      itens: tarefas.fazer,
      cor: 'border-l-4 border-yellow-400',
      bg: 'bg-yellow-50',
      icon: 'fa-list'
    },
    { 
      id: 'andamento', 
      titulo: '⚡ Em Andamento', 
      itens: tarefas.andamento,
      cor: 'border-l-4 border-blue-400',
      bg: 'bg-blue-50',
      icon: 'fa-spinner'
    },
    { 
      id: 'concluido', 
      titulo: '✅ Concluído', 
      itens: tarefas.concluido,
      cor: 'border-l-4 border-green-400',
      bg: 'bg-green-50',
      icon: 'fa-check-circle'
    }
  ];

  
  const toggleDescricao = (tarefaId) => {
    setDescricaoExpandida(prev => ({
      ...prev,
      [tarefaId]: !prev[tarefaId]
    }));
  };

  // Mover tarefa entre colunas
  const moverTarefa = async (coluna, indice, direcao) => {
    let arrayOrigem;
    if (coluna === 'fazer') arrayOrigem = [...tarefas.fazer];
    else if (coluna === 'andamento') arrayOrigem = [...tarefas.andamento];
    else arrayOrigem = [...tarefas.concluido];

    if (indice < 0 || indice >= arrayOrigem.length) return;
    
    const tarefa = arrayOrigem[indice];
    const texto = tarefa;
    arrayOrigem.splice(indice, 1);

    let colunaDestino = null;
    if (direcao === 'esquerda') {
      if (coluna === 'andamento') colunaDestino = 'fazer';
      else if (coluna === 'concluido') colunaDestino = 'andamento';
    } else {
      if (coluna === 'fazer') colunaDestino = 'andamento';
      else if (coluna === 'andamento') colunaDestino = 'concluido';
    }

    const novasTarefas = { ...tarefas };
    
    if (colunaDestino) {
      if (colunaDestino === 'fazer') novasTarefas.fazer.push(texto);
      else if (colunaDestino === 'andamento') novasTarefas.andamento.push(texto);
      else novasTarefas.concluido.push(texto);
    } else {
      if (coluna === 'fazer') novasTarefas.fazer.splice(indice, 0, texto);
      else if (coluna === 'andamento') novasTarefas.andamento.splice(indice, 0, texto);
      else novasTarefas.concluido.splice(indice, 0, texto);
    }

    if (coluna === 'fazer') novasTarefas.fazer = arrayOrigem;
    else if (coluna === 'andamento') novasTarefas.andamento = arrayOrigem;
    else novasTarefas.concluido = arrayOrigem;

    setTarefas(novasTarefas);
    setAnimacao(true);
    setTimeout(() => setAnimacao(false), 300);

    // Salvar no banco se a tarefa tem ID
    if (tarefa.id && colunaDestino) {
      try {
        await tarefasAPI.mover(tarefa.id, colunaDestino);
      } catch (error) {
        console.error('Erro ao mover tarefa:', error);
      }
    }
  };

  // Deletar tarefa
  const deletarTarefa = async (coluna, indice) => {
    let tarefa;
    if (coluna === 'fazer') tarefa = tarefas.fazer[indice];
    else if (coluna === 'andamento') tarefa = tarefas.andamento[indice];
    else tarefa = tarefas.concluido[indice];

    const novasTarefas = { ...tarefas };
    if (coluna === 'fazer') novasTarefas.fazer.splice(indice, 1);
    else if (coluna === 'andamento') novasTarefas.andamento.splice(indice, 1);
    else novasTarefas.concluido.splice(indice, 1);
    setTarefas(novasTarefas);

    // Deletar do banco se tiver ID
    if (tarefa.id) {
      try {
        await tarefasAPI.delete(tarefa.id);
      } catch (error) {
        console.error('Erro ao deletar tarefa:', error);
      }
    }
  };

  // Editar tarefa
  const editarTarefa = (coluna, indice, tarefaObj) => {
    setTarefaEditando({ coluna, indice, ...tarefaObj });
    setNovaTarefa({
      titulo: tarefaObj.titulo,
      horario: tarefaObj.horario || '',
      descricao: tarefaObj.descricao || ''
    });
    setModalAberto(true);
  };

 
  const adicionarTarefa = async () => {
    if (!novaTarefa.titulo.trim()) return;

    setCarregando(true);

    try {
      if (tarefaEditando) {
       
        const response = await tarefasAPI.update(tarefaEditando.id, {
          titulo: novaTarefa.titulo.trim(),
          horario: novaTarefa.horario || '',
          descricao: novaTarefa.descricao || ''
        });

        if (response.success) {
          // Atualizar localmente
          const novasTarefas = { ...tarefas };
          const coluna = tarefaEditando.coluna;
          const tarefaAtualizada = {
            ...tarefaEditando,
            titulo: novaTarefa.titulo.trim(),
            horario: novaTarefa.horario || '',
            descricao: novaTarefa.descricao || ''
          };
          
          if (coluna === 'fazer') novasTarefas.fazer[tarefaEditando.indice] = tarefaAtualizada;
          else if (coluna === 'andamento') novasTarefas.andamento[tarefaEditando.indice] = tarefaAtualizada;
          else novasTarefas.concluido[tarefaEditando.indice] = tarefaAtualizada;
          
          setTarefas(novasTarefas);
          setTarefaEditando(null);
        }
      } else {
        // Criar nova tarefa
        const response = await tarefasAPI.create({
          titulo: novaTarefa.titulo.trim(),
          horario: novaTarefa.horario || '',
          descricao: novaTarefa.descricao || ''
        });

        if (response.success) {
          
          const novaTarefaObj = {
            id: response.tarefa.id,
            titulo: response.tarefa.titulo,
            horario: response.tarefa.horario,
            descricao: response.tarefa.descricao
          };
          setTarefas({ ...tarefas, fazer: [...tarefas.fazer, novaTarefaObj] });
        }
      }
      
      setModalAberto(false);
      setNovaTarefa({ titulo: '', horario: '', descricao: '' });
    } catch (error) {
      console.error('Erro ao salvar tarefa:', error);
      alert('Erro ao salvar tarefa. Tente novamente.');
    } finally {
      setCarregando(false);
    }
  };

  // Estatísticas
  const contarTarefas = () => {
    const total = tarefas.fazer.length + tarefas.andamento.length + tarefas.concluido.length;
    const concluidas = tarefas.concluido.length;
    return { total, concluidas };
  };

  const { total, concluidas } = contarTarefas();
  const progresso = total === 0 ? 0 : Math.round((concluidas / total) * 100);

 
  const truncarTexto = (texto, limite = 80) => {
    if (!texto) return '';
    if (texto.length <= limite) return texto;
    return texto.substring(0, limite) + '...';
  };

  // Função para renderizar o card da tarefa
  const renderizarTarefa = (tarefa, idx, coluna) => {
    const tarefaObj = typeof tarefa === 'string' 
      ? { id: null, titulo: tarefa, horario: '', descricao: '' }
      : tarefa;
    
    const tarefaId = tarefaObj.id || `${coluna.id}-${idx}`;
    const descricaoExp = descricaoExpandida[tarefaId];
    const temDescricaoLonga = tarefaObj.descricao && tarefaObj.descricao.length > 80;
    const descricaoParaMostrar = descricaoExp ? tarefaObj.descricao : truncarTexto(tarefaObj.descricao, 80);

    return (
      <div
        key={idx}
        className={`group bg-white p-3 rounded-lg border border-gray-100 hover:shadow-md transition-all duration-200 hover:-translate-y-0.5 ${coluna.cor} ${animacao ? 'animate-pulse' : ''}`}
      >
        <div className="flex justify-between items-start gap-2">
          {/* Conteúdo principal */}
          <div className="flex-1 min-w-0">
            <p className="text-gray-700 text-sm font-semibold break-words">
              {tarefaObj.titulo}
            </p>
            
            {tarefaObj.horario && tarefaObj.horario !== '' && (
              <p className="text-xs text-purple-500 mt-1">
                <i className="far fa-clock mr-1" />
                {tarefaObj.horario}
              </p>
            )}
            
            {tarefaObj.descricao && tarefaObj.descricao !== '' && (
              <div className="mt-1">
                <p className="text-xs text-gray-500 break-words">
                  {descricaoParaMostrar}
                </p>
                {temDescricaoLonga && (
                  <button
                    onClick={() => toggleDescricao(tarefaId)}
                    className="text-xs text-[#5E2A8C] hover:text-[#F9D949] mt-1 font-medium transition-colors"
                  >
                    {descricaoExp ? '🔽 Ler menos' : '🔼 Ler mais'}
                  </button>
                )}
              </div>
            )}
          </div>
          
          {/* Botões de ação */}
          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
            <button
              onClick={() => moverTarefa(coluna.id, idx, 'esquerda')}
              className="w-7 h-7 rounded-full bg-gray-100 hover:bg-yellow-100 text-gray-500 hover:text-yellow-600 transition-all flex items-center justify-center"
              title="Mover para esquerda"
            >
              <i className="fas fa-arrow-left text-xs" />
            </button>
            <button
              onClick={() => moverTarefa(coluna.id, idx, 'direita')}
              className="w-7 h-7 rounded-full bg-gray-100 hover:bg-yellow-100 text-gray-500 hover:text-yellow-600 transition-all flex items-center justify-center"
              title="Mover para direita"
            >
              <i className="fas fa-arrow-right text-xs" />
            </button>
            <button
              onClick={() => editarTarefa(coluna.id, idx, tarefaObj)}
              className="w-7 h-7 rounded-full bg-gray-100 hover:bg-blue-100 text-gray-500 hover:text-blue-600 transition-all flex items-center justify-center"
              title="Editar tarefa"
            >
              <i className="fas fa-edit text-xs" />
            </button>
            <button
              onClick={() => deletarTarefa(coluna.id, idx)}
              className="w-7 h-7 rounded-full bg-gray-100 hover:bg-red-100 text-gray-500 hover:text-red-600 transition-all flex items-center justify-center"
              title="Excluir tarefa"
            >
              <i className="fas fa-trash text-xs" />
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-[#F9D949]/20">
        {/* Cabeçalho */}
        <div className="bg-gradient-to-r from-[#5E2A8C] to-[#7B3FAC] p-5">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-bold text-white">
                <i className="fas fa-columns mr-2 text-[#F9D949]" />
                Quadro Kanban
              </h2>
              <p className="text-white/70 text-sm mt-1">Organize suas tarefas com horários e descrições</p>
            </div>
            <div className="bg-white/20 backdrop-blur rounded-full px-4 py-2">
              <span className="text-white font-semibold">{progresso}%</span>
              <span className="text-white/70 text-sm ml-1">concluído</span>
            </div>
          </div>
          <div className="mt-3 h-2 bg-white/20 rounded-full overflow-hidden">
            <div 
              className="h-full bg-[#F9D949] rounded-full transition-all duration-500"
              style={{ width: `${progresso}%` }}
            />
          </div>
        </div>
        
        {/* Colunas Kanban */}
        <div className="flex-1 overflow-x-auto p-5 bg-gradient-to-br from-[#faf5ff] to-[#f3eaff]">
          <div className="flex gap-5 min-w-[700px]">
            {colunas.map(col => (
              <div 
                key={col.id} 
                className="flex-1 bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow flex flex-col"
              >
                <div className={`p-3 border-b-2 ${col.id === 'fazer' ? 'border-yellow-400' : col.id === 'andamento' ? 'border-blue-400' : 'border-green-400'} bg-gray-50 flex-shrink-0`}>
                  <div className="flex justify-between items-center">
                    <h3 className="font-bold text-[#5E2A8C]">
                      <i className={`fas ${col.icon} mr-2 ${col.id === 'fazer' ? 'text-yellow-500' : col.id === 'andamento' ? 'text-blue-500' : 'text-green-500'}`} />
                      {col.titulo}
                    </h3>
                    <span className="text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded-full">
                      {col.itens.length}
                    </span>
                  </div>
                </div>
                
                <div className="p-3 space-y-2 min-h-[300px] max-h-[400px] overflow-y-auto flex-1">
                  {col.itens.length === 0 ? (
                    <div className="text-center py-8 text-gray-400 text-sm">
                      <i className="fas fa-inbox text-2xl mb-2 block" />
                      Nenhuma tarefa
                    </div>
                  ) : (
                    col.itens.map((tarefa, idx) => renderizarTarefa(tarefa, idx, col))
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Botão adicionar tarefa */}
        <div className="p-5 border-t border-[#F9E6B3] bg-white">
          <button
            onClick={() => {
              setTarefaEditando(null);
              setNovaTarefa({ titulo: '', horario: '', descricao: '' });
              setModalAberto(true);
            }}
            disabled={carregando}
            className="w-full py-3 bg-gradient-to-r from-[#5E2A8C] to-[#7B3FAC] text-white rounded-xl font-semibold hover:shadow-lg transition-all hover:-translate-y-0.5 flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <i className="fas fa-plus-circle text-xl" />
            Nova Tarefa
          </button>
          <p className="text-xs text-gray-400 mt-2 text-center">
            <i className="fas fa-arrow-left mr-1" /> Passe o mouse sobre as tarefas para ver as opções
          </p>
        </div>
      </div>

      {/* MODAL */}
      {modalAberto && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl transform animate-modal-in">
            <div className="bg-gradient-to-r from-[#5E2A8C] to-[#7B3FAC] p-5 rounded-t-2xl">
              <h3 className="text-xl font-bold text-white">
                <i className="fas fa-tasks mr-2 text-[#F9D949]" />
                {tarefaEditando ? '✏️ Editar Tarefa' : '📝 Nova Tarefa'}
              </h3>
              <p className="text-white/70 text-sm mt-1">
                Preencha os detalhes da sua tarefa
              </p>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-[#5E2A8C] font-semibold mb-2 text-sm">
                  <i className="fas fa-tag mr-1" />
                  Título da tarefa *
                </label>
                <input
                  type="text"
                  value={novaTarefa.titulo}
                  onChange={(e) => setNovaTarefa({ ...novaTarefa, titulo: e.target.value })}
                  className="w-full px-4 py-2 border-2 border-[#F0E2FE] rounded-xl focus:border-[#F9D949] focus:outline-none transition-all"
                  placeholder="Ex: Estudar para a prova"
                  autoFocus
                />
              </div>
              
              <div>
                <label className="block text-[#5E2A8C] font-semibold mb-2 text-sm">
                  <i className="fas fa-clock mr-1" />
                  Horário (opcional)
                </label>
                <input
                  type="time"
                  value={novaTarefa.horario}
                  onChange={(e) => setNovaTarefa({ ...novaTarefa, horario: e.target.value })}
                  className="w-full px-4 py-2 border-2 border-[#F0E2FE] rounded-xl focus:border-[#F9D949] focus:outline-none transition-all"
                />
              </div>
              
              <div>
                <label className="block text-[#5E2A8C] font-semibold mb-2 text-sm">
                  <i className="fas fa-align-left mr-1" />
                  Descrição
                </label>
                <textarea
                  value={novaTarefa.descricao}
                  onChange={(e) => setNovaTarefa({ ...novaTarefa, descricao: e.target.value })}
                  rows="4"
                  className="w-full px-4 py-2 border-2 border-[#F0E2FE] rounded-xl focus:border-[#F9D949] focus:outline-none transition-all resize-none"
                  placeholder="Descreva os detalhes da tarefa..."
                />
                <p className="text-xs text-gray-400 mt-1">
                  {novaTarefa.descricao.length} caracteres
                </p>
              </div>
            </div>
            
            <div className="p-5 border-t border-[#F0E2FE] flex gap-3 justify-end">
              <button
                onClick={() => setModalAberto(false)}
                className="px-5 py-2 border-2 border-gray-300 rounded-xl text-gray-600 hover:bg-gray-50 transition-all"
              >
                Cancelar
              </button>
              <button
                onClick={adicionarTarefa}
                disabled={carregando}
                className="px-5 py-2 bg-gradient-to-r from-[#5E2A8C] to-[#7B3FAC] text-white rounded-xl font-semibold hover:shadow-lg transition-all hover:-translate-y-0.5 disabled:opacity-50"
              >
                {carregando ? (
                  <><i className="fas fa-spinner fa-spin mr-2" /> Salvando...</>
                ) : (
                  tarefaEditando ? 'Salvar Alterações' : 'Adicionar Tarefa'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.02); }
        }
        .animate-pulse {
          animation: pulse 0.3s ease-in-out;
        }
        @keyframes modal-in {
          from {
            opacity: 0;
            transform: scale(0.95) translateY(-20px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
        .animate-modal-in {
          animation: modal-in 0.3s ease-out;
        }
      `}</style>
    </>
  );
};

export default Kanban;