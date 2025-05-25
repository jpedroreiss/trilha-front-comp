import React, { useState, useRef, useEffect } from 'react';
import "../styles/NewMembers.css";
import Sidebar from '../components/Sidebar';
import { app } from '../firebase';
import { getAuth, createUserWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';
import { getFunctions, httpsCallable } from 'firebase/functions'; // Importa para Cloud Functions

// Define a interface para um membro
interface Member {
  id: string;
  nomeCompleto: string;
  dataNascimento: string;
  emailInstitucional: string;
  cargo: string;
  telefone: string;
  genero: string;
  foto?: string; // Opcional, URL da foto
  dataIngresso: string;
  habilidades: string[];
}

const NewMembers: React.FC = () => {
  // Estados para gerenciar a UI e os dados
  const [activeSection, setActiveSection] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [members, setMembers] = useState<Member[]>([]);
  const [currentMember, setCurrentMember] = useState<Partial<Member>>({
    nomeCompleto: '',
    dataNascimento: '',
    emailInstitucional: '',
    cargo: '',
    telefone: '',
    genero: '',
    dataIngresso: '',
    habilidades: []
  });
  const [errors, setErrors] = useState<{[key: string]: string}>({}); // Armazena erros de validação
  const [newSkill, setNewSkill] = useState(''); // Estado para nova habilidade a ser adicionada
  const [showForm, setShowForm] = useState(false); // Controla a visibilidade do formulário
  const [isEditing, setIsEditing] = useState(false); // Indica se está editando um membro existente
  const fileInputRef = useRef<HTMLInputElement>(null); // Referência para o input de arquivo

  // Instâncias do Firebase Auth e Functions
  const auth = getAuth(app);
  const functions = getFunctions(app);
  // Referência para a função callable do Cloud Function para deletar usuários
  const deleteUserAccountCallable = httpsCallable(functions, 'deleteUserAccount');

  // Carrega membros do localStorage ao montar o componente
  useEffect(() => {
    try {
      const savedMembers = localStorage.getItem('members');
      if (savedMembers) {
        setMembers(JSON.parse(savedMembers));
      }
    } catch (error) {
      console.error("Erro ao carregar membros do localStorage:", error);
      localStorage.removeItem('members'); // Limpa dados corrompidos se houver
    }
  }, []);

  // Salva membros no localStorage sempre que o estado 'members' muda
  useEffect(() => {
    try {
      localStorage.setItem('members', JSON.stringify(members));
    } catch (error) {
      console.error("Erro ao salvar membros no localStorage:", error);
      alert("Não foi possível salvar os dados. O armazenamento local pode estar cheio ou inacessível.");
    }
  }, [members]);

  // Valida os campos do formulário
  const validateForm = (): boolean => {
    const newErrors: {[key: string]: string} = {};

    if (!currentMember.nomeCompleto?.trim()) {
      newErrors.nomeCompleto = 'Nome completo é obrigatório';
    }

    if (!currentMember.dataNascimento) {
      newErrors.dataNascimento = 'Data de nascimento é obrigatória';
    } else if (new Date(currentMember.dataNascimento) >= new Date()) {
      newErrors.dataNascimento = 'Data de nascimento deve ser anterior à data atual';
    }

    if (!currentMember.emailInstitucional) {
      newErrors.emailInstitucional = 'Email institucional é obrigatório';
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(currentMember.emailInstitucional)) {
        newErrors.emailInstitucional = 'Email inválido';
      } else {
        const domain = currentMember.emailInstitucional.split('@')[1];
        const validDomains = ['compjunior.com.br'];
        if (!validDomains.includes(domain)) {
          newErrors.emailInstitucional = 'Domínio de email não autorizado';
        }
      }
    }

    if (!currentMember.cargo) {
      newErrors.cargo = 'Cargo é obrigatório';
    }

    if (!currentMember.telefone) {
      newErrors.telefone = 'Telefone é obrigatório';
    } else {
      const phoneRegex = /^\(\d{2}\)\s\d{4,5}-\d{4}$/;
      if (!phoneRegex.test(currentMember.telefone)) {
        newErrors.telefone = 'Formato: (11) 99999-9999';
      }
    }

    if (!currentMember.genero) {
      newErrors.genero = 'Gênero é obrigatório';
    }

    if (!currentMember.dataIngresso) {
      newErrors.dataIngresso = 'Data de ingresso é obrigatória';
    } else if (new Date(currentMember.dataIngresso) > new Date()) {
      newErrors.dataIngresso = 'Data de ingresso não pode ser futura';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Lida com a mudança de arquivo para a foto de perfil
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    const maxSize = 2 * 1024 * 1024; // 2MB

    if (!validTypes.includes(file.type)) {
      setErrors(prev => ({...prev, foto: 'Apenas arquivos JPG, JPEG e PNG são permitidos'}));
      return;
    }

    if (file.size > maxSize) {
      setErrors(prev => ({...prev, foto: 'Arquivo deve ter no máximo 2MB'}));
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      setCurrentMember(prev => ({...prev, foto: event.target?.result as string}));
      setErrors(prev => {
        const newErrors = {...prev};
        delete newErrors.foto;
        return newErrors;
      });
    };
    reader.readAsDataURL(file);
  };

  // Formata o número de telefone
  const formatPhone = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 11) {
      return numbers.replace(/(\d{2})(\d{4,5})(\d{4})/, '($1) $2-$3');
    }
    return value;
  };

  // Lida com a mudança no campo de telefone
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhone(e.target.value);
    setCurrentMember(prev => ({...prev, telefone: formatted}));
  };

  // Adiciona uma nova habilidade à lista
  const addSkill = () => {
    if (newSkill.trim() && !currentMember.habilidades?.includes(newSkill.trim())) {
      setCurrentMember(prev => ({
        ...prev,
        habilidades: [...(prev.habilidades || []), newSkill.trim()]
      }));
      setNewSkill('');
    }
  };

  // Remove uma habilidade da lista
  const removeSkill = (skillToRemove: string) => {
    setCurrentMember(prev => ({
      ...prev,
      habilidades: prev.habilidades?.filter(skill => skill !== skillToRemove) || []
    }));
  };

  // Lida com o envio do formulário (cadastro ou edição)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) {
      return;
    }

    try {
      if (isEditing && currentMember.id) {
        // Lógica para editar membro existente (não envolve Firebase Auth diretamente)
        setMembers(prev => prev.map(member =>
          member.id === currentMember.id ? {...currentMember as Member} : member
        ));
        alert('Membro atualizado com sucesso!');
      } else {
        // Lógica para adicionar novo membro e criar usuário no Firebase Auth
        if (!currentMember.emailInstitucional) {
          setErrors(prev => ({...prev, emailInstitucional: 'Email é obrigatório para criar usuário Firebase.'}));
          return;
        }

        const email = currentMember.emailInstitucional;
        const password = "compmembro2025"; // Senha genérica inicial

        // 1. Cria o usuário no Firebase Authentication
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        console.log("Usuário Firebase criado:", userCredential.user);

        // 2. Envia e-mail de redefinição de senha para o novo usuário
        await sendPasswordResetEmail(auth, email);
        console.log("E-mail de redefinição de senha enviado para:", email);

        // 3. Adiciona o membro ao estado local/localStorage
        const newMember: Member = {
          ...currentMember as Member,
          id: userCredential.user.uid // Usa o UID do Firebase como ID do membro
        };
        setMembers(prev => [...prev, newMember]);
        alert('Membro cadastrado e usuário Firebase criado com sucesso! Um e-mail de redefinição de senha foi enviado.');
      }

      // Reseta o formulário e o fecha
      resetForm();
      setShowForm(false);
    } catch (firebaseError: any) {
      console.error("Erro ao interagir com o Firebase:", firebaseError);
      let errorMessage = "Ocorreu um erro ao cadastrar o membro.";
      // Trata erros específicos do Firebase Auth
      switch (firebaseError.code) {
        case 'auth/email-already-in-use':
          errorMessage = 'O e-mail fornecido já está em uso por outro membro.';
          break;
        case 'auth/invalid-email':
          errorMessage = 'O formato do e-mail é inválido.';
          break;
        case 'auth/weak-password':
          errorMessage = 'A senha é muito fraca. Ela deve ter pelo menos 6 caracteres.';
          break;
        default:
          errorMessage = `Erro Firebase: ${firebaseError.message}`;
      }
      setErrors(prev => ({...prev, firebase: errorMessage}));
    }
  };

  // Prepara o formulário para edição de um membro
  const editMember = (id: string) => {
    const memberToEdit = members.find(member => member.id === id);
    if (memberToEdit) {
      setCurrentMember({...memberToEdit});
      setIsEditing(true);
      setShowForm(true);
      window.scrollTo(0, 0); // Rola para o topo da página
    }
  };

  // Exclui um membro e sua conta Firebase usando uma Cloud Function
  const deleteMember = async (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir este membro e sua conta Firebase? Esta ação não pode ser desfeita.')) {
      try {
        // Chama a Cloud Function para deletar o usuário do Firebase Auth
        const result = await deleteUserAccountCallable({ uid: id });

        // Verifica a resposta da Cloud Function
        if ((result.data as any).success) {
            // Se a exclusão no Firebase for bem-sucedida, remove do estado local
            setMembers(prev => prev.filter(member => member.id !== id));
            alert('Membro e conta Firebase excluídos com sucesso!');
        } else {
            // Lida com erros reportados pela Cloud Function
            alert(`Erro ao excluir conta Firebase: ${(result.data as any).message || 'Erro desconhecido.'}`);
        }
      } catch (error: any) {
        console.error("Erro ao excluir membro ou conta Firebase:", error);
        // Feedback para o usuário em caso de erro na requisição ou na função
        alert(`Ocorreu um erro ao excluir o membro. Detalhes: ${error.message || 'Erro desconhecido'}`);
      }
    }
  };

  // Reseta o formulário para os valores iniciais
  const resetForm = () => {
    setCurrentMember({
      nomeCompleto: '',
      dataNascimento: '',
      emailInstitucional: '',
      cargo: '',
      telefone: '',
      genero: '',
      dataIngresso: '',
      habilidades: []
    });
    setErrors({});
    setIsEditing(false);
    setNewSkill('');
    if (fileInputRef.current) {
      fileInputRef.current.value = ''; // Limpa o input de arquivo
    }
  };

  // Alterna a visibilidade da barra lateral (para dispositivos móveis)
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  // Gera as iniciais do nome para o placeholder da foto
  const getInitials = (name: string) => {
    const parts = name.split(' ');
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    if (parts.length > 1) return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
    return '';
  };

  return (
    <div className="dashboard-container">
      <Sidebar
        activeSection={activeSection}
        onNavigate={setActiveSection}
      />

      {/* Botão Hambúrguer para dispositivos móveis */}
      <div className="hamburger-menu" onClick={toggleSidebar}>
        ☰
      </div>

      <div className={`main-content ${sidebarOpen ? 'sidebar-open' : ''}`}>
        {showForm ? (
          <div className="form-container">
            <div className="form-header">
              <h2>{isEditing ? 'Editar Membro' : 'Cadastrar Novo Membro'}</h2>
              <button
                className="back-btn"
                onClick={() => {
                  setShowForm(false);
                  resetForm();
                }}
              >
                Voltar para lista
              </button>
            </div>

            <form onSubmit={handleSubmit} className="member-form">
              <div className="form-grid">
                <div className="form-group">
                  <label htmlFor="nomeCompleto">Nome Completo *</label>
                  <input
                    type="text"
                    id="nomeCompleto"
                    value={currentMember.nomeCompleto || ''}
                    onChange={(e) => setCurrentMember(prev => ({...prev, nomeCompleto: e.target.value}))}
                    placeholder="Digite o nome completo"
                  />
                  {errors.nomeCompleto && <div className="error">{errors.nomeCompleto}</div>}
                </div>

                <div className="form-group">
                  <label htmlFor="dataNascimento">Data de Nascimento *</label>
                  <input
                    type="date"
                    id="dataNascimento"
                    value={currentMember.dataNascimento || ''}
                    onChange={(e) => setCurrentMember(prev => ({...prev, dataNascimento: e.target.value}))}
                  />
                  {errors.dataNascimento && <div className="error">{errors.dataNascimento}</div>}
                </div>

                <div className="form-group">
                  <label htmlFor="emailInstitucional">E-mail Institucional *</label>
                  <input
                    type="email"
                    id="emailInstitucional"
                    value={currentMember.emailInstitucional || ''}
                    onChange={(e) => setCurrentMember(prev => ({...prev, emailInstitucional: e.target.value}))}
                    placeholder="usuario@empresa.com"
                  />
                  {errors.emailInstitucional && <div className="error">{errors.emailInstitucional}</div>}
                </div>

                <div className="form-group">
                  <label htmlFor="cargo">Cargo *</label>
                  <select
                    id="cargo"
                    value={currentMember.cargo || ''}
                    onChange={(e) => setCurrentMember(prev => ({...prev, cargo: e.target.value}))}
                  >
                    <option value="">Selecione um cargo</option>
                    <option value="Desenvolvedor Junior">Desenvolvedor Junior</option>
                    <option value="Desenvolvedor Pleno">Desenvolvedor Pleno</option>
                    <option value="Desenvolvedor Senior">Desenvolvedor Senior</option>
                    <option value="Tech Lead">Tech Lead</option>
                    <option value="Product Manager">Product Manager</option>
                    <option value="Designer">Designer</option>
                    <option value="QA Analyst">QA Analyst</option>
                    <option value="DevOps Engineer">DevOps Engineer</option>
                    <option value="Gerente de Projeto">Gerente de Projeto</option>
                    <option value="Diretor">Diretor</option>
                  </select>
                  {errors.cargo && <div className="error">{errors.cargo}</div>}
                </div>

                <div className="form-group">
                  <label htmlFor="telefone">Telefone *</label>
                  <input
                    type="text"
                    id="telefone"
                    value={currentMember.telefone || ''}
                    onChange={handlePhoneChange}
                    placeholder="(11) 99999-9999"
                    maxLength={15}
                  />
                  {errors.telefone && <div className="error">{errors.telefone}</div>}
                </div>

                <div className="form-group">
                  <label htmlFor="genero">Gênero *</label>
                  <select
                    id="genero"
                    value={currentMember.genero || ''}
                    onChange={(e) => setCurrentMember(prev => ({...prev, genero: e.target.value}))}
                  >
                    <option value="">Selecione o gênero</option>
                    <option value="Masculino">Masculino</option>
                    <option value="Feminino">Feminino</option>
                    <option value="Não-binário">Não-binário</option>
                    <option value="Prefiro não informar">Prefiro não informar</option>
                  </select>
                  {errors.genero && <div className="error">{errors.genero}</div>}
                </div>

                <div className="form-group">
                  <label htmlFor="dataIngresso">Data de Ingresso *</label>
                  <input
                    type="date"
                    id="dataIngresso"
                    value={currentMember.dataIngresso || ''}
                    onChange={(e) => setCurrentMember(prev => ({...prev, dataIngresso: e.target.value}))}
                  />
                  {errors.dataIngresso && <div className="error">{errors.dataIngresso}</div>}
                </div>

                <div className="form-group">
                  <label>Foto do Perfil</label>
                  <div
                    className="photo-upload"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <input
                      type="file"
                      ref={fileInputRef}
                      style={{display: 'none'}}
                      accept=".jpg,.jpeg,.png"
                      onChange={handleFileChange}
                    />
                    {currentMember.foto ? (
                      <div>
                        <img src={currentMember.foto} alt="Preview" className="photo-preview" />
                        <p>Clique para alterar a foto</p>
                      </div>
                    ) : (
                      <div>
                        <p>📷 Clique para adicionar uma foto</p>
                        <small>JPG, JPEG ou PNG até 2MB</small>
                      </div>
                    )}
                  </div>
                  {errors.foto && <div className="error">{errors.foto}</div>}
                </div>
              </div>

              <div className="skills-section">
                <h3>Habilidades</h3>
                <div className="skills-input">
                  <input
                    type="text"
                    value={newSkill}
                    onChange={(e) => setNewSkill(e.target.value)}
                    placeholder="Digite uma habilidade"
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                  />
                  <button type="button" className="add-skill-btn" onClick={addSkill}>
                    Adicionar
                  </button>
                </div>
                <div className="skills-list">
                  {currentMember.habilidades?.map((skill, index) => (
                    <div key={index} className="skill-tag">
                      {skill}
                      <button
                        type="button"
                        className="remove-skill"
                        onClick={() => removeSkill(skill)}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="form-actions">
                <button type="submit" className="submit-btn">
                  {isEditing ? 'Atualizar Membro' : 'Cadastrar Membro'}
                </button>
                <button
                  type="button"
                  className="cancel-btn"
                  onClick={() => {
                    setShowForm(false);
                    resetForm();
                  }}
                >
                  Cancelar
                </button>
              </div>
              {errors.firebase && <div className="error" style={{textAlign: 'center', marginTop: '20px'}}>{errors.firebase}</div>}
            </form>
          </div>
        ) : (
          <div className="members-container">
            <div className="members-header">
              <h2>Lista de Membros</h2>
              <button
                className="add-member-btn"
                onClick={() => setShowForm(true)}
              >
                + Cadastrar Novo Membro
              </button>
            </div>

            <div className="stats-card">
              <div className="stat-item">
                <span className="stat-value">{members.length}</span>
                <span className="stat-label">Membros Cadastrados</span>
              </div>
            </div>

            {members.length === 0 ? (
              <div className="empty-state">
                <img src="/empty-state.svg" alt="Nenhum membro cadastrado" className="empty-image" />
                <h3>Nenhum membro cadastrado ainda</h3>
                <p>Clique no botão acima para adicionar o primeiro membro.</p>
                <button
                  className="add-member-btn empty-btn"
                  onClick={() => setShowForm(true)}
                >
                  + Cadastrar Primeiro Membro
                </button>
              </div>
            ) : (
              <div className="members-grid">
                {members.map((member) => (
                  <div key={member.id} className="member-card">
                    <div className="card-header">
                      {member.foto ? (
                        <img src={member.foto} alt={member.nomeCompleto} className="member-photo" />
                      ) : (
                        <div className="member-photo placeholder">
                          {getInitials(member.nomeCompleto)}
                        </div>
                      )}
                      <div className="member-info">
                        <h3>{member.nomeCompleto}</h3>
                        <p className="member-position">{member.cargo}</p>
                        <p className="member-email">{member.emailInstitucional}</p>
                      </div>
                    </div>

                    <div className="card-body">
                      <div className="detail-row">
                        <span className="detail-label">Telefone:</span>
                        <span className="detail-value">{member.telefone}</span>
                      </div>
                      <div className="detail-row">
                        <span className="detail-label">Data Nasc.:</span>
                        <span className="detail-value">
                          {new Date(member.dataNascimento).toLocaleDateString('pt-BR')}
                        </span>
                      </div>
                      <div className="detail-row">
                        <span className="detail-label">Data Ingresso:</span>
                        <span className="detail-value">
                          {new Date(member.dataIngresso).toLocaleDateString('pt-BR')}
                        </span>
                      </div>

                      {member.habilidades && member.habilidades.length > 0 && (
                        <div className="skills-container">
                          <span className="detail-label">Habilidades:</span>
                          <div className="skills-list">
                            {member.habilidades.map((skill, index) => (
                              <span key={index} className="skill-badge">
                                {skill}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="card-footer">
                      <button
                        className="edit-btn"
                        onClick={() => editMember(member.id)}
                      >
                        Editar
                      </button>
                      <button
                        className="delete-btn"
                        onClick={() => deleteMember(member.id)}
                      >
                        Excluir
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default NewMembers;