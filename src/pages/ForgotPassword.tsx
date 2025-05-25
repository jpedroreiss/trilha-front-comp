import { useState } from 'react';
import { getAuth, sendPasswordResetEmail } from 'firebase/auth';
import { app } from '../firebase';
import "../styles/ForgotPassword.css";
import Logo from '../assets/logocomp.png';
import Image from '../assets/imageForgotPassword.png';
import Loading from '../components/LoadingOverlay';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [emailTouched, setEmailTouched] = useState(false);

  // Valida o formato do email
  const validateEmail = (email: string) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  // Lida com a mudança no campo de email
  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    setEmailTouched(true);
    setError('');
  };

  // Lida com o envio do formulário de recuperação de senha
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) {
      setError('Por favor, insira seu email');
      return;
    }

    if (!validateEmail(email)) {
      setError('Por favor, insira um email válido');
      return;
    }

    const auth = getAuth(app);
    setIsLoading(true);
    setError('');

    try {
      await sendPasswordResetEmail(auth, email);
      setIsSubmitted(true);
    } catch (error: any) {
      console.error('Erro ao enviar email de recuperação:', error);

      // Trata diferentes códigos de erro do Firebase
      switch (error.code) {
        case 'auth/invalid-email':
          setError('Email inválido');
          break;
        case 'auth/user-not-found':
          setError('Nenhum usuário encontrado com este email');
          break;
        case 'auth/too-many-requests':
          setError('Muitas tentativas. Tente novamente mais tarde');
          break;
        default:
          setError('Erro ao enviar email de recuperação');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Redireciona para a página de login
  const handleBackToLogin = () => {
    window.location.href = '/';
  };

  return (
    <>
      <Loading isVisible={isLoading} />

      <div className="recovery-container">
        <div className="recovery-left">
          <div className="recovery-header">
            <div className="logo">
              <img src={Logo} alt="Logo da empresa" />
              <div className="logo-text">
                <div className="company-name">CompJR</div>
                <div className="system-name">Sistema ERP</div>
              </div>
            </div>
          </div>

          {!isSubmitted ? (
            <>
              <div className="welcome-section">
                <div className="welcome-text">Recuperação de senha</div>
                <h1 className="recovery-title">Esqueceu sua senha?</h1>
                <p className="recovery-subtitle">
                  Insira o endereço de e-mail vinculado a esta conta e lhe enviaremos
                  um link para redefinir sua senha.
                </p>
              </div>

              <form className="recovery-form" onSubmit={handleSubmit}>
                {error && (
                  <div className="error-message">
                    {error}
                  </div>
                )}

                <div className="form-group">
                  <label htmlFor="email">Endereço de email</label>
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={handleEmailChange}
                    onBlur={() => setEmailTouched(true)}
                    placeholder="seu@email.com"
                    required
                    className={emailTouched && !validateEmail(email) && email ? 'input-error' : ''}
                  />
                  {emailTouched && !validateEmail(email) && email && (
                    <div className="validation-error">Formato de email inválido</div>
                  )}
                </div>

                <button
                  type="submit"
                  className="recovery-btn"
                  disabled={isLoading || !validateEmail(email)}
                >
                  {isLoading ? 'Enviando...' : 'Enviar link de recuperação'}
                </button>

                <button
                  type="button"
                  className="back-btn"
                  onClick={handleBackToLogin}
                >
                  Voltar para o Login
                </button>
              </form>
            </>
          ) : (
            <div className="success-section">
              <div className="success-icon">
                <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
                  <circle cx="32" cy="32" r="32" fill="#48bb78" fillOpacity="0.1" />
                  <circle cx="32" cy="32" r="20" fill="#48bb78" />
                  <path d="M24 32l6 6 12-12" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <h2 className="success-title">Email enviado!</h2>
              <p className="success-text">
                Enviamos um link de recuperação para <strong>{email}</strong>.
                Verifique sua caixa de entrada e siga as instruções para redefinir sua senha.
              </p>
              <div className="success-note">
                Não recebeu o email? Verifique sua pasta de spam ou tente novamente em alguns minutos.
              </div>
              <button
                className="back-btn primary"
                onClick={handleBackToLogin}
              >
                Voltar para o Login
              </button>
            </div>
          )}
        </div>

        <div className="image">
          <img src={Image} alt="Pessoa pensativa trabalhando no computador" />
        </div>
      </div>
    </>
  );
};

export default ForgotPassword;