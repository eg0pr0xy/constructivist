export type AspectRatio = '1:1' | '4:5' | '9:16' | '16:9';

export interface ArtConfig {
  seed: string;
  complexity: number;      // 0.0 to 1.0 (Number of elements)
  lineDensity: number;     // 0.0 to 1.0 (Grid / Hatching frequency)
  circleEmphasis: number;  // 0.0 to 1.0 (Likelihood of radial shapes)
  symmetry: number;        // 0.0 to 1.0 (None -> Mirror X -> Mirror XY)
  contrastMode: number;    // 0.0 to 1.0 (Light -> Balanced -> Dark)
  aspectRatio: AspectRatio;
}

export interface Palette {
  bg: string;
  fgPrimary: string;
  fgSecondary: string;
  accent: string;
  grid: string;
}

export const DEFAULT_CONFIG: ArtConfig = {
  seed: Math.random().toString(36).substring(7),
  complexity: 0.6,
  lineDensity: 0.5,
  circleEmphasis: 0.4,
  symmetry: 0.2,
  contrastMode: 0.5,
  aspectRatio: '4:5',
};