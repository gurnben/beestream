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
  videoUrl: any = null;
  checkUrl: any = null;
  streamHiveSelect: string;
  videoLoading: boolean;
  hives: Array<any>;
  error: string;
  correctLength: boolean;
  videoElement: any;

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
      console.log(`StreamReady signal receieved with url ${data.url}`);
      if (this.videoUrl == data.url) {
        this.videoLoading = false;
      }
      this.checkUrl = data.url;
      this.error = null;
    });
    this._videoService.on('novideo', (data) => {
      console.log(data.message);
      this.error = data.message;
    });
    this._videoService.emit('getStreamHive', {});
  }

  /*checkDuration(video, hive)
  * This method verifies that the video is longer than 50 seconds.  If we have
  * a complete video it should last longer than 50 seconds, if it does not, we
  * request a new video on a delay.
  */
  checkDuration(video) {
    var hive = this.getVideoInfo(this.checkUrl)[0];
    if (video.duration < 50) {
      console.log("Duration Check Failed");
      //Emit closeSession to tell the server to delete our session's video
      this._videoService.emit('closeSession', {video: this.checkUrl});
      //call reattempt to reattempt the stream.
      this.reattempt(hive);
    }
    else {
      console.log("Duration Check Successful");
      this.videoLoading = false;
      this.correctLength = true;
      this.videoUrl = this.checkUrl;
      [this.hive, this.date, this.time] = this.getVideoInfo(this.videoUrl);
    }
  }

  /*resubmit(hive, videoUrl, service)
  * This function sends the hive choice as a 'getStreamVideo' message from a
  * context.  It will use service to send a message containing hive and videoUrl
  * This is meant for use by checkDuration.
  */
  public static resubmit(hive, videoUrl, service) {
    if (hive) {
      console.log(`Resubmitting with hive ${hive} and videoUrl ${videoUrl}`);
      service.emit('getStreamVideo', {
        hive: hive,
        previous: videoUrl
      })
    }
  }

  reattempt(hive) {
    console.log(`Reattempt was called with hive ${hive} and checkUrl ${this.checkUrl}`);
    this.videoLoading = true;
    var url = this.checkUrl;
    this.checkUrl = null;
    setTimeout(StreamComponent.resubmit.bind(null, hive, url,
                                              this._videoService), 10000);
  }

  /*showTitle()
  * This function takes the place of the condition for the video title div.
  * This has been implemented to simplify our angluar template and comply with
  * angular standards.
  */
  showTitle() {
    return this.videoUrl && !this.error &&
            this.hive && this.date && this.time;
  }

  /*showVideo()
  * this fucntion takes the place of the condition for the video div.
  * This has been implemented to simplify our angular template and comply with
  * angular standards.
  */
  showVideo() {
    return this.videoUrl && !this.error;
  }

  /* This function sends the hive choice as a 'getStreamVideo' message.
  *
  * The selection for the hives comes from the input box.
  */
  onSubmit(hive) {
    console.log(`onSubmit called with ${hive}`);
    if (hive != null) {
      var message = {
        hive: hive,
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
