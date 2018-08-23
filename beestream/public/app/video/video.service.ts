import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
const io = require('socket.io-client');

/*VideoService
* This class acts as a wrapper for socket.io communications for all of our
* clientside modules.  As such, it is an injectable RXJS service.
*/
@Injectable()
export class VideoService {
  private socket: any;

  public constructor() {
    this.socket = io();
  }

  /*on
  * This method will handle all socket.on calls and intialize a socket listener
  * with the appropriate callback function.
  *
  * @params:
  *   eventName - the name of the event that we want to listen for.
  *   callback  - the callback to be mapped to the event listener.
  */
  public on(eventName, callback) {
    if (this.socket) {
      this.socket.on(eventName, function(data) {
        callback(data);
      });
    }
  }

  /*emit
  * This method will emit a socket.io message with specified data.
  *
  * @params:
  *   eventName - the name of the event to emit.
  *   data      - the data to send with our message/event.
  */
  public emit(eventName, data) {
    if (this.socket) {
      this.socket.emit(eventName, data);
    }
  }

  /*removeListener
  * This method will remove the listener for a specified eventName.
  *
  * @params:
  *   eventName - the event name to remove the listener for.
  */
  public removeListener(eventName) {
    if (this.socket) {
      this.socket.removeListener(eventName);
    }
  }
}
