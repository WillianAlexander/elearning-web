import { Component, input } from '@angular/core';

type StatColor = 'primary' | 'accent' | 'alert' | 'dark';

interface StatItem {
  label: string;
  value: string | number;
  icon: string;
  color?: StatColor;
}

const COLOR_MAP: Record<StatColor, { bg: string; text: string }> = {
  primary: { bg: 'bg-primary/10', text: 'text-primary' },
  accent: { bg: 'bg-primary/10', text: 'text-accent' },
  alert: { bg: 'bg-alert/10', text: 'text-alert-dark' },
  dark: { bg: 'bg-bg', text: 'text-dark' },
};

@Component({
  selector: 'app-stats-cards',
  standalone: true,
  template: `
    <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      @for (stat of stats(); track stat.label) {
        <div class="flex flex-col rounded-xl border border-border bg-surface p-5 shadow-sm">
          <div class="flex items-center justify-between">
            <span class="text-xs font-semibold uppercase tracking-wider text-muted">
              {{ stat.label }}
            </span>
            <div
              [class]="'flex h-8 w-8 items-center justify-center rounded-lg ' + getColorBg(stat)"
            >
              <span [class]="'material-symbols-outlined text-lg ' + getColorText(stat)">{{
                stat.icon
              }}</span>
            </div>
          </div>
          <span [class]="'mt-3 text-3xl font-bold ' + getColorText(stat)">
            {{ stat.value }}
          </span>
        </div>
      }
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
      }
    `,
  ],
})
export class StatsCardsComponent {
  readonly stats = input.required<StatItem[]>();

  getColorBg(stat: StatItem): string {
    const color = stat.color ?? 'primary';
    return COLOR_MAP[color]?.bg ?? COLOR_MAP['primary'].bg;
  }

  getColorText(stat: StatItem): string {
    const color = stat.color ?? 'primary';
    return COLOR_MAP[color]?.text ?? COLOR_MAP['primary'].text;
  }
}
