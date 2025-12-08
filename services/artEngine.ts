import { ArtConfig, Palette } from '../types';
import { SeededRandom } from '../utils/random';

const DEG2RAD = Math.PI / 180;

/**
 * Generates a color palette based on contrast mode and random seed.
 * The palette is strictly monochrome/neutral to match the request.
 */
function generatePalette(rng: SeededRandom, contrast: number): Palette {
  const baseGrey = rng.rangeInt(230, 250);
  // Introduce a slight "warmth" or "coolness" shift
  const toneShift = rng.rangeInt(-5, 5); 
  
  const white = `rgb(${baseGrey + toneShift}, ${baseGrey}, ${baseGrey - toneShift})`;
  const black = '#1a1a1a';
  const midGrey = `rgb(${120 + toneShift}, ${120}, ${120 - toneShift})`;
  const lightGrey = `rgb(${200 + toneShift}, ${200}, ${200 - toneShift})`;
  
  // High contrast mode pushes background darker
  if (contrast > 0.7) {
    return {
      bg: '#222222',
      fgPrimary: '#eeeeee',
      fgSecondary: '#aaaaaa',
      accent: '#ffffff',
      grid: 'rgba(255, 255, 255, 0.1)',
    };
  }
  
  // Light mode (Bauhaus standard)
  return {
    bg: white,
    fgPrimary: black,
    fgSecondary: midGrey,
    accent: lightGrey,
    grid: 'rgba(0, 0, 0, 0.1)',
  };
}

/**
 * Main drawing function.
 * @param ctx The 2D rendering context
 * @param width Canvas width
 * @param height Canvas height
 * @param config Art parameters
 */
export const drawComposition = (
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  config: ArtConfig
) => {
  const rng = new SeededRandom(config.seed);
  const palette = generatePalette(rng, config.contrastMode);

  // 1. Setup Background
  ctx.fillStyle = palette.bg;
  ctx.fillRect(0, 0, width, height);

  // Grid setup
  const gridSize = Math.floor(Math.min(width, height) / (rng.rangeInt(8, 16)));
  const cols = Math.ceil(width / gridSize);
  const rows = Math.ceil(height / gridSize);

  // 2. Draw Technical Grid (Background Layer)
  ctx.strokeStyle = palette.grid;
  ctx.lineWidth = 1;
  ctx.beginPath();
  
  // Draw random grid lines (not all of them)
  for (let x = 0; x <= width; x += gridSize) {
    if (rng.boolean(config.lineDensity)) {
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
    }
  }
  for (let y = 0; y <= height; y += gridSize) {
    if (rng.boolean(config.lineDensity)) {
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
    }
  }
  ctx.stroke();

  // 3. Define Main Shapes Logic
  const drawElement = (cx: number, cy: number, w: number, h: number, type: 'circle' | 'rect' | 'line' | 'complex') => {
    ctx.save();
    ctx.translate(cx, cy);

    const isHollow = rng.boolean(0.6); // Mostly hollow technical shapes
    const lineWidth = rng.pick([1, 2, 4, gridSize / 8]);
    
    ctx.lineWidth = lineWidth;
    ctx.strokeStyle = palette.fgPrimary;
    ctx.fillStyle = rng.boolean(0.5) ? palette.fgSecondary : palette.accent;

    if (type === 'circle') {
      const radius = Math.min(w, h) / 2;
      ctx.beginPath();
      // Sometimes drawing arcs instead of full circles
      if (rng.boolean(0.4)) {
        const startAngle = rng.pick([0, 90, 180, 270]) * DEG2RAD;
        const endAngle = startAngle + (rng.pick([90, 180, 270]) * DEG2RAD);
        ctx.arc(0, 0, radius, startAngle, endAngle);
      } else {
        ctx.arc(0, 0, radius, 0, Math.PI * 2);
      }
      
      if (!isHollow) {
        ctx.globalAlpha = 0.8;
        ctx.fill();
        ctx.globalAlpha = 1.0;
      }
      ctx.stroke();

      // Inner Concentric Circles
      if (rng.boolean(config.complexity)) {
         const steps = rng.rangeInt(2, 5);
         for(let i=1; i<steps; i++) {
             ctx.beginPath();
             ctx.arc(0, 0, radius * (1 - i/steps), 0, Math.PI * 2);
             ctx.lineWidth = 1;
             ctx.stroke();
         }
      }
    } else if (type === 'rect') {
      if (!isHollow) {
        ctx.fillRect(-w/2, -h/2, w, h);
      }
      ctx.strokeRect(-w/2, -h/2, w, h);
      
      // Hatching
      if (rng.boolean(config.lineDensity)) {
         ctx.beginPath();
         const step = rng.rangeInt(4, 10);
         ctx.lineWidth = 1;
         ctx.strokeStyle = palette.fgPrimary;
         for(let i = -w/2; i < w/2; i+= step) {
             ctx.moveTo(i, -h/2);
             ctx.lineTo(i, h/2);
         }
         ctx.stroke();
      }
    } else if (type === 'complex') {
        // A "Node" or "Chip" style element
        ctx.fillStyle = palette.fgPrimary;
        ctx.beginPath();
        ctx.arc(0, 0, gridSize/4, 0, Math.PI*2);
        ctx.fill();
        
        // Lines extending out
        ctx.beginPath();
        ctx.moveTo(0,0);
        const dir = rng.pick([[1,0], [-1,0], [0,1], [0,-1]]);
        ctx.lineTo(dir[0] * w, dir[1] * h);
        ctx.stroke();
    }

    ctx.restore();
  };

  // 4. Generate Layout & Symmetry
  const numShapes = Math.floor(5 + config.complexity * 25);
  
  const centerX = width / 2;
  const centerY = height / 2;
  
  // Decide symmetry axes
  const symmetryX = config.symmetry > 0.2;
  const symmetryY = config.symmetry > 0.6;
  const radialSym = config.symmetry > 0.8;

  // We generate shapes on one side, then mirror them
  for (let i = 0; i < numShapes; i++) {
    // Snap to grid
    let gx = rng.rangeInt(0, cols) * gridSize;
    let gy = rng.rangeInt(0, rows) * gridSize;
    
    // Bias towards center for composition
    if (rng.boolean(0.6)) {
        gx = centerX + (rng.rangeInt(-cols/4, cols/4) * gridSize);
        gy = centerY + (rng.rangeInt(-rows/4, rows/4) * gridSize);
    }

    const size = gridSize * rng.pick([1, 2, 3, 4, 6]);
    // Determines shape type based on slider
    const shapeType = rng.next() < config.circleEmphasis ? 'circle' : (rng.boolean(0.7) ? 'rect' : 'complex');

    // Drawing Operation Wrapper to handle symmetry
    const renderSymmetric = (x: number, y: number) => {
        drawElement(x, y, size, size, shapeType);
    };

    renderSymmetric(gx, gy);

    if (symmetryX) {
        const mirrorX = width - gx;
        renderSymmetric(mirrorX, gy);
    }
    
    if (symmetryY) {
        const mirrorY = height - gy;
        renderSymmetric(gx, mirrorY);
        if (symmetryX) {
             renderSymmetric(width - gx, mirrorY);
        }
    }
  }

  // 5. Connecting Lines (Circuit board style)
  const numLines = Math.floor(config.complexity * 15);
  ctx.strokeStyle = palette.fgPrimary;
  ctx.lineWidth = 1;
  ctx.beginPath();
  
  for(let i=0; i<numLines; i++) {
      let x1 = rng.rangeInt(0, cols) * gridSize;
      let y1 = rng.rangeInt(0, rows) * gridSize;
      
      // Draw lines
      const length = gridSize * rng.rangeInt(2, 8);
      const isVertical = rng.boolean();
      
      let x2 = isVertical ? x1 : x1 + length;
      let y2 = isVertical ? y1 + length : y1;

      // Ensure dots at ends
      const drawDot = (dx: number, dy: number) => {
           ctx.save();
           ctx.fillStyle = palette.fgPrimary;
           ctx.beginPath();
           ctx.arc(dx, dy, 2, 0, Math.PI*2);
           ctx.fill();
           ctx.restore();
      };

      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      
      // Symmetry for lines
      if (symmetryX) {
           ctx.moveTo(width - x1, y1);
           ctx.lineTo(width - x2, y2);
      }
  }
  ctx.stroke();

  // 6. Overlay Texture (Grain/Noise) - Optional subtle finish
  const imageData = ctx.getImageData(0, 0, width, height);
  const data = imageData.data;
  const noiseAmount = 10;
  for (let i = 0; i < data.length; i += 4) {
      const noise = (Math.random() - 0.5) * noiseAmount;
      data[i] = Math.max(0, Math.min(255, data[i] + noise));
      data[i+1] = Math.max(0, Math.min(255, data[i+1] + noise));
      data[i+2] = Math.max(0, Math.min(255, data[i+2] + noise));
  }
  ctx.putImageData(imageData, 0, 0);
};