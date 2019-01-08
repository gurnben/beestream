export interface ChartComponent {
  updateData(x: any, y: any, dataKey: string,
              datesKey: string, aggregateMethod: string): void;
  requiredDataSets(): string;
}
