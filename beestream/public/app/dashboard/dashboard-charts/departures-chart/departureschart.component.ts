import { Component, OnDestroy, AfterViewInit } from '@angular/core';
import { ViewChild } from '@angular/core';
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
export class DeparturesChartComponent implements OnDestroy, AfterViewInit {

  private chart:any;
  private showChart: boolean;

  /*constructor
  * Constructor for DashbordComponent
  * initializes necessary entry variables and service instances
  *
  * @params:
  *   _ioService: VideoService - object to handle socket.io interactions
  */
  public constructor() {}

  /*ngOnInit
  * This overrides the ngOnInit function to add additional functionality.
  */
  public ngOnInit() {}

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

  /*ngOnDestroy
  * This method overrides the ngOnDestroy method to add functionality, namely
  * it ensures that our socket.io listeners are removed.
  */
  public ngOnDestroy() {
    //TODO: remove listeners
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
        columns: [x, y.AverageDepartures],
        xs: xs,
      })
    }, 1000);
    setTimeout(() => {
      this.chart.axis.labels({y: 'Departures' + aggregateMethod});
    }, 1000);
    this.showChart = true;
  }
}
