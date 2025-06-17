import { Component, input, output, ViewChild } from '@angular/core';
import { ChartModule } from 'primeng/chart';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-chart',
  templateUrl: './chart.component.html',
  styleUrl: './chart.component.scss',
  imports: [ChartModule, ButtonModule],
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

  public reset(chart): void {
    this.resetZoom.emit(chart);
  }
}
