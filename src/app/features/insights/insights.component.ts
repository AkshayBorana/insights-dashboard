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
import { InsightsService } from './services/insights.service';
import { ChartConfigService } from '../../shared/service/chart-config.service';
import { DateRange } from '../../shared/model/date-range.model';
import { FormsModule } from '@angular/forms';
import { SelectModule } from 'primeng/select';
import { DatePickerModule } from 'primeng/datepicker';
import { Subject, takeUntil } from 'rxjs';
import { ButtonModule } from 'primeng/button';
import { formatDate } from '@angular/common';
import { SalesData } from '../../shared/model/chart-data.model';
import { CurrencyPipe } from '@angular/common';
import { getDateLabels } from '../../core/utils/date-utils';

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
    CurrencyPipe,
  ],
})
export class InsightsComponent implements OnInit, OnDestroy {
  // Subject to unsubscribe when component gets destroyed.
  ngUnSubscribe$ = new Subject<void>();

  insightsService = inject(InsightsService);
  chartConfigService = inject(ChartConfigService);

  customStartDate = model<Date | null>(null);
  customEndDate = model<Date | null>(null);

  public dateRanges: DateRange[] = [
    { name: 'Last Month', value: 'lastMonth' },
    { name: 'Last Quarter', value: 'lastQuarter' },
    { name: 'Last Year', value: 'lastYear' },
    { name: 'Custom', value: 'custom' },
  ];
  public dataSetButton = [
    { id: 0, value: 'pizzaStore', label: 'Pizza Pizza' },
    { id: 1, value: 'decathlon', label: 'Decathlon' },
    { id: 2, value: 'canadaGoose', label: 'Canada Goose' },
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

  dataSetNumber = signal<string>('pizzaStore');
  selectedRange = signal<string>('lastMonth');
  chartData = signal<any[]>([]);

  ngOnInit(): void {
    this.getSalesData();
  }

  /**
   * Fetches sales data from json file for a given time range for Area, Bar and Stacked chart.
   * Calculates the data for each chart type for a given range and sets the graph config.
   * @returns void - This method does not return a value
   */
  private getSalesData(): void {
    this.insightsService
      .getData(this.dataSetNumber())
      .pipe(takeUntil(this.ngUnSubscribe$))
      .subscribe((res: SalesData[]) => {
        const {
          allCustomerSales = [],
          loyaltyCustomerSales = [],
          labels = [],
          inStoreSaleAmount = [],
          onlineSaleAmount = [],
          totalAvgTicketAmount = [],
          loyaltyCusAvgTicketAmount = [],
        } = this.formatData(res, this.selectedRange());

        const finalData = [
          {
            chartConfig: 'area',
            chartTitle: 'Total Sales',
            type: 'line',
            width: '100%',
            height: '400px',
            resetZoomEnable: true,
            avgTotal: {
              total_1: allCustomerSales.reduce((acc, cur) => (acc += cur)),
              total_2: loyaltyCustomerSales.reduce((acc, cur) => (acc += cur)),
            },
            chartConfigOptions:
              this.chartConfigService.getChartConfig()['area'],
            callback: (chart: ChartModule): void => {
              if (chart && (chart['chart'] as Chart)) {
                chart['chart'].resetZoom();
              }
            },
            data: {
              labels,
              datasets: [
                {
                  label: 'All Customers',
                  data: allCustomerSales,
                  backgroundColor: 'rgba(255, 215, 0, 0.5)',
                  borderColor: 'rgba(255, 215, 0, 1)',
                  fill: true,
                  borderWidth: 1,
                },
                {
                  label: 'Loyalty Customers',
                  data: loyaltyCustomerSales,
                  backgroundColor: 'rgba(173, 216, 230, 0.8)',
                  borderColor: 'rgba(173, 216, 230, 1)',
                  fill: true,
                  borderWidth: 1,
                },
              ],
            },
          },
          {
            chartConfig: 'bar',
            chartTitle: 'Sales Channel Breakdown',
            type: 'bar',
            width: '100%',
            height: '400px',
            resetZoomEnable: false,
            avgTotal: {
              total_1: inStoreSaleAmount.reduce((acc, cur) => (acc += cur)),
              total_2: onlineSaleAmount.reduce((acc, cur) => (acc += cur)),
            },
            chartConfigOptions: this.chartConfigService.getChartConfig()['bar'],
            data: {
              labels: ['In-store', 'Online'],
              datasets: [
                {
                  label: 'In-Store',
                  data: [
                    inStoreSaleAmount &&
                      inStoreSaleAmount.length &&
                      inStoreSaleAmount?.reduce((acc, curr) => (acc += curr)),
                    onlineSaleAmount &&
                      onlineSaleAmount.length &&
                      onlineSaleAmount?.reduce((acc, curr) => (acc += curr)),
                  ],
                  backgroundColor: [
                    'rgba(255, 215, 0, 0.8)',
                    'rgba(173, 216, 230, 0.8)',
                  ],
                  maxBarThickness: 100,
                  borderRadius: 4,
                },
              ],
            },
          },
          {
            chartConfig: 'stacked',
            chartTitle: 'Average Ticket Size',
            type: 'bar',
            width: '100%',
            height: '400px',
            resetZoomEnable: false,
            avgTotal: {
              total_1: totalAvgTicketAmount.reduce((acc, cur) => (acc += cur)),
              total_2: loyaltyCusAvgTicketAmount.reduce(
                (acc, cur) => (acc += cur)
              ),
            },
            chartConfigOptions:
              this.chartConfigService.getChartConfig()['stacked'],
            data: {
              labels,
              datasets: [
                {
                  label: 'All Customers',
                  data: totalAvgTicketAmount,
                  backgroundColor: ['rgba(255, 215, 0, 0.8)'],
                  maxBarThickness: 100,
                  borderRadius: 4,
                  type: 'bar',
                },
                {
                  label: 'Loyalty Customers',
                  data: loyaltyCusAvgTicketAmount,
                  backgroundColor: ['rgba(173, 216, 230, 0.8)'],
                  maxBarThickness: 100,
                  borderRadius: 4,
                  type: 'bar',
                },
              ],
            },
          },
        ];

        this.chartData.set(finalData);
      });
  }

  /**
   * * Formats sales data based on a specified time range.
   * @param res An array of sales data
   * @param range Time range to filter the data ('lastMonth', 'lastQuarter', 'lastYear', 'custom'),
   * @returns Object
   *         - `allCustomerSales`: Array of total customer sales amounts (numbers).
   *         - `loyaltyCustomerSales`: Array of loyalty customer sales amounts (numbers).
   *         - `labels`: Array of formatted date strings for the X-axis (strings).
   *         - `inStoreSaleAmount`: Array of In store sales amounts (numbers).
   *         - `onlineSaleAmount`: Array of online sales amounts (numbers).
   *         - `totalAvgTicketAmount`: Array of average ticket amounts (numbers).
   *         - `loyaltyCusAvgTicketAmount`: Array of loyalty customer average ticket amounts (numbers).
   */
  private formatData(res: SalesData[], range: string) {
    const result = {
      allCustomerSales: [] as number[],
      loyaltyCustomerSales: [] as number[],
      labels: [] as string[],
      inStoreSaleAmount: [] as number[],
      onlineSaleAmount: [] as number[],
      totalAvgTicketAmount: [] as number[],
      loyaltyCusAvgTicketAmount: [] as number[],
    };

    if (!res && !res.length) {
      return result;
    }
    const { startDate, endDate } = this.getDateRange(range);
    const filteredData = this.filterDataByDateRange(res, startDate, endDate);
    if (filteredData.length > 0) {
      this.generateChartData(filteredData, result);
    }

    return result;
  }

  /**
   * Filters data for a given date range start and end date (number). Date range is in milliseconds.
   * @param data Array of sales data for a selected store
   * @param startDate Filter date for a start date.
   * @param endDate Filter date for an end date.
   * @returns Filtered and sorted data for a given range.
   */
  private filterDataByDateRange(
    data: any[],
    startDate?: number,
    endDate?: number
  ): SalesData[] {
    if (!startDate || !endDate) return [];

    return data
      .filter((el: any) => el.date >= startDate && el.date <= endDate)
      .sort((a, b) => a.date - b.date);
  }

  private generateChartData(
    filteredData: SalesData[],
    result: {
      allCustomerSales: number[];
      loyaltyCustomerSales: number[];
      labels: string[];
      inStoreSaleAmount: number[];
      onlineSaleAmount: number[];
      totalAvgTicketAmount: number[];
      loyaltyCusAvgTicketAmount: number[];
    }
  ): void {
    filteredData.forEach((data: any) => {
      result.allCustomerSales.push(data.allCustomerSales);
      result.loyaltyCustomerSales.push(data.loyaltyCustomerSales);
      result.inStoreSaleAmount.push(data.inStoreSaleAmount);
      result.onlineSaleAmount.push(data.onlineSaleAmount);
      result.totalAvgTicketAmount.push(data.totalAvgTicketAmount);
      result.loyaltyCusAvgTicketAmount.push(data.loyaltyCusAvgTicketAmount);
      result.labels.push(formatDate(data.date, 'YYYY-MM-dd', 'en-US'));
    });
  }

  /**
   * Generate the start date and end date in milliseconds (number) for a selected date range
   * @param range Date range to filter data ( 'Last month', 'Last quarter', 'Last year' and 'Custom ).
   * @returns Object
   *           - `startDate`: Start date in milliseconds (number).
   *           - `endDate`: End date in milliseconds (number).
   */
  private getDateRange(range: string): {
    startDate: number | undefined;
    endDate: number | undefined;
  } {
    let startDate: number | undefined;
    let endDate: number | undefined;

    switch (range) {
      case 'lastMonth':
        startDate = getDateLabels({ monthOffset: -1 }).firstDayTimeStamp;
        endDate = getDateLabels({ monthOffset: -1 }).lastDayTimeStamp;
        break;

      case 'lastQuarter':
        const now = new Date('2025-06-18T19:49:00-04:00');
        const currentQrtr = Math.floor(now.getMonth() / 3) + 1;
        const lastQrtr = currentQrtr === 1 ? 4 : currentQrtr - 1;
        const lastQrtrFirstMonth = (lastQrtr - 1) * 3 + 1;
        const lastQrtrLastMonth = lastQrtrFirstMonth + 2;
        const yearOffset = currentQrtr === 1 ? -1 : 0;
        startDate = getDateLabels({
          startMonth: lastQrtrFirstMonth,
          endMonth: lastQrtrLastMonth,
          yearOffset,
        }).firstDayTimeStamp;
        endDate = getDateLabels({
          startMonth: lastQrtrFirstMonth,
          endMonth: lastQrtrLastMonth,
          yearOffset,
        }).lastDayTimeStamp;
        break;

      case 'lastYear':
        startDate = getDateLabels({
          startMonth: 1,
          endMonth: 12,
          yearOffset: -1,
        }).firstDayTimeStamp;
        endDate = getDateLabels({
          startMonth: 1,
          endMonth: 12,
          yearOffset: -1,
        }).lastDayTimeStamp;
        break;

      case 'custom':
        startDate = this.customStartDate()
          ? this.customStartDate().getTime()
          : undefined;
        endDate = this.customEndDate()
          ? this.customEndDate().getTime()
          : undefined;
        break;

      default:
        startDate = undefined;
        endDate = undefined;
    }
    return { startDate, endDate };
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
      this.getSalesData();
    }
  }

  /**
   * Custom date picker, allows to fetch data for start and end date.
   * @returns void - This method does not return a value
   */
  public onCustomDateSelect(): void {
    if (this.customStartDate() && this.customEndDate()) {
      this.getSalesData();
    }
  }

  /**
   * To load different data sets
   * @param dataSet Data set for which the user has requested data. Eg: 'dataSet1', 'dataSet2', 'dataSet3'
   * @returns void - This method does not return a value
   */
  public updateDataSets(dataSet: string): void {
    this.dataSetNumber.set(dataSet);
    this.getSalesData();
  }

  ngOnDestroy(): void {
    // Unsubscribing to avoid memory leaks after the component is destroyed
    this.ngUnSubscribe$.next();
    this.ngUnSubscribe$.complete();
  }
}
