import React, { useState, useEffect } from 'react';

const Calendario = ({ 
  eventos, 
  dataSelecionada, 
  setDataSelecionada, 
  dataAtual, 
  setDataAtual, 
  adicionarEvento, 
  deletarEvento, 
  atualizarEvento 
}) => {
  const [novoEventoTitulo, setNovoEventoTitulo] = useState('');
  const [novoEventoData, setNovoEventoData] = useState('');
  const [novoEventoHorario, setNovoEventoHorario] = useState('');
  const [modalAberto, setModalAberto] = useState(false);
  const [eventoEditando, setEventoEditando] = useState(null);
  const [feriados, setFeriados] = useState({});
  const [carregandoFeriados, setCarregandoFeriados] = useState(false);
  const [loading, setLoading] = useState(false);

  // Lista de feriados religiosos
  const feriadosReligiosos = [
    'Carnaval', 'Sexta-feira Santa', 'Páscoa', 'Corpus Christi'
  ];

  const buscarFeriados = async (ano) => {
    setCarregandoFeriados(true);
    try {
      const response = await fetch(`https://brasilapi.com.br/api/feriados/v1/${ano}`);
      const data = await response.json();
      const feriadosObj = {};
      data.forEach(feriado => {
        let tipo = 'Nacional';
        if (feriadosReligiosos.includes(feriado.name)) {
          tipo = 'Religioso';
        }
        
        feriadosObj[feriado.date] = {
          nome: feriado.name,
          tipo: tipo,
          emoji: getEmojiPorFeriado(feriado.name),
          descricao: getDescricaoFeriado(feriado.name)
        };
      });
      setFeriados(feriadosObj);
    } catch (error) {
      console.error('Erro ao buscar feriados:', error);
      setFeriados(getFeriadosFallback(ano));
    } finally {
      setCarregandoFeriados(false);
    }
  };

  const getEmojiPorFeriado = (nome) => {
    const emojis = {
      'Confraternização mundial': '🎉',
      'Carnaval': '🎭',
      'Sexta-feira Santa': '✝️',
      'Páscoa': '🐣',
      'Tiradentes': '⚔️',
      'Dia do trabalho': '👷',
      'Corpus Christi': '🍞',
      'Independência do Brasil': '🇧🇷',
      'Nossa Senhora Aparecida': '🙏',
      'Finados': '🕯️',
      'Proclamação da República': '🏛️',
      'Dia da consciência negra': '✊',
      'Natal': '🎄'
    };
    return emojis[nome] || '📅';
  };

  const getDescricaoFeriado = (nome) => {
    const descricoes = {
      'Confraternização mundial': 'Ano Novo - Início do ano civil',
      'Carnaval': 'Período de festas populares',
      'Sexta-feira Santa': 'Paixão e Morte de Cristo',
      'Páscoa': 'Ressurreição de Jesus Cristo',
      'Tiradentes': 'Homenagem a Joaquim José da Silva Xavier',
      'Dia do trabalho': 'Dia Internacional do Trabalho',
      'Corpus Christi': 'Corpo de Cristo',
      'Independência do Brasil': 'Proclamação da Independência do Brasil',
      'Nossa Senhora Aparecida': 'Padroeira do Brasil',
      'Finados': 'Dia dos Fiéis Defuntos',
      'Proclamação da República': 'Proclamação da República Brasileira',
      'Dia da consciência negra': 'Homenagem a Zumbi dos Palmares',
      'Natal': 'Nascimento de Jesus Cristo'
    };
    return descricoes[nome] || 'Feriado nacional';
  };

  const getFeriadosFallback = (ano) => {
    const feriadosFixos = {
      [`${ano}-01-01`]: { nome: "Confraternização Universal", tipo: "Nacional", emoji: "🎉", descricao: "Ano Novo - Início do ano civil" },
      [`${ano}-04-21`]: { nome: "Tiradentes", tipo: "Nacional", emoji: "⚔️", descricao: "Homenagem a Joaquim José da Silva Xavier" },
      [`${ano}-05-01`]: { nome: "Dia do Trabalhador", tipo: "Nacional", emoji: "👷", descricao: "Dia Internacional do Trabalho" },
      [`${ano}-09-07`]: { nome: "Independência do Brasil", tipo: "Nacional", emoji: "🇧🇷", descricao: "Proclamação da Independência do Brasil" },
      [`${ano}-10-12`]: { nome: "Nossa Senhora Aparecida", tipo: "Nacional", emoji: "🙏", descricao: "Padroeira do Brasil" },
      [`${ano}-11-02`]: { nome: "Finados", tipo: "Nacional", emoji: "🕯️", descricao: "Dia dos Fiéis Defuntos" },
      [`${ano}-11-15`]: { nome: "Proclamação da República", tipo: "Nacional", emoji: "🏛️", descricao: "Proclamação da República Brasileira" },
      [`${ano}-12-25`]: { nome: "Natal", tipo: "Nacional", emoji: "🎄", descricao: "Nascimento de Jesus Cristo" }
    };
    return feriadosFixos;
  };

  useEffect(() => {
    const ano = dataAtual.getFullYear();
    buscarFeriados(ano);
  }, [dataAtual]);

  const getFeriadoCor = (tipo) => tipo === 'Nacional' ? 'bg-orange-500' : 'bg-purple-500';
  const getFeriadoFundo = (tipo) => tipo === 'Nacional' ? 'bg-orange-100' : 'bg-purple-100';
  const getFeriadoTexto = (tipo) => tipo === 'Nacional' ? 'text-orange-700' : 'text-purple-700';
  const obterFeriado = (data) => feriados[data] || null;

  const ano = dataAtual.getFullYear();
  const mes = dataAtual.getMonth();
  const primeiroDia = new Date(ano, mes, 1).getDay();
  const diasNoMes = new Date(ano, mes + 1, 0).getDate();

  const diasArray = [];
  for (let i = 0; i < primeiroDia; i++) diasArray.push(null);
  for (let d = 1; d <= diasNoMes; d++) diasArray.push(new Date(ano, mes, d));

  const meses = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];

 
  const temEvento = (dataStr) => {
    if (!eventos || eventos.length === 0) return false;
    return eventos.some(evento => {
      const dataEvento = String(evento.data).split('T')[0];
      return dataEvento === dataStr;
    });
  };
  
  const ehHoje = (dataStr) => dataStr === new Date().toISOString().slice(0, 10);

  // Eventos do dia selecionado 
  const eventosDoDia = eventos.filter(evento => {
    const dataEvento = String(evento.data).split('T')[0];
    return dataEvento === dataSelecionada;
  });
  
  const feriado = obterFeriado(dataSelecionada);

  const handleAdicionarEvento = async () => {
    if (!novoEventoTitulo.trim() || !novoEventoData) {
      alert('Preencha o título e a data!');
      return;
    }
    
    setLoading(true);
    const sucesso = await adicionarEvento(novoEventoTitulo, novoEventoData, novoEventoHorario);
    setLoading(false);
    
    if (sucesso) {
      setNovoEventoTitulo('');
      setNovoEventoData('');
      setNovoEventoHorario('');
      setModalAberto(false);
      setDataSelecionada(novoEventoData);
    } else {
      alert('Erro ao adicionar compromisso. Tente novamente.');
    }
  };

  const handleEditarEvento = (evento) => {
    setEventoEditando(evento);
    setNovoEventoTitulo(evento.titulo);
    setNovoEventoData(evento.data);
    setNovoEventoHorario(evento.horario);
    setModalAberto(true);
  };

  const salvarEdicao = async () => {
    if (!eventoEditando) return;
    setLoading(true);
    await atualizarEvento(eventoEditando.id, novoEventoTitulo, novoEventoData, novoEventoHorario);
    setLoading(false);
    setEventoEditando(null);
    setModalAberto(false);
    setNovoEventoTitulo('');
    setNovoEventoData('');
    setNovoEventoHorario('');
    setDataSelecionada(novoEventoData);
  };

  return (
    <>
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-[#F9D949]/20">
        {/* Cabeçalho */}
        <div className="bg-gradient-to-r from-[#5E2A8C] to-[#7B3FAC] p-5">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-bold text-white">
                <i className="fas fa-calendar-alt mr-2 text-[#F9D949]" />
                Agenda Mensal
              </h2>
              <p className="text-white/70 text-sm mt-1">
                {carregandoFeriados ? 'Carregando feriados...' : 'Organize seus compromissos importantes'}
              </p>
            </div>
            <div className="flex gap-2">
              <button 
                onClick={() => setDataAtual(new Date(ano, mes - 1))} 
                className="bg-white/20 hover:bg-white/30 text-white px-3 py-1 rounded-full text-sm transition-all"
              >
                ◀
              </button>
              <span className="bg-white/20 backdrop-blur px-4 py-1 rounded-full text-white font-semibold text-sm">
                {meses[mes]} {ano}
              </span>
              <button 
                onClick={() => setDataAtual(new Date(ano, mes + 1))} 
                className="bg-white/20 hover:bg-white/30 text-white px-3 py-1 rounded-full text-sm transition-all"
              >
                ▶
              </button>
            </div>
          </div>
        </div>

        {/* Legenda */}
        <div className="px-5 pt-4 pb-2 border-b border-gray-100 bg-gray-50">
          <div className="flex flex-wrap gap-4 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-red-500"></div>
              <span className="text-gray-600">Compromisso</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-orange-500"></div>
              <span className="text-gray-600">Feriado Nacional</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-purple-500"></div>
              <span className="text-gray-600">Feriado Religioso</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-[#F9D949] ring-2 ring-[#F9D949]"></div>
              <span className="text-gray-600">Hoje</span>
            </div>
          </div>
        </div>
        
        {/* Grade do calendário */}
        <div className="p-5 bg-gradient-to-br from-[#faf5ff] to-[#f3eaff]">
          <div className="grid grid-cols-7 gap-2 text-center mb-3">
            {['DOM', 'SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SÁB'].map((dia, i) => (
              <div key={i} className="text-xs font-bold text-[#5E2A8C] py-2">{dia}</div>
            ))}
          </div>
          
          <div className="grid grid-cols-7 gap-2">
            {diasArray.map((dia, idx) => {
              if (!dia) return <div key={idx} className="p-2" />;
              
              const dataStr = dia.toISOString().slice(0, 10);
              const temEventoDia = temEvento(dataStr);
              const ehHojeDia = ehHoje(dataStr);
              const feriadoData = obterFeriado(dataStr);
              
              return (
                <div
                  key={idx}
                  onClick={() => setDataSelecionada(dataStr)}
                  className={`
                    relative group p-3 text-center rounded-xl cursor-pointer transition-all duration-200
                    ${ehHojeDia ? 'ring-2 ring-[#F9D949] ring-offset-2' : ''}
                    ${dataSelecionada === dataStr ? 'bg-gradient-to-r from-[#5E2A8C] to-[#7B3FAC] text-white shadow-lg scale-105' : ''}
                    ${temEventoDia && !feriadoData && dataSelecionada !== dataStr ? 'bg-red-500 text-white font-bold shadow-md' : ''}
                    ${feriadoData && dataSelecionada !== dataStr ? `${getFeriadoCor(feriadoData.tipo)} text-white font-bold shadow-md` : ''}
                    ${!temEventoDia && !feriadoData && dataSelecionada !== dataStr && !ehHojeDia ? 'hover:bg-white/50 bg-white' : ''}
                  `}
                >
                  <span className="text-sm font-bold">{dia.getDate()}</span>
                  {feriadoData && <div className="text-xs mt-1">{feriadoData.emoji}</div>}
                  {feriadoData && (
                    <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 bg-black/90 text-white text-xs px-3 py-1.5 rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20 shadow-lg">
                      <div className="font-bold">{feriadoData.nome}</div>
                      <div className="text-[10px] text-gray-300">{feriadoData.descricao}</div>
                    </div>
                  )}
                  {temEventoDia && !feriadoData && (
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full animate-pulse"></div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
        
        {/* Lista de compromissos do dia */}
        <div className="border-t border-[#F9E6B3] p-5 bg-white">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-[#5E2A8C]">
              <i className="fas fa-clock mr-2 text-[#F9D949]" />
              Compromissos do dia
            </h3>
            <span className="text-xs text-[#8B6EB0] bg-gray-100 px-3 py-1 rounded-full">
              {dataSelecionada.split('-').reverse().join('/')}
            </span>
          </div>
          
          <div className="max-h-60 overflow-y-auto space-y-2">
            {feriado && (
              <div className={`${getFeriadoFundo(feriado.tipo)} border-l-4 ${getFeriadoCor(feriado.tipo).replace('bg', 'border')} p-3 rounded-xl`}>
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{feriado.emoji}</span>
                  <div>
                    <p className={`font-bold ${getFeriadoTexto(feriado.tipo)}`}>{feriado.nome}</p>
                    <p className="text-xs text-gray-600">{feriado.descricao}</p>
                    <p className="text-xs text-gray-500 mt-1">Feriado {feriado.tipo}</p>
                  </div>
                </div>
              </div>
            )}
            
            {eventosDoDia.length === 0 && !feriado && (
              <div className="text-center py-8 text-gray-400">
                <i className="fas fa-calendar-day text-3xl mb-2 block" />
                <p className="text-sm">Nenhum compromisso para este dia</p>
                <button
                  onClick={() => {
                    setNovoEventoData(dataSelecionada);
                    setModalAberto(true);
                  }}
                  className="mt-2 text-[#5E2A8C] text-sm hover:underline"
                >
                  + Adicionar compromisso
                </button>
              </div>
            )}
            
            {eventosDoDia.map(evento => (
              <div key={evento.id} className="bg-gradient-to-r from-red-50 to-pink-50 p-3 rounded-xl border-l-4 border-red-500 hover:shadow-md transition-all group">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <i className="fas fa-circle text-red-500 text-xs" />
                      <p className="font-bold text-gray-800">{evento.titulo}</p>
                    </div>
                    {evento.horario && evento.horario !== '--:--' && (
                      <p className="text-xs text-gray-600 mt-1 ml-4">
                        <i className="far fa-clock mr-1" />
                        {evento.horario}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={() => handleEditarEvento(evento)} 
                      className="w-8 h-8 rounded-full bg-white hover:bg-blue-100 text-blue-500 transition-all flex items-center justify-center"
                    >
                      <i className="fas fa-edit text-sm" />
                    </button>
                    <button 
                      onClick={() => deletarEvento(evento.id)} 
                      className="w-8 h-8 rounded-full bg-white hover:bg-red-100 text-red-500 transition-all flex items-center justify-center"
                    >
                      <i className="fas fa-trash-alt text-sm" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Botão adicionar */}
        <div className="p-5 bg-gray-50 border-t border-[#F9E6B3]">
          <button
            onClick={() => {
              setEventoEditando(null);
              setNovoEventoTitulo('');
              setNovoEventoData('');
              setNovoEventoHorario('');
              setModalAberto(true);
            }}
            disabled={loading}
            className="w-full py-3 bg-gradient-to-r from-[#5E2A8C] to-[#7B3FAC] text-white rounded-xl font-semibold hover:shadow-lg transition-all hover:-translate-y-0.5 flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <i className="fas fa-plus-circle text-xl" />
            Adicionar Compromisso
          </button>
        </div>
      </div>

      {/* MODAL */}
      {modalAberto && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl animate-modal-in">
            <div className="bg-gradient-to-r from-[#5E2A8C] to-[#7B3FAC] p-5 rounded-t-2xl">
              <h3 className="text-xl font-bold text-white">
                <i className="fas fa-calendar-plus mr-2 text-[#F9D949]" />
                {eventoEditando ? '✏️ Editar Compromisso' : '📅 Novo Compromisso'}
              </h3>
              <p className="text-white/70 text-sm mt-1">Preencha os dados do seu compromisso</p>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-[#5E2A8C] font-semibold mb-2 text-sm">
                  <i className="fas fa-tag mr-1" /> Título *
                </label>
                <input
                  type="text"
                  value={novoEventoTitulo}
                  onChange={(e) => setNovoEventoTitulo(e.target.value)}
                  className="w-full px-4 py-2 border-2 border-[#F0E2FE] rounded-xl focus:border-[#F9D949] focus:outline-none transition-all"
                  placeholder="Ex: Reunião importante"
                  autoFocus
                />
              </div>
              
              <div>
                <label className="block text-[#5E2A8C] font-semibold mb-2 text-sm">
                  <i className="fas fa-calendar-day mr-1" /> Data *
                </label>
                <input
                  type="date"
                  value={novoEventoData}
                  onChange={(e) => setNovoEventoData(e.target.value)}
                  className="w-full px-4 py-2 border-2 border-[#F0E2FE] rounded-xl focus:border-[#F9D949] focus:outline-none transition-all"
                />
              </div>
              
              <div>
                <label className="block text-[#5E2A8C] font-semibold mb-2 text-sm">
                  <i className="fas fa-clock mr-1" /> Horário
                </label>
                <input
                  type="time"
                  value={novoEventoHorario}
                  onChange={(e) => setNovoEventoHorario(e.target.value)}
                  className="w-full px-4 py-2 border-2 border-[#F0E2FE] rounded-xl focus:border-[#F9D949] focus:outline-none transition-all"
                />
                <p className="text-xs text-gray-400 mt-1">Opcional</p>
              </div>
            </div>
            
            <div className="p-5 border-t border-[#F0E2FE] flex gap-3 justify-end">
              <button
                onClick={() => {
                  setModalAberto(false);
                  setEventoEditando(null);
                  setNovoEventoTitulo('');
                  setNovoEventoData('');
                  setNovoEventoHorario('');
                }}
                className="px-5 py-2 border-2 border-gray-300 rounded-xl text-gray-600 hover:bg-gray-50 transition-all"
              >
                Cancelar
              </button>
              <button
                onClick={eventoEditando ? salvarEdicao : handleAdicionarEvento}
                disabled={loading}
                className="px-5 py-2 bg-gradient-to-r from-[#5E2A8C] to-[#7B3FAC] text-white rounded-xl font-semibold hover:shadow-lg transition-all hover:-translate-y-0.5 disabled:opacity-50"
              >
                {loading ? (
                  <><i className="fas fa-spinner fa-spin mr-2" /> Salvando...</>
                ) : (
                  eventoEditando ? 'Salvar' : 'Adicionar'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes modal-in {
          from { opacity: 0; transform: scale(0.95) translateY(-20px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
        .animate-modal-in { animation: modal-in 0.3s ease-out; }
        @keyframes pulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.2); opacity: 0.7; }
        }
        .animate-pulse { animation: pulse 1s ease-in-out infinite; }
      `}</style>
    </>
  );
};

export default Calendario;