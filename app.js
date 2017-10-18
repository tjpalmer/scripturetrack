webpackJsonp([0],[
/* 0 */,
/* 1 */,
/* 2 */,
/* 3 */
/***/ (function(module, exports, __webpack_require__) {

/**
 * Copyright 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */

if (false) {
  var REACT_ELEMENT_TYPE = (typeof Symbol === 'function' &&
    Symbol.for &&
    Symbol.for('react.element')) ||
    0xeac7;

  var isValidElement = function(object) {
    return typeof object === 'object' &&
      object !== null &&
      object.$$typeof === REACT_ELEMENT_TYPE;
  };

  // By explicitly using `prop-types` you are opting into new development behavior.
  // http://fb.me/prop-types-in-prod
  var throwOnDirectAccess = true;
  module.exports = require('./factoryWithTypeCheckers')(isValidElement, throwOnDirectAccess);
} else {
  // By explicitly using `prop-types` you are opting into new production behavior.
  // http://fb.me/prop-types-in-prod
  module.exports = __webpack_require__(24)();
}


/***/ }),
/* 4 */,
/* 5 */,
/* 6 */,
/* 7 */,
/* 8 */,
/* 9 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });

// CONCATENATED MODULE: ./src/util.ts
class Indexed {
}
function arrayify(indexed) {
    let result = new Array(indexed.length);
    for (let i = 0; i < indexed.length; ++i) {
        result[i] = indexed[i];
    }
    return result;
}
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

// EXTERNAL MODULE: ./node_modules/csstips/lib/index.js
var lib = __webpack_require__(2);
var lib_default = /*#__PURE__*/__webpack_require__.n(lib);

// EXTERNAL MODULE: ./node_modules/react/index.js
var react = __webpack_require__(0);
var react_default = /*#__PURE__*/__webpack_require__.n(react);

// EXTERNAL MODULE: ./node_modules/react-feather/dist/icons/chevron-down.js
var chevron_down = __webpack_require__(23);
var chevron_down_default = /*#__PURE__*/__webpack_require__.n(chevron_down);

// EXTERNAL MODULE: ./node_modules/react-feather/dist/icons/chevron-up.js
var chevron_up = __webpack_require__(28);
var chevron_up_default = /*#__PURE__*/__webpack_require__.n(chevron_up);

// EXTERNAL MODULE: ./node_modules/typestyle/lib.es2015/index.js + 3 modules
var lib_es2015 = __webpack_require__(1);

// CONCATENATED MODULE: ./src/excerpt.tsx







class excerpt_ExcerptScroller extends react["PureComponent"] {
    markEnd(top, bottom) {
        this.setState({ bottom, ready: true, top });
    }
    render() {
        let { chapter } = this.props;
        let { bottom, page, ready, top } = this.state || {};
        return (react["createElement"]("div", { className: Object(lib_es2015["style"])(lib["flex"], lib["vertical"]) },
            react["createElement"](excerpt_ScrollButton, { scroller: this, dir: 'up', end: top || !ready }),
            react["createElement"](excerpt_ExcerptView, Object.assign({ page: page, scroller: this }, { chapter })),
            react["createElement"](excerpt_ScrollButton, { scroller: this, dir: 'down', end: bottom || !ready })));
    }
    scroll(dir) {
        if (this.state.page != undefined) {
            let offset = dir == 'up' ? -1 : 1;
            this.setState({ page: this.state.page + offset });
        }
    }
    setPage(page) {
        this.setState({ page });
    }
}
class excerpt_ExcerptView extends react["PureComponent"] {
    constructor() {
        super(...arguments);
        this.maxHeight = window.innerHeight * 5 / 8;
        this.splits = [];
        this.watchingResize = false;
    }
    componentDidUpdate() {
        let { container } = this;
        if (container) {
            this.split();
            if (!this.watchingResize) {
                let listener = () => {
                    if (!(this.container && document.contains(this.container))) {
                        this.maxHeight = window.innerHeight * 5 / 8;
                        window.removeEventListener('resize', listener);
                        this.watchingResize = false;
                    }
                    this.setState({ ready: false });
                    window.setTimeout(() => {
                        this.splits = [];
                        this.split();
                    }, 100);
                };
                window.addEventListener('resize', listener);
                this.watchingResize = true;
            }
        }
    }
    render() {
        let { chapter } = this.props;
        let { ready } = this.state || {};
        let minScreen = Math.min(screen.height, screen.width) / devicePixelRatio;
        let fontSize = minScreen / 24;
        return (react["createElement"]("div", { className: Object(lib_es2015["style"])({
                fontFamily: 'Excerpt',
                fontSize: `${fontSize}px`,
                height: `${this.maxHeight}px`,
                letterSpacing: '-0.05em',
                overflow: 'hidden',
                position: 'relative',
                visibility: ready ? 'visible' : 'hidden',
                wordSpacing: '0.1em',
            }, Object(lib["padding"])(0, '1em')), ref: element => this.container = element }, chapter && chapter.paragraphs.map((paragraph, paragraphIndex) => react["createElement"]("p", { className: Object(lib_es2015["style"])({
                lineHeight: 1.5,
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
            }) }, paragraph.verses.map(verse => react["createElement"]("span", null,
            verse.text,
            " "))))));
    }
    split() {
        setTimeout(() => {
            let { container, maxHeight, props, splits } = this;
            let splitIndex = this.props.page;
            if (container && !(splits.length && this.splitChapter == this.props.chapter)) {
                this.splitChapter = this.props.chapter;
                splits = this.splits = calculateLineSplits(container);
                splitIndex = Math.floor(splits.length * random());
                this.props.scroller.setPage(splitIndex);
                this.setState({ ready: true });
            }
            if (container && splitIndex != undefined) {
                let split = splits[splitIndex];
                let height = split.height;
                container.style.height = `${height}px`;
                let extra = maxHeight - height;
                if (extra >= 0) {
                    let extraTop = Math.floor(extra / 2);
                    let extraBottom = extra - extraTop;
                    container.style.marginTop = `${extraTop}px`;
                    container.style.marginBottom = `${extraBottom}px`;
                }
                container.scrollTop = split.top;
                this.props.scroller.markEnd(splitIndex == 0, splitIndex == splits.length - 1);
            }
        }, 100);
    }
}
class excerpt_ScrollButton extends react["Component"] {
    render() {
        let { dir, end, scroller } = this.props;
        let size = window.innerHeight / 16;
        return (react["createElement"]("div", { className: Object(lib_es2015["style"])(lib["flex"], lib["vertical"], {
                color: end ? '#bbb' : 'black',
                fontSize: '4em',
                textAlign: 'center',
            }) },
            react["createElement"]("div", { className: Object(lib_es2015["style"])(lib["flex"]) }),
            react["createElement"]("div", { className: Object(lib_es2015["style"])(lib["flex"]) },
                react["createElement"]("span", { className: Object(lib_es2015["style"])({ cursor: 'default', padding: '1em' }), onClick: () => !end && scroller.scroll(dir) }, dir == 'up' ?
                    react["createElement"](chevron_up_default.a, { size: size }) :
                    react["createElement"](chevron_down_default.a, { size: size }))),
            react["createElement"]("div", { className: Object(lib_es2015["style"])(lib["flex"]) })));
    }
}
function calculateLineSplits(box) {
    let total = window.innerHeight;
    let maxHeight = total * 5 / 8;
    let splits = [];
    let lines = findLines(box);
    let lastLine = lines[0];
    let lastTop = lastLine.top;
    let split = { height: 0, top: lastTop };
    let pushSplit = () => {
        split.height = lastLine.bottom - split.top;
        splits.push(split);
        split = { height: 0, top: lastTop };
    };
    for (let line of lines) {
        let distance = line.bottom - lastTop;
        if (distance > maxHeight) {
            lastTop = line.top;
            pushSplit();
        }
        lastLine = line;
    }
    pushSplit();
    return splits;
}
function drawSplits(box, splits) {
    for (let split of arrayify(box.querySelectorAll('.split'))) {
        split.remove();
    }
    let rect = box.querySelector('p').getBoundingClientRect();
    let x = rect.left;
    let width = rect.width;
    let addSplit = (y, color) => {
        let split = document.createElement('div');
        split.setAttribute('class', 'split');
        split.setAttribute('style', `
      background: ${color};
      height: 1px;
      left: ${x}px;
      position: absolute;
      top: ${y}px;
      width: ${width}px;
    `);
        box.appendChild(split);
    };
    for (let split of splits) {
        addSplit(split.top, 'black');
        addSplit(split.top + split.height, 'red');
    }
}
;
function findLines(box) {
    let { max, min } = Math;
    let lines = [];
    let offset = box.scrollTop - box.offsetTop;
    for (let para of arrayify(box.children)) {
        let edges = [];
        let total = 0;
        for (let span of arrayify(para.children)) {
            for (let rect of arrayify(span.getClientRects())) {
                edges.push({ top: true, y: rect.top + offset });
                edges.push({ top: false, y: rect.bottom + offset });
                ++total;
            }
        }
        edges.sort((a, b) => a.y - b.y);
        let makeLine = () => ({
            bottom: -Infinity, chunkBegin: false, chunkEnd: false, top: Infinity,
        });
        let line = makeLine();
        line.chunkBegin = true;
        for (let edge of edges) {
            if (edge.top) {
                if (isFinite(line.bottom)) {
                    lines.push(line);
                    line = makeLine();
                }
                line.top = min(line.top, edge.y);
            }
            else {
                line.bottom = max(line.bottom, edge.y);
            }
        }
        line.chunkEnd = true;
        lines.push(line);
    }
    return lines;
}

// EXTERNAL MODULE: ./node_modules/react-feather/dist/icons/chevrons-left.js
var chevrons_left = __webpack_require__(29);
var chevrons_left_default = /*#__PURE__*/__webpack_require__.n(chevrons_left);

// EXTERNAL MODULE: ./node_modules/react-feather/dist/icons/chevrons-right.js
var chevrons_right = __webpack_require__(30);
var chevrons_right_default = /*#__PURE__*/__webpack_require__.n(chevrons_right);

// EXTERNAL MODULE: ./node_modules/react-feather/dist/icons/settings.js
var settings = __webpack_require__(31);
var settings_default = /*#__PURE__*/__webpack_require__.n(settings);

// CONCATENATED MODULE: ./src/panel.tsx








class panel_ChapterView extends react["Component"] {
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
        return react["createElement"]("li", Object.assign({}, { className }, { ref: element => {
                if (answer) {
                    library.answerElement = element;
                }
            }, onClick: this.onClick }), index + 1);
    }
}
class panel_DocView extends react["Component"] {
    constructor(props) {
        super(props);
        this.onClick = () => {
            let { guess, name, volume } = this.props;
            let { library } = volume.props;
            if (!(guess || library.props.answer)) {
                this.setState({ expanded: !this.state.expanded });
            }
        };
        this.state = { expanded: !!props.answer };
    }
    render() {
        let { answer, guess, title, volume } = this.props;
        let { expanded } = this.state;
        let { answer: anyAnswer } = volume.props.library.props;
        return (react["createElement"]("div", null,
            react["createElement"]("div", { className: Object(lib_es2015["style"])(!(anyAnswer || guess) && { $nest: { '&:hover': { fontWeight: 'bold' } } }), onClick: this.onClick }, title),
            react["createElement"]("ul", { className: Object(lib_es2015["style"])({
                    display: 'flex',
                    flexDirection: 'row',
                    flexWrap: 'wrap',
                    listStyle: 'none',
                    padding: 0,
                }) }, (answer || expanded || guess) && this.props.chapterSizes.map((_, chapterIndex) => react["createElement"](panel_ChapterView, { answer: answer && answer.chapterIndex == chapterIndex ?
                    answer : undefined, doc: this, guess: guess && guess.chapterIndex == chapterIndex ? guess : undefined, index: chapterIndex })))));
    }
}
class panel_LibraryView extends react["Component"] {
    constructor() {
        super(...arguments);
        this.makeGuess = () => {
            let { answer, app } = this.props;
            if (answer) {
                this.setState({ shown: false });
                app.shuffle();
            }
            else {
                app.showAnswer();
            }
        };
        this.togglePanel = () => {
            this.setState({ shown: !(this.state || {}).shown });
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
        let { shown } = this.state || {};
        if (!answer) {
            this.answerElement = undefined;
        }
        let last = outcomes.length == quizLength;
        let score = outcomes.length ? outcomes.slice(-1)[0].score : 0;
        let minScreen = Math.min(screen.height, screen.width) / devicePixelRatio;
        let iconSize = minScreen / 16;
        let panelWidth = Math.min(0.9 * minScreen, window.innerWidth);
        return (react["createElement"]("div", { className: Object(lib_es2015["style"])(lib["content"], lib["vertical"], {
                background: 'white',
                borderLeft: '1px solid black',
                bottom: 0,
                fontSize: `${iconSize / 2}px`,
                left: shown ? `${window.innerWidth - panelWidth}px` : '100%',
                position: 'fixed',
                width: `${panelWidth}px`,
                top: 0,
            }), ref: panel => this.panel = panel },
            react["createElement"]("div", { className: Object(lib_es2015["style"])({
                    display: shown ? 'none' : 'block',
                    left: `-${iconSize}px`,
                    position: 'absolute',
                }), onClick: this.togglePanel },
                react["createElement"](chevrons_left_default.a, { size: iconSize })),
            react["createElement"]("div", { className: Object(lib_es2015["style"])({
                    background: 'rgba(255, 255, 255, 0.2)',
                    position: 'absolute',
                    right: 0,
                }) },
                react["createElement"]("div", { onClick: this.togglePanel },
                    react["createElement"](chevrons_right_default.a, { size: iconSize })),
                react["createElement"]("div", null,
                    react["createElement"](settings_default.a, { className: Object(lib_es2015["style"])({
                            marginTop: '0.5em', padding: `${iconSize * 0.2}px`,
                        }), color: '#bbb', size: iconSize }))),
            react["createElement"]("div", { className: Object(lib_es2015["style"])(lib["flex"], Object(lib["margin"])(0), lib["scrollY"], {
                    cursor: 'default',
                    paddingLeft: '1em',
                    paddingRight: `${iconSize}px`,
                }) }, this.props.items.map(volume => react["createElement"](panel_VolumeView, Object.assign({ answer: answer && answer.names[0] == volume.name ? answer : undefined, guess: guess && guess.names[0] == volume.name ? guess : undefined, key: volume.name + count, library: this }, Object.assign({ count }, volume))))),
            react["createElement"]("div", { className: Object(lib_es2015["style"])(lib["content"], lib["horizontal"], {
                    borderTop: '1px solid black',
                    margin: '0 0.5em',
                    padding: '1em 0.5em 0',
                }) },
                react["createElement"]("div", { className: Object(lib_es2015["style"])(lib["flex"]) },
                    "Round ",
                    outcomes.length + (answer ? 0 : 1),
                    " / ",
                    quizLength),
                react["createElement"]("div", null, answer &&
                    react["createElement"]("span", null,
                        "+ ",
                        outcomes.slice(-1)[0].score))),
            react["createElement"]("div", { className: Object(lib_es2015["style"])(lib["content"], lib["horizontal"], { padding: '1em' }) },
                react["createElement"]("div", { className: Object(lib_es2015["style"])(lib["flex"]) },
                    react["createElement"]("button", { disabled: !guess, onClick: this.makeGuess, type: 'button' }, answer ? (last ? 'New Game!' : 'Next Excerpt') : 'Make Guess')),
                react["createElement"]("div", null,
                    last ? 'Final ' : '',
                    "Score ",
                    sum(function* score() {
                        for (let outcome of outcomes) {
                            yield outcome.score;
                        }
                    }())))));
    }
}
class panel_VolumeView extends react["Component"] {
    constructor(props) {
        super(props);
        this.onClick = () => {
            let { guess, library, name } = this.props;
            if (!(guess || library.props.answer)) {
                this.setState({ expanded: !this.state.expanded });
            }
        };
        this.state = { expanded: !!props.answer };
    }
    render() {
        let { answer, count, guess, library } = this.props;
        let { answer: anyAnswer } = library.props;
        let { expanded } = this.state;
        let extraStyle = !(anyAnswer || guess) ? { $nest: { '&:hover': { fontSize: '120%' } } } : {};
        let expandStyle = answer || expanded || guess ? {} : { display: 'none' };
        return (react["createElement"]("div", null,
            react["createElement"]("h2", { className: Object(lib_es2015["style"])(Object.assign({ fontSize: '110%', marginBottom: '0.2em' }, extraStyle)), onClick: this.onClick }, this.props.title),
            react["createElement"]("ul", { className: Object(lib_es2015["style"])({
                    listStyle: 'none',
                    marginTop: 0,
                    padding: 0,
                }) }, this.props.items.map(doc => react["createElement"]("li", { className: Object(lib_es2015["style"])(expandStyle) },
                react["createElement"](panel_DocView, Object.assign({}, doc, { answer: answer && answer.names[1] == doc.name ? answer : undefined, guess: guess && guess.names[1] == doc.name ? guess : undefined, key: doc.name + count, volume: this })))))));
    }
}
let highlight = {
    background: 'silver',
    fontWeight: 'bold',
};

// CONCATENATED MODULE: ./src/view.tsx





class view_AppView extends react["Component"] {
    constructor(props) {
        super(props);
        this.state = {
            count: 0,
            outcomes: [],
            quizLength: 5,
        };
        this.shuffle(true);
    }
    guess(guess) {
        this.setState({ guess });
    }
    render() {
        let { actual, chapter, count, guess, showAnswer } = this.state;
        let answer = showAnswer ? actual : undefined;
        return (react["createElement"]("div", { className: Object(lib_es2015["style"])(lib["fillParent"], lib["horizontal"], lib["someChildWillScroll"]) },
            react["createElement"](excerpt_ExcerptScroller, Object.assign({}, { chapter })),
            react["createElement"](panel_LibraryView, Object.assign({ app: this }, { answer, count, guess }, this.props.library))));
    }
    showAnswer() {
        let { actual, guess, outcomes } = this.state;
        let score = scoreGuess(this.props.library, actual, guess);
        outcomes = outcomes.slice();
        outcomes.push({ actual: actual, guess: guess, score });
        this.setState({ outcomes, showAnswer: true });
    }
    shuffle(first) {
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
        let newState = {
            actual: { chapterIndex, names },
            chapter: undefined,
            chapterIndex,
            count: this.state.count + 1,
            guess: undefined,
            outcomes: outcomes.length < quizLength ? outcomes : [],
            showAnswer: false,
        };
        if (first) {
            Object.assign(this.state, newState);
        }
        else {
            this.setState(newState);
        }
        let base = volume.uri.replace(/\/[^/]*$/, '');
        let chapterUri = [base, names[1], `ch${chapterIndex}.json`].join('/');
        fetch(chapterUri).then(response => {
            response.text().then(text => {
                this.setState({ chapter: JSON.parse(text), chapterIndex });
            });
        });
    }
}
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






// EXTERNAL MODULE: ./node_modules/react-dom/index.js
var react_dom = __webpack_require__(7);
var react_dom_default = /*#__PURE__*/__webpack_require__.n(react_dom);

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
        Object(react_dom["render"])(react["createElement"](view_AppView, { library: volumes }), document.getElementById('root'));
    });
}
function load(uri) {
    return __awaiter(this, void 0, void 0, function* () {
        return yield (yield fetch(uri)).json();
    });
}


/***/ }),
/* 10 */,
/* 11 */,
/* 12 */,
/* 13 */,
/* 14 */,
/* 15 */,
/* 16 */,
/* 17 */,
/* 18 */,
/* 19 */,
/* 20 */,
/* 21 */,
/* 22 */,
/* 23 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _react = __webpack_require__(0);

var _react2 = _interopRequireDefault(_react);

var _propTypes = __webpack_require__(3);

var _propTypes2 = _interopRequireDefault(_propTypes);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _objectWithoutProperties(obj, keys) { var target = {}; for (var i in obj) { if (keys.indexOf(i) >= 0) continue; if (!Object.prototype.hasOwnProperty.call(obj, i)) continue; target[i] = obj[i]; } return target; }

var ChevronDown = function ChevronDown(props) {
  var color = props.color,
      size = props.size,
      otherProps = _objectWithoutProperties(props, ['color', 'size']);

  return _react2.default.createElement(
    'svg',
    _extends({
      xmlns: 'http://www.w3.org/2000/svg',
      width: size,
      height: size,
      viewBox: '0 0 24 24',
      fill: 'none',
      stroke: color,
      strokeWidth: '2',
      strokeLinecap: 'round',
      strokeLinejoin: 'round'
    }, otherProps),
    _react2.default.createElement('polyline', { points: '6 9 12 15 18 9' })
  );
};

ChevronDown.propTypes = {
  color: _propTypes2.default.string,
  size: _propTypes2.default.oneOfType([_propTypes2.default.string, _propTypes2.default.number])
};

ChevronDown.defaultProps = {
  color: 'currentColor',
  size: '24'
};

exports.default = ChevronDown;

/***/ }),
/* 24 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/**
 * Copyright 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */



var emptyFunction = __webpack_require__(25);
var invariant = __webpack_require__(26);
var ReactPropTypesSecret = __webpack_require__(27);

module.exports = function() {
  function shim(props, propName, componentName, location, propFullName, secret) {
    if (secret === ReactPropTypesSecret) {
      // It is still safe when called from React.
      return;
    }
    invariant(
      false,
      'Calling PropTypes validators directly is not supported by the `prop-types` package. ' +
      'Use PropTypes.checkPropTypes() to call them. ' +
      'Read more at http://fb.me/use-check-prop-types'
    );
  };
  shim.isRequired = shim;
  function getShim() {
    return shim;
  };
  // Important!
  // Keep this list in sync with production version in `./factoryWithTypeCheckers.js`.
  var ReactPropTypes = {
    array: shim,
    bool: shim,
    func: shim,
    number: shim,
    object: shim,
    string: shim,
    symbol: shim,

    any: shim,
    arrayOf: getShim,
    element: shim,
    instanceOf: getShim,
    node: shim,
    objectOf: getShim,
    oneOf: getShim,
    oneOfType: getShim,
    shape: getShim
  };

  ReactPropTypes.checkPropTypes = emptyFunction;
  ReactPropTypes.PropTypes = ReactPropTypes;

  return ReactPropTypes;
};


/***/ }),
/* 25 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * 
 */

function makeEmptyFunction(arg) {
  return function () {
    return arg;
  };
}

/**
 * This function accepts and discards inputs; it has no side effects. This is
 * primarily useful idiomatically for overridable function endpoints which
 * always need to be callable, since JS lacks a null-call idiom ala Cocoa.
 */
var emptyFunction = function emptyFunction() {};

emptyFunction.thatReturns = makeEmptyFunction;
emptyFunction.thatReturnsFalse = makeEmptyFunction(false);
emptyFunction.thatReturnsTrue = makeEmptyFunction(true);
emptyFunction.thatReturnsNull = makeEmptyFunction(null);
emptyFunction.thatReturnsThis = function () {
  return this;
};
emptyFunction.thatReturnsArgument = function (arg) {
  return arg;
};

module.exports = emptyFunction;

/***/ }),
/* 26 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 */



/**
 * Use invariant() to assert state which your program assumes to be true.
 *
 * Provide sprintf-style format (only %s is supported) and arguments
 * to provide information about what broke and what you were
 * expecting.
 *
 * The invariant message will be stripped in production, but the invariant
 * will remain to ensure logic does not differ in production.
 */

var validateFormat = function validateFormat(format) {};

if (false) {
  validateFormat = function validateFormat(format) {
    if (format === undefined) {
      throw new Error('invariant requires an error message argument');
    }
  };
}

function invariant(condition, format, a, b, c, d, e, f) {
  validateFormat(format);

  if (!condition) {
    var error;
    if (format === undefined) {
      error = new Error('Minified exception occurred; use the non-minified dev environment ' + 'for the full error message and additional helpful warnings.');
    } else {
      var args = [a, b, c, d, e, f];
      var argIndex = 0;
      error = new Error(format.replace(/%s/g, function () {
        return args[argIndex++];
      }));
      error.name = 'Invariant Violation';
    }

    error.framesToPop = 1; // we don't care about invariant's own frame
    throw error;
  }
}

module.exports = invariant;

/***/ }),
/* 27 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/**
 * Copyright 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */



var ReactPropTypesSecret = 'SECRET_DO_NOT_PASS_THIS_OR_YOU_WILL_BE_FIRED';

module.exports = ReactPropTypesSecret;


/***/ }),
/* 28 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _react = __webpack_require__(0);

var _react2 = _interopRequireDefault(_react);

var _propTypes = __webpack_require__(3);

var _propTypes2 = _interopRequireDefault(_propTypes);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _objectWithoutProperties(obj, keys) { var target = {}; for (var i in obj) { if (keys.indexOf(i) >= 0) continue; if (!Object.prototype.hasOwnProperty.call(obj, i)) continue; target[i] = obj[i]; } return target; }

var ChevronUp = function ChevronUp(props) {
  var color = props.color,
      size = props.size,
      otherProps = _objectWithoutProperties(props, ['color', 'size']);

  return _react2.default.createElement(
    'svg',
    _extends({
      xmlns: 'http://www.w3.org/2000/svg',
      width: size,
      height: size,
      viewBox: '0 0 24 24',
      fill: 'none',
      stroke: color,
      strokeWidth: '2',
      strokeLinecap: 'round',
      strokeLinejoin: 'round'
    }, otherProps),
    _react2.default.createElement('polyline', { points: '18 15 12 9 6 15' })
  );
};

ChevronUp.propTypes = {
  color: _propTypes2.default.string,
  size: _propTypes2.default.oneOfType([_propTypes2.default.string, _propTypes2.default.number])
};

ChevronUp.defaultProps = {
  color: 'currentColor',
  size: '24'
};

exports.default = ChevronUp;

/***/ }),
/* 29 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _react = __webpack_require__(0);

var _react2 = _interopRequireDefault(_react);

var _propTypes = __webpack_require__(3);

var _propTypes2 = _interopRequireDefault(_propTypes);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _objectWithoutProperties(obj, keys) { var target = {}; for (var i in obj) { if (keys.indexOf(i) >= 0) continue; if (!Object.prototype.hasOwnProperty.call(obj, i)) continue; target[i] = obj[i]; } return target; }

var ChevronsLeft = function ChevronsLeft(props) {
  var color = props.color,
      size = props.size,
      otherProps = _objectWithoutProperties(props, ['color', 'size']);

  return _react2.default.createElement(
    'svg',
    _extends({
      xmlns: 'http://www.w3.org/2000/svg',
      width: size,
      height: size,
      viewBox: '0 0 24 24'
    }, otherProps),
    _react2.default.createElement('polyline', {
      points: '11 17 6 12 11 7',
      fill: 'none',
      stroke: color,
      strokeLinecap: 'round',
      strokeLinejoin: 'round',
      strokeWidth: '2'
    }),
    _react2.default.createElement('polyline', {
      points: '18 17 13 12 18 7',
      fill: 'none',
      stroke: color,
      strokeLinecap: 'round',
      strokeLinejoin: 'round',
      strokeWidth: '2'
    })
  );
};

ChevronsLeft.propTypes = {
  color: _propTypes2.default.string,
  size: _propTypes2.default.oneOfType([_propTypes2.default.string, _propTypes2.default.number])
};

ChevronsLeft.defaultProps = {
  color: 'currentColor',
  size: '24'
};

exports.default = ChevronsLeft;

/***/ }),
/* 30 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _react = __webpack_require__(0);

var _react2 = _interopRequireDefault(_react);

var _propTypes = __webpack_require__(3);

var _propTypes2 = _interopRequireDefault(_propTypes);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _objectWithoutProperties(obj, keys) { var target = {}; for (var i in obj) { if (keys.indexOf(i) >= 0) continue; if (!Object.prototype.hasOwnProperty.call(obj, i)) continue; target[i] = obj[i]; } return target; }

var ChevronsRight = function ChevronsRight(props) {
  var color = props.color,
      size = props.size,
      otherProps = _objectWithoutProperties(props, ['color', 'size']);

  return _react2.default.createElement(
    'svg',
    _extends({
      xmlns: 'http://www.w3.org/2000/svg',
      width: size,
      height: size,
      viewBox: '0 0 24 24'
    }, otherProps),
    _react2.default.createElement('polyline', {
      points: '13 17 18 12 13 7',
      fill: 'none',
      stroke: color,
      strokeLinecap: 'round',
      strokeLinejoin: 'round',
      strokeWidth: '2'
    }),
    _react2.default.createElement('polyline', {
      points: '6 17 11 12 6 7',
      fill: 'none',
      stroke: color,
      strokeLinecap: 'round',
      strokeLinejoin: 'round',
      strokeWidth: '2'
    })
  );
};

ChevronsRight.propTypes = {
  color: _propTypes2.default.string,
  size: _propTypes2.default.oneOfType([_propTypes2.default.string, _propTypes2.default.number])
};

ChevronsRight.defaultProps = {
  color: 'currentColor',
  size: '24'
};

exports.default = ChevronsRight;

/***/ }),
/* 31 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _react = __webpack_require__(0);

var _react2 = _interopRequireDefault(_react);

var _propTypes = __webpack_require__(3);

var _propTypes2 = _interopRequireDefault(_propTypes);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _objectWithoutProperties(obj, keys) { var target = {}; for (var i in obj) { if (keys.indexOf(i) >= 0) continue; if (!Object.prototype.hasOwnProperty.call(obj, i)) continue; target[i] = obj[i]; } return target; }

var Settings = function Settings(props) {
  var color = props.color,
      size = props.size,
      otherProps = _objectWithoutProperties(props, ['color', 'size']);

  return _react2.default.createElement(
    'svg',
    _extends({
      xmlns: 'http://www.w3.org/2000/svg',
      width: size,
      height: size,
      viewBox: '0 0 24 24'
    }, otherProps),
    _react2.default.createElement('circle', {
      cx: '12',
      cy: '12',
      r: '3',
      fill: 'none',
      stroke: color,
      strokeLinecap: 'round',
      strokeLinejoin: 'round',
      strokeWidth: '2'
    }),
    _react2.default.createElement('path', {
      d: 'M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z',
      fill: 'none',
      stroke: color,
      strokeMiterlimit: '10',
      strokeWidth: '2'
    })
  );
};

Settings.propTypes = {
  color: _propTypes2.default.string,
  size: _propTypes2.default.oneOfType([_propTypes2.default.string, _propTypes2.default.number])
};

Settings.defaultProps = {
  color: 'currentColor',
  size: '24'
};

exports.default = Settings;

/***/ })
],[9]);