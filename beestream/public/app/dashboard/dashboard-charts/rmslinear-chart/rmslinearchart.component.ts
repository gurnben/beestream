import { Component, AfterViewInit } from '@angular/core';
import { ViewChild } from '@angular/core';
import { ChartComponent } from '../chart.interface.component';
import * as c3 from 'c3';
require('../../c3.styles.css');

/*DashboardComponent
* This component will be our dashboard for beemon analytics.
*/
@Component({
  selector: 'rmslinear-chart',
  template: require('./rmslinearchart.template.html'),
  styles: [ '../../c3.styles.css' ]
})
export class RMSLinearChartComponent implements ChartComponent, AfterViewInit {

  private chart:any;
  private showChart: boolean;
  requiredDataSet: any = {audio: ['AverageRMSLinear', 'UTCStartDate', 'UTCEndDate']};

  /*ngAfterViewInit()
  * This method overrides the ngAfterViewInit method to add functionality,
  * namely, we'll have to set up our c3 charts here.
  */
  public ngAfterViewInit() {
    this.chart = c3.generate({
      bindto: '#rmslinear-chart',
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
          label: 'RMS Linear'
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

    //Clear the chart
    let hivesToRemove = [];
    for (let hive of unchartedHives) {
      hivesToRemove.push(hive);
      hivesToRemove.push(hive + 'Dates');
    }

    //push the new data to the chart
    let data = { video: {}, audio: {
      UTCStartDate: [],
      AverageRMSLinear: []
    } };
    for (let field in res.audio) {
      if (field.includes('Date')) {
        (data['audio'])[field] = [datesKey].concat(res.audio[field]);
      }
      else if (field != 'HiveName') {
        (data['audio'])[field] = [dataKey].concat(res.audio[field]);
      }
    }

    //push the new data to the chart
    let xs = {};
    xs[dataKey] = datesKey;
    this.chart.load({
      unload: hivesToRemove,
      columns: [data.audio.UTCStartDate, data.audio.AverageRMSLinear],
      xs: xs,
    })

    //update the chart's key with the method of aggregation
    if (aggregateMethod) {
      this.chart.axis.labels({y: 'RMS' + aggregateMethod});
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
