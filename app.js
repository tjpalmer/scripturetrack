webpackJsonp([0],{

/***/ 7:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_react__ = __webpack_require__(1);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1_react_dom__ = __webpack_require__(1);
/// <reference path="../node_modules/@types/react/index.d.ts" />


function init() {
    __WEBPACK_IMPORTED_MODULE_1_react_dom__["render"](__WEBPACK_IMPORTED_MODULE_0_react__["createElement"](Clock, null), 
    // document.getElementById('root'),
    document.body);
}
window.addEventListener('load', init);
class Clock extends __WEBPACK_IMPORTED_MODULE_0_react__["Component"] {
    constructor(props) {
        super(props);
        this.state = { date: new Date() };
    }
    componentDidMount() {
        this.timerID = setInterval(() => this.tick(), 1000);
    }
    componentWillUnmount() {
        clearInterval(this.timerID);
    }
    tick() {
        this.setState({ date: new Date() });
    }
    render() {
        return (__WEBPACK_IMPORTED_MODULE_0_react__["createElement"]("div", null,
            __WEBPACK_IMPORTED_MODULE_0_react__["createElement"]("h1", null, "Hello, world!"),
            __WEBPACK_IMPORTED_MODULE_0_react__["createElement"]("h2", null,
                "It is ",
                this.state.date.toLocaleTimeString(),
                ".")));
    }
}


/***/ })

},[7]);