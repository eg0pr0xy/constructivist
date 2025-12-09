import React from 'react';
import { ArtConfig, AspectRatio } from '../types';

interface ControlsProps {
  config: ArtConfig;
  onChange: (newConfig: ArtConfig) => void;
  onGenerate: () => void;
  onDownload: () => void;
}

export const Controls: React.FC<ControlsProps> = ({ config, onChange, onGenerate, onDownload }) => {
  
  const handleChange = <K extends keyof ArtConfig>(key: K, value: ArtConfig[K]) => {
    onChange({ ...config, [key]: value });
  };

  const Slider = ({ label, value, min, max, step, paramKey }: { label: string, value: number, min: number, max: number, step: number, paramKey: keyof ArtConfig }) => (
    <div className="mb-4">
      <div className="flex justify-between mb-1">
        <label className="text-xs uppercase tracking-widest text-gray-500 font-semibold">{label}</label>
        <span className="text-xs text-gray-700 font-mono">{value.toFixed(2)}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => handleChange(paramKey, parseFloat(e.target.value))}
        className="w-full h-1 bg-gray-300 rounded-lg appearance-none cursor-pointer accent-black"
      />
    </div>
  );

  return (
    <div className="flex flex-col h-full bg-white border-r border-gray-200 p-6 overflow-y-auto">
      <div className="mb-8">
        {/* Logo */}
        <div className="mb-4 h-16 flex items-center justify-center">
          <img src="/logo.png" alt="Constructivist Logo" className="h-full w-auto" />
        </div>
        <h1 className="text-2xl font-bold tracking-tighter mb-1">CONSTRUCTIVIST</h1>
        <p className="text-xs text-gray-500">Generative Geometric Assembler</p>
      </div>

      <div className="space-y-6 flex-1">
        
        {/* Aspect Ratio */}
        <div className="mb-4">
          <label className="text-xs uppercase tracking-widest text-gray-500 font-semibold block mb-2">Dimensions</label>
          <div className="grid grid-cols-4 gap-2">
            {(['1:1', '4:5', '9:16', '16:9'] as AspectRatio[]).map((ratio) => (
              <button
                key={ratio}
                onClick={() => handleChange('aspectRatio', ratio)}
                className={`text-xs py-2 border ${config.aspectRatio === ratio ? 'bg-black text-white border-black' : 'bg-white text-gray-600 border-gray-300 hover:border-gray-500'} transition-colors`}
              >
                {ratio}
              </button>
            ))}
          </div>
        </div>

        {/* Sliders */}
        <div className="space-y-1 border-t border-gray-100 pt-6">
           <Slider label="Complexity" paramKey="complexity" value={config.complexity} min={0.1} max={1.0} step={0.05} />
           <Slider label="Line Density" paramKey="lineDensity" value={config.lineDensity} min={0} max={1.0} step={0.05} />
           <Slider label="Curvature" paramKey="circleEmphasis" value={config.circleEmphasis} min={0} max={1.0} step={0.05} />
           <Slider label="Symmetry" paramKey="symmetry" value={config.symmetry} min={0} max={1.0} step={0.1} />
           <Slider label="Contrast" paramKey="contrastMode" value={config.contrastMode} min={0} max={1.0} step={0.1} />
        </div>

        {/* Seed Input */}
        <div className="border-t border-gray-100 pt-6">
          <label className="text-xs uppercase tracking-widest text-gray-500 font-semibold block mb-2">Seed</label>
          <div className="flex space-x-2">
             <input 
                type="text" 
                value={config.seed} 
                onChange={(e) => handleChange('seed', e.target.value)}
                className="flex-1 bg-gray-50 border border-gray-300 text-sm p-2 font-mono focus:outline-none focus:border-black"
             />
             <button 
                onClick={() => handleChange('seed', Math.random().toString(36).substring(7))}
                className="bg-gray-200 hover:bg-gray-300 px-3 py-2 text-gray-700 transition-colors"
                title="Randomize Seed"
             >
               <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/><path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16"/><path d="M16 16h5v5"/></svg>
             </button>
          </div>
        </div>
      </div>

      <div className="mt-8 space-y-3 pt-6 border-t border-gray-200">
        <button 
          onClick={onGenerate}
          className="w-full bg-black text-white py-3 px-4 font-semibold uppercase tracking-wider text-sm hover:bg-gray-800 transition-colors flex items-center justify-center space-x-2"
        >
            <span>Regenerate</span>
        </button>

        <button 
          onClick={onDownload}
          className="w-full bg-white text-black border border-black py-3 px-4 font-semibold uppercase tracking-wider text-sm hover:bg-gray-50 transition-colors"
        >
          Download HQ
        </button>
      </div>
    </div>
  );
};
