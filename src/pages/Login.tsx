import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { app } from '../firebase';
import "../styles/LoginForm.css";
import Image from '../assets/loginImage.jpg';
import Logo from '../assets/logocomp.png';
import Loading from '../components/LoadingOverlay';
import { useAuth } from '../components/AuthContext';

interface LoginFormProps {}

const LoginForm: React.FC<LoginFormProps> = () => {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [rememberMe, setRememberMe] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true); // Estado de carregamento inicial
  const [error, setError] = useState<string | null>(null);

  const auth = getAuth(app);
  const navigate = useNavigate();
  const { login } = useAuth();

  // Simula um tempo de carregamento inicial para a UI
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  // Lida com o envio do formulário de login
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      // Autentica o usuário com Firebase
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Obtém o token e faz login no contexto de autenticação
      const token = await user.getIdToken();
      login(token);

      // Persiste o email se "Lembrar" estiver marcado
      if (rememberMe) {
        localStorage.setItem('rememberMe', 'true');
        localStorage.setItem('email', email);
      } else {
        localStorage.removeItem('rememberMe');
        localStorage.removeItem('email');
      }

      // Redireciona para o dashboard após login
      navigate('/dashboard');

    } catch (error: any) {
      console.error('Erro no login:', error);

      // Trata erros específicos do Firebase
      switch (error.code) {
        case 'auth/invalid-email':
          setError('Email inválido');
          break;
        case 'auth/user-disabled':
          setError('Esta conta foi desativada');
          break;
        case 'auth/user-not-found':
          setError('Usuário não encontrado');
          break;
        case 'auth/wrong-password':
          setError('Senha incorreta');
          break;
        case 'auth/too-many-requests':
          setError('Muitas tentativas. Tente novamente mais tarde');
          break;
        default:
          setError('Erro ao fazer login. Tente novamente');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Redireciona para a página de recuperação de senha
  const handleForgotPassword = () => {
    navigate('/recuperar-senha');
  };

  // Preenche o email se a opção "Lembrar" estava ativa
  useEffect(() => {
    if (localStorage.getItem('rememberMe') === 'true') {
      const savedEmail = localStorage.getItem('email');
      if (savedEmail) {
        setEmail(savedEmail);
        setRememberMe(true);
      }
    }
  }, []);

  return (
    <>
      <Loading isVisible={isLoading} />

      <div className="login-container">
        <div className="login-left">
          <div className="login-header">
            <div className="logo">
              <img src={Logo} alt="Logo da empresa" />
              <div className="logo-text">
                <div className="company-name">CompJR</div>
                <div className="system-name">Sistema ERP</div>
              </div>
            </div>
          </div>

          <div className="welcome-section">
            <p className="welcome-text">Bem vindo de volta!</p>
            <h1 className="login-title">Faça o login novamente</h1>
          </div>

          <form className="login-form" onSubmit={handleSubmit}>
            {error && (
              <div className="error-message">
                {error}
              </div>
            )}

            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Entre com endereço de email"
                disabled={isLoading}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Senha</label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••"
                disabled={isLoading}
                required
                minLength={6}
              />
            </div>

            <div className="form-options">
              <label className="checkbox-container">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  disabled={isLoading}
                />
                <span className="checkmark"></span>
                Lembrar
              </label>
              <button
                type="button"
                className="forgot-password"
                onClick={handleForgotPassword}
                disabled={isLoading}
              >
                Eu esqueci minha senha
              </button>
            </div>

            <button
              type="submit"
              className="login-btn"
              disabled={isLoading}
            >
              {isLoading ? 'Entrando...' : 'Entrar'}
            </button>
          </form>
        </div>

        <div className="image">
          <img src={Image} alt="Imagem decorativa" />
        </div>
      </div>
    </>
  );
};

export default LoginForm;