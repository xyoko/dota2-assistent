import React from 'react';
import { createRoot } from 'react-dom/client';
import ShapeWaves from './ShapeWaves.jsx';
import './style.css';

function App() {
  return (
    <main className="demo">
      <div className="demo__scene">
        <ShapeWaves
          maskImage="/dota2.svg"
          fontFamily={'Geist, "Geist Sans", system-ui, sans-serif'}
          fontWeight={500}
          textSize={0.6}
          shapes="mixed"
          cellSize={10}
          dotSize={0.75}
          color="#880808"
          hoverColor="#ffffff"
          backgroundColor="#120f17"
          speed={1}
          scale={1}
          contrast={1}
          brightness={0.4}
          flow={0}
          direction={0}
          fade={0.25}
          interactive
          splashRadius={40}
          splashStrength={0.4}
          glow={0.35}
          intro
          introDuration={1.6}
          paused={false}
          onError={error => console.error('ShapeWaves failed:', error)}
        />
      </div>
    </main>
  );
}

createRoot(document.getElementById('root')).render(<App />);