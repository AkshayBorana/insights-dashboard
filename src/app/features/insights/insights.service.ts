import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { catchError, map, Observable, of } from 'rxjs';
import { environment } from '../../../environment/environment';

@Injectable({
  providedIn: 'root',
})
export class InsightsService {
  constructor() {}
  private http = inject(HttpClient);
  private env = environment;

  /**
   * Fetches and processes Area chart data from a specified API endpoint based on a dataset and range.
   * This method simulates an API call by retrieving data from a predefined URL and maps it to the
   * requested dataset and range. If the requested range is not found, it defaults to 'lastMonth'
   * @param dataset - The name of the dataset to retrieve (e.g., 'dataset-1', 'dataset-2', 'dataset-3').
   * @param range - The time range for the data (e.g., 'lastMonth', 'lastQuarter', 'lastYear', 'custom'). Defaults to 'lastMonth'
   * @returns Observable<any> - An observable that emits the chart data object containing labels and datasets,
   * or an error message string if the request fails.
   * @throws {HttpErrorResponse} - If the HTTP request fails, the error is caught and transformed into an observable emitting 'Error loading data! Please try again.'.
   * @example
   * // Example usage in a service or component
   * this.dataService.getAreaChartData('dataset-1', 'lastMonth').subscribe(
   *   data => console.log(data),
   *   error => console.error(error)
   * );
   */
  public getAreaChartData(dataset: string, range: string): Observable<any> {
    return this.http.get<any>(`${this.env.AREA_API_URL}`).pipe(
      map((data) => data[dataset][range] || data[dataset]['lastMonth']),
      catchError((error: HttpErrorResponse) =>
        of('Error loading data! Please try again.')
      )
    );
  }

  /**
   * Fetches and processes Bar chart data from a specified API endpoint based on a dataset.
   * This method simulates an API call by retrieving data from a predefined URL and maps it to the requested dataset
   * @param dataset - The name of the dataset to retrieve (e.g., 'dataset-1', 'dataset-2', 'dataset-3').
   * @returns Observable<any> - An observable that emits the chart data object containing labels and datasets,
   * or an error message string if the request fails.
   * @throws {HttpErrorResponse} - If the HTTP request fails, the error is caught and transformed into an observable emitting 'Error loading data! Please try again.'.
   * @example
   * // Example usage in a service or component
   * this.dataService.getBarData('dataset-1').subscribe(
   *   data => console.log(data),
   *   error => console.error(error)
   * );
   */
  public getBarData(dataset): Observable<any> {
    return this.http.get<any>(`${this.env.BAR_API_URL}`).pipe(
      map((data) => data[dataset] || data['dataSet1']),
      catchError((error: HttpErrorResponse) =>
        of('Error loading data! Please try again.')
      )
    );
  }

  /**
   * Fetches and processes Stacked chart data from a specified API endpoint based on a dataset.
   * This method simulates an API call by retrieving data from a predefined URL and maps it to the requested dataset
   * @param dataset - The name of the dataset to retrieve (e.g., 'dataset-1', 'dataset-2', 'dataset-3').
   * @returns Observable<any> - An observable that emits the chart data object containing labels and datasets,
   * or an error message string if the request fails.
   * @throws {HttpErrorResponse} - If the HTTP request fails, the error is caught and transformed into an observable emitting 'Error loading data! Please try again.'.
   * @example
   * // Example usage in a service or component
   * this.dataService.getStackedData('dataset-1').subscribe(
   *   data => console.log(data),
   *   error => console.error(error)
   * );
   */
  public getStackedData(dataset): Observable<any> {
    return this.http.get<any>(`${this.env.STACKED_API_URL}`).pipe(
      map((data) => data[dataset] || data['dataSet1']),
      catchError((error: HttpErrorResponse) =>
        of('Error loading data! Please try again.')
      )
    );
  }
}
