import { Component,
         AfterViewInit,
         Output,
         Input,
         EventEmitter,
         OnChanges,
         SimpleChange } from '@angular/core';
import { ChartComponent } from '../chart.interface.component';
import { ViewChild } from '@angular/core';
import * as c3 from 'c3';
require('../../../c3.styles.css');
require('../../../weather-icons.css');

/*DashboardComponent
* This component will be our dashboard for beemon analytics.
*/
@Component({
  selector: 'weather-widget',
  template: require('./weatherwidget.template.html'),
  styles: [ '../../c3.styles.css', '../../../weather-icons.css' ]
})
export class WeatherWidget implements OnChanges, AfterViewInit {

  @Input() private focused: any;
  private icon: string = "wi wi-na";
  private showWidget: boolean = false;
  private data: any = {};
  private focusedDate: Date = null;
  private focusedData: any = {
    AverageHumidity: '-',
    AverageTemperature: '--'
  };
  requiredDataSet: any = {
    weather: ['AverageTemperature', 'AverageHumidity', 'AverageWindspeed',
              'Weather', 'Clouds', 'UTCStartDate', 'UTCEndDate']
  };

  /*ngAfterViewInit()
  * This method overrides the ngAfterViewInit method to add functionality,
  * namely, we'll have to set up our c3 charts here.
  */
  public ngAfterViewInit() {
    // do necessary population after init.
  }

  /*ngOnChanges
  * This method handles variable changes.
  * Whenever the focused data point change, change our selected point.
  *
  * @params:
  *   changes: SimpleChange - an array of key:value pairs holding the input
  *                           variable changes.
  */
  public ngOnChanges(changes: {[propKey: string]: SimpleChange}) {
    let relaventChanges = changes['focused'].currentValue;
    //If we have relavent changes
    if ((relaventChanges != null) && this.data[relaventChanges.name]) {
      //find the closest date to the new focused date
      let focusDate = new Date(relaventChanges.x);
      //save the hivename we're looking for, used to index into the data object
      let targetHiveName = relaventChanges.name;

      let x = this.data[targetHiveName].UTCStartDate;
      let minDiff = Infinity;
      let minIndex = 0;
      for (let i = 0; i < x.length; i++) {
        let d = new Date(x[i]);
        let diff = Math.abs(d.getTime() - focusDate.getTime());
        if (diff < minDiff) {
          minDiff = diff;
          minIndex = i;
        }
      }

      //set fields according to this date (minIndex is the index of date with
      // minimum difference from the focused date)
      this.focusedDate = new Date(this.data[targetHiveName].UTCStartDate[minIndex]);
      //Set the focused data based on the focused date and its index
      //TODO: If you want to add a new dataset to the weather widget, add it
      //  here and in the list of requiredDataSets, then it should be available
      //  to the template.
      this.focusedData = {
        UTCDate: this.data[targetHiveName].UTCStartDate[minIndex],
        Weather: this.data[targetHiveName].Weather[minIndex],
        Clouds: this.data[targetHiveName].Clouds[minIndex],
        AverageTemperature: Math.round(this.data[targetHiveName].AverageTemperature[minIndex]),
        AverageHumidity: Math.round(this.data[targetHiveName].AverageHumidity[minIndex]),
        AverageWindspeed: this.data[targetHiveName].AverageWindspeed[minIndex]
      }

      this.icon = this.processWeather(this.focusedData);

      this.showWidget = true;
    }
  }

  /*updateChartData()
  * This method will update all chart data with our new data.  May need to be
  * specialized to deal with special types of charts later!
  */
  public updateData(res: any, dataKey: string,
                    datesKey: string, aggregateMethod: string,
                    unchartedHives: Array<string>) {
      this.data[dataKey] = res['weather'];
      this.showWidget = true;
  }

  /*requiredDataSets
  * returns a list of required data sets.
  */
  public requiredDataSets(): { audio: [], video: [], weather: [] } {
    return this.requiredDataSet;
  }

  /*processWeather
  * This method takes as input a weather data object and outputs a weather
  * status to be used for the iconography.
  */
  public processWeather(weather: any) : string {

    //Object containing weather icons and their appropriate icon names.
    //Weather classes should be in priority order (highest priority first).
    let weatherClasses = {
      windy: {
        "thunderstorm": "wi-thunderstorm",
        "snow": "wi wi-snow-wind",
        "rain": "wi wi-rain-wind",
        "drizzle": "wi wi-sprinkle",
        "unknown": "wi wi-na"
      },
      notWindy: {
        "thunderstorm": "wi wi-thunderstorm",
        "snow": "wi wi-snow",
        "rain": "wi wi-rain",
        "drizzle": "wi wi-sprinkle",
        "unknown": "wi wi-na"
      }
    };
    let windy = false;
    let cloudy = false;
    let precip = null;
    let icon = null;

    if (weather.Clouds) {
      // set cloudy to true if it was cloudy at all, false if not
      for (let cloud of weather.Clouds) {
        if (cloud != null && (cloud.toLowerCase().includes('broken')
            || cloud.toLowerCase().includes('scattered')
            || cloud.toLowerCase().includes('overcast'))) {
          cloudy = true;
        }
      }
    }

    // set windy to true if it was windy, false if not.  (windy = wind > 15mph)
    windy = (weather.AverageWindspeed > 15);

    // set precipitation to the proper precip/windy icon name using the
    // weatherClasses object
    for (let i = 0; i < Object.keys(weatherClasses).length; i++) {
      if (weather.Weather) {
        for (let condition of weather.Weather) {
          if (windy) {
            let checkingClass = Object.keys(weatherClasses.windy)[i];
            if (condition.toLowerCase().includes(checkingClass)
                && !precip) {
              precip = weatherClasses.windy[checkingClass];
            }
          }
          else {
            let checkingClass = Object.keys(weatherClasses.notWindy)[i];
            if (condition.toLowerCase().includes(checkingClass)
                && !precip) {
              precip = weatherClasses.notWindy[checkingClass];
            }
          }
        }
      }
    }

    if (precip) {
      icon = precip;
    }
    else if (!precip && cloudy && windy) {
      icon = 'wi wi-cloudy-windy';
    }
    else if (!precip && cloudy && !windy) {
      icon = 'wi wi-cloud'
    }
    else if (!precip && !cloudy && windy) {
      icon = 'wi wi-windy';
    }
    else {
      icon = 'wi wi-day-sunny';
    }
    return icon;
  }

  /*formatDatetime
  * Takes in a date object and outputs a datetime string in the format:
  *   MM/DD/YY HH:MM AM/PM
  */
  private formatDatetime(datetime: Date) {
    if (datetime != null) {
      let datestring = "";
      datestring += (datetime.getMonth() < 10) ? ('0' + datetime.getMonth()) :
        (datetime.getMonth());
      datestring += '/';
      datestring += (datetime.getDate() < 10) ? ('0' + datetime.getDate()) :
        (datetime.getDate());
      datestring += '/';
      datestring += (datetime.getFullYear() + ' ');
      datestring += (datetime.getHours() < 10) ? '0' : '';
      datestring += (datetime.getHours() < 13) ? datetime.getHours() :
        datetime.getHours() - 12;
      datestring += ':';
      datestring += (datetime.getMinutes() < 10) ? ('0' + datetime.getMinutes()) :
        datetime.getMinutes();
      datestring += (datetime.getHours() < 13) ? "AM" : 'PM'
      return datestring;
    }
    else {
      return 'No Focused Date';
    }
  }
}
