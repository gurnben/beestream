import { Inject } from '@angular/core';
import { Component, HostListener, OnDestroy } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { NgForm } from '@angular/forms';
import { VideoService } from '../video/video.service';

/*This component will handle the streaming page and video streaming.
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

  /*constructor
  * Sets and initializes necessary fields.
  *
  * @params:
  *   _videoService: VideoService - an object wrapper for socket.io interactions
  *   document: DOCUMENT          - an object encapsulation of the DOM, used for
  *                                 all DOM interactions.
  */
  public constructor(private _videoService: VideoService,
              @Inject(DOCUMENT) private document: any) {}

  /*ngOnInit
  * This overrides the ngOnInit function to add additional functionality.
  * This initializes arrays for the hives option list, starts the necessary
  * listeners, and emits the getStreamHive message to get the hives list.
  */
  public ngOnInit() {
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

  /*checkDuration
  * This method verifies that the video is longer than 50 seconds.  If we have
  * a complete video it should last longer than 50 seconds, if it does not, we
  * request a new video after a delay.
  *
  * @params:
  *   video: HTMLVideoElement - the HTML video player element to check the
  *           duration of.
  */
  private checkDuration(video: HTMLVideoElement) {
    var hive = this.getVideoInfo(this.checkUrl)[0];
    if (video.duration < 50) {
      //Emit closeSession to tell the server to delete our session's video
      this._videoService.emit('closeSession', {video: this.checkUrl});
      //call reattempt to reattempt the stream.
      this.reattempt(hive);
    }
    else {
      this.videoLoading = false;
      this.correctLength = true;
      this.videoUrl = this.checkUrl;
      [this.hive, this.date, this.time] = this.getVideoInfo(this.videoUrl);
    }
  }

  /*resubmit
  * This function sends the hive choice as a 'getStreamVideo' message from a
  * context.  It will use service to send a message containing hive and videoUrl
  * This is meant for use by checkDuration.
  *
  * @params:
  *   hive: string     - the hive name that is currently being streamed
  *   videoUrl: string - the current videoUrl, which defines the current video
  *   service          - the calling object's socketio service object
  */
  public static resubmit(hive: string, videoUrl: string, service) {
    if (hive) {
      service.emit('getStreamVideo', {
        hive: hive,
        previous: videoUrl
      })
    }
  }

  /*reattempt
  * Reloads the video after a 10 second delay.
  *
  * @params:
  *   hive: string - the name of the hive currently being streamed
  */
  public reattempt(hive: string) {
    this.videoLoading = true;
    var url = this.checkUrl;
    this.checkUrl = null;
    setTimeout(StreamComponent.resubmit.bind(null, hive, url,
                                              this._videoService), 10000);
  }

  /*showTitle
  * This function takes the place of the condition for the video title div.
  * This has been implemented to simplify our angluar template and comply with
  * angular standards.
  */
  private showTitle() {
    return this.videoUrl && !this.error &&
            this.hive && this.date && this.time;
  }

  /*showVideo
  * this fucntion takes the place of the condition for the video div.
  * This has been implemented to simplify our angular template and comply with
  * angular standards.
  */
  private showVideo() {
    return this.videoUrl && !this.error;
  }

  /*onSubmit
  * This function sends the hive choice as a 'getStreamVideo' message.
  * The selection for the hives comes from the input box.
  *
  * @params:
  *   hive: string - the name of the hive currently being streamed
  */
  private onSubmit(hive: string) {
    if (hive != null && !this.videoLoading) {
      var message = {
        hive: hive,
        previous: this.videoUrl
      };
      this._videoService.emit('getStreamVideo', message);
    }
  }

  /*getVideoInfo
  * This function handles the formatting of the video's hive, date, and time
  * into a human readable format to be displayed.
  *
  * @params:
  *   The videoUrl value to be split up into  a readable format.
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

  /*beforeunloadHandler
  * This function handles the user closing the window.  It sends the
  * 'closeSession' signal to make sure that the server cleans up the video
  * that the client was streaming.
  *
  * @params:
  *   event - the event to be handled.  In this case it is ignored as the method
  *            invocation is bouind to an event.
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
  * Have to stop listening for 'hiveList', 'dateList', and 'timeList'.
  */
  public ngOnDestroy() {
    this._videoService.emit('closeSession', {video: this.videoUrl});
    this._videoService.removeListener('streamHiveList');
    this._videoService.removeListener('streamRequestRecieved');
    this._videoService.removeListener('streamReady');
  }
}
