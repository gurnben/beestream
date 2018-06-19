import { Component,
         Input,
         OnDestroy,
         OnChanges,
         SimpleChange } from '@angular/core';
import { VideoService } from '../video/video.service';

/*This component loads and displays video analytics obtained using the beet
* CLI.  This will provide an approximate number of arrivals/departures in each
* video file.
*/
@Component({
  selector: 'analysis',
  templateUrl: '/app/analysis/analysis.template.html',
  providers: [VideoService]
})
export class AnalysisComponent implements OnChanges, OnDestroy{
  @Input() video: any;
  hive: string;
  date: string;
  time: string;
  datetime: any;
  arrivals: any;
  departures: any;
  videoAnalysisComplete: boolean = false;
  videoAnalysisLoading: boolean = false;

  /*Constructor for AnalysisComponent
  *
  * Puts our VideoService instance in the _ioService attribute.
  */
  constructor(private _ioService: VideoService) {}

  /*This overrides the ngOnInit function to add additional functionality.
  *
  * This adds the necessary socket.io 'on' events.
  */
  ngOnInit() {
    this._ioService.on('videoAnalysisSuccess', (message) => {
      var analysisDate = new Date(message.datetime);
      var ourDate = new Date(this.datetime);
      if (this.hive == message.hive && ourDate.getTime() == analysisDate.getTime()) {
        this.arrivals = message.arrivals;
        this.departures = message.departures;
        this.videoAnalysisComplete = true;
        this.videoAnalysisLoading = false;
      }
    });
    this._ioService.on('videoAnalysisFailure', (message) => {
      console.log(`Video analysis returned an error: ${message.message}`);
      this.videoAnalysisComplete = false;
      this.videoAnalysisLoading = false;
    });
  }

  /*This method handles variable changes.
  * Whenever the video soruce changes, we process that source by breaking it up
  * into hive, date, and time.
  */
  ngOnChanges(changes: {[propKey: string]: SimpleChange}) {
    if (changes['video'].currentValue != null) {

      //get new video info and process it into "readable" format.
      var newVideo = changes['video'].currentValue;
      newVideo = newVideo.split('/')[2];
      [this.hive, this.date, this.time] = newVideo.split('@');
      this.time = this.time.replace(/-/g, ':');
      this.date = `${this.date.substr(5, 2)}/${this.date.substr(8, 2)}/${this.date.substr(0, 4)}`;
      this.datetime = new Date(`${this.date.substr(6, 4)}-${this.date.substr(0, 2)}-${this.date.substr(3, 2)}T${this.time}`)

      //set state variables and request analysis for new video.
      this.videoAnalysisLoading = true;
      this.videoAnalysisComplete = false;
      this._ioService.emit('getAnalysis', {
        hive: this.hive,
        datetime: new Date(`${this.date.substr(6, 4)}-${this.date.substr(0, 2)}-${this.date.substr(3, 2)}T${this.time}`)
      });
    }
  }

  /*ngOnDestroy()
  * This function overrides the ngOnDestroy function to add functionality when
  * the user closes the webpage.
  */
  ngOnDestroy() {
    this._ioService.removeListener('videoAnalysisSuccess');
    this._ioService.removeListener('videoAnalysisFailure');
  }
}
