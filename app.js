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
    let chapterCount = 0;
    let chapters = [];
    let paragraph = { size: 0, verses: [] };
    let line;
    let finishChapter = () => {
        finishParagraph();
        if (chapter.number || chapter.paragraphs.length) {
            chapter.size = chapter.paragraphs.reduce((size, paragraph) => size + paragraph.size, 0);
            chapters.push(chapter);
        }
        chapter = { number: +line, paragraphs: [], size: 0 };
    };
    let finishParagraph = () => {
        if (paragraph.verses.length) {
            paragraph.size = paragraph.verses.reduce((size, verse) => size + verse.text.length, 0);
            chapter.paragraphs.push(paragraph);
        }
        paragraph = { size: 0, verses: [] };
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
                doc.title = line;
                break;
            }
            case 'id': {
                doc.id = line.slice(0, line.search(/\s|$/));
                break;
            }
            case 'imt1':
            case 'mt1': {
                break;
            }
            case 'p': {
                finishParagraph();
                break;
            }
            case 'toc1':
            case 'toc2':
            case 'toc3': {
                break;
            }
            default: {
                line = line.replace(/\|[^\\]*/g, '');
                line = line.replace(/\\f\b.*?\\f\*/g, '');
                line = line.replace(/\\x\b.*?\\x\*/g, '');
                line = line.replace(/\\\+?\w+\*?/g, '');
                line = line.replace(/\xb0|\xb6/g, '');
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
    }
    else {
        doc.chapterSizes = chapters.map(chapter => chapter.size);
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
        this.setState({});
        this.shuffle();
    }
    guess(guess) {
        this.setState({ guess });
    }
    render() {
        let { actual, chapter, guess, showAnswer } = this.state;
        let answer = showAnswer ? actual : undefined;
        return (preact_compat_es["createElement"]("div", { className: Object(lib_es2015["style"])(lib["fillParent"], lib["horizontal"]) },
            preact_compat_es["createElement"](view_ExcerptView, Object.assign({}, { chapter })),
            preact_compat_es["createElement"](view_LibraryView, Object.assign({ app: this }, { answer, guess }, this.props.library))));
    }
    showAnswer() {
        this.setState({ showAnswer: true });
    }
    shuffle() {
        let { library } = this.props;
        for (let volume of library.items) {
            volume.size = volume.items.reduce((size, doc) => size + doc.size, 0);
        }
        let end = library.items.reduce((size, volume) => size + volume.size, 0);
        let charIndex = random() * end;
        let { item: volume, offset: volumeOffset } = findIndexOffset(charIndex, library.items);
        let { index: docIndex, item: doc, offset } = findIndexOffset(volumeOffset, volume.items);
        let names = [volume.name, volume.items[docIndex].name];
        let { index: chapterIndex } = findIndexOffset(offset, doc.chapterSizes, size => size);
        this.setState({
            actual: { chapterIndex, names },
            chapter: undefined,
            chapterIndex,
            guess: undefined,
            showAnswer: false,
        });
        fetch(['texts', ...names].join('/')).then(response => {
            response.text().then(text => {
                let doc = usfmParse(text, true);
                this.setState({ chapter: doc.chapters[chapterIndex], chapterIndex });
            });
        });
    }
}
class view_ChapterView extends preact_compat_es["Component"] {
    constructor() {
        super(...arguments);
        this.onClick = () => {
            let { doc, index, guess } = this.props;
            let { volume } = doc.props;
            let { app } = volume.props.library.props;
            if (guess) {
                app.guess();
            }
            else {
                app.guess({
                    chapterIndex: index, names: [volume.props.name, doc.props.name],
                });
            }
        };
    }
    render() {
        let { answer, doc, guess, index } = this.props;
        let { library } = doc.props.volume.props;
        let className;
        if (answer) {
            className = Object(lib_es2015["style"])(Object.assign({ color: 'green', fontSize: '150%', fontWeight: 'bold' }, (guess && highlight)));
        }
        else {
            className = Object(lib_es2015["style"])(Object.assign({}, (guess && highlight), { $nest: !library.props.answer && {
                    '&:hover': highlight,
                } }));
        }
        return preact_compat_es["createElement"]("li", Object.assign({}, { className }, { ref: element => {
                if (answer) {
                    library.answerElement = element;
                }
            }, onClick: this.onClick }), index + 1);
    }
}
class view_DocView extends preact_compat_es["Component"] {
    constructor(props) {
        super(props);
        this.onClick = () => {
            let { name, volume } = this.props;
            let { library } = volume.props;
            if (!library.props.answer) {
                this.setState({ expanded: !this.state.expanded });
            }
        };
        this.setState({ expanded: !!props.answer });
    }
    render() {
        let { answer, guess, title, volume } = this.props;
        let { expanded } = this.state;
        return (preact_compat_es["createElement"]("div", null,
            preact_compat_es["createElement"]("div", { className: Object(lib_es2015["style"])({ $nest: { '&:hover': { fontWeight: 'bold' } } }), onClick: this.onClick }, title),
            preact_compat_es["createElement"]("ul", null, (answer || expanded || guess) && this.props.chapterSizes.map((_, chapterIndex) => preact_compat_es["createElement"](view_ChapterView, { answer: answer && answer.chapterIndex == chapterIndex ?
                    answer : undefined, doc: this, guess: guess && guess.chapterIndex == chapterIndex ? guess : undefined, index: chapterIndex })))));
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
            let { answer, app } = this.props;
            if (answer) {
                app.shuffle();
            }
            else {
                app.showAnswer();
            }
        };
    }
    componentDidUpdate() {
        let { answerElement } = this;
        if (answerElement) {
            answerElement.scrollIntoView({ behavior: 'smooth' });
        }
    }
    render() {
        let { answer, guess } = this.props;
        if (!answer) {
            this.answerElement = undefined;
        }
        return (preact_compat_es["createElement"]("div", { className: Object(lib_es2015["style"])(lib["content"], lib["vertical"], Object(lib["width"])('25%')) },
            preact_compat_es["createElement"]("div", { className: Object(lib_es2015["style"])(lib["flex"], Object(lib["margin"])(0), Object(lib["padding"])(0, '1em'), lib["scrollY"], { cursor: 'default' }) }, this.props.items.map(volume => preact_compat_es["createElement"]("p", null,
                preact_compat_es["createElement"](view_VolumeView, Object.assign({ answer: answer && answer.names[0] == volume.name ? answer : undefined, guess: guess && guess.names[0] == volume.name ? guess : undefined, key: volume.name, library: this }, volume))))),
            preact_compat_es["createElement"]("div", { className: Object(lib_es2015["style"])(lib["content"], Object(lib["padding"])('1em')) },
                preact_compat_es["createElement"]("button", { disabled: !guess, onClick: this.makeGuess, type: 'button' }, answer ? "Next Excerpt" : "Make Guess"))));
    }
}
class view_VolumeView extends preact_compat_es["Component"] {
    render() {
        let { answer, guess } = this.props;
        return (preact_compat_es["createElement"]("div", null,
            this.props.title,
            preact_compat_es["createElement"]("ul", null, this.props.items.map(doc => preact_compat_es["createElement"]("li", null,
                preact_compat_es["createElement"](view_DocView, Object.assign({}, doc, { answer: answer && answer.names[1] == doc.name ? answer : undefined, guess: guess && guess.names[1] == doc.name ? guess : undefined, key: doc.name, volume: this })))))));
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