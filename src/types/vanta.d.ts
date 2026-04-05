declare module 'vanta/dist/vanta.birds.min.js' {
  interface VantaBirdsOptions {
    el: HTMLElement;
    mouseControls?: boolean;
    touchControls?: boolean;
    gyroControls?: boolean;
    minHeight?: number;
    minWidth?: number;
    scale?: number;
    scaleMobile?: number;
    backgroundColor?: number;
    backgroundAlpha?: number;
    color1?: number;
    color2?: number;
    colorMode?: string;
    birdSize?: number;
    wingSpan?: number;
    speedLimit?: number;
    separation?: number;
    alignment?: number;
    cohesion?: number;
    quantity?: number;
  }

  interface VantaEffect {
    destroy(): void;
    resize(): void;
    setOptions(options: Partial<VantaBirdsOptions>): void;
  }

  interface VantaLibrary {
    BIRDS(options: VantaBirdsOptions): VantaEffect;
  }

  const VANTA: VantaLibrary;
  export default VANTA;
}

declare global {
  interface Window {
    VANTA: {
      BIRDS(options: any): any;
    };
    THREE: any;
  }
}
