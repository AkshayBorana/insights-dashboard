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
import { forkJoin, Subject, takeUntil } from 'rxjs';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-insights',
  templateUrl: './insights.component.html',
  styleUrl: './insights.component.scss',
  imports: [ChartComponent, FormsModule, SelectModule, DatePickerModule, ButtonModule],
})
export class InsightsComponent implements OnInit, OnDestroy {
  ngUnSubscribe$ = new Subject<void>();

  insightsService = inject(InsightsService);
  chartConfigService = inject(ChartConfigService);

  areaChartData = signal<any>(null);
  areaChartOptions = signal<any>(null);

  barChartData = signal<any>(null);
  barChartOptions = signal<any>(null);

  stackedChartData = signal<any>(null);
  stackedChartOptions = signal<any>(null);

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
  selectedRange = signal<string>('lastMonth');

  constructor() {}

  ngOnInit(): void {
    this.initChart();
    this.loadData(this.selectedRange());
  }

  private loadData(range: string): void {

    // const areaChart$ = this.insightsService.getAreaData(range);
    // const barChart$ = this.insightsService.getBarData(range);
    // const stackedChart$ = this.insightsService.getStackedData(range);

    // forkJoin([areaChart$, barChart$, stackedChart$])
    //   .pipe(takeUntil(this.ngUnSubscribe$))
    //   .subscribe(([areaData, barData, stackedData]) => {
    //    this.areaChartData.set(areaData);
    //    this.barChartData.set(barData);
    //    this.stackedChartData.set(stackedData)
    //   });

    this.insightsService.getAreaChartData(this.dataSetNumber(), range)
      .pipe(takeUntil(this.ngUnSubscribe$))
      .subscribe(res => {
       this.areaChartData.set(res);
      })

    // this.insightsService
    //   .getAreaData(range)
    //   .pipe(takeUntil(this.ngUnSubscribe$))
    //   .subscribe((data) => {
    //     this.areaChartData.set(data);
    //   });

    this.insightsService
      .getBarData(this.dataSetNumber(),range)
      .pipe(takeUntil(this.ngUnSubscribe$))
      .subscribe((data) => this.barChartData.set(data));

    this.insightsService
      .getStackedData(this.dataSetNumber(), range)
      .pipe(takeUntil(this.ngUnSubscribe$))
      .subscribe((data) => this.stackedChartData.set(data));
  }

  private initChart(): void {
    this.areaChartOptions.set(this.chartConfigService.areaChartCongif);
    this.barChartOptions.set(this.chartConfigService.barChartConfig);
    this.stackedChartOptions.set(this.chartConfigService.stackedChartConfig);
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
    this.selectedRange.set(value);
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

    if (startDate && endDate) {
      this.loadData(this.selectedRange());
    }
  }

  public updateDataSets(dataSet: string): void {
    this.dataSetNumber.set(dataSet);
    // this.loadData(this.dataSetNumber(), this.selectedRange())
  }

  ngOnDestroy(): void {
    this.ngUnSubscribe$.next();
    this.ngUnSubscribe$.complete();
  }
}
