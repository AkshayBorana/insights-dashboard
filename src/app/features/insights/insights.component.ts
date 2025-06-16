import { Component } from '@angular/core';
import { ChartComponent } from '../../shared/components/chart/chart.component';

@Component({
  selector: 'app-insights',
  templateUrl: './insights.component.html',
  styleUrl: './insights.component.scss',
  imports: [ChartComponent],
})

export class InsightsComponent {
  constructor() {}
}
