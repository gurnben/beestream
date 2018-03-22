/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = "./public/app/app.module.ts");
/******/ })
/************************************************************************/
/******/ ({

/***/ "./public/app/app.module.ts":
/*!**********************************!*\
  !*** ./public/app/app.module.ts ***!
  \**********************************/
/*! no static exports found */
/***/ (function(module, exports) {

eval("(void 0)([\"@angular/core\", \"@angular/platform-browser\", \"@angular/router\", \"@angular/http\", \"./app.component\", \"./app.routes\"], function (exports_1, context_1) {\n    \"use strict\";\n    var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {\n        var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;\n        if (typeof Reflect === \"object\" && typeof Reflect.decorate === \"function\") r = Reflect.decorate(decorators, target, key, desc);\n        else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;\n        return c > 3 && r && Object.defineProperty(target, key, r), r;\n    };\n    var __moduleName = context_1 && context_1.id;\n    var core_1, platform_browser_1, router_1, http_1, app_component_1, app_routes_1, AppModule;\n    return {\n        setters: [\n            function (core_1_1) {\n                core_1 = core_1_1;\n            },\n            function (platform_browser_1_1) {\n                platform_browser_1 = platform_browser_1_1;\n            },\n            function (router_1_1) {\n                router_1 = router_1_1;\n            },\n            function (http_1_1) {\n                http_1 = http_1_1;\n            },\n            function (app_component_1_1) {\n                app_component_1 = app_component_1_1;\n            },\n            function (app_routes_1_1) {\n                app_routes_1 = app_routes_1_1;\n            }\n        ],\n        execute: function () {\n            AppModule = class AppModule {\n            };\n            AppModule = __decorate([\n                core_1.NgModule({\n                    imports: [\n                        platform_browser_1.BrowserModule,\n                        http_1.HttpModule,\n                        router_1.RouterModule.forRoot(app_routes_1.AppRoutes)\n                    ],\n                    declarations: [\n                        app_component_1.AppComponent\n                    ],\n                    bootstrap: [app_component_1.AppComponent]\n                })\n            ], AppModule);\n            exports_1(\"AppModule\", AppModule);\n        }\n    };\n});\n\n\n//# sourceURL=webpack:///./public/app/app.module.ts?");

/***/ })

/******/ });