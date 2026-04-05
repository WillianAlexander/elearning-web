import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface HeatmapEntry {
  date: string;
  count: number;
}

@Component({
  selector: 'app-heatmap-grid',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="space-y-2">
      <h3 class="text-sm font-semibold text-dark">Actividad de aprendizaje</h3>

      <!-- Month labels -->
      <div class="flex pl-8">
        @for (marker of monthMarkers; track marker.weekIndex) {
          <span
            class="text-[10px] text-muted"
            [style.margin-left.px]="marker.weekIndex * 14"
            [style.width.px]="14 * 4"
          >
            {{ marker.label }}
          </span>
        }
      </div>

      <div class="flex gap-0.5">
        <!-- Day labels -->
        <div class="flex flex-col gap-0.5 pr-1">
          @for (label of dayLabels; track $index) {
            @if (label) {
              <span class="block h-[12px] w-6 text-[10px] leading-[12px] text-muted text-right">
                {{ label }}
              </span>
            } @else {
              <span class="block h-[12px] w-6"></span>
            }
          }
        </div>

        <!-- Grid -->
        <div class="flex gap-0.5 overflow-x-auto">
          @for (week of weeks; track $index) {
            <div class="flex flex-col gap-0.5">
              @for (day of week; track day.date) {
                <div
                  class="h-[12px] w-[12px] rounded-[2px] transition-colors"
                  [class]="getIntensityClass(day.count)"
                  [title]="day.isInRange ? day.date + ': ' + day.count + ' acciones' : ''"
                ></div>
              }
            </div>
          }
        </div>
      </div>

      <!-- Legend -->
      <div class="flex items-center gap-1 pl-8 text-[10px] text-muted">
        <span>Más</span>
        @for (level of legendLevels; track level) {
          <div class="h-[12px] w-[12px] rounded-[2px]" [class]="getIntensityClass(level)"></div>
        }
        <span>Menos</span>
      </div>
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
export class HeatmapGridComponent {
  readonly entries = input<HeatmapEntry[]>([]);
  readonly months = input<number>(6);

  dayLabels = ['', '', 'Mié', '', 'Vie', '', ''];
  monthLabels = [
    'Ene',
    'Feb',
    'Mar',
    'Abr',
    'May',
    'Jun',
    'Jul',
    'Ago',
    'Sep',
    'Oct',
    'Nov',
    'Dic',
  ];
  legendLevels = [0, 2, 5, 10, 15];

  weeks: Array<Array<{ date: string; count: number; isInRange: boolean }>> = [];
  monthMarkers: Array<{ weekIndex: number; label: string }> = [];

  ngOnInit(): void {
    this.buildGrid();
  }

  private buildGrid(): void {
    const countMap = new Map(this.entries().map((e) => [e.date, e.count]));

    const end = new Date();
    const start = new Date();
    start.setMonth(start.getMonth() - this.months());
    start.setDate(start.getDate() - ((start.getDay() + 6) % 7));

    const allWeeks: Array<Array<{ date: string; count: number; isInRange: boolean }>> = [];
    const markers: Array<{ weekIndex: number; label: string }> = [];
    const currentDate = new Date(start);
    let lastMonth = -1;

    while (
      currentDate <= end ||
      allWeeks.length === 0 ||
      (allWeeks[allWeeks.length - 1]?.length ?? 0) < 7
    ) {
      const dayOfWeek = (currentDate.getDay() + 6) % 7;

      if (dayOfWeek === 0) {
        allWeeks.push([]);
      }

      const dateStr = currentDate.toISOString().split('T')[0]!;
      const month = currentDate.getMonth();

      if (month !== lastMonth && dayOfWeek === 0) {
        markers.push({
          weekIndex: allWeeks.length - 1,
          label: this.monthLabels[month]!,
        });
        lastMonth = month;
      }

      const currentWeek = allWeeks[allWeeks.length - 1];
      if (currentWeek) {
        currentWeek.push({
          date: dateStr,
          count: countMap.get(dateStr) ?? 0,
          isInRange: currentDate <= end,
        });
      }

      currentDate.setDate(currentDate.getDate() + 1);

      if (allWeeks.length > 53) break;
    }

    this.weeks = allWeeks;
    this.monthMarkers = markers;
  }

  getIntensityClass(count: number): string {
    if (count === 0) return 'bg-gray-100';
    if (count <= 2) return 'bg-primary/20';
    if (count <= 5) return 'bg-primary/40';
    if (count <= 10) return 'bg-primary/60';
    return 'bg-primary/90';
  }
}
