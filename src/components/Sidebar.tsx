import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Home, Users, FileText, Building2, DollarSign, Bell, Settings } from 'lucide-react';
import Logo from '../assets/logocomp.png'; 
import "../styles/Sidebar.css";

// Interface para os itens da sidebar
interface SidebarItem {
  id: string;
  label: string;
  icon: React.ElementType;
  route?: string;
}

// Props do componente Sidebar
interface SidebarProps {
  activeSection: string;
  onNavigate: (section: string) => void;
}

// Lista de itens da sidebar com seus ícones e rotas
const sidebarItems: SidebarItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: Home, route: '/dashboard' },
  { id: 'funcionarios', label: 'Funcionários', icon: Users, route: '/dashboard-membros' },
  { id: 'comprovantes', label: 'Comprovantes de pagamento', icon: Building2 },
  { id: 'pagamentos', label: 'Pagamentos Docentes', icon: DollarSign },
  { id: 'comunicados', label: 'Comunicados', icon: FileText },
  { id: 'circulares', label: 'Circulares', icon: FileText },
  { id: 'monitoria', label: 'Monitoria', icon: Users },
  { id: 'licitacoes', label: 'Licitações', icon: FileText },
  { id: 'orcamento', label: 'Orçamento', icon: DollarSign, route: '/dashboard-orcamento' },
  { id: 'estoques', label: 'Estoques e inventário', icon: Building2 },
  { id: 'notificacoes', label: 'Notificações', icon: Bell },
  { id: 'cancelacao', label: 'Cancelação', icon: Settings },
  { id: 'relatorios', label: 'Relatórios', icon: FileText },
];

const Sidebar: React.FC<SidebarProps> = ({ activeSection, onNavigate }) => {
  const navigate = useNavigate();

  const handleClick = (item: SidebarItem) => {
    if (item.route) {
      navigate(item.route);  
    }
    onNavigate(item.id);     
  };
  
  return (
    <aside className="sidebar sidebar-open">
      {/* Cabeçalho da sidebar com logo e nome da empresa */}
      <div className="sidebar-header">
        <div className="company-info">
          <div className="company-logo">
            <img src={Logo} alt="Company Logo" />
          </div>
          <div className="company-details">
            <h3>CompJR</h3>
            <p>Sistema ERP</p>
          </div>
        </div>
      </div>

      {/* Navegação principal da sidebar */}
      <nav className="sidebar-nav">
        {sidebarItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              className={`nav-item ${activeSection === item.id ? 'nav-item-active' : ''}`}
              onClick={() => handleClick(item)}
            >
              <Icon size={20} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>
    </aside>
  );
};

export default Sidebar;