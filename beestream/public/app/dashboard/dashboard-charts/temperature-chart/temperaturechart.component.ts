import { Component, AfterViewInit } from '@angular/core';
import { ViewChild } from '@angular/core';
import { ChartComponent } from '../chart.interface.component';
import * as c3 from 'c3';
require('../../c3.styles.css');

/*DashboardComponent
* This component will be our dashboard for beemon analytics.
*/
@Component({
  selector: 'temperature-chart',
  template: require('./temperaturechart.template.html'),
  styles: [ '../../c3.styles.css' ]
})
export class TemperatureChartComponent implements ChartComponent, AfterViewInit {

  private chart:any;
  private showChart: boolean;
  private columns: Array<any> = [];
  private xs: any = {};
  requiredDataSet: any = {
    weather: ['AverageTemperature', 'UTCStartDate', 'UTCEndDate']
  };

  /*ngAfterViewInit()
  * This method overrides the ngAfterViewInit method to add functionality,
  * namely, we'll have to set up our c3 charts here.
  */
  public ngAfterViewInit() {
    this.chart = c3.generate({
      bindto: '#temperature-chart',
      data: {
        xs: {},
        xFormat: '%Y-%m-%dT%H:%M:%S.%LZ',
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
          label: 'Temperature'
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
    //Get a list of hives that aren't currently charted and their names with
    //'dates' appended to cover the dates datasets.  This is used to remove
    //previously charted datasets later.
    let unusedDataSets = [];
    for (let hive of unchartedHives) {
      unusedDataSets.push(hive);
      unusedDataSets.push(hive + "Dates");
    }

    //Process data by appending a hivename or hivename with date appended.
    let data = { video: {}, audio: {}, weather: {
      UTCStartDate: [],
      AverageTemperature: []
    } };
    for (let field in res.weather) {
      if (field.includes('Date')) {
        (data['weather'])[field] = [datesKey].concat(res.weather[field]);
      }
      else if (field != 'HiveName') {
        (data['weather'])[field] = [dataKey].concat(res.weather[field]);
      }
    }

    //Remove any datasets that shouldn't be charted anymore, or that will be
    //replaced by this update.
    let newCols = [];
    for (let index = 0; index < this.columns.length; index++) {
      if (!((this.columns[index][0] === dataKey)
          || (this.columns[index][0] === datesKey)
          || (unusedDataSets.includes(this.columns[index][0])))) {
        newCols.push(this.columns[index]);
      }
    }
    this.columns = newCols;

    //push new datasets
    this.columns.push(data.weather.UTCStartDate);
    this.columns.push(data.weather.AverageTemperature);

    //Load our new XS key-value pair
    let newXS = {};
    for (let pair in this.xs) {
      if (!((unusedDataSets.includes(pair)) || (pair === dataKey))) {
        newXS[pair] = pair + "Dates";
      }
    }
    newXS[dataKey] = datesKey;
    this.xs = newXS;


    this.showChart = false;

    //Re-generate and reload the chart.
    //This portion should be able to be done using this.chart.load() but
    //issues with c3 cause the chart to improperly regenerate without
    //re-rendering and removing unloaded datasets.  Specifically,
    //this.chart.load successfully loads new datasets and unloads requested
    //datasets, but the re-render process doesn't un-render removed datasets.
    this.chart = c3.generate({
      bindto: '#temperature-chart',
      data: {
        xs: this.xs,
        xFormat: '%Y-%m-%dT%H:%M:%S.%LZ',
        columns: this.columns,
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
          label: 'Temperature'
        }
      }
    });

    //update the chart's key with the method of aggregation
    if (aggregateMethod) {
      this.chart.axis.labels({y: 'Temperature' + aggregateMethod});
    }

    //show the chart!
    this.showChart = true;
  }

  /*requiredDataSets
  * returns a list of required data sets.
  */
  public requiredDataSets(): { audio: [], video: [], weather: [] } {
    return this.requiredDataSet;
  }
}
