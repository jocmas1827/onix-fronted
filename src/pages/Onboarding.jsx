import React from 'react';
import './Onboarding.css';

export default function Onboarding({ onComplete }) {
  return (
    <div className="onboarding-container">
      {/* Mock Status Bar Space */}
      <div style={{ height: '40px', width: '100%' }}></div>

      <div className="hero-graphic">
        <div className="logo-x">X</div>
      </div>

      <div className="text-block">
        <h1 className="heading text-primary">
          Conecta. Comprende. <span className="text-accent">Convierte.</span>
        </h1>
        <p className="paragraph">
          Onix IA es tu copiloto de ventas.
          {'\n'}IA que conversa, filtra, entiende
          {'\n'}y te ayuda a cerrar más.
        </p>
      </div>

      <div className="actions-block flex-column items-center">
        <button className="btn-primary hover-glow" onClick={onComplete}>
          Comenzar
        </button>
        <button className="btn-text">
          Iniciar sesión
        </button>
      </div>
    </div>
  );
}
