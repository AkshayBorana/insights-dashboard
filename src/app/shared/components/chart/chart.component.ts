import { Component, input, output, ViewChild } from '@angular/core';
import { ChartModule } from 'primeng/chart';

@Component({
  selector: 'app-chart',
  templateUrl: './chart.component.html',
  styleUrl: './chart.component.scss',
  imports: [ChartModule],
})
export class ChartComponent {
  @ViewChild('chart') chart: ChartModule;

  type = input<
    | 'bar'
    | 'line'
    | 'scatter'
    | 'bubble'
    | 'pie'
    | 'doughnut'
    | 'polarArea'
    | 'radar'
  >();
  options = input();
  data = input();
  resetZoom = output<ChartModule | null>();
  width = input<string>();
  height = input<string>();
  resetZoomEffect = input<boolean>();

  constructor() {}

  public reset(chart): void {
    this.resetZoom.emit(chart);
  }
}
