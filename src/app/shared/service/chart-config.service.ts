import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class ChartConfigService {
  public areaChartCongif = {
    responsive: true,
    plugins: {
      zoom: {
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
      },
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
          callback: (value: number | string) => `$${value}`,
          padding: 20,
        }, // Adds $ symbol to each value on Y-axis.
      },
    },
  };
}
