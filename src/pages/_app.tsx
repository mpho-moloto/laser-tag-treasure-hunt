import React from 'react';
import '../styles/global.css';

export default function MyApp({ Component, pageProps }: any) {
  return (
    <>
      {/* Cyberpunk Background Elements */}
      <div className="grid-lines"></div>
      <div className="neon-glow"></div>
      <div className="neon-glow"></div>
      <div className="scan-lines"></div>
      
      {/* Main App */}
      <div className="app-container">
        <Component {...pageProps} />
      </div>
    </>
  );
}