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
    this.getData();
  }

  /**
   * Fetch data from api service for Area, Bar and Stacked chart.
   * @returns void - This method does not return a value
   */
  private getData(): void {
    this.insightsService
      .getData(this.dataSetNumber())
      .pipe(takeUntil(this.ngUnSubscribe$))
      .subscribe((res: SalesData[]) => {

        const {
          labels = [],
          allCustomerSales = [],
          loyaltyCustomerSales = [],
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

  formatData(res: SalesData[], range: string) {
    const allCustomerSales = [];
    const loyaltyCustomerSales = [];
    const labels = [];
    const inStoreSaleAmount = [];
    const onlineSaleAmount = [];
    const totalAvgTicketAmount = [];
    const loyaltyCusAvgTicketAmount = [];
    let filteredData = [];

    if (!res && !res.length) {
      return {
        allCustomerSales,
        loyaltyCustomerSales,
        labels,
        inStoreSaleAmount,
        onlineSaleAmount,
        totalAvgTicketAmount,
        loyaltyCusAvgTicketAmount,
      };
    }

    // Last month
    if (range === 'lastMonth') {
      const { lastMonthFirstDayTimeStamp, lastMonthLastDayTimeStamp } =
        this.getLastMonthDateLabels();
      filteredData = res.filter((el: any) => {
        if (
          el.date >= lastMonthFirstDayTimeStamp &&
          el.date <= lastMonthLastDayTimeStamp
        ) {
          return el;
        }
      });

      filteredData.forEach((data: any, i) => {
        allCustomerSales.push(data.allCustomerSales);
        loyaltyCustomerSales.push(data.loyaltyCustomerSales);
        inStoreSaleAmount.push(data.inStoreSaleAmount);
        onlineSaleAmount.push(data.onlineSaleAmount);
        totalAvgTicketAmount.push(data.totalAvgTicketAmount);
        loyaltyCusAvgTicketAmount.push(data.loyaltyCusAvgTicketAmount);
        labels.push(formatDate(data.date, 'YYYY-MM-dd', 'en-US'));
      });
    }

    // For last quarter...
    if (range === 'lastQuarter') {
      const { lastQuarterFirstDay, lastQuarterLastDay } =
        this.getLastQuarterLabels();
      filteredData = res.filter((el: any) => {
        if (el.date >= lastQuarterFirstDay && el.date <= lastQuarterLastDay) {
          return el;
        }
      });

      filteredData.forEach((data: any, i) => {
        allCustomerSales.push(data.allCustomerSales);
        loyaltyCustomerSales.push(data.loyaltyCustomerSales);
        inStoreSaleAmount.push(data.inStoreSaleAmount);
        onlineSaleAmount.push(data.onlineSaleAmount);
        totalAvgTicketAmount.push(data.totalAvgTicketAmount);
        loyaltyCusAvgTicketAmount.push(data.loyaltyCusAvgTicketAmount);
        labels.push(formatDate(data.date, 'YYYY-MM-dd', 'en-US'));
      });
    }

    // Last year....
    if (range === 'lastYear') {
      const { previousYearFirstDayTimeStamp, previousYearLastDayTimeStamp } =
        this.getLastYearLabels();
      filteredData = res.filter((el: any) => {
        if (
          el.date >= previousYearFirstDayTimeStamp &&
          el.date <= previousYearLastDayTimeStamp
        )
          return el;
      });

      filteredData.forEach((data: any) => {
        allCustomerSales.push(data.allCustomerSales);
        loyaltyCustomerSales.push(data.loyaltyCustomerSales);
        inStoreSaleAmount.push(data.inStoreSaleAmount);
        onlineSaleAmount.push(data.onlineSaleAmount);
        totalAvgTicketAmount.push(data.totalAvgTicketAmount);
        loyaltyCusAvgTicketAmount.push(data.loyaltyCusAvgTicketAmount);
        labels.push(formatDate(data.date, 'YYYY-MM-dd', 'en-US'));
      });
    }

    // Custom date selection.
    if (range === 'custom' && this.customStartDate() && this.customEndDate()) {
      filteredData = res.filter((el: any) => {
        if (
          el.date >= this.customStartDate().getTime() &&
          el.date <= this.customEndDate().getTime()
        )
          return el;
      });

      filteredData.forEach((data: any) => {
        allCustomerSales.push(data.allCustomerSales);
        loyaltyCustomerSales.push(data.loyaltyCustomerSales);
        inStoreSaleAmount.push(data.inStoreSaleAmount);
        onlineSaleAmount.push(data.onlineSaleAmount);
        totalAvgTicketAmount.push(data.totalAvgTicketAmount);
        loyaltyCusAvgTicketAmount.push(data.loyaltyCusAvgTicketAmount);
        labels.push(formatDate(data.date, 'YYYY-MM-dd', 'en-US'));
      });
    }

    return {
      allCustomerSales,
      loyaltyCustomerSales,
      labels,
      inStoreSaleAmount,
      onlineSaleAmount,
      totalAvgTicketAmount,
      loyaltyCusAvgTicketAmount,
    };
  }

  // Return labels if user selects last year option.
  getLastYearLabels() {
    const currentYear = new Date().getFullYear();
    const previousYear = currentYear - 1;
    const previousYearFirstDay = new Date(previousYear, 0, 1);
    const previousYearLastDay = new Date(previousYear, 11, 0);
    return {
      previousYearFirstDay,
      previousYearFirstDayTimeStamp: previousYearFirstDay.getTime(),
      previousYearLastDay,
      previousYearLastDayTimeStamp: previousYearLastDay.getTime(),
    };
  }

  /**
   * Filters data for last month option.
   * @returns last months first day, last day
   */
  getLastMonthDateLabels() {
    const currentMonth = new Date().getMonth();
    const previousMonth = currentMonth - 1;
    const currentYear = new Date().getFullYear();
    const firstDay = new Date(currentYear, previousMonth, 1);
    const lastDay = new Date(currentYear, currentMonth, 0);

    lastDay.setHours(23, 59, 59, 999);

    return {
      lastMonthFirstDay: firstDay,
      lastMonthFirstDayTimeStamp: firstDay.getTime(),
      lastMonthLastDay: lastDay,
      lastMonthLastDayTimeStamp: lastDay.getTime(),
    };
  }

  /**
   *
   * @returns Gives last quarter first day and last day details
   */
  getLastQuarterLabels() {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const getMonthDates = (
      firstMonth: number,
      lastMonth: number,
      year: number
    ) => {
      const firstDate = new Date(year, firstMonth - 1, 1); // 0-based month
      firstDate.setHours(0, 0, 0, 0); // Start of day
      const lastDate = new Date(year, lastMonth, 0); // Last day of the month
      lastDate.setHours(23, 59, 59, 999); // End of day
      return { firstDate, lastDate };
    };

    const currentQrtr = Math.floor(currentMonth / 3) + 1;
    const lastQrtr = currentQrtr === 1 ? 4 : currentQrtr - 1; // Last quarter (1 for Q1)
    const lastQrtrFirstMonth = (lastQrtr - 1) * 3 + 1; // First month of last quarter (1 for January)
    const lastQrtrLastMonth = lastQrtrFirstMonth + 2; // Last month of last quarter (3 for March)
    const quarterYear = currentQrtr === 1 ? currentYear - 1 : currentYear;
    const { firstDate, lastDate } = getMonthDates(
      lastQrtrFirstMonth,
      lastQrtrLastMonth,
      quarterYear
    );

    return {
      lastQuarterFirstDay: firstDate.getTime(),
      firstDate,
      lastQuarterLastDay: lastDate.getTime(),
      lastDate,
    };
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
      this.getData();
    }
  }

  /**
   * Custom date picker, allows to fetch data for start and end date.
   * @returns void - This method does not return a value
   */
  public onCustomDateSelect(): void {
    if (this.customStartDate() && this.customEndDate()) {
      this.getData();
    }
  }

  /**
   * To load different data sets
   * @param dataSet Data set for which the user has requested data. Eg: 'dataSet1', 'dataSet2', 'dataSet3'
   * @returns void - This method does not return a value
   */
  public updateDataSets(dataSet: string): void {
    this.dataSetNumber.set(dataSet);
    this.getData();
  }

  ngOnDestroy(): void {
    // Unsubscribing to avoid memory leaks after the component is destroyed
    this.ngUnSubscribe$.next();
    this.ngUnSubscribe$.complete();
  }
}
