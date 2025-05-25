import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getAuth, confirmPasswordReset } from 'firebase/auth';
import { app } from '../firebase';
import "../styles/ResetPassword.css";
import Logo from '../assets/logocomp.png';
import Loading from '../components/LoadingOverlay';

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [oobCode, setOobCode] = useState('');

  useEffect(() => {
    const code = searchParams.get('oobCode');
    if (code) {
      setOobCode(code);
    } else {
      setError('Código de redefinição inválido ou expirado');
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newPassword || !confirmPassword) {
      setError('Por favor, preencha todos os campos');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('As senhas não coincidem');
      return;
    }

    if (newPassword.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres');
      return;
    }

    const auth = getAuth(app);
    setIsLoading(true);
    setError('');

    try {
      await confirmPasswordReset(auth, oobCode, newPassword);
      setSuccess(true);
    } catch (error: any) {
      console.error('Erro ao redefinir senha:', error);
      
      switch (error.code) {
        case 'auth/expired-action-code':
          setError('O link de redefinição expirou');
          break;
        case 'auth/invalid-action-code':
          setError('Código de redefinição inválido');
          break;
        case 'auth/weak-password':
          setError('A senha é muito fraca');
          break;
        default:
          setError('Erro ao redefinir senha');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToLogin = () => {
    window.location.href = '/';
  };

  return (
    <>
      <Loading isVisible={isLoading} />
      
      <div className="reset-container">
        <div className="reset-left">
          <div className="reset-header">
            <div className="logo">
              <img src={Logo} alt="Logo da empresa"/>
              <div className="logo-text">
                <div className="company-name">CompJR</div>
                <div className="system-name">Sistema ERP</div>
              </div>
            </div>
          </div>

          {success ? (
            <div className="success-section">
              <div className="success-icon">
                <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
                  <circle cx="32" cy="32" r="32" fill="#48bb78" fillOpacity="0.1"/>
                  <circle cx="32" cy="32" r="20" fill="#48bb78"/>
                  <path d="M24 32l6 6 12-12" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <h2 className="success-title">Senha redefinida!</h2>
              <p className="success-text">
                Sua senha foi redefinida com sucesso. Agora você pode fazer login com sua nova senha.
              </p>
              <button 
                className="back-btn primary"
                onClick={handleBackToLogin}
              >
                Voltar para o login
              </button>
            </div>
          ) : (
            <>
              <div className="welcome-section">
                <div className="welcome-text">Redefinição de senha</div>
                <h1 className="reset-title">Crie uma nova senha</h1>
                <p className="reset-subtitle">
                  Por favor, digite uma nova senha segura para sua conta.
                </p>
              </div>

              <form className="reset-form" onSubmit={handleSubmit}>
                {error && (
                  <div className="error-message">
                    {error}
                  </div>
                )}
                
                <div className="form-group">
                  <label htmlFor="newPassword">Nova senha</label>
                  <input
                    type="password"
                    id="newPassword"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Digite sua nova senha"
                    required
                    minLength={6}
                  />
                  <div className="password-requirements">
                    A senha deve ter pelo menos 6 caracteres
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="confirmPassword">Confirmar nova senha</label>
                  <input
                    type="password"
                    id="confirmPassword"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirme sua nova senha"
                    required
                    minLength={6}
                  />
                </div>

                <button 
                  type="submit"
                  className="reset-btn"
                  disabled={isLoading}
                >
                  {isLoading ? 'Redefinindo...' : 'Redefinir senha'}
                </button>

                <button 
                  type="button"
                  className="back-btn"
                  onClick={handleBackToLogin}
                >
                  Voltar para o login
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default ResetPassword;