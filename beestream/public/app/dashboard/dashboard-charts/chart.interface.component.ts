export interface ChartComponent {
  requiredDataSet: any;
  updateData(res: any, dataKey: string,
              datesKey: string, aggregateMethod: string,
              unchartedHives: Array<string>): void;
  noData(): void;
  requiredDataSets(): any;
}
