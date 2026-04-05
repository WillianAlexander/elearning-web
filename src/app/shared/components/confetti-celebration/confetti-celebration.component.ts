import {
  Component,
  input,
  output,
  OnChanges,
  SimpleChanges,
  ElementRef,
  ViewChild,
  AfterViewInit,
} from '@angular/core';

declare const confetti: any;

@Component({
  selector: 'app-confetti-celebration',
  standalone: true,
  template: `<canvas #canvas class="fixed inset-0 pointer-events-none z-50"></canvas>`,
  styles: [
    `
      :host {
        display: block;
      }
    `,
  ],
})
export class ConfettiCelebrationComponent implements AfterViewInit, OnChanges {
  @ViewChild('canvas') canvasRef!: ElementRef<HTMLCanvasElement>;

  readonly trigger = input<boolean>(false);
  readonly complete = output<void>();

  private hasFired = false;

  ngAfterViewInit(): void {
    if (this.trigger() && !this.hasFired) {
      this.fireConfetti();
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['trigger'] && this.trigger() && !this.hasFired) {
      this.fireConfetti();
    }
  }

  private async fireConfetti(): Promise<void> {
    this.hasFired = true;

    try {
      // Dynamically import canvas-confetti
      const confettiModule = await import('canvas-confetti');
      const confetti = confettiModule.default;

      // Fire a burst from the center
      confetti({
        particleCount: 150,
        spread: 100,
        origin: { y: 0.6 },
        colors: ['#008F3C', '#79B32B', '#FCC800', '#0E6049'],
        disableForReducedMotion: true,
      });

      // Second burst after a short delay
      setTimeout(() => {
        confetti({
          particleCount: 80,
          spread: 120,
          origin: { y: 0.5, x: 0.3 },
          colors: ['#008F3C', '#79B32B', '#FCC800'],
          disableForReducedMotion: true,
        });
        confetti({
          particleCount: 80,
          spread: 120,
          origin: { y: 0.5, x: 0.7 },
          colors: ['#008F3C', '#79B32B', '#FCC800'],
          disableForReducedMotion: true,
        });
      }, 300);

      // Notify completion after animation settles
      setTimeout(() => {
        this.complete.emit();
      }, 5000);
    } catch (error) {
      console.warn('Confetti could not be loaded:', error);
    }
  }
}
