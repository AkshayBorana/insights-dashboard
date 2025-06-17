import {
  Component,
  computed,
  inject,
  model,
  OnDestroy,
  OnInit,
  signal,
} from '@angular/core';
import { ChartComponent } from '../../shared/components/chart/chart.component';
import { ChartModule } from 'primeng/chart';
import { Chart } from 'chart.js';
import { InsightsService } from './insights.service';
import { ChartConfigService } from '../../shared/service/chart-config.service';
import { DateRange } from '../../shared/model/date-range.model';
import { FormsModule } from '@angular/forms';
import { SelectModule } from 'primeng/select';
import { DatePickerModule } from 'primeng/datepicker';

@Component({
  selector: 'app-insights',
  templateUrl: './insights.component.html',
  styleUrl: './insights.component.scss',
  imports: [ChartComponent, FormsModule, SelectModule, DatePickerModule],
})
export class InsightsComponent implements OnInit, OnDestroy {
  insightsService = inject(InsightsService);
  chartConfigService = inject(ChartConfigService);

  areaChartData = signal<any>(null);
  areaChartOptions = signal<any>(null);

  customStartDate = model<Date | null>(null);
  customEndDate = model<Date | null>(null);
  public dateRanges: DateRange[] = [
    { name: 'Last Month', value: 'lastMonth' },
    { name: 'Last Quarter', value: 'lastQuarter' },
    { name: 'Last Year', value: 'lastYear' },
    { name: 'Custom', value: 'custom' },
  ];

  salesDateRecord = signal<string>('Last Month');
  computeDateRangeText = computed(() => {
    let range = '';

    if (this.salesDateRecord() !== 'Custom') {
      return (range = this.salesDateRecord());
    }

    if (this.salesDateRecord() === 'Custom') {
      if (this.customStartDate() && this.customEndDate()) {
        const strDate = `${this.customStartDate().toLocaleString('default', {
          month: 'long',
        })} ${this.customStartDate().getDate().toString()}`;
        const endDate = `${this.customEndDate().toLocaleString('default', {
          month: 'long',
        })} ${this.customEndDate().getDate().toString()}`;
        return (range = `Looking at period of ${strDate} - ${endDate}`);
      } else {
        return range;
      }
    }
    return range;
  });

  dataSetNumber = signal<string>('dataSet1');

  constructor() {}

  ngOnInit(): void {
    this.initChart();
    this.loadData('lastMonth');
  }

  private loadData(range: string): void {
    this.insightsService.getAreaData(range).subscribe((data) => {
      this.areaChartData.set(data);
    });
  }

  private initChart(): void {
    this.areaChartOptions.set(this.chartConfigService.areaChartCongif);
  }

  /**
   * @description To reset charts zoom/pan effect.
   * @param chart : ChartModule
   */
  public resetZoom(chart: ChartModule): void {
    if (chart && (chart['chart'] as Chart)) {
      chart['chart'].resetZoom();
    }
  }

  public onDateRangeChange(event: any): void {
    const { name, value } = event?.value;
    this.salesDateRecord.set(name);
    console.log(this.salesDateRecord());
    if (value !== 'custom') {
      this.loadData(value);
    }
  }

  public onCustomDateSelect(): void {
    let startDate = '';
    let endDate = '';
    if (this.customStartDate()) {
      startDate = this.customStartDate()!.toISOString().slice(0, 10);
    }

    if (this.customEndDate()) {
      endDate = this.customEndDate()!.toISOString().slice(0, 10);
    }

    console.log(startDate, endDate);

    if (startDate && endDate) {
      this.loadData('custom');
    }
  }

  ngOnDestroy(): void {}
}
