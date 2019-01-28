import { Component, AfterViewInit } from '@angular/core';
import { ViewChild } from '@angular/core';
import { ChartComponent } from '../chart.interface.component';
import * as c3 from 'c3';
require('../../c3.styles.css');

/*DashboardComponent
* This component will be our dashboard for beemon analytics.
*/
@Component({
  selector: 'arrivals-chart',
  template: require('./arrivalschart.template.html'),
  styles: [ '../../c3.styles.css' ]
})
export class ArrivalsChartComponent implements ChartComponent, AfterViewInit {

  private chart: any;
  private showChart: boolean;
  requiredDataSet: any = {video: ['AverageArrivals', 'UTCStartDate', 'UTCEndDate']};

  /*ngAfterViewInit()
  * This method overrides the ngAfterViewInit method to add functionality,
  * namely, we'll have to set up our c3 charts here.
  */
  public ngAfterViewInit() {
    this.chart = c3.generate({
      bindto: '#arrivals-chart',
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
          label: 'Arrivals'
        }
      }
    });
  }

  /*updateChartData()
  * This method will update all chart data with our new data.  May need to be
  * specialized to deal with special types of charts later!
  */
  public updateData(res: any, dataKey: string,
                    datesKey: string, aggregateMethod: string,
                    unchartedHives: Array<string>) {
    //hide the chart while we update it.
    this.showChart = false;

    //Process data by appending a hivename or hivename with date appended.
    let data = { video: {
      UTCStartDate: [],
      AverageArrivals: []
    }, audio: {} };
    for (let field in res.video) {
      if (field.includes('Date')) {
        (data['video'])[field] = [datesKey].concat(res.video[field]);
      }
      else if (field != 'HiveName') {
        (data['video'])[field] = [dataKey].concat(res.video[field]);
      }
    }

    //Clear the chart
    let hivesToRemove = [];
    for (let hive of unchartedHives) {
      hivesToRemove.push(hive);
      hivesToRemove.push(hive + 'Dates');
    }

    console.log(hivesToRemove.toString());

    //TODO: Figure out how to actually remove a dataset from the chart and get it to redraw

    //push the new data to the chart
    let xs = {};
    xs[dataKey] = datesKey;
    this.chart.load({
      unload: hivesToRemove,
      columns: [data.video.UTCStartDate, data.video.AverageArrivals],
      xs: xs
    });

    //update the chart's key with the method of aggregation
    if (aggregateMethod) {
      this.chart.axis.labels({y: 'Arrivals' + aggregateMethod});
    }

    //show the chart!
    this.showChart = true;
  }

  /*requiredDataSets
  * returns a list of required data sets.
  */
  public requiredDataSets(): { audio: [], video: [] } {
    return this.requiredDataSet;
  }
}
