import { Component, HostListener, OnDestroy } from '@angular/core';
import { NgForm } from '@angular/forms'
import { ArchiveService } from './archive.service';

/* This component displays the article video chooser and plays a chosen video.
*
* This file uses the archive service to handle socket interactions.
*/
@Component({
  selector: 'archive',
  templateUrl: './app/archive/archive.template.html',
  providers: [ArchiveService]
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

  /*Constructor for ArchiveComponent
  *
  * Gets the archiveServices and puts it in the _archiveService attribute
  */
  constructor(private _archiveService: ArchiveService) {}

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

    this._archiveService.on('hiveList', (hvlst) => {
      this.hives = hvlst.hiveNames;
      this.dates = new Array();
      this.times = new Array();
    });
    this._archiveService.on('dateList', (dtlst) => {
      this.dates = dtlst.dates;
      this.times = new Array();
    });
    this._archiveService.on('timeList', (tilst) => {
      this.times = tilst.times;
    });
    this._archiveService.on('videoRequestRecieved', (data) => {
      this.videoLoading = true;
      console.log(data);
    });
    this._archiveService.on('videoReady', (vidURL) => {
      this.videoLoading = false;
      this.videoUrl = vidURL.url;
    })
    this._archiveService.emit('getHive', {})
  }

  /*This function sends the hive choice as a socket.io getDate message.
  *
  * The hiveSelect field's current status is sent.
  */
  respondHive() {
    var message = {
      text: this.hiveSelect
    };
    this._archiveService.emit('getDate', message);
  }

  /*This function sends the date choice as a socket.io getTime message.
  *
  * The dateSelect field's current status is sent.
  */
  respondDate() {
    var message = {
      hive: this.hiveSelect,
      date: this.dateSelect
    };
    this._archiveService.emit('getTime', message);
  }

  /*This function sends the Time choice as a socket.io sendTime message.
  *
  * The timeSelect field's current status is sent.
  */
  onSubmit() {
    var message = {
      hive: this.hiveSelect,
      date: this.dateSelect,
      time: this.timeSelect,
      previous: this.videoUrl
    };
    this._archiveService.emit('getVideo', message);
  }

  /*This function handles the user closing the window.  It sends the
  * 'closeSession' signal to make sure that the server cleans up the video
  * that the client was streaming.
  */
  @HostListener('window:beforeunload', ['$event'])
  beforeunloadHandler(event) {
    this._archiveService.emit('closeSession', {video: this.videoUrl});
  }

  /*This function makes sure that our socket removes its listeners when the
  * connection is destroyed/browser is closed.
  *
  * Have to stop listening for 'hiveList', 'dateList', and 'timeList'.
  */
  ngOnDestroy() {
    this._archiveService.emit('closeSession', {video: this.videoUrl});
    this._archiveService.removeListener('hiveList');
    this._archiveService.removeListener('dateList');
    this._archiveService.removeListener('timeList');
    this._archiveService.removeListener('videoRequestRecieved');
    this._archiveService.removeListener('videoReady');
  }
}
