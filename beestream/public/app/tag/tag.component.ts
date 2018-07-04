import { Component,
         Input,
         OnDestroy,
         OnChanges,
         SimpleChange } from '@angular/core';
import { NgForm } from '@angular/forms';
import { VideoService } from '../video/video.service';

/* This component displays a lsit of tags and options for adding tags.
*/
@Component({
  selector: 'tags',
  templateUrl: '/app/tag/tag.template.html',
  providers: [VideoService]
})
export class TagComponent implements OnChanges, OnDestroy{
  @Input() video: any;
  hive: string;
  date: string;
  time: string;
  displayTime: string;
  tags: Array<any> = [];
  tagNames: Array<any> = [];
  modified: Array<any> = [];
  errors: Array<any>;

  /*Constructor for TagComponent
  *
  * Gets the videoservice and puts it in the _ioService attribute
  */
  constructor(private _ioService: VideoService) {}

  /*This overrides the ngOnInit function to add additional functionality.
  *
  */
  ngOnInit() {
    //Handles errors associated wtih saving tags.
    this._ioService.on('tagError', (message) => {
      this.errors.push(message.message);
      console.log(`Recieved an error: ${message.message}`);
    });
    //Handles successful saving of tags.  Requests new list of comments.
    this._ioService.on('tagSuccess', (message) => {
      var videoDate = new Date(`${this.date.substr(6, 4)}-${this.date.substr(0, 2)}-${this.date.substr(3, 2)}T${this.time}`)
      this._ioService.emit('getTags', {
        hive: this.hive,
        datetime: videoDate
      });
    });
    //Handler for recieving and populating a list of comments.
    this._ioService.on('tagList', (message) => {
      this.tags = message.tags;
      this.tags.sort((a, b) => {
        var diff = b.count - a.count;
        if (diff == 0 && a.name < b.name) {
          diff = -1;
        }
        if (diff == 0 && a.name > b.name) {
          diff = 1;
        }
        return diff;
      })
      for (var tag of message.tags) {
        this.tagNames.push(tag.name);
      }
    });
    this._ioService.emit('getTags', {
      hive: this.hive,
      datetime: new Date(`${this.date.substr(6, 4)}-${this.date.substr(0, 2)}-${this.date.substr(3, 2)}T${this.time}`)
    });
  }

  /*This method handles variable changes.
  * Whenever the video source changes, we process that source breaking it up
  * into hive, date, and time.
  */
  ngOnChanges(changes: {[propKey: string]: SimpleChange}) {
    if (changes['video'].currentValue != null) {
      var newVideo = changes['video'].currentValue;
      newVideo = newVideo.split('/')[2];
      [this.hive, this.date, this.time] = newVideo.split('@');
      this.time = this.time.replace(/-/g, ':');
      this.displayTime = +this.time.substr(0, 2) > 12 ?
        `${+this.time.substr(0, 2) - 12}${this.time.substr(2, 7)}PM` :
        `${this.time}AM`;
      this.date = `${this.date.substr(5, 2)}/${this.date.substr(8, 2)}/${this.date.substr(0, 4)}`;
      this._ioService.emit('getTags', {
        hive: this.hive,
        datetime: new Date(`${this.date.substr(6, 4)}-${this.date.substr(0, 2)}-${this.date.substr(3, 2)}T${this.time}`)
      });
      this.modified = [];
    }
  }

  /*This method is a handler for our tag submission.
  * This will emit the proper socket.io message to store the tag.
  */
  submitTag(tag: any, hive: string, date: string, time: string) {
    if (this.tagNames.includes(tag.name) && !this.modified.includes(tag.name)) {
      var videoDate = new Date(`${date.substr(6, 4)}-${date.substr(0, 2)}-${date.substr(3, 2)}T${time}`);
      this._ioService.emit('newTag', {
        tag: tag.name,
        hive: hive,
        datetime: videoDate
      });
      this.modified.push(tag.name);
    }
    else if (this.modified.includes(tag.name)) {
      var videoDate = new Date(`${date.substr(6, 4)}-${date.substr(0, 2)}-${date.substr(3, 2)}T${time}`);
      this._ioService.emit('decrementTag', {
        tag: tag.name,
        hive: hive,
        datetime: videoDate
      });
      this.modified.splice(this.modified.findIndex((x) => {return x === tag.name}), 1);
    }
  }

  /*This function makes sure that our socket removes its listeners when the
  * connection is destroyed/browser is closed.
  *
  * Have to stop listening for 'tagList', 'tagSuccess', 'tagError'
  */
  ngOnDestroy() {
    this._ioService.removeListener('tagList');
    this._ioService.removeListener('tagSuccess');
    this._ioService.removeListener('tagError');
  }
}
