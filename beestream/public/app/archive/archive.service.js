System.register(["rxjs/Rx", "@angular/core"], function (exports_1, context_1) {
    "use strict";
    var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
        var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
        if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
        else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
        return c > 3 && r && Object.defineProperty(target, key, r), r;
    };
    var __metadata = (this && this.__metadata) || function (k, v) {
        if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
    };
    var __moduleName = context_1 && context_1.id;
    var core_1, io, ArchiveService;
    return {
        setters: [
            function (_1) {
            },
            function (core_1_1) {
                core_1 = core_1_1;
            }
        ],
        execute: function () {
            io = require('socket.io-client');
            ArchiveService = class ArchiveService {
                constructor() {
                    this.socket = io('http://localhost:3000');
                }
                /* This method will respond to all socket.on calls and pass them through. */
                on(eventName, callback) {
                    if (this.socket) {
                        this.socket.on(eventName, function (data) {
                            callback(data);
                        });
                    }
                }
                ;
                /* This method will respond to all socket.emit calls and pass them through. */
                emit(eventName, data) {
                    if (this.socket) {
                        this.socket.emit(eventName, data);
                    }
                }
                ;
                /* This method will respond to socket.removeListener calls. */
                removeListener(eventName) {
                    if (this.socket) {
                        this.socket.removeListener(eventName);
                    }
                }
                ;
            };
            ArchiveService = __decorate([
                core_1.Injectable(),
                __metadata("design:paramtypes", [])
            ], ArchiveService);
            exports_1("ArchiveService", ArchiveService);
        }
    };
});
//# sourceMappingURL=archive.service.js.map