/**
 * Generates a dataset of mock sales and order data for a specified number of days (Genarating data for last 800 days).
 * The function creates an array of objects containing random sales amounts, ticket sizes,
 * and order counts, spanning back `n` days from the current date (June 18, 2025, 02:41 PM EDT).
 * Each object includes timestamps and formatted display dates for chart compatibility.
 *
 * @param n - The number of days to generate data for.
 * @returns Array - An array of objects with properties: `date` (timestamp), `displayDate` (string),
 *                  `allCustomerSales`, `loyaltyCustomerSales`, `inStoreSaleAmount`,
 *                  `onlineSaleAmount`, `totalAvgTicketAmount`, `loyaltyCusAvgTicketAmount`, and `totalOrders`.
 * @example
 * const data = generateDataSet(30);
 * console.log(data[0]); // { allCustomerSales: 3937,
  date: 1681185600000,
  displayDate: "Tue Apr 11 2023",
  inStoreSaleAmount: 647,
  loyaltyCusAvgTicketAmount: 18,
  loyaltyCustomerSales: 1824,
  onlineSaleAmount: 3290,
  totalAvgTicketAmount: 17,
  totalOrders: 213 }
 */

import { SalesData } from "../../../shared/model/chart-data.model";

export function generateDataSet(n): SalesData[] {
  const data = [];
  const dateNow = new Date();
  dateNow.setHours(0, 0, 0, 0);
  const now = dateNow.getTime();
  const oneDay = 24 * 60 * 60 * 1000;

  for (let i = 0; i < n; i++) {
    const date = new Date(now - i * oneDay);
    const totalAmount = Math.floor(Math.random() * 7000);
    const loyalSaleAmount = Math.floor(totalAmount * (Math.random() * 0.7));
    const storeSaleAmount = Math.floor(totalAmount * (Math.random() * 0.5));
    const onlineSaleAmount = totalAmount - storeSaleAmount;
    const totalOrders = Math.floor(Math.random() * 1000);
    const loyalAverageTicketAmount = Math.floor(totalAmount / totalOrders);
    const averageTicketAmount = Math.floor(loyalAverageTicketAmount * (Math.random() * 0.5 + 0.5));

    data.push({
      date: date.getTime(),
      displayDate: date.toDateString(),
      allCustomerSales: totalAmount,
      loyaltyCustomerSales: loyalSaleAmount,
      inStoreSaleAmount: storeSaleAmount,
      onlineSaleAmount: onlineSaleAmount,
      totalAvgTicketAmount: averageTicketAmount,
      loyaltyCusAvgTicketAmount: loyalAverageTicketAmount,
      totalOrders,
    });
  }
  return data;
}
