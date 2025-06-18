import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { catchError, map, Observable, of } from 'rxjs';
import { environment } from '../../../environment/environment';
import { SalesData } from '../../shared/model/chart-data.model';

@Injectable({
  providedIn: 'root',
})
export class InsightsService {
  constructor() {}
  private http = inject(HttpClient);
  private env = environment;

  /**
   * Fetches and processes chart data from a specified API endpoint based on a dataset.
   * This method simulates an API call by retrieving data from a predefined URL and maps it to the requested dataset
   * @param dataset - The name of the dataset to retrieve for a given store (e.g., 'pizzaStore', 'decathlon', 'canadagoose').
   * @returns Observable<any> - An observable that emits the chart data object containing labels and datasets,
   * or an error message string if the request fails.
   * @throws {HttpErrorResponse} - If the HTTP request fails, the error is caught and transformed into an observable emitting 'Error loading data! Please try again.'.
   * @example
   * // Example usage in a service or component
   * this.dataService.getStackedData('pizzaStore').subscribe(
   *   data => console.log(data),
   *   error => console.error(error)
   * );
   */
  public getData(dataset: string): Observable<SalesData[]> {
    return this.http.get<SalesData>(this.env.URL).pipe(
      map((data) => data[dataset] || data['pizzaStore']),
      catchError((err: HttpErrorResponse) =>
        of('Error loading data! Please try again.')
      )
    );
  }
}
