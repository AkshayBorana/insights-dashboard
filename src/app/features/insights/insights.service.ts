import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class DataService {
  constructor() {}

  getAreaData(range: string): Observable<any> {
    const mockData = this.getMockAreaData(range);
    return of(mockData);
  }

  private getMockAreaData(range: string): any {
    const baseData = {
      labels: [
        '2025-05-01',
        '2025-05-07',
        '2025-05-13',
        '2025-05-20',
        '2025-05-25',
        '2025-05-31',
      ],
      datasets: [
        {
          label: 'All Customers',
          data: [90, 400, 100, 1000, 1500, 2200],
          backgroundColor: 'rgba(255, 215, 0, 0.5)',
          borderColor: 'rgba(255, 215, 0, 1)',
          fill: true,
          borderWidth: 1,
        },
        {
          label: 'Loyalty Customers',
          data: [10, 600, 300, 1200, 1800, 3000],
          backgroundColor: 'rgba(173, 216, 230, 0.8)',
          borderColor: 'rgba(173, 216, 230, 1)',
          fill: true,
          borderWidth: 1,
        },
      ],
    };

    switch (range) {
      case 'lastMonth':
        baseData.labels = [
          '2025-05-01',
          '2025-05-08',
          '2025-05-19',
          '2025-05-22',
          '2025-05-25',
          '2025-05-31',
        ];
        baseData.datasets[0].data = [15000, 18000, 25000, 22000, 35000, 48000];
        baseData.datasets[1].data = [7000, 19000, 28000, 16000, 40000, 55000];
        break;
      case 'lastQuarter':
        baseData.labels = ['2025-04-01', '2025-05-01', '2025-06-01'];
        baseData.datasets[0].data = [10000, 33010, 50505];
        baseData.datasets[1].data = [18000, 40400, 60000];
        break;
      case 'lastYear':
        baseData.labels = [
          '2024-07-01',
          '2024-10-01',
          '2025-01-01',
          '2025-04-01',
          '2025-07-01',
        ];
        baseData.datasets[0].data = [100000, 120000, 140000, 160000, 180000];
        baseData.datasets[1].data = [60000, 70000, 80000, 90000, 100000];
        break;
      case '2025-06-08-2025-06-14':
        baseData.labels = [
          '2025-06-08',
          '2025-06-09',
          '2025-06-10',
          '2025-06-11',
          '2025-06-12',
          '2025-06-13',
          '2025-06-14'
        ];
        baseData.datasets[0].data = [1000, 2500, 500, 4000, 2900, 4000, 5000];
        baseData.datasets[1].data = [1800, 25000, 3400, 5000, 7000, 8500, 10000];
        break;

      default:
        baseData.labels = [
          '2025-06-08',
          '2025-06-09',
          '2025-06-10',
          '2025-06-11',
          '2025-06-12',
          '2025-06-13',
          '2025-06-14'
        ];
        baseData.datasets[0].data = [1000, 2500, 500, 4000, 2900, 4000, 5000];
        baseData.datasets[1].data = [1800, 25000, 3400, 5000, 7000, 8500, 10000];
        break;
    }
    return baseData;
  }
}
