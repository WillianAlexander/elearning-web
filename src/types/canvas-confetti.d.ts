declare module 'canvas-confetti' {
  interface Options {
    particleCount?: number;
    spread?: number;
    origin?: { y?: number; x?: number };
    colors?: string[];
    disableForReducedMotion?: boolean;
  }

  function confetti(options?: Options): Promise<null>;
  export default confetti;
}
