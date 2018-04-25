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
  templateUrl: './app/archive/archive.template.html',
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

  videoLoading: boolean;
  videoUrl: any;
  error: string;

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
      this.videoLoading = false;
      this.videoUrl = vidURL.url;

      /*If the video is not at least 60 seconds we got a partial video and
      * need to request that it be reconverted and served.  This corrects for
      * a video that is still being uploaded.
      */
      var videoElements = document.getElementsByClassName('video');
      if (videoElements.length > 0) {
        var videoDuration = (<HTMLVideoElement>videoElements[0]).duration;
        if (videoDuration < 60) {
          //Emit closeSession to tell the server to delete our session's video
          this._videoService.emit('closeSession', {video: this.videoUrl});
          //Call onSubmit to re-request the video.
          this.onSubmit();
        }
      }
    });
    this._videoService.on('novideo', (data) => {
      this.error = data.message;
    })
    this._videoService.emit('getHive', {})
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
