import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class ChartConfigService {
  public areaChartCongif = {
    responsive: true,
    plugins: {
      legend: {
        align: 'start',
        position: 'top',
        labels: {
          boxWidth: 10,
          boxHeight: 10,
          padding: 20,

        },
      },
    },
    scales: {
      x: {
        display: true,
        grid: { display: false },
        ticks: { padding: 10 },
      },
      y: {
        beginAtZero: true,
        border: { display: false }, // Hide Y-axis border
        ticks: {
          callback: (value: number | string) => `$${value}`, // Adds $ symbol to each value on Y-axis.
          padding: 20,
        },
      },
    },
  };
}
