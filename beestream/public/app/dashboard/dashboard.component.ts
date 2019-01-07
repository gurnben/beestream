import { Component, ViewEncapsulation, OnDestroy, AfterViewInit, ViewChild } from '@angular/core';
import { VideoService } from '../video/video.service';
import { NgForm } from '@angular/forms';
import { FormArray, FormControl, FormGroup, Validators } from '@angular/forms';
import { DeparturesChartComponent } from './dashboard-charts/departures-chart/departureschart.component';
import { ArrivalsChartComponent } from './dashboard-charts/arrivals-chart/arrivalschart.component';
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
  @ViewChild(DeparturesChartComponent)
    private departuresChart: DeparturesChartComponent;
  @ViewChild(ArrivalsChartComponent)
    private arrivalsChart: ArrivalsChartComponent;
  private checkboxGroup = null;
  private hiddenControl = null;
  private form = null;
  private charts: Array<any> = [];
  private hives: Array<string> = null;
  private hiveRanges: Array<any> = null;
  private activeHives: Array<string> = [];
  private activeRange: any = {
    startDate: null,
    endDate: null
  };
  private avaliableDataSets: Array<any> = [];
  private aggregateMethod: String;
  private dataLoading = false;
  private dataReceived = false;
  private MAX_VALUES_PER_HIVE:number = 1000;
  private startDateFilter: any = null;
  private endDateFilter: any = null;
  private dateFilterDates: any = null;
  private color = 'primary';

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
    this._ioService.emit('dashboardConnect', {});
    this._ioService.on('dashboardHiveList', (message) => {
      this.hives = message.hiveNames
      this.hiveRanges = message.dates;
    });
    this._ioService.on('updateData', (message) => {
      let AverageArrivals = [message.HiveName].concat(message.AverageArrivals);
      var response = {};
      for (let dataset of this.avaliableDataSets) {
        response[dataset] = [message.HiveName].concat(message[dataset]);
      }
      let x = [message.HiveName + 'Dates'].concat(message.StartDates);
      this.updateChartData(x, response,
        message.HiveName, message.HiveName + 'Dates');
      this.dataLoading = false;
      this.dataReceived = true;
      this.aggregateMethod = message.aggregateMethod;
    });
    this._ioService.on('availableDateList', (message) => {
      let dates = [];
      for (let i = 0; i < message.dateList.length; i++) {
        dates[i] = new Date(message.dateList[i]);
        dates[i].setHours(0);
        dates[i].setMinutes(0);
        dates[i].setSeconds(0);
        dates[i] = dates[i].toISOString();
      }
      this.dateFilterDates = dates;
      this.startDateFilter = (d: Date): boolean => {
        return false;
      }
      this.endDateFilter = (d: Date): boolean => {
        return false;
      }
    });
    this._ioService.on('avaliableDataSets', (message) => {
      this.avaliableDataSets = message.dataSets;
    });
  }

  /*ngAfterViewInit()
  * This method overrides the ngAfterViewInit method to add functionality,
  * namely, we'll have to set up our c3 charts here.
  */
  public ngAfterViewInit() {
    this.charts.push(this.departuresChart);
    this.charts.push(this.arrivalsChart);
  }

  /*ngOnDestroy
  * This method overrides the ngOnDestroy method to add functionality, namely
  * it ensures that our socket.io listeners are removed.
  */
  public ngOnDestroy() {
    //TODO: remove listeners
  }

  private hiveSelected(form: NgForm) {
    this.activeRange.startDate = null;
    this.activeRange.endDate = null;
    for (let hive of this.hives) {
      if (form.value[hive]) {
        this.activeHives.push(hive);
        let hiveStart = new Date(this.hiveRanges[hive].StartDate);
        let activeStart = new Date(this.activeRange.startDate);
        let hiveEnd = new Date(this.hiveRanges[hive].EndDate);
        let activeEnd = new Date(this.activeRange.endDate);
        if (hiveStart < activeStart || this.activeRange.startDate == null) {
          this.activeRange.startDate = hiveStart;
          this.activeRange.startDate.setHours(0);
          this.activeRange.startDate.setMinutes(0);
          this.activeRange.startDate.setSeconds(0);
        }
        if (hiveEnd > activeEnd || this.activeRange.endDate == null) {
          this.activeRange.endDate = hiveEnd;
          this.activeRange.endDate.setHours(0);
          this.activeRange.endDate.setMinutes(0);
          this.activeRange.endDate.setSeconds(0);
        }
      }
    }
    this.startDateFilter = (d: Date): boolean => {
      return d >= this.activeRange.startDate && d <= this.activeRange.endDate &&
        this.dateFilterDates.includes(d.toISOString());
    }
    this.endDateFilter = (d: Date): boolean => {
      return d >= this.activeRange.startDate && d <= this.activeRange.endDate &&
        this.dateFilterDates.includes(d.toISOString());
    }
  }

  /*startDateSelected
  * This method will handle the user selecting a start date.  This will change
  * the datepickerfilter for the endDate to only allow selection of dates after
  * the selected start date.
  *
  * @params:
  *   date:Date - the start date selected
  */
  private startDateSelected(date: Date) {
    this.endDateFilter = (d: Date): boolean => {
      let threshold_date = new Date(date);
      return d >= this.activeRange.startDate && d <= this.activeRange.endDate &&
        this.dateFilterDates.includes(d.toISOString()) && d > threshold_date;
    }
  }

  /*endDateSelected
  * This method will handle the user selecting an end date.  This will change
  * the datepickerfilter for the startdate to only allow selection of dates
  * before the selected end date.
  *
  * @params:
  *   date:Date - the start date selected
  */
  private endDateSelected(date: Date) {
    this.startDateFilter = (d: Date): boolean => {
      let threshold_date = new Date(date);
      return d >= this.activeRange.startDate && d <= this.activeRange.endDate &&
        this.dateFilterDates.includes(d.toISOString()) && d < threshold_date;
    }
  }

  /*getAnalysis
  * This method will handle requests for analysis for a list of hives from our
  * form with hive checkboxes!
  *
  * @params:
  *   form: NgForm the angular form object
  */
  private getAnalysis(form: NgForm) {
    let hiveRequestList = [];
    for (let name of Object.keys(form.value)) {
      if (this.hives.includes(name) && form.value[name]) {
        hiveRequestList.push(name);
      }
    }
    let requestDataSet = this.avaliableDataSets;
    this._ioService.emit('getData', {
      hives: hiveRequestList,
      count: this.MAX_VALUES_PER_HIVE,
      startDate: form.value.startDate,
      stopDate: form.value.endDate,
      dataSets: requestDataSet
    });
    this.dataLoading = true;
  }

  /*updateChartData()
  * This method will update all chart data with our new data.  May need to be
  * specialized to deal with special types of charts later!
  */
  private updateChartData(x: any, y: any,
                          dataKey: string, datesKey: string) {
    for (var chart of this.charts) {
      chart.updateData(x, y, dataKey, datesKey, this.aggregateMethod);
    }
  }
}
