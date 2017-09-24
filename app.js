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
    let chapter = { paragraphs: [], size: 0 };
    let chapters = [];
    let paragraph = { size: 0, verses: [] };
    let line;
    let finishChapter = () => {
        if (includeText) {
            finishParagraph();
            if (chapter.number || chapter.paragraphs.length) {
                chapter.size = chapter.paragraphs.reduce((size, paragraph) => size + paragraph.size, 0);
                chapters.push(chapter);
            }
            chapter = { number: +line, paragraphs: [], size: 0 };
        }
    };
    let finishParagraph = () => {
        if (includeText) {
            if (paragraph.verses.length) {
                paragraph.size = paragraph.verses.reduce((size, verse) => size + verse.text.length, 0);
                chapter.paragraphs.push(paragraph);
            }
            paragraph = { size: 0, verses: [] };
        }
    };
    for (line of text.split('\n')) {
        line = line.trim();
        let split = line.search(/\s|$/);
        let type = line.slice(1, split);
        line = line.slice(split).trim();
        switch (type) {
            case 'c': {
                finishChapter();
                break;
            }
            case 'h': {
                doc.title = stripTag(line);
                break;
            }
            case 'id':
            case 'toc1':
            case 'toc2':
            case 'toc3': {
                break;
            }
            case 'imt1':
            case 'mt1': {
                doc.titleFull = stripTag(line);
                break;
            }
            case 'p': {
                finishParagraph();
                break;
            }
            default: {
                line = line.replace(/\|[^\\]*/g, '');
                line = line.replace(/\\f\b.*?\\f\*/g, '');
                line = line.replace(/\\\+?\w+\*?/g, '');
                line = line.replace('\xb6', '');
                let number;
                switch (type) {
                    case 'v': {
                        let split = line.search(/\s|$/);
                        number = +line.slice(0, split);
                        line = line.slice(split).trim();
                        break;
                    }
                    default: break;
                }
                paragraph.verses.push({ number, text: line });
                lines.push(line);
                size += line.length + 1;
            }
        }
    }
    finishChapter();
    doc.size = size;
    if (includeText) {
        doc.chapters = chapters;
        doc.text = lines.join('\n') + '\n';
    }
    return doc;
}
function findIndexOffset(offset, items, sizer) {
    if (!sizer) {
        sizer = (item) => item.size;
    }
    let end = 0;
    let chapterBegins = items.map(item => {
        let prev = end;
        end += sizer(item);
        return prev;
    });
    let itemIndex = 0;
    let itemBegin = chapterBegins.reverse().find((chapterBegin, index) => {
        itemIndex = chapterBegins.length - index - 1;
        return chapterBegin <= offset;
    }) || 0;
    let item = items[itemIndex];
    return { index: itemIndex, item, offset: offset - itemBegin };
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
        this.shuffle();
    }
    render() {
        let { chapter, selected } = this.state;
        return (preact_compat_es["createElement"]("div", { className: Object(lib_es2015["style"])(lib["fillParent"], lib["horizontal"]) },
            preact_compat_es["createElement"](view_ExcerptView, Object.assign({}, { chapter })),
            preact_compat_es["createElement"](view_LibraryView, Object.assign({ app: this }, { selected }, this.props.library))));
    }
    select(path) {
        console.log('select', path);
        this.setState({ selected: path });
    }
    shuffle() {
        let { library } = this.props;
        for (let volume of library.items) {
            volume.size = volume.items.reduce((size, doc) => size + doc.size, 0);
        }
        let end = library.items.reduce((size, volume) => size + volume.size, 0);
        let charIndex = random() * end;
        let { item: volume, offset: volumeOffset } = findIndexOffset(charIndex, library.items);
        let { index: docIndex, offset } = findIndexOffset(volumeOffset, volume.items);
        let path = [volume.name, volume.items[docIndex].name];
        this.setState({
            chapter: undefined, chapterIndex: undefined, path, selected: undefined,
        });
        fetch(['texts', ...path].join('/')).then(response => {
            response.text().then(text => {
                let doc = usfmParse(text, true);
                let { index: chapterIndex, item: chapter, offset: chapterOffset } = findIndexOffset(offset, doc.chapters);
                console.log(path, chapterIndex);
                text = doc.text;
                console.log(offset, text.length);
                this.setState({ chapter, chapterIndex });
            });
        });
    }
}
class view_DocView extends preact_compat_es["Component"] {
    constructor() {
        super(...arguments);
        this.onClick = () => {
            let { name, volume } = this.props;
            volume.props.library.props.app.select([volume.props.name, name]);
        };
    }
    render() {
        return (preact_compat_es["createElement"]("div", { className: Object(lib_es2015["style"])(Object.assign({}, (this.props.selected && highlight), { $nest: {
                    '&:hover': highlight,
                } })), onClick: this.onClick }, this.props.title));
    }
}
class view_ExcerptView extends preact_compat_es["PureComponent"] {
    componentDidUpdate() {
        let { container } = this;
        if (container) {
            let extraHeight = container.scrollHeight - container.offsetHeight;
            let offset = extraHeight * random();
            container.scrollTop = offset;
        }
    }
    render() {
        let { chapter } = this.props;
        return (preact_compat_es["createElement"]("div", { className: Object(lib_es2015["style"])(lib["flex"], {
                fontFamily: 'Excerpt',
                fontSize: '200%',
            }, Object(lib["padding"])(0, '1em'), lib["scrollY"]), ref: element => this.container = element }, chapter && chapter.paragraphs.map((paragraph, paragraphIndex) => preact_compat_es["createElement"]("p", { className: Object(lib_es2015["style"])({
                margin: '0.3em auto',
                maxWidth: '30em',
                textIndent: '1.5em',
                $nest: {
                    '&:first-child': {
                        marginTop: '1em',
                    },
                    '&:last-child': {
                        marginBottom: '1em',
                    },
                },
            }) }, paragraph.verses.map(verse => preact_compat_es["createElement"]("span", null,
            verse.text,
            " "))))));
    }
}
class view_LibraryView extends preact_compat_es["Component"] {
    constructor() {
        super(...arguments);
        this.makeGuess = () => {
            this.props.app.shuffle();
        };
    }
    render() {
        let { selected } = this.props;
        return (preact_compat_es["createElement"]("div", { className: Object(lib_es2015["style"])(lib["content"], lib["vertical"], Object(lib["width"])('25%')) },
            preact_compat_es["createElement"]("div", { className: Object(lib_es2015["style"])(lib["flex"], Object(lib["margin"])(0), Object(lib["padding"])(0, '1em'), lib["scrollY"], { cursor: 'default' }) }, this.props.items.map(volume => preact_compat_es["createElement"]("p", null,
                preact_compat_es["createElement"](view_VolumeView, Object.assign({ key: volume.name, library: this }, volume, { selected: selected && volume.name == selected[0] ? selected[1] : undefined }))))),
            preact_compat_es["createElement"]("div", { className: Object(lib_es2015["style"])(lib["content"], Object(lib["padding"])('1em')) },
                preact_compat_es["createElement"]("button", { disabled: !selected, onClick: this.makeGuess, type: 'button' }, "Make Guess"))));
    }
}
class view_VolumeView extends preact_compat_es["Component"] {
    render() {
        let { selected } = this.props;
        return (preact_compat_es["createElement"]("div", null,
            this.props.title,
            preact_compat_es["createElement"]("ul", null, this.props.items.map(doc => preact_compat_es["createElement"]("li", null,
                preact_compat_es["createElement"](view_DocView, Object.assign({ key: doc.name, selected: selected == doc.name, volume: this }, doc)))))));
    }
}
function random() {
    let ints = new Uint8Array(8);
    crypto.getRandomValues(ints);
    ints[7] = 0x3f;
    ints[6] |= 0xf0;
    return new DataView(ints.buffer).getFloat64(0, true) - 1;
}
let highlight = {
    background: 'silver',
    fontWeight: 'bold',
};

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