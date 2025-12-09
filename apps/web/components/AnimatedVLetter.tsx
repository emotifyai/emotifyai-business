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

const AnimatedVLetter = () => {
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [particles, setParticles] = useState<Particle[]>([]);
  const [animationPhase, setAnimationPhase] = useState(0);

  // Define the V shape using a grid - much bigger and steeper
  const vShape = [
    // Left side of V (steep angle)
    [0, 1], [1, 1], [2, 2], [3, 2], [4, 3], [5, 3], [6, 4], [7, 4], [8, 5], [9, 5], [10, 6], [11, 6],
    [12, 7], [13, 7], [14, 8], [15, 8], [16, 9], [17, 9], [18, 10], [19, 10], [20, 11], [21, 11],
    [22, 12], [23, 12], [24, 13], [25, 13], [26, 14], [27, 14], [28, 15], [29, 15], [30, 16],
    [0, 2], [1, 2], [2, 3], [3, 3], [4, 4], [5, 4], [6, 5], [7, 5], [8, 6], [9, 6], [10, 7], [11, 7],
    [12, 8], [13, 8], [14, 9], [15, 9], [16, 10], [17, 10], [18, 11], [19, 11], [20, 12], [21, 12],
    [22, 13], [23, 13], [24, 14], [25, 14], [26, 15], [27, 15], [28, 16], [29, 16], [30, 17],
    [0, 3], [1, 3], [2, 4], [3, 4], [4, 5], [5, 5], [6, 6], [7, 6], [8, 7], [9, 7], [10, 8], [11, 8],
    [12, 9], [13, 9], [14, 10], [15, 10], [16, 11], [17, 11], [18, 12], [19, 12], [20, 13], [21, 13],
    [22, 14], [23, 14], [24, 15], [25, 15], [26, 16], [27, 16], [28, 17], [29, 17], [30, 18],
    // Right side of V (steep angle)
    [0, 31], [1, 31], [2, 30], [3, 30], [4, 29], [5, 29], [6, 28], [7, 28], [8, 27], [9, 27], [10, 26], [11, 26],
    [12, 25], [13, 25], [14, 24], [15, 24], [16, 23], [17, 23], [18, 22], [19, 22], [20, 21], [21, 21],
    [22, 20], [23, 20], [24, 19], [25, 19], [26, 18], [27, 18], [28, 17], [29, 17], [30, 16],
    [0, 30], [1, 30], [2, 29], [3, 29], [4, 28], [5, 28], [6, 27], [7, 27], [8, 26], [9, 26], [10, 25], [11, 25],
    [12, 24], [13, 24], [14, 23], [15, 23], [16, 22], [17, 22], [18, 21], [19, 21], [20, 20], [21, 20],
    [22, 19], [23, 19], [24, 18], [25, 18], [26, 17], [27, 17], [28, 16], [29, 16], [30, 15],
    [0, 29], [1, 29], [2, 28], [3, 28], [4, 27], [5, 27], [6, 26], [7, 26], [8, 25], [9, 25], [10, 24], [11, 24],
    [12, 23], [13, 23], [14, 22], [15, 22], [16, 21], [17, 21], [18, 20], [19, 20], [20, 19], [21, 19],
    [22, 18], [23, 18], [24, 17], [25, 17], [26, 16], [27, 16], [28, 15], [29, 15], [30, 14],
  ];

  useEffect(() => {
    // Initialize blocks with random delays
    const initialBlocks = vShape.map(([row, col], index) => ({
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

export default AnimatedVLetter;