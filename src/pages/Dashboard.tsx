import React, { useState, useEffect, useRef } from 'react';
import {
  Users,
  FileText,
  UserPlus,
  Building2,
  Menu,
  ChevronDown,
  TrendingUp,
  TrendingDown,
  LogOut
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import "../styles/Dashboard.css";

// Importações do Firebase Auth
import { app } from '../firebase'; // Instância do Firebase
import { getAuth, onAuthStateChanged, signOut } from 'firebase/auth'; // Funções de autenticação
const auth = getAuth(app); // Obtém a instância de autenticação

const Dashboard: React.FC = () => {
  // Estados para controle da interface
  const [activeSection, setActiveSection] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentDate, setCurrentDate] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // Estados para autenticação
  const [loggedInUserName, setLoggedInUserName] = useState('');
  const [loading, setLoading] = useState(true); // Controla o estado de carregamento da verificação de auth

  // Efeito para monitorar o estado de autenticação
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setLoading(false); // Finaliza o carregamento
      
      if (!user) {
        // Se não houver usuário autenticado, redireciona imediatamente para login
        navigate('/');
        return;
      }
      
      // Define o nome do usuário baseado nas informações disponíveis
      setLoggedInUserName(
        user.displayName || 
        user.email?.split('@')[0] || // Pega a parte antes do @ se for email
        'Usuário'
      );
    });

    // Cleanup function para remover o listener quando o componente desmontar
    return () => unsubscribe();
  }, [navigate]);

  // Efeito para atualizar a data atual periodicamente
  useEffect(() => {
    const updateDate = () => {
      const now = new Date();
      const options: Intl.DateTimeFormatOptions = {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      };
      setCurrentDate(now.toLocaleDateString('pt-BR', options));
    };

    updateDate(); // Atualiza imediatamente
    const interval = setInterval(updateDate, 60000); // Atualiza a cada minuto
    
    return () => clearInterval(interval); // Limpa o intervalo ao desmontar
  }, []);

  // Efeito para fechar o dropdown ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Dados mockados para exibição no dashboard
  const comunicados = [
    { id: '01', titulo: 'Comunicado de otimização', enviado: 'João Ba', para: 'Israel', status: 'Pendente' },
    { id: '02', titulo: 'Projeto de otimização', enviado: 'Fatima', para: 'Mu de Áries', status: 'Aprovado' },
    { id: '03', titulo: 'Aviso de projeto', enviado: 'João Ba', para: 'James brown', status: 'Aprovado' },
    { id: '04', titulo: 'Comunicado de otimização', enviado: 'Israel', para: 'João Ba', status: 'Aprovado' },
  ];

  const funcionarios = [
    { id: '01', nome: 'Israel kamalakwonode', cargo: 'Admin', funcao: 'Recursos Humanos' },
    { id: '02', nome: 'Old Yvan Kovode', cargo: 'Admin', funcao: 'Gerenciamento' },
    { id: '03', nome: 'Daniel Safoues', cargo: 'Head TI', funcao: 'Pesquisas e Operação' },
    { id: '04', nome: 'Fadma Asinfada', cargo: 'Head Contas', funcao: 'Contas' },
  ];

  const comprovantes = [
    { id: '01', assunto: 'Solicitação de pagamento para mudança', data: '20/01/2023', status: 'Pendente' },
    { id: '02', assunto: 'Solicitação de taxa de proposta', data: '19/01/2023', status: 'Aprovado' },
    { id: '03', assunto: 'Solicitação de pagamento para fevereiro', data: '19/01/2023', status: 'Aprovado' },
    { id: '04', assunto: 'Solicitação de taxa de proposta', data: '03/01/2023', status: 'Pendente' },
  ];

  // Componente para os cartões de estatísticas
  const StatCard: React.FC<{
    title: string;
    value: string;
    icon: React.ReactNode;
    color: string;
    trend?: string;
    trendType?: 'positive' | 'negative';
  }> = ({ title, value, icon, color, trend = "2% a mais que no último trimestre", trendType = 'positive' }) => (
    <div className="stat-card">
      <div className="stat-card-content">
        <div className="stat-text">
          <h3 className="stat-value">{value}</h3>
          <p className="stat-title">{title}</p>
          <small className={`stat-trend ${trendType === 'negative' ? 'negative' : ''}`}>
            {trendType === 'positive' ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
            {trend}
          </small>
        </div>
        <div className="stat-icon" style={{ color }}>
          {icon}
        </div>
      </div>
      <div className="stat-accent" style={{ backgroundColor: color }}></div>
    </div>
  );

  // Componente para as seções de tabela
  const TableSection: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <div className="table-section">
      <div className="table-header">
        <h2>{title}</h2>
      </div>
      <div className="table-container">
        {children}
      </div>
    </div>
  );

  // Função para alternar a visibilidade do sidebar
  const toggleSidebar = () => {
    setSidebarOpen(prevState => !prevState);
  };

  // Função para fechar o sidebar
  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  // Função para alternar o dropdown do perfil
  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };

  // Função para deslogar o usuário
  const handleLogout = async () => {
    try {
      await signOut(auth); // Chama a função de logout do Firebase
      navigate('/'); // Redireciona para a página de login
    } catch (error) {
      console.error("Erro ao deslogar:", error);
      alert("Ocorreu um erro ao tentar sair. Por favor, tente novamente.");
    }
  };

  // Função para navegar entre seções (fecha sidebar em mobile)
  const handleNavigate = (section: string) => {
    setActiveSection(section);
    if (window.innerWidth <= 768) {
      setSidebarOpen(false);
    }
  };

  // Tela de carregamento enquanto verifica autenticação
  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loader"></div>
        <p>Verificando autenticação...</p>
      </div>
    );
  }

  // Não renderiza nada se não estiver autenticado (o redirecionamento já aconteceu)
  if (!loggedInUserName) {
    return null;
  }

  return (
    <div className="dashboard">
      {/* Sidebar */}
      <Sidebar
        activeSection={activeSection}
        onNavigate={handleNavigate}
      />

      {/* Overlay para mobile */}
      {sidebarOpen && (
        <div
          className="sidebar-overlay"
          onClick={closeSidebar}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            zIndex: 999
          }}
        />
      )}

      {/* Conteúdo principal */}
      <main className="main-content">
        {/* Cabeçalho */}
        <header className="header">
          <div className="header-left">
            <button
              className="mobile-menu-btn"
              onClick={toggleSidebar}
              aria-label="Abrir menu lateral"
            >
              <Menu size={24} />
            </button>
            <div className="header-info">
              <h1>Bem-vindo, {loggedInUserName}</h1>
              <p>Hoje é {currentDate}</p>
            </div>
          </div>
          <div className="header-right" ref={dropdownRef}>
            <button className="user-profile" onClick={toggleDropdown} aria-expanded={dropdownOpen}>
              <div className="user-avatar">
                {loggedInUserName.charAt(0).toUpperCase()}
                {loggedInUserName.includes(' ') && loggedInUserName.split(' ')[1].charAt(0).toUpperCase()}
              </div>
              <div className="user-info">
                <span className="user-name">{loggedInUserName}</span>
                <ChevronDown size={16} />
              </div>
            </button>
            <div className={`profile-dropdown ${dropdownOpen ? 'show' : ''}`}>
              <button onClick={handleLogout}>
                <LogOut size={18} />
                Sair
              </button>
            </div>
          </div>
        </header>

        {/* Seção de estatísticas */}
        <section className="stats-section">
          <div className="stats-grid">
            <StatCard
              title="Total de funcionários"
              value="250"
              icon={<Users size={32} />}
              color="#f59e0b"
              trend="2% a mais que no último trimestre"
              trendType="positive"
            />
            <StatCard
              title="Total de candidaturas"
              value="100"
              icon={<UserPlus size={32} />}
              color="#3b82f6"
              trend="5% a menos que no mês passado"
              trendType="negative"
            />
            <StatCard
              title="Total de projetos"
              value="10"
              icon={<FileText size={32} />}
              color="#8b5cf6"
              trend="1% a mais que no ano passado"
              trendType="positive"
            />
            <StatCard
              title="Total de departamentos"
              value="10"
              icon={<Building2 size={32} />}
              color="#10b981"
              trend="Estável em relação ao último ano"
              trendType="positive"
            />
          </div>
        </section>

        {/* Seção de conteúdo com tabelas */}
        <section className="content-section">
          <div className="content-wrapper-tables">
            <TableSection title="Comunicados Recentes">
              <table className="table">
                <thead>
                  <tr>
                    <th>S/N</th>
                    <th>Título</th>
                    <th>Enviado de</th>
                    <th>Enviado para</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {comunicados.map((item) => (
                    <tr key={item.id}>
                      <td>{item.id}</td>
                      <td className="text-truncate">{item.titulo}</td>
                      <td>{item.enviado}</td>
                      <td>{item.para}</td>
                      <td>
                        <span className={`status status-${item.status.toLowerCase()}`}>
                          {item.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </TableSection>

            <TableSection title="Funcionários Ativos">
              <table className="table">
                <thead>
                  <tr>
                    <th>S/N</th>
                    <th>Nome</th>
                    <th>Cargo</th>
                    <th>Função</th>
                  </tr>
                </thead>
                <tbody>
                  {funcionarios.map((item) => (
                    <tr key={item.id}>
                      <td>{item.id}</td>
                      <td className="text-truncate">{item.nome}</td>
                      <td>{item.cargo}</td>
                      <td>{item.funcao}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </TableSection>

            <TableSection title="Comprovantes de Pagamento Recentes">
              <table className="table">
                <thead>
                  <tr>
                    <th>S/N</th>
                    <th>Assunto</th>
                    <th>Data</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {comprovantes.map((item) => (
                    <tr key={item.id}>
                      <td>{item.id}</td>
                      <td className="text-truncate">{item.assunto}</td>
                      <td>{item.data}</td>
                      <td>
                        <span className={`status status-${item.status.toLowerCase()}`}>
                          {item.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </TableSection>
          </div>

          {/* Seção do gráfico */}
          <div className="content-grid-chart">
            <div className="chart-section">
              <div className="chart-header">
                <h2>Distribuição de Candidaturas</h2>
                <div className="chart-legend">
                  <div className="legend-item">
                    <div className="legend-dot" style={{ backgroundColor: '#10b981' }}></div>
                    <span>Registrados (300)</span>
                  </div>
                  <div className="legend-item">
                    <div className="legend-dot" style={{ backgroundColor: '#f59e0b' }}></div>
                    <span>Aprovados (370)</span>
                  </div>
                  <div className="legend-item">
                    <div className="legend-dot" style={{ backgroundColor: '#ef4444' }}></div>
                    <span>Rejeitados (50)</span>
                  </div>
                </div>
              </div>
              <div className="chart-container">
                <div className="donut-chart">
                  <div className="chart-center">
                    <h3>720</h3>
                    <p>Total de candidaturas</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Dashboard;