import { Inject } from '@angular/core';
import { Component, HostListener, OnDestroy } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { NgForm } from '@angular/forms';
import { VideoService } from '../video/video.service';

/*This component will handle the streaming page and video streaming.
*
* This file uses the stream service to interface with the videos.
*/
@Component({
  selector: 'stream',
  templateUrl: '/app/stream/stream.template.html',
  providers: [ VideoService ]
})
export class StreamComponent {
  videoUrl : any;
  streamHiveSelect: string;
  videoLoading: boolean;
  hives: Array<any>;
  error: string;
  correctLength: boolean;

  /* Parameters to display about the CURRENT video.*/
  hive: string;
  date: string;
  time: string;

  /*Constructor for ArchiveComponent
  *
  * Gets the videoService and puts it in the _videoService attribute
  */
  constructor(private _videoService: VideoService, @Inject(DOCUMENT) private document: any) {}

  /*This overrides the ngOnInit function to add additional functionality.
  *
  * This initializes arrays for the hives option list, starts the necessary
  * listeners, and emits the getStreamHive message to get the hives list.
  */
  ngOnInit() {
    this.hives = new Array();
    this.videoLoading = false;
    this.streamHiveSelect = null;
    this.error = null;
    this.correctLength = false;

    this._videoService.on('streamHiveList', (hvlst) => {
      this.hives = hvlst.hiveNames;
    });
    this._videoService.on('streamRequestRecieved', (data) => {
      this.videoLoading = true;
    });
    this._videoService.on('streamReady', (data) => {
      this.correctLength = false;
      this.videoUrl = data.url;
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
        if (videoDuration < 60) {
          //Emit closeSession to tell the server to delete our session's video
          this._videoService.emit('closeSession', {video: this.videoUrl});
          //Call onSubmit to re-request the video.
          this.videoUrl = null;
          this.videoLoading = true;
          this.correctLength = false;
          this.onSubmit();
        }
        else {
          this.videoLoading = false;
          this.correctLength = true
        }
      }
      else {
        this.videoLoading = false;
        this.correctLength = true;
      }
    });
    this._videoService.on('novideo', (data) => {
      this.error = data.message;
    });
    this._videoService.emit('getStreamHive', {});
  }

  /* This function sends the hive choice as a 'getStreamVideo' message.
  *
  * The selection for the hives comes from the input box.
  */
  onSubmit() {
    if (this.streamHiveSelect != null) {
      var message = {
        hive: this.streamHiveSelect,
        previous: this.videoUrl
      };
      this._videoService.emit('getStreamVideo', message);
    }
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

  /*This function handles the user closing the window.  It sends the
  * 'closeSession' signal to make sure that the server cleans up the video
  * that the client was streaming.
  */
  @HostListener('window:beforeunload', ['$event'])
  beforeunloadHandler(event) {
    this._videoService.emit('closeSession', {video: this.videoUrl});
  }

  /*This function makes sure that our socket removes its listeners when the
  * connection is destroyed/browser is closed.  This also sends the closeSession
  * message containing the current video's url since we are done with that video
  *
  * Have to stop listening for 'hiveList', 'dateList', and 'timeList'.
  */
  ngOnDestroy() {
    this._videoService.emit('closeSession', {video: this.videoUrl});
    this._videoService.removeListener('streamHiveList');
    this._videoService.removeListener('streamRequestRecieved');
    this._videoService.removeListener('streamReady');
  }
}
