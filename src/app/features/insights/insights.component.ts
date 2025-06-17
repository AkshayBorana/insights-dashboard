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
import { forkJoin, map, Subject, takeUntil } from 'rxjs';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-insights',
  templateUrl: './insights.component.html',
  styleUrl: './insights.component.scss',
  imports: [
    ChartComponent,
    FormsModule,
    SelectModule,
    DatePickerModule,
    ButtonModule,
  ],
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
  public dataSetButton = [
    { id: 0, value: 'dataSet1', label: 'Data set 1' },
    { id: 1, value: 'dataSet2', label: 'Data set 2' },
    { id: 2, value: 'dataSet3', label: 'Data set 3' },
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
        return (range = `Looking at data for period of ${strDate} - ${endDate}`);
      } else {
        return range;
      }
    }
    return range;
  });
  dataSetNumber = signal<string>('dataSet1');
  selectedRange = signal<string>('lastMonth');

  minDateLimit: Date;
  maxDateLimit: Date;

  ngOnInit(): void {
    this.initChart();
    this.loadData(this.selectedRange());
    this.minDateLimit = this.setDateSelectionLimit().minDate;
    this.maxDateLimit = this.setDateSelectionLimit().maxDate;
  }

  /**
   * Fetch data from api service for Area, Bar and Stacked chart.
   * @param range: Range for which the data should be fetched.
   * @returns void - This method does not return a value
   */
  private loadData(range: string): void {
    const areaChart$ = this.insightsService
      .getAreaChartData(this.dataSetNumber(), range)
      .pipe(
        map((res) => {
          const updatedData = { ...res };
          updatedData.datasets = res.datasets.map((dataset) => ({
            ...dataset,
            total: dataset.data.reduce(
              (acc: number, val: number) => acc + val,
              0
            ),
          }));
          return updatedData;
        })
      );
    const barChart$ = this.insightsService
      .getBarData(this.dataSetNumber())
      .pipe(
        map((res) => {
          const updatedData = { ...res };
          updatedData.datasets = res.datasets.map((dataset) => ({
            ...dataset,
            total: dataset.data.reduce(
              (acc: number, val: number) => acc + val,
              0
            ),
          }));
          return updatedData;
        })
      );
    const stackedChart$ = this.insightsService
      .getStackedData(this.dataSetNumber())
      .pipe(
        map((res) => {
          const updatedData = { ...res };
          updatedData.datasets = res.datasets.map((dataset) => ({
            ...dataset,
            total: dataset.data.reduce(
              (acc: number, val: number) => acc + val,
              0
            ),
          }));
          return updatedData;
        })
      );

    forkJoin([areaChart$, barChart$, stackedChart$])
      .pipe(takeUntil(this.ngUnSubscribe$))
      .subscribe(([areaData, barData, stackedData]) => {
        this.areaChartData.set(areaData);
        this.barChartData.set(barData);
        this.stackedChartData.set(stackedData);
      });
  }

  /**
   * Initializes charts config options. Eg: legends, labels, color etc.
   * @returns void - This method does not return a value
   */
  private initChart(): void {
    this.areaChartOptions.set(this.chartConfigService.areaChartCongif);
    this.barChartOptions.set(this.chartConfigService.barChartConfig);
    this.stackedChartOptions.set(this.chartConfigService.stackedChartConfig);
  }

  /**
   * Resets the zoom and pan state of a Chart
   * @param chart The PrimeNG ChartModule instance containing the Chart.js chart.
   * @returns void - This method does not return a value; it modifies the chart's zoom/pan state as a side effect.
   */
  public resetZoom(chart: ChartModule): void {
    if (chart && (chart['chart'] as Chart)) {
      chart['chart'].resetZoom();
    }
  }

  /**
   * Dropdown to get data for different date range eg: 'Last month', 'Last quarter', 'Last year' and 'custom date'.
   * @param event The date range for which user wants has requested data.
   * @returns void - This method does not return a value
   */
  public onDateRangeChange(event: any): void {
    const { name, value } = event?.value;
    this.salesDateRecord.set(name);
    this.selectedRange.set(value);
    if (value !== 'custom') {
      this.loadData(value);
    }
  }

  /**
   * Custom date picker, allows to fetch data for start and end date.
   * @returns void - This method does not return a value
   */
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

  /**
   * To load different data sets
   * @param dataSet Data set for which the user has requested data. Eg: 'dataSet1', 'dataSet2', 'dataSet3'
   * @returns void - This method does not return a value
   */
  public updateDataSets(dataSet: string): void {
    this.dataSetNumber.set(dataSet);
    this.loadData(this.selectedRange());
  }

  /**
   * To set min and max date limits on calendar for custom date selection
   * @returns Object - An object containing `minDate` and `maxDate` as Date objects.
   */
  setDateSelectionLimit(): { minDate: Date; maxDate: Date } {
    const now = new Date();
    const minDate = new Date();
    const maxDate = new Date();

    minDate.setDate(1);
    minDate.setHours(0, 0, 0, 0);

    maxDate.setMonth(now.getMonth() + 1);
    maxDate.setDate(0);
    maxDate.setHours(23, 59, 59, 999);

    return {
      minDate,
      maxDate,
    };
  }

  ngOnDestroy(): void {
    // Unsubscribing to avoid memory leaks after the component is destroyed
    this.ngUnSubscribe$.next();
    this.ngUnSubscribe$.complete();
  }
}
