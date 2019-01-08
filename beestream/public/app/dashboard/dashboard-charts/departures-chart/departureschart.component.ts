import { Component, AfterViewInit } from '@angular/core';
import { ViewChild } from '@angular/core';
import { ChartComponent } from '../chart.interface.component';
import * as c3 from 'c3';
require('../../c3.styles.css');

/*DashboardComponent
* This component will be our dashboard for beemon analytics.
*/
@Component({
  selector: 'departures-chart',
  template: require('./departureschart.template.html'),
  styles: [ '../../c3.styles.css' ]
})
export class DeparturesChartComponent implements ChartComponent, AfterViewInit {

  private chart:any;
  private showChart: boolean;
  private requiredDataSet: string = 'AverageDepartures';

  /*ngAfterViewInit()
  * This method overrides the ngAfterViewInit method to add functionality,
  * namely, we'll have to set up our c3 charts here.
  */
  public ngAfterViewInit() {
    this.chart = c3.generate({
      bindto: '#departures-chart',
      data: {
        xs: {},
        xFormat: '%Y-%m-%dT%H:%M:%S.000Z',
        columns: [],
        type: 'scatter'
      },
      axis: {
        x: {
          label: 'Datetime',
          type: 'timeseries',
          tick: {
            rotate: 60,
            fit: true,
            multiline: true,
            format: '%Y-%m-%d %H:%M:%S'
          }
        },
        y: {
          label: 'Departures'
        }
      }
    });
  }

  /*updateChartData()
  * This method will update all chart data with our new data.  May need to be
  * specialized to deal with special types of charts later!
  */
  public updateData(x: any, y: any, dataKey: string,
                          datesKey: string, aggregateMethod: string) {
    setTimeout(() => {
      let xs = {};
      xs[dataKey] = datesKey;
      this.chart.load({
        columns: [x, y[this.requiredDataSet]],
        xs: xs,
      })
    }, 1000);
    if (aggregateMethod) {
      setTimeout(() => {
        this.chart.axis.labels({y: 'Departures' + aggregateMethod});
      }, 1000);
    }
    this.showChart = true;
  }

  /*
  *
  */
  public requiredDataSets() {
    return this.requiredDataSet;
  }
}
