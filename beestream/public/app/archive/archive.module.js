System.register(["@angular/core", "@angular/common", "@angular/router", "./archive.routes", "./archive.component", "./archive.service"], function (exports_1, context_1) {
    "use strict";
    var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
        var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
        if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
        else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
        return c > 3 && r && Object.defineProperty(target, key, r), r;
    };
    var __moduleName = context_1 && context_1.id;
    var core_1, common_1, router_1, archive_routes_1, archive_component_1, archive_service_1, ArchiveModule;
    return {
        setters: [
            function (core_1_1) {
                core_1 = core_1_1;
            },
            function (common_1_1) {
                common_1 = common_1_1;
            },
            function (router_1_1) {
                router_1 = router_1_1;
            },
            function (archive_routes_1_1) {
                archive_routes_1 = archive_routes_1_1;
            },
            function (archive_component_1_1) {
                archive_component_1 = archive_component_1_1;
            },
            function (archive_service_1_1) {
                archive_service_1 = archive_service_1_1;
            }
        ],
        execute: function () {
            ArchiveModule = class ArchiveModule {
            };
            ArchiveModule = __decorate([
                core_1.NgModule({
                    imports: [
                        common_1.CommonModule,
                        router_1.RouterModule.forChild(archive_routes_1.ArchiveRoutes)
                    ],
                    declarations: [
                        archive_component_1.ArchiveComponent
                    ],
                    providers: [
                        archive_service_1.ArchiveService
                    ]
                })
            ], ArchiveModule);
            exports_1("ArchiveModule", ArchiveModule);
        }
    };
});
//# sourceMappingURL=archive.module.js.map