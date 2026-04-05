import { onMounted, onBeforeUnmount, Ref } from 'vue';

export interface VantaBirdsOptions {
  backgroundColor?: number;
  backgroundAlpha?: number;
  color1?: number;
  color2?: number;
  colorMode?: string;
  quantity?: number;
  birdSize?: number;
  wingSpan?: number;
  speedLimit?: number;
  separation?: number;
  alignment?: number;
  cohesion?: number;
  mouseControls?: boolean;
  touchControls?: boolean;
  gyroControls?: boolean;
  minHeight?: number;
  minWidth?: number;
  scale?: number;
  scaleMobile?: number;
}

declare global {
  interface Window {
    VANTA: any;
    THREE: any;
  }
  
  // Extend globalThis for better portability
  var VANTA: any;
  var THREE: any;
}

export function useVantaBirds(
  elementRef: Ref<HTMLElement | null>,
  options: VantaBirdsOptions = {}
) {
  let vantaEffect: any = null;

  onMounted(async () => {
    if (!elementRef.value) return;

    try {
      // Verificar que THREE esté disponible desde el CDN
      if (!globalThis.THREE) {
        return;
      }

      // Importar Vanta Birds - esto registra VANTA en window
      await import('vanta/dist/vanta.birds.min.js');

      // Esperar un momento para que Vanta se registre
      await new Promise(resolve => setTimeout(resolve, 100));

      // Verificar que globalThis.VANTA está disponible
      if (!globalThis.VANTA?.BIRDS) {
        return;
      }

      const defaultOptions = {
        el: elementRef.value,
        mouseControls: true,
        touchControls: true,
        gyroControls: false,
        minHeight: 200,
        minWidth: 200,
        scale: 1,
        scaleMobile: 1,
        backgroundColor: 0x05323b,
        backgroundAlpha: 1,
        color1: 0x071f53,
        color2: 0x53a453,
        colorMode: "varianceGradient",
        birdSize: 1,
        wingSpan: 30,
        speedLimit: 5,
        separation: 20,
        alignment: 20,
        cohesion: 20,
        quantity: 5,
        ...options,
      };

      vantaEffect = globalThis.VANTA.BIRDS(defaultOptions);
    } catch (error) {
      console.error('Vanta Birds initialization failed:', error);
    }
  });

  onBeforeUnmount(() => {
    if (vantaEffect) {
      vantaEffect.destroy();
    }
  });

  return {
    vantaEffect,
  };
}
