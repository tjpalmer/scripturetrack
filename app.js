webpackJsonp([0],{

/***/ 11:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });

// CONCATENATED MODULE: ./src/usfm.ts
function usfmParse(text, includeText) {
    let doc = {};
    let lines = [];
    let size = 0;
    for (let line of text.split('\n')) {
        line = line.trim();
        // TODO Extract start first.
        if (line.startsWith('\\h')) {
            doc.title = stripTag(line);
        }
        else if (line.startsWith('\\mt1') || line.startsWith('\\imt1')) {
            doc.titleFull = stripTag(line);
        }
        else {
            // Remove Strong's references.
            line = line.replace(/\|[^\\]*/g, '');
            // Remove footnotes.
            line = line.replace(/\\f\b.*?\\f\*/g, '');
            // Remove other tags.
            line = line.replace(/\\\+?\w+\*?/g, '');
            lines.push(line);
            size += line.length + 1;
        }
    }
    doc.size = size;
    if (includeText) {
        doc.text = lines.join('\n') + '\n';
    }
    return doc;
}
function stripTag(line) {
    return line.replace(/^\S+\s+/, '');
}

// EXTERNAL MODULE: ./node_modules/csstips/lib/index.js
var lib = __webpack_require__(3);
var lib_default = /*#__PURE__*/__webpack_require__.n(lib);

// EXTERNAL MODULE: ./node_modules/preact-compat/dist/preact-compat.es.js
var preact_compat_es = __webpack_require__(2);

// EXTERNAL MODULE: ./node_modules/typestyle/lib.es2015/index.js + 3 modules
var lib_es2015 = __webpack_require__(1);

// CONCATENATED MODULE: ./src/view.tsx





class view_AppView extends preact_compat_es["Component"] {
    constructor(props) {
        super(props);
        let { library } = props;
        let end = 0;
        let begins = library.items.map(volume => volume.items.map(doc => {
            let prev = end;
            end += doc.size;
            return prev;
        }));
        let charIndex = random() * end;
        let volumeIndex = -1;
        let volumeBegins = begins.reverse().find((docBegins, index) => {
            volumeIndex = begins.length - index - 1;
            return docBegins[0] <= charIndex;
        });
        let docIndex = -1;
        let docBegin = volumeBegins.reverse().find((docBegin, index) => {
            docIndex = volumeBegins.length - index - 1;
            return docBegin <= charIndex;
        });
        console.log(charIndex, volumeIndex, docIndex, library.items[volumeIndex].items[docIndex]);
        let volume = library.items[volumeIndex];
        let path = [volume.key, volume.items[docIndex].key];
        let offset = charIndex - docBegin;
        fetch(['texts', ...path].join('/')).then(response => {
            response.text().then(text => {
                text = usfmParse(text, true).text;
                console.log(offset, text.length);
                this.setState({ text });
            });
        });
        this.setState({ offset, path });
    }
    render() {
        let { offset, text } = this.state;
        return (preact_compat_es["createElement"]("div", { className: Object(lib_es2015["style"])(lib["fillParent"], lib["horizontal"]) },
            preact_compat_es["createElement"]("div", { className: Object(lib_es2015["style"])(lib["flex"], {
                    fontFamily: ['Excerpt', 'sans-serif'],
                    fontSize: '200%',
                }, Object(lib["padding"])(0, '1em'), lib["scrollY"]) },
                preact_compat_es["createElement"]("p", null, text && text.slice(offset, offset + 1000))),
            preact_compat_es["createElement"](view_LibraryView, Object.assign({}, this.props.library))));
    }
}
class view_DocView extends preact_compat_es["Component"] {
    render() {
        return (preact_compat_es["createElement"]("div", null, this.props.title));
    }
}
class view_LibraryView extends preact_compat_es["Component"] {
    render() {
        return (preact_compat_es["createElement"]("div", { className: Object(lib_es2015["style"])(lib["content"], Object(lib["margin"])(0), Object(lib["padding"])(0, '1em'), lib["scrollY"], Object(lib["width"])('25%')) }, this.props.items.map(volume => preact_compat_es["createElement"]("p", null,
            preact_compat_es["createElement"](view_VolumeView, Object.assign({}, volume))))));
    }
}
class view_VolumeView extends preact_compat_es["Component"] {
    render() {
        return (preact_compat_es["createElement"]("div", null,
            this.props.title,
            preact_compat_es["createElement"]("ul", null, this.props.items.map(doc => preact_compat_es["createElement"]("li", null,
                preact_compat_es["createElement"](view_DocView, Object.assign({}, doc)))))));
    }
}
function random() {
    let ints = new Uint8Array(8);
    crypto.getRandomValues(ints);
    ints[7] = 0x3f;
    ints[6] |= 0xf0;
    return new DataView(ints.buffer).getFloat64(0, true) - 1;
}

// CONCATENATED MODULE: ./src/index.ts



// CONCATENATED MODULE: ./src/main.tsx
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};





function init() {
    return __awaiter(this, void 0, void 0, function* () {
        document.getElementById('preload').remove();
        Object(lib["normalize"])();
        Object(lib["setupPage"])('#root');
        let library = yield (yield fetch('texts/texts.json')).json();
        let app = { library, path: [] };
        Object(preact_compat_es["render"])(preact_compat_es["createElement"](view_AppView, Object.assign({}, app)), document.getElementById('root'));
    });
}
window.addEventListener('load', init);
class main_Clock extends preact_compat_es["Component"] {
    constructor(props) {
        super(props);
        this.state = { date: new Date() };
    }
    componentDidMount() {
        this.timerID = window.setInterval(() => this.tick(), 1000);
    }
    componentWillUnmount() {
        clearInterval(this.timerID);
    }
    tick() {
        this.setState({ date: new Date() });
    }
    render() {
        return (preact_compat_es["createElement"]("div", null,
            preact_compat_es["createElement"]("h1", null, "Hello, world!"),
            preact_compat_es["createElement"]("h2", null,
                "It is ",
                this.state.date.toLocaleTimeString(),
                ".")));
    }
}


/***/ })

},[11]);