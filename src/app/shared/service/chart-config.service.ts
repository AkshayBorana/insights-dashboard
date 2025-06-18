import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class ChartConfigService {
  public getChartConfig(): unknown {
    return {
      area: {
        responsive: true,
        plugins: {
          zoom: this.zoomConfig(),
          legend: this.configLegend(),
        },
        scales: {
          x: this.xAxisConfig(),
          y: {
            beginAtZero: true,
            border: { display: false }, // Hide Y-axis border
            ticks: {
              callback: (value: number | string) => `$${value}`,
              padding: 20,
            }, // Adds $ symbol to each value on Y-axis.
          },
        },
      },
      bar: {
        responsive: true,
        plugins: {
          legend: this.configLegend(),
        },
        scales: {
          x: this.xAxisConfig(),
          y: {
            beginAtZero: true,
            border: { display: false }, // Hide Y-axis border
            ticks: {
              callback: (value: number | string) => `$${value}`,
              padding: 20,
            },
          },
        },
      },
      stacked: {
        responsive: true,
        plugins: {
          legend: this.configLegend(),
        },
        scales: {
          x: this.xAxisConfig(),
          y: {
            beginAtZero: true,
            border: { display: false },
            stacked: true, // Enable stacking for the bars
            ticks: {
              callback: (value: number) => `$${value.toFixed(2)}`, // Format with $ and 2 decimal places
              padding: 10,
            },
          },
        },
      },
    };
  }

  private configLegend(): unknown {
    return {
      legend: {
        align: 'start',
        position: 'top',
        display: true,
        labels: {
          boxWidth: 10,
          boxHeight: 10,
          padding: 20,
        },
      },
    };
  }

  private xAxisConfig(): unknown {
    return {
      border: { display: false },
      display: true,
      grid: { display: false },
      ticks: { padding: 10 },
      stacked: true,
    };
  }

  private zoomConfig(): unknown {
    return {
      zoom: {
        wheel: {
          enabled: true, // Enable zoom with mouse wheel
          speed: 0.1,
        },
        pinch: { enabled: true }, // Enable pinch zoom for touch devices
        mode: 'xy', // Zoom in both x and y directions
        limits: { x: { min: 0, max: 10 }, y: { min: 0, max: 20 } },
      },
      pan: {
        enabled: true, // Enable panning
        mode: 'xy', // Pan in both x and y directions
      },
    };
  }
}

// generateLabels: (chart: any) => {
//   const datasets = chart.data.datasets;
//   return datasets.map((dataset: any) => ({
//     text: `$${dataset.total.toLocaleString()} ${dataset.label}`,
//     fillStyle: dataset.backgroundColor,
//     strokeStyle: dataset.borderColor,
//     lineWidth: 1,
//     borderRadius: 2,
//   }));
// },
