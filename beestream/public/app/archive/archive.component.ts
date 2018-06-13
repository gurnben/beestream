import { Component, HostListener, OnDestroy } from '@angular/core';
import { Inject } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { NgForm } from '@angular/forms';
import { VideoService } from '../video/video.service';

/* This component displays the article video chooser and plays a chosen video.
*
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
  error: string;
  correctLength: boolean;

  /*Constructor for ArchiveComponent
  *
  * Gets the archiveServices and puts it in the _videoService attribute
  */
  constructor(private _videoService: VideoService, @Inject(DOCUMENT) private document: any) {}

  /*This overrides the ngOnInit function to add additional functionality.
  *
  * This initializes arrays for each option list, starts our listeners for the
  * list events from socketio, and emits the initial getHive message to get the
  * hive list.
  *
  */
  ngOnInit() {
    this.hives = new Array();
    this.dates = new Array();
    this.times = new Array();
    this.videoLoading = false;
    this.correctLength = false;
    this.videoUrl = null;
    this.hiveSelect = null;
    this.dateSelect = null;
    this.timeSelect = null;
    this.error = null;

    this._videoService.on('hiveList', (hvlst) => {
      this.hives = hvlst.hiveNames;
    });
    this._videoService.on('dateList', (dtlst) => {
      this.dates = dtlst.dates;
    });
    this._videoService.on('timeList', (tilst) => {
      this.times = tilst.times;
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
    })
    this._videoService.emit('getHive', {})
  }

  /*checkDuration(video, hive)
  * This method verifies that the video is longer than 50 seconds.  If we have
  * a complete video it should last longer than 50 seconds, if it does not, we
  * request a new video on a delay.
  */
  checkDuration(video, hive, date, time) {
    if (video.duration < 30) {
      this.error = `This video only lasts ${Math.ceil(video.duration)} ` +
                    `seconds, there's probably something wrong with it.  We ` +
                    `apologize, please view another video and try again later!`;
      //Emit closeSession to tell the server to delete our session's video
      this._videoService.emit('closeSession', {video: this.videoUrl});
      // this.videoUrl = null;
    }
    else {
      this.videoLoading = false;
      this.correctLength = true
    }
  }

  /*showTitle()
  * This function takes the place of the condition for the video title div.
  * This has been implemented to simplify our angluar template and comply with
  * angular standards.
  */
  showTitle() {
    return this.videoUrl && !this.error && this.correctLength &&
            this.hive && this.date && this.time;
  }

  /*showVideo()
  * this fucntion takes the place of the condition for the video div.
  * This has been implemented to simplify our angular template and comply with
  * angular standards.
  */
  showVideo() {
    return this.videoUrl && !this.error && this.correctLength;
  }

  /*This function handles the formatting of the video's hive, date, and time
  * into a human readable format to be displayed.
  */
  getVideoInfo(videoMetaData: string) {
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

  /*This function sends the hive choice as a socket.io getDate message.
  *
  * The hiveSelect field's current status is sent.
  */
  respondHive() {
    if (this.hiveSelect != null) {
      var message = {
        text: this.hiveSelect
      };
      this.dates = new Array();
      this.dateSelect = null;
      this.times = new Array();
      this.timeSelect = null;
      this._videoService.emit('getDate', message);
    }
  }

  /*This function sends the date choice as a socket.io getTime message.
  *
  * The dateSelect field's current status is sent.
  */
  respondDate() {
    if ((this.hiveSelect != null) && (this.dateSelect != null)) {
      var message = {
        hive: this.hiveSelect,
        date: this.dateSelect
      };
      this.times = new Array();
      this.timeSelect = null;
      this._videoService.emit('getTime', message);
    }
  }

  /*This function sends the video choice as a socket.io getVideo message.
  *
  * The input boxes field's current status is sent as well as the current
  * video url so since we are done with that video.
  */
  onSubmit() {
    if ((this.hiveSelect != null) && (this.dateSelect != null) && (this.timeSelect != null)) {
      var message = {
        hive: this.hiveSelect,
        date: this.dateSelect,
        time: this.timeSelect,
        previous: this.videoUrl
      };
      this._videoService.emit('getVideo', message);
    }
  }

  /*This function handles the user closing the window.  It sends the
  * 'closeSession' signal to make sure that the server cleans up the video
  * that the client was streaming.
  */
  @HostListener('window:beforeunload', ['$event'])
  beforeunloadHandler(event) {
    this._videoService.emit('closeSession', {video: this.videoUrl});
  }

  /*This function makes sure that our socket removes its listeners when the
  * connection is destroyed/browser is closed.  This als osends the closeSession
  * message containing the current video's url since we are done with that video
  *
  * Have to stop listening for 'hiveList', 'dateList', 'timeList',
  * 'videorequestRecieved', and 'videoReady'.
  */
  ngOnDestroy() {
    this._videoService.emit('closeSession', {video: this.videoUrl});
    this._videoService.removeListener('hiveList');
    this._videoService.removeListener('dateList');
    this._videoService.removeListener('timeList');
    this._videoService.removeListener('videoRequestRecieved');
    this._videoService.removeListener('videoReady');
  }
}
