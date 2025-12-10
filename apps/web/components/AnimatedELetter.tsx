'use client';

import React, { useState, useEffect } from 'react';

interface Block {
  row: number;
  col: number;
  id: number;
  delay: number;
  visible: boolean;
  scale: number;
  rotation: number;
  offsetX: number;
  offsetY: number;
}

interface Particle {
  id: number;
  left: number;
  top: number;
  delay: number;
}

const AnimatedELetter = () => {
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [particles, setParticles] = useState<Particle[]>([]);
  const [animationPhase, setAnimationPhase] = useState(0);

  // Define the V shape using a grid - much bigger and steeper
  const eShape = [
    // Vertical spine of E (left side)
    [0, 1], [1, 1], [2, 1], [3, 1], [4, 1], [5, 1], [6, 1], [7, 1], [8, 1], [9, 1], [10, 1], [11, 1],
    [12, 1], [13, 1], [14, 1], [15, 1], [16, 1], [17, 1], [18, 1], [19, 1], [20, 1], [21, 1],
    [22, 1], [23, 1], [24, 1], [25, 1], [26, 1], [27, 1], [28, 1], [29, 1], [30, 1],
    [0, 2], [1, 2], [2, 2], [3, 2], [4, 2], [5, 2], [6, 2], [7, 2], [8, 2], [9, 2], [10, 2], [11, 2],
    [12, 2], [13, 2], [14, 2], [15, 2], [16, 2], [17, 2], [18, 2], [19, 2], [20, 2], [21, 2],
    [22, 2], [23, 2], [24, 2], [25, 2], [26, 2], [27, 2], [28, 2], [29, 2], [30, 2],
    [0, 3], [1, 3], [2, 3], [3, 3], [4, 3], [5, 3], [6, 3], [7, 3], [8, 3], [9, 3], [10, 3], [11, 3],
    [12, 3], [13, 3], [14, 3], [15, 3], [16, 3], [17, 3], [18, 3], [19, 3], [20, 3], [21, 3],
    [22, 3], [23, 3], [24, 3], [25, 3], [26, 3], [27, 3], [28, 3], [29, 3], [30, 3],
    // Top horizontal bar
    [0, 4], [0, 5], [0, 6], [0, 7], [0, 8], [0, 9], [0, 10], [0, 11], [0, 12], [0, 13], [0, 14], [0, 15], [0, 16], [0, 17], [0, 18],
    [1, 4], [1, 5], [1, 6], [1, 7], [1, 8], [1, 9], [1, 10], [1, 11], [1, 12], [1, 13], [1, 14], [1, 15], [1, 16], [1, 17], [1, 18],
    [2, 4], [2, 5], [2, 6], [2, 7], [2, 8], [2, 9], [2, 10], [2, 11], [2, 12], [2, 13], [2, 14], [2, 15], [2, 16], [2, 17], [2, 18],
    // Middle horizontal bar
    [14, 4], [14, 5], [14, 6], [14, 7], [14, 8], [14, 9], [14, 10], [14, 11], [14, 12], [14, 13], [14, 14], [14, 15],
    [15, 4], [15, 5], [15, 6], [15, 7], [15, 8], [15, 9], [15, 10], [15, 11], [15, 12], [15, 13], [15, 14], [15, 15],
    [16, 4], [16, 5], [16, 6], [16, 7], [16, 8], [16, 9], [16, 10], [16, 11], [16, 12], [16, 13], [16, 14], [16, 15],
    // Bottom horizontal bar
    [28, 4], [28, 5], [28, 6], [28, 7], [28, 8], [28, 9], [28, 10], [28, 11], [28, 12], [28, 13], [28, 14], [28, 15], [28, 16], [28, 17], [28, 18],
    [29, 4], [29, 5], [29, 6], [29, 7], [29, 8], [29, 9], [29, 10], [29, 11], [29, 12], [29, 13], [29, 14], [29, 15], [29, 16], [29, 17], [29, 18],
    [30, 4], [30, 5], [30, 6], [30, 7], [30, 8], [30, 9], [30, 10], [30, 11], [30, 12], [30, 13], [30, 14], [30, 15], [30, 16], [30, 17], [30, 18],
  ];

  useEffect(() => {
    // Initialize blocks with random delays
    const initialBlocks = eShape.map(([row, col], index) => ({
      row,
      col,
      id: index,
      delay: Math.random() * 1000,
      visible: false,
      scale: 0,
      rotation: Math.random() * 360,
      offsetX: (Math.random() - 0.5) * 200,
      offsetY: (Math.random() - 0.5) * 200,
    }));
    setBlocks(initialBlocks);

    // Initialize particles
    const initialParticles = Array.from({ length: 20 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      top: Math.random() * 100,
      delay: Math.random() * 2,
    }));
    setParticles(initialParticles);

    // Animation loop
    const animationInterval = setInterval(() => {
      setAnimationPhase(prev => (prev + 1) % 3);
    }, 4000);

    return () => clearInterval(animationInterval);
  }, []);

  useEffect(() => {
    if (blocks.length === 0) return;

    const timer = setTimeout(() => {
      setBlocks(prevBlocks =>
        prevBlocks.map(block => {
          if (animationPhase === 0) {
            // Pop in phase
            return {
              ...block,
              visible: true,
              scale: 1,
              rotation: 0,
              offsetX: 0,
              offsetY: 0,
            };
          } else if (animationPhase === 1) {
            // Deform phase
            return {
              ...block,
              scale: 0.8 + Math.random() * 0.4,
              rotation: (Math.random() - 0.5) * 30,
              offsetX: (Math.random() - 0.5) * 20,
              offsetY: (Math.random() - 0.5) * 20,
            };
          } else {
            // Reform phase
            return {
              ...block,
              scale: 1,
              rotation: 0,
              offsetX: 0,
              offsetY: 0,
            };
          }
        })
      );
    }, 100);

    return () => clearTimeout(timer);
  }, [animationPhase, blocks.length]);

  const blockSize = 16;
  const gap = 3;

  return (
    <div className="flex items-center justify-center w-full h-full">
      <div className="relative" style={{ width: '650px', height: '650px' }}>
        {/* Glow effect */}
        <div className="absolute inset-0 blur-3xl opacity-50">
          {blocks.map((block) => (
            <div
              key={`glow-${block.id}`}
              className="absolute bg-purple-500"
              style={{
                left: `${block.col * (blockSize + gap)}px`,
                top: `${block.row * (blockSize + gap)}px`,
                width: `${blockSize * 2}px`,
                height: `${blockSize * 2}px`,
                transform: `translate(${block.offsetX}px, ${block.offsetY}px) scale(${block.scale}) rotate(${block.rotation}deg)`,
                opacity: block.visible ? 0.6 : 0,
                transition: `all 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)`,
                transitionDelay: `${block.delay}ms`,
              }}
            />
          ))}
        </div>

        {/* Main V blocks */}
        {blocks.map((block) => (
          <div
            key={block.id}
            className="absolute rounded-sm shadow-lg"
            style={{
              left: `${block.col * (blockSize + gap)}px`,
              top: `${block.row * (blockSize + gap)}px`,
              width: `${blockSize}px`,
              height: `${blockSize}px`,
              background: 'linear-gradient(135deg, #a78bfa 0%, #7c3aed 50%, #6d28d9 100%)',
              transform: `translate(${block.offsetX}px, ${block.offsetY}px) scale(${block.scale}) rotate(${block.rotation}deg)`,
              opacity: block.visible ? 1 : 0,
              transition: `all 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)`,
              transitionDelay: `${block.delay}ms`,
              boxShadow: '0 0 20px rgba(139, 92, 246, 0.5)',
            }}
          />
        ))}

        {/* Particle effects */}
        <div className="absolute inset-0 pointer-events-none">
          {particles.map((particle) => (
            <div
              key={`particle-${particle.id}`}
              className="absolute w-1 h-1 bg-purple-400 rounded-full animate-float"
              style={{
                left: `${particle.left}%`,
                top: `${particle.top}%`,
                animationDelay: `${particle.delay}s`,
                opacity: 0.3,
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default AnimatedELetter;