import React, { useState, useEffect, useRef, useCallback } from 'react';
import { DEFAULT_CONFIG, ArtConfig } from './types';
import { Controls } from './components/Controls';
import { drawComposition } from './services/artEngine';

function App() {
  const [config, setConfig] = useState<ArtConfig>(DEFAULT_CONFIG);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // To handle window resizing debouncing
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });

  // Calculate canvas dimensions based on container and aspect ratio
  const getCanvasDimensions = useCallback(() => {
    if (!containerSize.width) return { width: 800, height: 800 };
    
    const { width: maxW, height: maxH } = containerSize;
    const padding = 40;
    const availW = maxW - padding * 2;
    const availH = maxH - padding * 2;

    let targetW, targetH;
    
    const [rw, rh] = config.aspectRatio.split(':').map(Number);
    const ratio = rw / rh;

    if (availW / ratio <= availH) {
      targetW = availW;
      targetH = availW / ratio;
    } else {
      targetH = availH;
      targetW = availH * ratio;
    }

    return { width: targetW, height: targetH };
  }, [containerSize, config.aspectRatio]);


  // Handle resize observer
  useEffect(() => {
    if (!containerRef.current) return;
    
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setContainerSize({
          width: entry.contentRect.width,
          height: entry.contentRect.height
        });
      }
    });
    
    resizeObserver.observe(containerRef.current);
    return () => resizeObserver.disconnect();
  }, []);

  // Main Draw Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const { width, height } = getCanvasDimensions();
    
    // Handle High DPI displays
    const dpr = window.devicePixelRatio || 1;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    ctx.scale(dpr, dpr);
    
    // Draw
    drawComposition(ctx, width, height, config);

  }, [config, containerSize, getCanvasDimensions]);

  const handleGenerate = () => {
    // Just changing seed triggers regen
    setConfig(prev => ({ ...prev, seed: Math.random().toString(36).substring(7) }));
  };

  const handleDownload = () => {
    // Create an offscreen canvas for high-res export (3000px on shortest side approx)
    const exportCanvas = document.createElement('canvas');
    const [rw, rh] = config.aspectRatio.split(':').map(Number);
    
    // Base size 3000px
    const baseSize = 3000;
    const width = rw >= rh ? baseSize : baseSize * (rw/rh);
    const height = rh > rw ? baseSize : baseSize * (rh/rw);
    
    exportCanvas.width = width;
    exportCanvas.height = height;
    
    const ctx = exportCanvas.getContext('2d');
    if(ctx) {
      drawComposition(ctx, width, height, config);
      const link = document.createElement('a');
      link.download = `constructivist-${config.seed}-${Date.now()}.png`;
      link.href = exportCanvas.toDataURL('image/png');
      link.click();
    }
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden text-gray-800">
      
      {/* Sidebar Controls - Fixed width on Desktop, full on Mobile */}
      <div className="w-80 h-full flex-shrink-0 z-10 shadow-xl">
        <Controls 
          config={config} 
          onChange={setConfig} 
          onGenerate={handleGenerate}
          onDownload={handleDownload}
        />
      </div>

      {/* Main Canvas Area */}
      <div ref={containerRef} className="flex-1 h-full bg-gray-100 flex items-center justify-center overflow-hidden relative">
        
        {/* Decorative background grid pattern for the 'desk' area */}
        <div className="absolute inset-0 opacity-5 pointer-events-none" style={{ 
          backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', 
          backgroundSize: '20px 20px' 
        }}></div>

        <canvas 
          ref={canvasRef}
          className="shadow-2xl bg-white transition-all duration-300 ease-in-out"
        />
      </div>
    </div>
  );
}

export default App;