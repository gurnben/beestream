import { Component, HostListener, OnDestroy } from '@angular/core';
import { Inject } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { NgForm } from '@angular/forms';
import { VideoService } from '../video/video.service';
import { Router, ParamMap, ActivatedRoute } from '@angular/router'
import { PlatformLocation } from '@angular/common';
import { ShareButtons } from '@ngx-share/core';

/*ArchiveComponent
* This component displays the article video chooser and plays a chosen video.
* This file uses the archive service to handle socket interactions.
*/
@Component({
  selector: 'archive',
  templateUrl: '/app/archive/archive.template.html',
  providers: [VideoService]
})
export class ArchiveComponent implements OnDestroy{
  /* Fields for the current state of the hive/date/time selection */
  hiveSelect: string;
  dateSelect: string;
  timeSelect: string;
  /* Arrays to hold the options for hive/date/time */
  hives: Array<any>;
  dates: Array<any>;
  times: Array<any>;

  /* Parameters to display about the CURRENT video.*/
  hive: string;
  date: string;
  time: string;

  videoLoading: boolean;
  videoUrl: any;
  link: any;
  error: string;
  correctLength: boolean;

  /*constructor
  * Constructor for ArchiveComponent
  * Gets the archiveServices and puts it in the _videoService attribute
  *
  * @params:
  *   _videoService: VideoService - object to handle socket.io interactions
  *   document: DOCUMENT          - object to interact with the DOM
  *   route: ActivatedRoute       - object to interact with the URL and URL params
  *   router: Router              - router object to redirect users.
  */
  public constructor(private _videoService: VideoService,
              @Inject(DOCUMENT) private document: any,
              private route: ActivatedRoute,
              private router: Router,
              private platformLocation: PlatformLocation,
              @Inject(ShareButtons) private share: ShareButtons) {}

  /*ngOnInit
  * This overrides the ngOnInit function to add additional functionality.
  * This initializes arrays for each option list, starts our listeners for the
  * list events from socketio, and emits the initial getHive message to get the
  * hive list.
  */
  public ngOnInit() {
    this.hives = new Array();
    this.dates = new Array();
    this.times = new Array();
    this.hiveSelect = null;
    this.dateSelect = null;
    this.timeSelect = null;
    this.videoLoading = false;
    this.correctLength = false;
    this.videoUrl = null;
    this.link = null;
    this.error = null;

    this._videoService.on('hiveList', (hvlst) => {
      this.hives = hvlst.hiveNames;
      this.hives = this.hives.sort();
      this.route.paramMap.subscribe(params => {
        if (this.hives.includes(params.get('hive'))) {
          this.hiveSelect = params.get('hive');
          this._videoService.emit('getDate', {
            hive: this.hiveSelect
          });
        }
      });
    });
    this._videoService.on('dateList', (dtlst) => {
      this.dates = dtlst.dates;
      this.dates.sort().reverse();
      this.route.paramMap.subscribe(params => {
        if (this.dates.includes(params.get('date'))) {
          this.dateSelect = params.get('date');
          this._videoService.emit('getTime', {
            hive: this.hiveSelect,
            date: this.dateSelect
          });
        }
      });
    });
    this._videoService.on('timeList', (tilst) => {
      this.times = tilst.times;
      this.times.sort().reverse();
      this.route.paramMap.subscribe(params => {
        if (this.times.includes(params.get('time'))) {
          this.timeSelect = params.get('time');
          console.log(this.videoUrl);
          this._videoService.emit('getVideo', {
            hive: this.hiveSelect,
            date: this.dateSelect,
            time: this.timeSelect,
            previous: this.videoUrl
          });
          this.router.navigate(['/archive']);
        }
      });
    });
    this._videoService.on('videoRequestRecieved', (data) => {
      this.videoLoading = true;
    });
    this._videoService.on('videoReady', (vidURL) => {
      this.videoUrl = vidURL.url;
      this.error = null;
      //process the date to display
      [this.hive, this.date, this.time] = this.getVideoInfo(this.videoUrl);
      /*If the video is not at least 60 seconds we got a partial video and
      * need to request that it be reconverted and served.  This corrects for
      * a video that is still being uploaded.
      */
      var videoElements = document.getElementsByClassName('video');
      if (videoElements.length > 0) {
        var videoDuration = (<HTMLVideoElement>videoElements[0]).duration;
        if (videoDuration < 50) {
          //Emit closeSession to tell the server to delete our session's video
          this._videoService.emit('closeSession', {video: this.videoUrl});
          //Call onSubmit to re-request the video.
          this.videoUrl = null;
          this.videoLoading = true;
          this.correctLength = false;
          this.onSubmit();
        }
      }
      this.videoLoading = false;
      this.correctLength = true;
    });
    this._videoService.on('novideo', (data) => {
      this.error = data.message;
    });
    this._videoService.emit('getHive', {});
  }

  /*checkDuration
  * This method verifies that the video is longer than 50 seconds.  If we have
  * a complete video it should last longer than 50 seconds, if it does not, we
  * request a new video on a delay.
  *
  * @params:
  *   video - the DOM object to check the duration value on
  *   hive  - the hive that is currently being viewed
  *   date  - the date of the video that is currently being viewed
  *   time  - the time of the video that is currently being viewed
  */
  private checkDuration(video, hive, date, time) {
    if (video.duration < 30) {
      this.error = `This video only lasts ${Math.ceil(video.duration)} ` +
                    `seconds, there's probably something wrong with it.  We ` +
                    `apologize, please view another video and try again later!`;
      //Emit closeSession to tell the server to delete our session's video
      this._videoService.emit('closeSession', {video: this.videoUrl});
      this.videoUrl = null;
    }
    else {
      this.videoLoading = false;
      this.correctLength = true
    }
  }

  /*showTitle
  * This function takes the place of the condition for the video title div.
  * This has been implemented to simplify our angluar template and comply with
  * angular standards.
  */
  private showTitle() {
    return this.videoUrl && !this.error && this.correctLength &&
            this.hive && this.date && this.time;
  }

  /*showVideo
  * this fucntion takes the place of the condition for the video div.
  * This has been implemented to simplify our angular template and comply with
  * angular standards.
  */
  private showVideo() {
    return this.videoUrl && !this.error && this.correctLength;
  }

  /*getVideoInfo
  * This function handles the formatting of the video's hive, date, and time
  * into a human readable format to be displayed.
  *
  * params:
  *   videoMetaData: string - the video's url containing its metadata
  */
  private getVideoInfo(videoMetaData: string) {
    var newVideo = videoMetaData.split('/')[2];
    var hive, date, time;
    [hive, date, time] = newVideo.split('@');
    time = time.replace(/-/g, ':');
    var displayTime = +time.substr(0, 2) > 12 ?
      `${+time.substr(0, 2) - 12}${time.substr(2, 7)}PM` :
      `${time}AM`;
    date = `${date.substr(5, 2)}/${date.substr(8, 2)}/${date.substr(0, 4)}`;
    return [hive, date, displayTime];
  }

  /*respondHive
  * This function submits the current hive selection by redirecting the user to
  * the archive page with the hive parameter set.
  * The hiveSelect field's current status is sent.
  */
  private respondHive() {
    if (this.hiveSelect != null) {
      this.dates = new Array();
      this.dateSelect = null;
      this.times = new Array();
      this.timeSelect = null;
      this._videoService.emit('getDate', {
        hive: this.hiveSelect
      });
    }
  }

  /*respondDate
  * This function submits the current date selection by redirecting the user to
  * the archive page wtih the hive and date parameters set.
  * The dateSelect field's current status is sent.
  */
  private respondDate() {
    if ((this.hiveSelect != null) && (this.dateSelect != null)) {
      this.times = new Array();
      this.timeSelect = null;
      this._videoService.emit('getTime', {
        hive: this.hiveSelect,
        date: this.dateSelect
      });
    }
  }

  /*onSubmit
  * This function submits the hive, date, and time selections to get a new video
  * by redirecting the user to the same archive page with hive, date, and time
  * parameters set.
  *
  * The input boxes field's current status is sent as well as the current
  * video url so since we are done with that video.
  */
  private onSubmit() {
    if ((this.hiveSelect != null) && (this.dateSelect != null) && (this.timeSelect != null)) {
      this.link = `${(this.platformLocation as any).location.href};hive=${this.hiveSelect};date=${this.dateSelect};time=${this.timeSelect}`;
      this._videoService.emit('getVideo', {
        hive: this.hiveSelect,
        date: this.dateSelect,
        time: this.timeSelect,
        previous: this.videoUrl
      });
    }
  }

  /*formatDate
  * returns a formatted version of the date in format MM/DD/YYYY
  *
  * @params:
  *   date - a string representation of the date in format yyyy-mm-dd
  */
  private formatDate(date: string) {
    var year = date.substr(0, 4);
    var month = date.substr(5, 2);
    var day = date.substr(8, 2);
    return `${month}/${day}/${year}`;
  }

  /*formatTime
  * returns a formatted version of the time in format HH:MM:SS AM/PM
  *
  * @params:
  *   date - a string representation of the time in format HH-MM-SS
  */
  private formatTime(time: string) {
    var minutes = time.substr(3, 2);
    var seconds = time.substr(6, 2);
    var hours = +time.substr(0, 2) > 12 ? String(+time.substr(0, 2) - 12) : time.substr(0, 2)
    var fulltime = "";
    if (+time.substr(0, 2) > 12) {
        fulltime = `${hours}:${minutes}:${seconds} PM`;
    }
    else {
      if (+time.substr(0, 2) > 9) {
        fulltime = `${hours}:${minutes}:${seconds} AM`;
      }
      else {
        fulltime = `${hours.substr(1, 1)}:${minutes}:${seconds} AM`;
      }
    }
    return fulltime;
  }

  /*beforeunloadHandler
  * This function handles the user closing the window.  It sends the
  * 'closeSession' signal to make sure that the server cleans up the video
  * that the client was streaming.
  *
  * @params:
  *   event - The event that is being handled.  In this case, thie event doesn't
  *           matter!
  */
  @HostListener('window:beforeunload', ['$event'])
  beforeunloadHandler(event) {
    this._videoService.emit('closeSession', {video: this.videoUrl});
  }

  /*ngOnDestroy
  * This function makes sure that our socket removes its listeners when the
  * connection is destroyed/browser is closed.  This also sends the closeSession
  * message containing the current video's url since we are done with that video
  *
  * Have to stop listening for 'hiveList', 'dateList', 'timeList',
  * 'videorequestRecieved', and 'videoReady'.
  */
  public ngOnDestroy() {
    this._videoService.emit('closeSession', {video: this.videoUrl});
    this._videoService.removeListener('hiveList');
    this._videoService.removeListener('dateList');
    this._videoService.removeListener('timeList');
    this._videoService.removeListener('videoRequestRecieved');
    this._videoService.removeListener('videoReady');
  }
}
