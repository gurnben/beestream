System.register(["@angular/core", "./archive.service"], function (exports_1, context_1) {
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
    var core_1, archive_service_1, ArchiveComponent;
    return {
        setters: [
            function (core_1_1) {
                core_1 = core_1_1;
            },
            function (archive_service_1_1) {
                archive_service_1 = archive_service_1_1;
            }
        ],
        execute: function () {
            ArchiveComponent = class ArchiveComponent {
                /*Constructor for ArchiveComponent
                *
                * Gets the archiveServices and puts it in the _archiveService attribute
                */
                constructor(_archiveService) {
                    this._archiveService = _archiveService;
                }
                /*This overrides the ngOnInit function to add additional functionality.
                *
                * This initializes arrays for each option list, starts our listeners for the
                * list events from socketio, and emits the initial getHive message to get the
                * hive list.
                *
                */
                ngOnInit() {
                    this.hives = new Array();
                    this.hives.push("Test Hive");
                    this.dates = new Array();
                    this.times = new Array();
                    this._archiveService.on('hiveList', (hvlst) => {
                        this.hives.push(hvlst);
                    });
                    this._archiveService.on('dateList', (dtlst) => {
                        this.dates.push(dtlst);
                    });
                    this._archiveService.on('timeList', (tilst) => {
                        this.times.push(tilst);
                    });
                    this._archiveService.emit('getHive', {});
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
                        text: this.dateSelect
                    };
                    this._archiveService.emit('getTime', message);
                }
                /*This function sends the Time choice as a socket.io sendTime message.
                *
                * The timeSelect field's current status is sent.
                */
                respondTime() {
                    var message = {
                        text: this.timeSelect
                    };
                    this._archiveService.emit('sendTime', message);
                }
                /*This function makes sure that our socket removes its listeners when the
                * connection is destroyed/browser is closed.
                *
                * Have to stop listening for 'hiveList', 'dateList', and 'timeList'.
                */
                ngOnDestroy() {
                    this._archiveService.removeListener('hiveList');
                    this._archiveService.removeListener('dateList');
                    this._archiveService.removeListener('timeList');
                }
            };
            ArchiveComponent = __decorate([
                core_1.Component({
                    selector: 'archive',
                    templateUrl: './app/archive/archive.template.html'
                }),
                __metadata("design:paramtypes", [archive_service_1.ArchiveService])
            ], ArchiveComponent);
            exports_1("ArchiveComponent", ArchiveComponent);
        }
    };
});
//# sourceMappingURL=archive.component.js.map