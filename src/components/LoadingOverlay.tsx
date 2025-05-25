import React, { useEffect, useState, type JSX } from 'react';
import "../styles/LoadingOverlay.css";
import ZeusImage from '../assets/zeus.png';

// Props do componente de loading overlay
interface LoadingOverlayProps {
  isVisible: boolean;
}

const LoadingOverlay: React.FC<LoadingOverlayProps> = ({ isVisible }) => {
  // Estado para armazenar as partículas animadas
  const [particles, setParticles] = useState<JSX.Element[]>([]);

  // Efeito para criar partículas aleatórias ao montar o componente
  useEffect(() => {
    const particleElements: JSX.Element[] = [];
    const particleCount = 15;

    // Cria partículas com posições e opacidades aleatórias
    for (let i = 0; i < particleCount; i++) {
      particleElements.push(
        <div
          key={i}
          className="particle"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            opacity: `${Math.random() * 0.5 + 0.3}`,
          }}
        />
      );
    }

    setParticles(particleElements);
  }, []);

  // Não renderiza se não estiver visível
  if (!isVisible) return null;

  return (
    <div className="loading-overlay">
      {/* Container das partículas de fundo */}
      <div className="particles">
        {particles}
      </div>

      {/* Container principal com imagem e animação circular */}
      <div className="zeus-container">
        <div className="progress-ring">
          <svg width="200" height="200">
            <defs>
              {/* Gradiente para o círculo de progresso */}
              <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#4299e1" />
                <stop offset="100%" stopColor="#ebf8ff" />
              </linearGradient>
            </defs>
            {/* Círculo de fundo */}
            <circle
              cx="100"
              cy="100"
              r="90"
              strokeWidth="4"
              fill="none"
              className="progress-ring-bg"
            />
            {/* Círculo animado */}
            <circle
              cx="100"
              cy="100"
              r="90"
              strokeWidth="4"
              fill="none"
              className="progress-circle"
              strokeDasharray="565"
              strokeDashoffset="282.5"
            />
          </svg>
        </div>
        {/* Imagem central do loading */}
        <img src={ZeusImage} alt="Zeus" className="zeus-image" />
      </div>

      {/* Texto de carregamento */}
      <div className="loading-text">
        Carregando
      </div>
    </div>
  );
};

export default LoadingOverlay;