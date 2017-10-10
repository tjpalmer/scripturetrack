webpackJsonp([0],{

/***/ 11:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });

// CONCATENATED MODULE: ./src/util.ts
function random() {
    let ints = new Uint8Array(8);
    crypto.getRandomValues(ints);
    ints[7] = 0x3f;
    ints[6] |= 0xf0;
    return new DataView(ints.buffer).getFloat64(0, true) - 1;
}
function sum(numbers) {
    let sum = 0;
    for (let number of numbers) {
        sum += number;
    }
    return sum;
}

// CONCATENATED MODULE: ./src/text.ts

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
function findLibraryTextOffset(library, path) {
    let offset = 0;
    for (let volume of library.items) {
        if (volume.name == path.names[0]) {
            for (let doc of volume.items) {
                if (doc.name == path.names[1]) {
                    let { chapterSizes } = doc;
                    if (!chapterSizes) {
                        chapterSizes = doc.chapters.map(chapter => chapter.size);
                    }
                    chapterSizes = chapterSizes.slice(0, path.chapterIndex + 1);
                    offset += sum(chapterSizes) - chapterSizes.slice(-1)[0] / 2;
                    return offset;
                }
                else {
                    offset += doc.size;
                }
            }
        }
        else {
            offset += volume.size;
        }
    }
    throw new Error('path not found');
}

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
        this.setState({
            count: 0,
            outcomes: [],
            quizLength: 5,
        });
        this.shuffle();
    }
    guess(guess) {
        this.setState({ guess });
    }
    render() {
        let { actual, chapter, count, guess, showAnswer } = this.state;
        let answer = showAnswer ? actual : undefined;
        return (preact_compat_es["createElement"]("div", { className: Object(lib_es2015["style"])(lib["fillParent"], lib["horizontal"]) },
            preact_compat_es["createElement"](view_ExcerptView, Object.assign({}, { chapter })),
            preact_compat_es["createElement"](view_LibraryView, Object.assign({ app: this }, { answer, count, guess }, this.props.library))));
    }
    showAnswer() {
        let { actual, guess, outcomes } = this.state;
        let score = scoreGuess(this.props.library, actual, guess);
        outcomes = outcomes.slice();
        outcomes.push({ actual: actual, guess: guess, score });
        this.setState({ outcomes, showAnswer: true });
    }
    shuffle() {
        let { library } = this.props;
        let { outcomes, quizLength } = this.state;
        for (let volume of library.items) {
            volume.size = volume.items.reduce((size, doc) => size + doc.size, 0);
        }
        let volumeIndex = Math.floor(random() * library.items.length);
        let volume = library.items[volumeIndex];
        let volumeOffset = random() * volume.size;
        let { index: docIndex, item: doc, offset } = findIndexOffset(volumeOffset, volume.items);
        let names = [volume.name, volume.items[docIndex].name];
        let { index: chapterIndex } = findIndexOffset(offset, doc.chapterSizes, size => size);
        this.setState({
            actual: { chapterIndex, names },
            chapter: undefined,
            chapterIndex,
            count: this.state.count + 1,
            guess: undefined,
            outcomes: outcomes.length < quizLength ? outcomes : [],
            showAnswer: false,
        });
        let base = volume.uri.replace(/\/[^/]*$/, '');
        let chapterUri = [base, names[1], `ch${chapterIndex}.json`].join('/');
        fetch(chapterUri).then(response => {
            response.text().then(text => {
                this.setState({ chapter: JSON.parse(text), chapterIndex });
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
            let { answer: anyAnswer, app } = volume.props.library.props;
            if (!anyAnswer) {
                if (guess) {
                    app.guess();
                }
                else {
                    app.guess({
                        chapterIndex: index, names: [volume.props.name, doc.props.name],
                    });
                }
            }
        };
    }
    render() {
        let { answer, doc, guess, index } = this.props;
        let { library } = doc.props.volume.props;
        let className;
        let common = {
            letterSpacing: '-0.05em',
            minWidth: '1.3em',
            padding: '0.2em',
            textAlign: 'center',
        };
        if (answer) {
            className = Object(lib_es2015["style"])(Object.assign({ color: 'green', fontSize: '150%', fontWeight: 'bold' }, (guess && highlight), common));
        }
        else {
            className = Object(lib_es2015["style"])(Object.assign({}, (guess && highlight), common, { $nest: !library.props.answer && {
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
            let { guess, name, volume } = this.props;
            let { library } = volume.props;
            if (!(guess || library.props.answer)) {
                this.setState({ expanded: !this.state.expanded });
            }
        };
        this.setState({ expanded: !!props.answer });
    }
    render() {
        let { answer, guess, title, volume } = this.props;
        let { expanded } = this.state;
        let { answer: anyAnswer } = volume.props.library.props;
        return (preact_compat_es["createElement"]("div", null,
            preact_compat_es["createElement"]("div", { className: Object(lib_es2015["style"])(!(anyAnswer || guess) && { $nest: { '&:hover': { fontWeight: 'bold' } } }), onClick: this.onClick }, title),
            preact_compat_es["createElement"]("ul", { className: Object(lib_es2015["style"])({
                    display: 'flex',
                    flexDirection: 'row',
                    flexWrap: 'wrap',
                    listStyle: 'none',
                    padding: 0,
                }) }, (answer || expanded || guess) && this.props.chapterSizes.map((_, chapterIndex) => preact_compat_es["createElement"](view_ChapterView, { answer: answer && answer.chapterIndex == chapterIndex ?
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
                fontSize: '250%',
                letterSpacing: '-0.05em',
                wordSpacing: '0.1em',
            }, Object(lib["padding"])(0, '1em'), lib["scrollY"]), ref: element => this.container = element }, chapter && chapter.paragraphs.map((paragraph, paragraphIndex) => preact_compat_es["createElement"]("p", { className: Object(lib_es2015["style"])({
                margin: '0.3em auto',
                maxWidth: '25em',
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
        let { answer, app, count, guess } = this.props;
        let { outcomes, quizLength } = app.state;
        if (!answer) {
            this.answerElement = undefined;
        }
        let last = outcomes.length == quizLength;
        let score = outcomes.length ? outcomes.slice(-1)[0].score : 0;
        return (preact_compat_es["createElement"]("div", { className: Object(lib_es2015["style"])({ fontSize: '150%' }, lib["content"], lib["vertical"], Object(lib["width"])('25%')) },
            preact_compat_es["createElement"]("div", { className: Object(lib_es2015["style"])(lib["flex"], Object(lib["margin"])(0), Object(lib["padding"])(0, '1em'), lib["scrollY"], { cursor: 'default' }) }, this.props.items.map(volume => preact_compat_es["createElement"](view_VolumeView, Object.assign({ answer: answer && answer.names[0] == volume.name ? answer : undefined, guess: guess && guess.names[0] == volume.name ? guess : undefined, key: volume.name + count, library: this }, Object.assign({ count }, volume))))),
            preact_compat_es["createElement"]("div", { className: Object(lib_es2015["style"])(lib["content"], lib["horizontal"], {
                    borderTop: '1px solid black',
                    margin: '0 0.5em',
                    padding: '1em 0.5em 0',
                }) },
                preact_compat_es["createElement"]("div", { className: Object(lib_es2015["style"])(lib["flex"]) },
                    "Round ",
                    outcomes.length + (answer ? 0 : 1),
                    " / ",
                    quizLength),
                preact_compat_es["createElement"]("div", null, answer &&
                    preact_compat_es["createElement"]("span", null,
                        "+ ",
                        outcomes.slice(-1)[0].score))),
            preact_compat_es["createElement"]("div", { className: Object(lib_es2015["style"])(lib["content"], lib["horizontal"], { padding: '1em' }) },
                preact_compat_es["createElement"]("div", { className: Object(lib_es2015["style"])(lib["flex"]) },
                    preact_compat_es["createElement"]("button", { disabled: !guess, onClick: this.makeGuess, type: 'button' }, answer ? (last ? 'New Game!' : 'Next Excerpt') : 'Make Guess')),
                preact_compat_es["createElement"]("div", null,
                    last ? 'Final ' : '',
                    "Score ",
                    sum(function* score() {
                        for (let outcome of outcomes) {
                            yield outcome.score;
                        }
                    }())))));
    }
}
class view_VolumeView extends preact_compat_es["Component"] {
    constructor(props) {
        super(props);
        this.onClick = () => {
            let { guess, library, name } = this.props;
            if (!(guess || library.props.answer)) {
                this.setState({ expanded: !this.state.expanded });
            }
        };
        this.setState({ expanded: !!props.answer });
    }
    render() {
        let { answer, count, guess, library } = this.props;
        let { answer: anyAnswer } = library.props;
        let { expanded } = this.state;
        let extraStyle = !(anyAnswer || guess) ? { $nest: { '&:hover': { fontSize: '120%' } } } : {};
        let expandStyle = answer || expanded || guess ? {} : { display: 'none' };
        return (preact_compat_es["createElement"]("div", null,
            preact_compat_es["createElement"]("h2", { className: Object(lib_es2015["style"])(Object.assign({ fontSize: '110%', marginBottom: '0.2em' }, extraStyle)), onClick: this.onClick }, this.props.title),
            preact_compat_es["createElement"]("ul", { className: Object(lib_es2015["style"])({
                    listStyle: 'none',
                    marginTop: 0,
                    padding: 0,
                }) }, this.props.items.map(doc => preact_compat_es["createElement"]("li", { className: Object(lib_es2015["style"])(expandStyle) },
                preact_compat_es["createElement"](view_DocView, Object.assign({}, doc, { answer: answer && answer.names[1] == doc.name ? answer : undefined, guess: guess && guess.names[1] == doc.name ? guess : undefined, key: doc.name + count, volume: this })))))));
    }
}
let highlight = {
    background: 'silver',
    fontWeight: 'bold',
};
function scoreGuess(library, actual, guess) {
    if (actual.names[0] != guess.names[0]) {
        return 0;
    }
    let volume = library.items.find(volume => volume.name == actual.names[0]);
    library = { items: [volume] };
    let actualOffset = findLibraryTextOffset(library, actual);
    let guessOffset = findLibraryTextOffset(library, guess);
    let distance = Math.abs(actualOffset - guessOffset);
    let wordsPerPage = 2000;
    let librarySize = sum(library.items.map(volume => volume.size));
    console.log(distance / wordsPerPage, librarySize / wordsPerPage);
    let closeness = 1 - 5 * (distance / librarySize);
    let softplus = Math.log(1 + Math.exp(10 * closeness));
    return Math.round(50 * softplus);
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




window.addEventListener('load', init);
function init() {
    return __awaiter(this, void 0, void 0, function* () {
        document.getElementById('preload').remove();
        Object(lib["normalize"])();
        Object(lib["setupPage"])('#root');
        let uri = '/kjv.st/volumes.json';
        let volumes;
        try {
            volumes = yield load(uri);
        }
        catch (_a) {
            uri = 'http://localhost:52119/volumes.json';
            volumes = yield load(uri);
        }
        for (let volume of volumes.items) {
            volume.uri = uri;
        }
        Object(preact_compat_es["render"])(preact_compat_es["createElement"](view_AppView, { library: volumes }), document.getElementById('root'));
    });
}
function load(uri) {
    return __awaiter(this, void 0, void 0, function* () {
        return yield (yield fetch(uri)).json();
    });
}


/***/ })

},[11]);