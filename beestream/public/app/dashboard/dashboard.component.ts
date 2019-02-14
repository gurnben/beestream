import { Component, ViewEncapsulation, OnDestroy, AfterViewInit, ViewChild } from '@angular/core';
import { VideoService } from '../video/video.service';
import { NgForm } from '@angular/forms';
import { FormArray, FormControl, FormGroup, Validators } from '@angular/forms';
import { DeparturesChartComponent } from './dashboard-charts/departures-chart/departureschart.component';
import { ArrivalsChartComponent } from './dashboard-charts/arrivals-chart/arrivalschart.component';
import { RMSLinearChartComponent } from './dashboard-charts/rmslinear-chart/rmslinearchart.component';
import { TemperatureChartComponent } from './dashboard-charts/temperature-chart/temperaturechart.component';
import { ChartComponent } from './dashboard-charts/chart.interface.component';
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
    private departuresChart: ChartComponent;
  @ViewChild(ArrivalsChartComponent)
    private arrivalsChart: ChartComponent;
  @ViewChild(RMSLinearChartComponent)
    private rmsLinearChart: ChartComponent;
  @ViewChild(TemperatureChartComponent)
    private temperatureChart: ChartComponent;
  private checkboxGroup = null;
  private hiddenControl = null;
  private form = null;
  private charts: Array<any> = [];
  private hives: Array<string> = null;
  private hiveRanges: Array<any> = null;
  private activeHives: Array<string> = [];
  private unchartedHives: Array<string> = [];
  private activeRange: any = {
    startDate: null,
    endDate: null
  };
  private avaliableDataSets: any = {};
  private aggregateMethod: String;
  private dataLoading = false;
  private dataReceived = false;
  private MAX_VALUES_PER_HIVE:number = 1000;
  private startDateFilter: any = null;
  private endDateFilter: any = null;
  private dateFilterDates: any = null;
  private beginStartAt: any = new Date();
  private endStartAt: any = new Date();
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
      var response = {};
      response['video'] = message.video;
      response['audio'] = message.audio;
      response['weather'] = message.weather;
      //TODO: Add new datasets here
      this.aggregateMethod = message.aggregateMethod;
      this.updateChartData(response,
        message.video.HiveName, message.video.HiveName + 'Dates');
      this.dataLoading = false;
      this.dataReceived = true;
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
    this._ioService.on('availableDataSets', (message) => {
      this.avaliableDataSets = message.dataSets;
    });
  }

  /*ngAfterViewInit()
  * This method overrides the ngAfterViewInit method to add functionality,
  * namely, we'll have to set up our c3 charts here.
  */
  public ngAfterViewInit() {
    //TODO: Add any new @ViewChild charts to the charts array here
    //Example: this.charts.push(this.chart);
    this.charts.push(this.departuresChart);
    this.charts.push(this.arrivalsChart);
    this.charts.push(this.rmsLinearChart)
    this.charts.push(this.temperatureChart);
  }

  /*ngOnDestroy
  * This method overrides the ngOnDestroy method to add functionality, namely
  * it ensures that our socket.io listeners are removed.
  */
  public ngOnDestroy() {
    this._ioService.removeListener('dashboardHiveList');
    this._ioService.removeListener('updateData');
    this._ioService.removeListener('availableDateList');
    this._ioService.removeListener('availableDataSets');
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
    this.endStartAt = this.activeRange.endDate;
    this.beginStartAt = this.activeRange.endDate;
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
    this.beginStartAt = date;
    this.endDateFilter = (d: Date): boolean => {
      let threshold_date = new Date(this.beginStartAt);
      return d >= this.activeRange.startDate && d <= this.activeRange.endDate &&
        this.dateFilterDates.includes(d.toISOString()) && d >= threshold_date;
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
    this.endStartAt = date;
    this.startDateFilter = (d: Date): boolean => {
      let threshold_date = new Date(this.endStartAt);
      return d >= this.activeRange.startDate && d <= this.activeRange.endDate &&
        this.dateFilterDates.includes(d.toISOString()) && d <= threshold_date;
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
    if (form.valid) {
      //Set the datetime bounds time fields to 0 and 23:59:59
      let startDate = new Date(form.value.startDate);
      startDate.setHours(0);
      startDate.setMinutes(0);
      startDate.setSeconds(0);
      let endDate = new Date(form.value.endDate);
      endDate.setHours(23);
      endDate.setMinutes(59);
      endDate.setSeconds(59);

      //Get a list of selected hives to get data for
      let hiveRequestList = [];
      for (let name of Object.keys(form.value)) {
        if (this.hives.includes(name) && form.value[name]) {
          hiveRequestList.push(name);
        }
      }

      //Update the list of currently requested hives
      this.unchartedHives = [];
      for (let hive of this.hives) {
        if (!hiveRequestList.includes(hive)) {
          this.unchartedHives.push(hive);
        }
      }

      //Get a list of datasets that our charts require
      let requestDataSet = {};
      for (let chart of this.charts) {
        let dataSetList = chart.requiredDataSets();
        for (let datatype of Object.keys(dataSetList)) {
          for (let dataset of dataSetList[datatype]) {
            if (!requestDataSet[datatype]) {
              requestDataSet[datatype] = [];
            }
            (requestDataSet[datatype]).push(dataset);
          }
        }
      }

        this._ioService.emit('getData', {
          hives: hiveRequestList,
          count: this.MAX_VALUES_PER_HIVE,
          startDate: startDate,
          stopDate: endDate,
          dataSets: requestDataSet
        });
      this.dataLoading = true;
    }
  }

  private dataSetAvailableForChart(y: any, chart: ChartComponent): boolean {
      let requiredDataSets = chart.requiredDataSets();
      for (let key of Object.keys(requiredDataSets)) {
        for (let dataSet of requiredDataSets[key]) {
          if (!((y[key])[dataSet])) {
            return false;
          }
        }
      }
      return true;
  }

  /*updateChartData()
  * This method will update all chart data with our new data.  May need to be
  * specialized to deal with special types of charts later!
  */
  private updateChartData(res: any, dataKey: string, datesKey: string) {
    for (var chart of this.charts) {
      if (this.dataSetAvailableForChart(res, chart)) {
        chart.updateData(res, dataKey, datesKey, this.aggregateMethod, this.unchartedHives);
      }
    }
  }
}
