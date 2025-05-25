import React, { useState, useEffect } from 'react';
import '../styles/Budget.css';
import Sidebar from '../components/Sidebar';
import { v4 as uuidv4 } from 'uuid';

// Interface para um membro (ex: funcionário)
interface Member {
  id: string;
  nomeCompleto: string;
}

// Interface para um orçamento
interface Budget {
  id: string;
  budgetNumber: string;
  projectName: string;
  clientName: string;
  responsibleMemberId: string;
  responsibleMemberName: string;
  estimatedValue: number;
  expectedCosts: number;
  creationDate: string;
  status: 'Em análise' | 'Aprovado' | 'Reprovado';
}

const Budget: React.FC = () => {
  const [activeSection, setActiveSection] = useState('budgets');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [currentBudget, setCurrentBudget] = useState<Partial<Budget>>({
    budgetNumber: '',
    projectName: '',
    clientName: '',
    responsibleMemberId: '',
    responsibleMemberName: '',
    estimatedValue: 0,
    expectedCosts: 0,
    creationDate: '',
    status: 'Em análise',
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [showForm, setShowForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [members, setMembers] = useState<Member[]>([]);

  // Carrega orçamentos e membros do localStorage ao montar
  useEffect(() => {
    try {
      const savedBudgets = localStorage.getItem('budgets');
      if (savedBudgets) {
        setBudgets(JSON.parse(savedBudgets));
      }
      const savedMembers = localStorage.getItem('members');
      if (savedMembers) {
        setMembers(JSON.parse(savedMembers));
      }
    } catch (error) {
      console.error('Erro ao carregar dados do localStorage:', error);
    }
  }, []);

  // Salva orçamentos no localStorage sempre que 'budgets' muda
  useEffect(() => {
    try {
      localStorage.setItem('budgets', JSON.stringify(budgets));
    } catch (error) {
      console.error('Erro ao salvar orçamentos no localStorage:', error);
      alert('Não foi possível salvar os dados. O armazenamento local pode estar cheio ou inacessível.');
    }
  }, [budgets]);

  // Valida os campos do formulário
  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (!currentBudget.budgetNumber?.trim()) {
      newErrors.budgetNumber = 'Número do orçamento é obrigatório';
    }
    if (!currentBudget.projectName?.trim()) {
      newErrors.projectName = 'Descrição do projeto é obrigatória';
    }
    if (!currentBudget.clientName?.trim()) {
      newErrors.clientName = 'Cliente associado é obrigatório';
    }
    if (!currentBudget.responsibleMemberId) {
      newErrors.responsibleMemberId = 'Membro responsável é obrigatório';
    }
    if (currentBudget.estimatedValue === undefined || currentBudget.estimatedValue <= 0) {
      newErrors.estimatedValue = 'Valor estimado deve ser maior que zero';
    }
    if (currentBudget.expectedCosts === undefined || currentBudget.expectedCosts < 0) {
      newErrors.expectedCosts = 'Custos previstos não pode ser negativo';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Lida com o envio do formulário (criação ou edição)
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) {
      return;
    }

    const member = members.find(m => m.id === currentBudget.responsibleMemberId);
    const responsibleMemberName = member ? member.nomeCompleto : 'Desconhecido';

    if (isEditing && currentBudget.id) {
      setBudgets(prev =>
        prev.map(budget =>
          budget.id === currentBudget.id
            ? { ...currentBudget as Budget, responsibleMemberName }
            : budget
        )
      );
      alert('Orçamento atualizado com sucesso!');
    } else {
      const newBudget: Budget = {
        ...currentBudget as Budget,
        id: uuidv4(),
        creationDate: new Date().toISOString().split('T')[0],
        status: 'Em análise',
        responsibleMemberName,
      };
      setBudgets(prev => [...prev, newBudget]);
      alert('Orçamento criado com sucesso!');
    }

    resetForm();
    setShowForm(false);
    setIsEditing(false);
  };

  // Preenche o formulário para edição
  const editBudget = (id: string) => {
    const budgetToEdit = budgets.find(budget => budget.id === id);
    if (budgetToEdit) {
      setCurrentBudget({ ...budgetToEdit });
      setIsEditing(true);
      setShowForm(true);
      setErrors({});
      window.scrollTo(0, 0);
    }
  };

  // Deleta um orçamento
  const deleteBudget = (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir este orçamento? Esta ação não pode ser desfeita.')) {
      setBudgets(prev => prev.filter(budget => budget.id !== id));
      alert('Orçamento excluído com sucesso!');
    }
  };

  // Altera o status do orçamento para 'Aprovado'
  const sendForApproval = (id: string) => {
    if (window.confirm('Deseja aprovar este orçamento?')) {
      setBudgets(prev =>
        prev.map(budget =>
          budget.id === id
            ? { ...budget, status: 'Aprovado' }
            : budget
        )
      );
      alert('Orçamento aprovado com sucesso!');
    }
  };

  // Limpa o formulário
  const resetForm = () => {
    setCurrentBudget({
      budgetNumber: '',
      projectName: '',
      clientName: '',
      responsibleMemberId: '',
      responsibleMemberName: '',
      estimatedValue: 0,
      expectedCosts: 0,
      creationDate: '',
      status: 'Em análise',
    });
    setErrors({});
    setIsEditing(false);
  };

  // Lida com o cancelamento do formulário
  const handleCancelForm = () => {
    if (window.confirm('Tem certeza que deseja cancelar? Os dados não serão salvos.')) {
      resetForm();
      setShowForm(false);
    }
  };

  // Alterna a visibilidade do sidebar
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="dashboard-container">
      <Sidebar
        activeSection={activeSection}
        onNavigate={setActiveSection}
      />

      <div className="hamburger-menu" onClick={toggleSidebar}>
        ☰
      </div>

      <div className={`main-content ${sidebarOpen ? 'sidebar-open' : ''}`}>
        {showForm ? (
          <div className="form-container">
            <div className="form-header">
              <h2>{isEditing ? 'Editar Orçamento' : 'Cadastrar Novo Orçamento'}</h2>
              <button
                className="back-btn"
                onClick={() => {
                  setShowForm(false);
                  resetForm();
                }}
              >
                Voltar para listagem
              </button>
            </div>

            <form onSubmit={handleSubmit} className="budget-form">
              <div className="form-grid">
                <div className="form-group">
                  <label htmlFor="budgetNumber">Número do Orçamento *</label>
                  <input
                    type="text"
                    id="budgetNumber"
                    value={currentBudget.budgetNumber || ''}
                    onChange={(e) => setCurrentBudget(prev => ({ ...prev, budgetNumber: e.target.value }))}
                    placeholder="Ex: ORC001"
                  />
                  {errors.budgetNumber && <div className="error">{errors.budgetNumber}</div>}
                </div>

                <div className="form-group">
                  <label htmlFor="projectName">Descrição do Projeto *</label>
                  <input
                    type="text"
                    id="projectName"
                    value={currentBudget.projectName || ''}
                    onChange={(e) => setCurrentBudget(prev => ({ ...prev, projectName: e.target.value }))}
                    placeholder="Desenvolvimento de App Mobile"
                  />
                  {errors.projectName && <div className="error">{errors.projectName}</div>}
                </div>

                <div className="form-group">
                  <label htmlFor="clientName">Cliente Associado *</label>
                  <input
                    type="text"
                    id="clientName"
                    value={currentBudget.clientName || ''}
                    onChange={(e) => setCurrentBudget(prev => ({ ...prev, clientName: e.target.value }))}
                    placeholder="Nome do Cliente S.A."
                  />
                  {errors.clientName && <div className="error">{errors.clientName}</div>}
                </div>

                <div className="form-group">
                  <label htmlFor="responsibleMember">Membro Responsável *</label>
                  <select
                    id="responsibleMember"
                    value={currentBudget.responsibleMemberId || ''}
                    onChange={(e) => setCurrentBudget(prev => ({ ...prev, responsibleMemberId: e.target.value }))}
                  >
                    <option value="">Selecione um membro</option>
                    {members.map(member => (
                      <option key={member.id} value={member.id}>
                        {member.nomeCompleto}
                      </option>
                    ))}
                  </select>
                  {errors.responsibleMemberId && <div className="error">{errors.responsibleMemberId}</div>}
                </div>

                <div className="form-group">
                  <label htmlFor="estimatedValue">Valor Estimado (R$) *</label>
                  <input
                    type="number"
                    id="estimatedValue"
                    value={currentBudget.estimatedValue || ''}
                    onChange={(e) => setCurrentBudget(prev => ({ ...prev, estimatedValue: parseFloat(e.target.value) || 0 }))}
                    placeholder="15000.00"
                    min="0.01"
                    step="0.01"
                  />
                  {errors.estimatedValue && <div className="error">{errors.estimatedValue}</div>}
                </div>

                <div className="form-group">
                  <label htmlFor="expectedCosts">Custos Previstos (R$)</label>
                  <input
                    type="number"
                    id="expectedCosts"
                    value={currentBudget.expectedCosts || ''}
                    onChange={(e) => setCurrentBudget(prev => ({ ...prev, expectedCosts: parseFloat(e.target.value) || 0 }))}
                    placeholder="5000.00"
                    min="0"
                    step="0.01"
                  />
                  {errors.expectedCosts && <div className="error">{errors.expectedCosts}</div>}
                </div>

                <div className="form-group">
                  <label htmlFor="creationDate">Data de Criação</label>
                  <input
                    type="date"
                    id="creationDate"
                    value={currentBudget.creationDate || new Date().toISOString().split('T')[0]}
                    readOnly
                    className="readonly-field"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="status">Status do Orçamento</label>
                  <select
                    id="status"
                    value={currentBudget.status || 'Em análise'}
                    onChange={(e) => setCurrentBudget(prev => ({ ...prev, status: e.target.value as 'Em análise' | 'Aprovado' | 'Reprovado' }))}
                    disabled={!isEditing}
                  >
                    <option value="Em análise">Em análise</option>
                    <option value="Aprovado">Aprovado</option>
                    <option value="Reprovado">Reprovado</option>
                  </select>
                </div>
              </div>

              <div className="form-actions">
                <button type="submit" className="submit-btn">
                  {isEditing ? 'Atualizar Orçamento' : 'Confirmar Cadastro'}
                </button>
                <button
                  type="button"
                  className="cancel-btn"
                  onClick={handleCancelForm}
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        ) : (
          <div className="budgets-container">
            <div className="budgets-header">
              <h2>Lista de Orçamentos</h2>
              <button
                className="add-budget-btn"
                onClick={() => setShowForm(true)}
              >
                + Cadastrar Novo Orçamento
              </button>
            </div>

            <div className="stats-card">
              <div className="stat-item">
                <span className="stat-value">{budgets.length}</span>
                <span className="stat-label">Total de Orçamentos</span>
              </div>
              <div className="stat-item">
                <span className="stat-value">{budgets.filter(b => b.status === 'Aprovado').length}</span>
                <span className="stat-label">Orçamentos Aprovados</span>
              </div>
              <div className="stat-item">
                <span className="stat-value">{budgets.filter(b => b.status === 'Em análise').length}</span>
                <span className="stat-label">Orçamentos Pendentes</span>
              </div>
            </div>

            {budgets.length === 0 ? (
              <div className="empty-state">
                <img src="/empty-state.svg" alt="Nenhum orçamento cadastrado" className="empty-image" />
                <h3>Nenhum orçamento cadastrado ainda</h3>
                <p>Clique no botão acima para adicionar o primeiro orçamento.</p>
                <button
                  className="add-budget-btn empty-btn"
                  onClick={() => setShowForm(true)}
                >
                  + Cadastrar Primeiro Orçamento
                </button>
              </div>
            ) : (
              <>
                <h3>Todos os Orçamentos</h3>
                <div className="budgets-grid">
                  {budgets.map(budget => (
                    <div key={budget.id} className="budget-card">
                      <div className="card-header">
                        <h3>{budget.projectName}</h3>
                        <span className={`budget-status ${budget.status.toLowerCase().replace(' ', '-')}`}>
                          {budget.status}
                        </span>
                      </div>
                      <div className="card-body">
                        <div className="detail-row">
                          <span className="detail-label">Número:</span>
                          <span className="detail-value">{budget.budgetNumber}</span>
                        </div>
                        <div className="detail-row">
                          <span className="detail-label">Cliente:</span>
                          <span className="detail-value">{budget.clientName}</span>
                        </div>
                        <div className="detail-row">
                          <span className="detail-label">Responsável:</span>
                          <span className="detail-value">{budget.responsibleMemberName}</span>
                        </div>
                        <div className="detail-row">
                          <span className="detail-label">Valor Estimado:</span>
                          <span className="detail-value">R$ {budget.estimatedValue.toFixed(2)}</span>
                        </div>
                        <div className="detail-row">
                          <span className="detail-label">Custos Previstos:</span>
                          <span className="detail-value">R$ {budget.expectedCosts.toFixed(2)}</span>
                        </div>
                        <div className="detail-row">
                          <span className="detail-label">Criado em:</span>
                          <span className="detail-value">
                            {new Date(budget.creationDate).toLocaleDateString('pt-BR')}
                          </span>
                        </div>
                      </div>
                      <div className="card-footer">
                        {budget.status === 'Em análise' && (
                          <button
                            className="approve-btn"
                            onClick={() => sendForApproval(budget.id)}
                          >
                            Aprovar
                          </button>
                        )}
                        <button
                          className="edit-btn"
                          onClick={() => editBudget(budget.id)}
                        >
                          Editar
                        </button>
                        <button
                          className="delete-btn"
                          onClick={() => deleteBudget(budget.id)}
                        >
                          Excluir
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Budget;