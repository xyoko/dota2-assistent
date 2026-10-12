import React, { useEffect, useRef } from 'react';

export interface GhostFibersProps {
  lineColor?: string;
  glowColor?: string;
  speed?: number;
  scale?: number;
  rotation?: number;
  rotationSpeed?: number;
  layers?: number;
  waveAmplitude?: number;
  waveFrequency?: number;
  waveSpeed?: number;
  layerSpeed?: number;
  twist?: number;
  twistFrequency?: number;
  twistSpeed?: number;
  lineFrequency?: number;
  lineSpacing?: number;
  lineSharpness?: number;
  glowFalloff?: number;
  glowIntensity?: number;
  brightness?: number;
  blueBoost?: number;
  vignette?: number;
  grain?: number;
  dpr?: number;
  className?: string;
}

export const GhostFibers: React.FC<GhostFibersProps> = React.memo(({
  lineColor = '#140E35',
  glowColor = '#3437A0',
  speed = 0.2,
  layers = 4,
  waveAmplitude = 0.015,
  waveFrequency = 3,
  waveSpeed = 0.15,
  lineFrequency = 5,
  glowIntensity = 1.6,
  className = ''
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Restored 100% native resolution for maximum sharpness as requested
    let width = window.innerWidth;
    let height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;

    const fibers: Array<{
      x: number;
      y: number;
      vx: number;
      vy: number;
      length: number;
      phase: number;
      width: number;
      isBloodScarlet: boolean;
      layer: number;
    }> = [];

    // Blood scarlet color for the requested trails
    const scarletColor = '#dc2626';

    const totalFibers = 80 * (layers / 4);

    for (let i = 0; i < totalFibers; i++) {
      fibers.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * speed * 10,
        vy: (Math.random() - 0.5) * speed * 10,
        length: Math.random() * 200 + 100,
        phase: Math.random() * Math.PI * 2,
        width: Math.random() * lineFrequency + 0.5,
        isBloodScarlet: i % 2 === 0, // Half of them must be blood scarlet
        layer: (i % layers) + 1
      });
    }

    let animationFrameId: number;
    let time = 0;

    const draw = () => {
      time += waveSpeed * 0.1;
      
      // Create a nice trailing/fading effect
      ctx.fillStyle = `rgba(2, 6, 23, 0.2)`; // Slate-950 fade
      ctx.fillRect(0, 0, width, height);

      ctx.lineCap = 'round';
      ctx.globalCompositeOperation = 'screen';

      fibers.forEach(fiber => {
        // Apply wave physics
        fiber.x += fiber.vx + Math.sin(time + fiber.phase * waveFrequency) * waveAmplitude * 100;
        fiber.y += fiber.vy + Math.cos(time + fiber.phase * waveFrequency) * waveAmplitude * 100;
        fiber.phase += 0.02 * speed;

        // Wrapping edges
        if (fiber.x > width + fiber.length) fiber.x = -fiber.length;
        if (fiber.x < -fiber.length) fiber.x = width + fiber.length;
        if (fiber.y > height + fiber.length) fiber.y = -fiber.length;
        if (fiber.y < -fiber.length) fiber.y = height + fiber.length;

        ctx.beginPath();
        ctx.moveTo(fiber.x, fiber.y);
        
        const endX = fiber.x + Math.cos(fiber.phase) * fiber.length;
        const endY = fiber.y + Math.sin(fiber.phase) * fiber.length;

        const cpX = fiber.x + (endX - fiber.x) * 0.5 + Math.sin(fiber.phase * 0.5) * 80;
        const cpY = fiber.y + (endY - fiber.y) * 0.5 + Math.cos(fiber.phase * 0.5) * 80;

        ctx.quadraticCurveTo(cpX, cpY, endX, endY);
        
        const baseWidth = fiber.width * (fiber.layer / 2);
        const color = fiber.isBloodScarlet ? scarletColor : glowColor;
        
        // Outer stroke acts as a fast glow (no shadowBlur)
        ctx.globalAlpha = 0.4;
        ctx.strokeStyle = color;
        ctx.lineWidth = baseWidth * 2.5;
        ctx.stroke();

        // Inner sharp core for high contrast pop
        ctx.globalAlpha = 1.0;
        ctx.strokeStyle = fiber.isBloodScarlet ? '#ff9999' : '#9999ff';
        ctx.lineWidth = baseWidth * 0.7;
        ctx.stroke();
      });

      ctx.globalCompositeOperation = 'source-over';
      animationFrameId = requestAnimationFrame(draw);
    };

    draw();

    const handleResize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [lineColor, glowColor, speed, layers, waveAmplitude, waveFrequency, waveSpeed, lineFrequency, glowIntensity]);

  return (
    <canvas 
      ref={canvasRef} 
      className={`absolute inset-0 w-full h-full pointer-events-none ${className}`}
    />
  );
});

export default GhostFibers;
