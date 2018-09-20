import { Component, OnDestroy } from '@angular/core';
import { VideoService } from '../video/video.service';
import { ChartsModule } from 'ng2-charts';

/*DashboardComponent
* This component will be our dashboard for beemon analytics.
*/
@Component({
  selector: 'dash',
  template: require('./dashboard.template.html'),
  providers: [VideoService]
})
export class DashboardComponent implements OnDestroy {

  public lineChartData:Array<any> = [];
  public lineChartLabels:Array<any> = [];
  public lineChartOptions:any = {
    responsive: true
  };
  public lineChartColors:Array<any> = [
    { // grey
      backgroundColor: 'rgba(73, 98, 255, 0.2)',
      borderColor: 'rgba(73, 98, 255, 1)',
      pointBackgroundColor: 'rgba(73, 98, 255, 1)',
      pointBorderColor: '#4962ff',
      pointHoverBackgroundColor: '#4962ff',
      pointHoverBorderColor: 'rgba(73, 98, 255, 1)'
    },
    { // dark grey
      backgroundColor: 'rgba(252, 58, 58, 0.2)',
      borderColor: 'rgba(252, 58, 58, 1)',
      pointBackgroundColor: 'rgba(252, 58, 58, 1)',
      pointBorderColor: '#fc3a3a',
      pointHoverBackgroundColor: '#fc3a3a',
      pointHoverBorderColor: 'rgba(252, 58, 58, 1)'
    },
    { // grey
      backgroundColor: 'rgba(148,159,177,0.2)',
      borderColor: 'rgba(148,159,177,1)',
      pointBackgroundColor: 'rgba(148,159,177,1)',
      pointBorderColor: '#fff',
      pointHoverBackgroundColor: '#fff',
      pointHoverBorderColor: 'rgba(148,159,177,0.8)'
    }
  ];
  public lineChartLegend:boolean = true;
  public lineChartType:string = 'line';

  public randomize():void {
    let _lineChartData:Array<any> = new Array(this.lineChartData.length);
    for (let i = 0; i < this.lineChartData.length; i++) {
      _lineChartData[i] = {data: new Array(this.lineChartData[i].data.length), label: this.lineChartData[i].label};
      for (let j = 0; j < this.lineChartData[i].data.length; j++) {
        _lineChartData[i].data[j] = Math.floor((Math.random() * 100) + 1);
      }
    }
    this.lineChartData = _lineChartData;
  }

  // events
  public chartClicked(e:any):void {
    console.log(e);
  }

  public chartHovered(e:any):void {
    console.log(e);
  }

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
    this._ioService.emit('getData', {
      hive: 'rpi11b'
    });
    this._ioService.emit('getData', {
      hive: 'rpi12b'
    });
    this._ioService.on('updateData', (message) => {
      for (let i = 0; i < this.lineChartData.length; i++) {
        if (this.lineChartData[i].label === message.hiveName) {
          this.lineChartData[i].data = message.arrivals;
          this.lineChartData[i].departures = message.departures;
          this.lineChartData[i].filepaths = message.filepaths;
          var dates = [];
          message.dates.forEach((date) => {
            dates.push(new Date(date));
          });
          this.lineChartLabels = dates;
          return;
        }
      }
      this.lineChartData.push({
        label: message.hiveName,
        data: message.arrivals,
        departures: message.departures,
        filepaths: message.filepaths,
      });
      var dates = [];
      message.dates.forEach((date) => {
        dates.push(new Date(date));
      });
      this.lineChartLabels = dates;
    });
  }

  /*ngOnDestroy
  * This method overrides the ngOnDestroy method to add functionality, namely
  * it ensures that our socket.io listeners are removed.
  */
  public ngOnDestroy() {
    //TODO: remove listeners
  }
}
