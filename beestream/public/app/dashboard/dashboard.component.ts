import { Component, ViewEncapsulation, OnDestroy, AfterViewInit } from '@angular/core';
import { VideoService } from '../video/video.service';
import { NgForm } from '@angular/forms';
import { ViewChild } from '@angular/core';
import { ChartsModule } from 'ng2-charts';
import { BaseChartDirective } from 'ng2-charts';
import * as c3 from 'c3';
require('./c3.styles.css');

/*DashboardComponent
* This component will be our dashboard for beemon analytics.
*/
@Component({
  selector: 'dash',
  template: require('./dashboard.template.html'),
  providers: [VideoService],
  encapsulation: ViewEncapsulation.None,
  styles: [ './c3.styles.css' ]
})
export class DashboardComponent implements OnDestroy, AfterViewInit {

  @ViewChild("primaryChart") chart: BaseChartDirective;
  private charts: Array<any> = [];
  private hives: Array<string> = null;
  private activeHives: Array<string> = [];
  private requestedHives: Array<string> = [];
  private MAX_VALUES_PER_HIVE:number = 1000;

  /*constructor
  * Constructor for DashbordComponent
  * initializes necessary entry variables and service instances
  *
  * @params:
  *   _ioService: VideoService - object to handle socket.io interactions
  */
  public constructor(private _ioService: VideoService) {}

  /*ngOnInit
  * This overrides the ngOnInit function to add additional functionality.
  */
  public ngOnInit() {
    this._ioService.emit('dashboardHiveList', {});
    this._ioService.on('dashboardHiveList', (message) => {
        this.hives = message.hiveNames
    });
    this._ioService.on('updateData', (message) => {
      // if (!this.activeHives.includes(message.hiveName)) {
      //   let dates = message.dates
      //   let data = message.arrivals
      //   this.activeHives.push(message.hiveName);
      //   var filteredData = this.filterData(dates, data);
      //
      //   let datesKey = message.hiveName + 'Dates';
      //   let dataKey = message.hiveName;
      //   let x = [datesKey].concat(filteredData.x);
      //   let y = [dataKey].concat(filteredData.y);
      //   let newColumn = [x, y]
      //
      //   this.updateChartData(newColumn, dataKey, datesKey);
      // }
    });
  }

  /*ngAfterViewInit()
  * This method overrides the ngAfterViewInit method to add functionality,
  * namely, we'll have to set up our c3 charts here.
  */
  public ngAfterViewInit() {
    let chart = c3.generate({
      bindto: '#chart',
      data: {
        xs: {},
        xFormat: '%Y-%m-%dT%H:%M:%S.000Z',
        columns: [],
        type: 'scatter'
      },
      axis: {
        x: {
          type: 'timeseries',
          tick: {
            rotate: 60,
            fit: true,
            multiline: true,
            format: '%Y-%m-%d %H:%M:%S'
          }
        }
      }
    });
    this.charts.push(chart);
  }

  /*ngOnDestroy
  * This method overrides the ngOnDestroy method to add functionality, namely
  * it ensures that our socket.io listeners are removed.
  */
  public ngOnDestroy() {
    //TODO: remove listeners
  }

  /*getAnalysis
  * This method will handle requests for analysis for a list of hives from our
  * form with hive checkboxes!
  *
  * @params:
  *   form: NgForm the angular form object
  */
  public getAnalysis(form: NgForm) {
    for (let name in form.value) {
      let status = form.value[name];
      //if we want the hive data (status is true) and it isn't active or inactive, then request the data
      if (status && !this.requestedHives.includes(name)) {
        this.requestedHives.push(name);
        this._ioService.emit('getData', {
          hives: [name],
          count: this.MAX_VALUES_PER_HIVE,
          startDate: null,
          stopDate: null
        })
      }
    }
  }

  /*updateChartData()
  * This method will update all chart data with our new data.  May need to be
  * specialized to deal with special types of charts later!
  */
  private updateChartData(newColumns: Array<any>, dataKey: string,
                          datesKey: string) {
    for (var chart of this.charts) {
      setTimeout(() => {
        let xs = {};
        xs[dataKey] = datesKey;
        chart.load({
          columns: newColumns,
          xs: xs
        })
      }, 1000);
    }
  }

  /*filterData
  * this method will filter the data to show 1, 2, 3, or 5 values per day based
  * on the number of days and a display threshold.  This will allow the data
  * display to adapt to different zoom levels without lagging out the
  * visualization.
  *
  * @params:
  *   x: Array<any> - our x-values aka the list of datetimes
  *   y: Array<any> - our y-values aka our analysis values
  */
  private filterData(x: Array<any>, y: Array<any>) {
    let dataSetSize = x.length;
    let dateList = [];
    let filesPerDay = 0;
    for (let date of x.slice(0, x.length - 1)) {
      let d = new Date(date);
      d.setHours(0);
      d.setMinutes(0);
      d.setSeconds(0);
      if (!dateList.includes(d.toISOString())) {
        dateList.push(d.toISOString());
      }
      else {
        filesPerDay++;
      }
    }
    filesPerDay = filesPerDay / dateList.length;
    let itemsPerDay = (this.MAX_VALUES_PER_HIVE / (dateList.length - 1)) + 1;
    console.log(Math.floor(itemsPerDay));
    var filtered = {
      x: [],
      y: []
    };
    if (Math.floor(itemsPerDay) <= 2) {
      let dateIntervals = this.generateDatetimeIntervals(dateList, 8, 0, 16, 0);
      let data = this.findRangeAverage(dateIntervals.list, x, y);
      filtered.x = filtered.x.concat(dateIntervals.dates);
      filtered.y = filtered.y.concat(data);
    }
    else if (Math.floor(itemsPerDay) <= 4) {
      //Average the first half of the day
      let dateIntervals = this.generateDatetimeIntervals(dateList, 8, 0, 12, 0);
      let data = this.findRangeAverage(dateIntervals.list, x, y);
      filtered.x = filtered.x.concat(dateIntervals.dates);
      filtered.y = filtered.y.concat(data);
      //Average the second half of the day
      dateIntervals = this.generateDatetimeIntervals(dateList, 12, 1, 14, 0);
      data = this.findRangeAverage(dateIntervals.list, x, y);
      filtered.x = filtered.x.concat(dateIntervals.dates);
      filtered.y = filtered.y.concat(data);
    }
    else if (itemsPerDay <= 8) {
      for (let i = 8; i < 16; i++) {
        let dateIntervals = this.generateDatetimeIntervals(dateList, i, 0, i + 1, i % 2);
        let data = this.findRangeAverage(dateIntervals.list, x, y);
        filtered.x = filtered.x.concat(dateIntervals.dates);
        filtered.y = filtered.y.concat(data);
      }
    }
    else if (itemsPerDay <= filesPerDay) {
      filtered = this.halveData(dateList, x, y);
    }
    else {
      filtered = {
        x: x,
        y: y
      };
    }
    return filtered;
  }

  /*findRangeAverage
  * given an array of datetimes and data, this function will find the average
  * value in data for each unique date between the time of startHour:startMinute
  * and stopHour and stopMinute.
  *
  * @params:
  *   intervals: Array<any> - an array containing all intervals to check
  *   dateTimes: Array<any> - an array containing all datetimes to be evaluated
  *   data: Array<any> - the data to be averaged based on dateTimes.
  */
  private findRangeAverage(intervals: Array<any>, dateTimes: Array<Date>, data: Array<any>) {
    let averages = new Array(intervals.length).fill(0);
    let videoCountPerInterval = new Array(intervals.length).fill(0);
    for (let i = 0; i < dateTimes.length; i++) {
      for (let j = 0; j < intervals.length; j++) {
        let datetime = new Date(dateTimes[i]);
        let start = new Date(intervals[j].start);
        let end = new Date(intervals[j].stop);
        if (datetime >= start &&
            datetime <= end) {
          averages[j] += data[i];
          videoCountPerInterval[j]++;
        }
      }
    }
    for (let i = 0; i < averages.length; i++) {
      if (videoCountPerInterval[i] > 0) {
        averages[i] = Math.round(averages[i] / videoCountPerInterval[i]);
      }
    }
    return averages;
  }

  /*setTimeForDate
  * This method will take an input date and an hour and minute value and return
  * a datetime object with that hour and minute set.
  *
  * @params:
  *   date: Date - the date to set hour and minute on
  *   hour: number -  the hour to set on date
  *   minute: number - the minute to set on date.
  */
  private setTimeForDate(date: Date, hour: number, minute: number) {
    date.setHours(hour);
    date.setMinutes(minute);
    date.setSeconds(0);
    return date;
  }

  /*generateDatetimeIntervals
  * This method will take as input a list of unique datetimes and
  * start and stop times and will return a list of intervals.  The intervals
  * will be an object containing as datetime object formatting to the start and
  * stop times.
  */
  private generateDatetimeIntervals(dateList: Array<Date>,
                                    startHour: number, startMinute: number,
                                    stopHour: number, stopMinute: number) {
    let intervalsList = [];
    let intervalDates = [];
    for (var i = 0; i < dateList.length; i++) {
      //set our start and stop intervals
      let start = this.setTimeForDate(new Date(dateList[i]), startHour, startMinute);
      let stop = this.setTimeForDate(new Date(dateList[i]), stopHour, stopMinute);
      intervalsList[i] = {
        start: start,
        stop: stop
      };
      //average our start and stop datetimes as our new "interval datetimes"
      intervalDates[i] = new Date((start.getTime() + stop.getTime()) / 2);
    }
    return {
      dates: intervalDates,
      list: intervalsList
    }
  }

  /*halveData
  * This method will take an input data and will average every other value,
  * in essense halving the data size.
  *
  * @params:
  *   dates: Array<any> - an array containig all the distinct dates in the given
  *                       dateTimes array.
  *   dateTimes: Array<any> - an array containing all dateTimes to be evaluated
  *   data: Array<any> - the data to be averaged based on dateTimes.
  */
  private halveData(dates: Array<any>, dateTimes: Array<any>,
                    data: Array<any>) {
    for (var date of dates) {
      // console.log(date);
    }
    return {
      x: dateTimes,
      y: data
    }
  }
}
