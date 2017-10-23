webpackJsonp([0],{

/***/ 8:
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

// CONCATENATED MODULE: ./src/feather/icons.tsx

function Icon(props) {
    let color = props.color || 'currentColor';
    let className = 'icon';
    if (props.className) {
        className += ' ' + props.className;
    }
    return (react["createElement"]("svg", { className: className, fill: "none", stroke: color, strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", viewBox: "0 0 24 24" }, props.children));
}
;
function ChevronDown(props) {
    return react["createElement"](Icon, Object.assign({}, props),
        react["createElement"]("polyline", { points: "6 9 12 15 18 9" }));
}
function ChevronUp(props) {
    return react["createElement"](Icon, Object.assign({}, props),
        react["createElement"]("polyline", { points: "18 15 12 9 6 15" }));
}
;
function ChevronsLeft(props) {
    return react["createElement"](Icon, Object.assign({}, props),
        react["createElement"]("polyline", { points: "11 17 6 12 11 7" }),
        react["createElement"]("polyline", { points: "18 17 13 12 18 7" }));
}
function ChevronsRight(props) {
    return react["createElement"](Icon, Object.assign({}, props),
        react["createElement"]("polyline", { points: "13 17 18 12 13 7" }),
        react["createElement"]("polyline", { points: "6 17 11 12 6 7" }));
}
function Maximize(props) {
    return react["createElement"](Icon, Object.assign({}, props),
        react["createElement"]("path", { d: "M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3" }));
}
function Minimize(props) {
    return react["createElement"](Icon, Object.assign({}, props),
        react["createElement"]("path", { d: "M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3" }));
}
function Settings(props) {
    return react["createElement"](Icon, Object.assign({}, props),
        react["createElement"]("circle", { cx: "12", cy: "12", r: "3" }),
        react["createElement"]("path", { strokeMiterlimit: "10", d: "M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" }));
}

// CONCATENATED MODULE: ./src/feather/index.tsx


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
        return (react["createElement"]("div", { className: Object(lib_es2015["style"])({
                fontFamily: 'Excerpt',
                fontSize: `5vmin`,
                height: `62.5vh`,
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
            let maxHeight = window.innerHeight * 5 / 8;
            let { container, props, splits } = this;
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
        return (react["createElement"]("div", { className: Object(lib_es2015["style"])(lib["flex"], lib["vertical"], {
                color: end ? '#bbb' : 'black',
                fontSize: '4em',
                textAlign: 'center',
            }) },
            react["createElement"]("div", { className: Object(lib_es2015["style"])(lib["flex"]) }),
            react["createElement"]("div", { className: Object(lib_es2015["style"])(lib["flex"]) },
                react["createElement"]("span", { className: Object(lib_es2015["style"])({ cursor: 'default', padding: '6.25vh' }), onClick: () => !end && scroller.scroll(dir) }, dir == 'up' ? react["createElement"](ChevronUp, null) : react["createElement"](ChevronDown, null))),
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
class panel_Controls extends react["Component"] {
    constructor() {
        super(...arguments);
        this.fullScreen = false;
        this.toggleFullScreen = () => {
            if (this.isFullScreen()) {
                let exitFullscreen = (document.exitFullscreen || document.mozCancelFullScreen ||
                    document.webkitExitFullscreen);
                exitFullscreen.call(document);
                this.fullScreen = false;
            }
            else {
                let { box } = this.props.panel.props.app;
                let requestFullScreen = (box.mozRequestFullScreen || box.requestFullscreen ||
                    box.webkitRequestFullScreen);
                requestFullScreen.call(box);
                this.fullScreen = true;
            }
            this.setState({ fullScreen: this.fullScreen });
        };
    }
    isFullScreen() {
        return !!(document.fullscreenElement || document.mozFullScreenElement ||
            document.webkitFullscreenElement);
    }
    render() {
        let { iconSize, panel } = this.props;
        return react["createElement"]("div", { className: Object(lib_es2015["style"])({ $nest: { '& > div': {
                        padding: `${iconSize / 4}vh`,
                        position: 'fixed',
                        right: 0,
                    } } }) },
            react["createElement"]("div", { className: Object(lib_es2015["style"])({ top: 0 }), onClick: panel.togglePanel },
                react["createElement"](ChevronsLeft, null)),
            react["createElement"]("div", { className: Object(lib_es2015["style"])({ bottom: 0 }), onClick: this.toggleFullScreen }, this.fullScreen ?
                react["createElement"](Minimize, { className: Object(lib_es2015["style"])({ padding: `${0.15 * iconSize}vh` }) }) :
                react["createElement"](Maximize, { className: Object(lib_es2015["style"])({ padding: `${0.15 * iconSize}vh` }) })));
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
        let { answer, app, count, guess, items: volumes } = this.props;
        let { outcomes, quizLength } = app.state;
        let { shown } = this.state || {};
        if (!answer) {
            this.answerElement = undefined;
        }
        let last = outcomes.length == quizLength;
        let score = outcomes.length ? outcomes.slice(-1)[0].score : 0;
        let iconSize = 6.25;
        return react["createElement"]("div", null,
            react["createElement"](panel_Controls, Object.assign({}, { iconSize }, { panel: this })),
            react["createElement"]("div", { className: Object(lib_es2015["style"])(lib["content"], lib["vertical"], {
                    background: 'white',
                    borderLeft: '1px solid black',
                    bottom: 0,
                    fontSize: `3.125vh`,
                    right: shown ? 0 : '-90vmin',
                    position: 'fixed',
                    width: `90vmin`,
                    top: 0,
                }) },
                react["createElement"]("div", { className: Object(lib_es2015["style"])({
                        background: 'rgba(255, 255, 255, 0.2)',
                        position: 'absolute',
                        right: 0,
                    }) },
                    react["createElement"]("div", { className: Object(lib_es2015["style"])({ padding: '0.5em' }), onClick: this.togglePanel },
                        react["createElement"](ChevronsRight, null)),
                    react["createElement"]("div", { className: Object(lib_es2015["style"])({ padding: '0.5em' }) },
                        react["createElement"](Settings, { color: '#bbb', className: Object(lib_es2015["style"])({ padding: `${0.15 * iconSize}vh` }) }))),
                react["createElement"]("div", { className: Object(lib_es2015["style"])(lib["flex"], Object(lib["margin"])(0), lib["scrollY"], {
                        cursor: 'default',
                        paddingLeft: '1em',
                        paddingRight: `${iconSize}vh`,
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
                        }()))),
                last && react["createElement"](panel_SummaryView, Object.assign({}, { outcomes, volumes }))));
    }
}
class panel_SummaryView extends react["Component"] {
    render() {
        let { outcomes, volumes } = this.props;
        let thClass = Object(lib_es2015["style"])({ textAlign: 'left' });
        let Head = ({ text }) => react["createElement"]("th", { className: thClass }, text);
        let renderPath = (path) => {
            let volume = volumes.find(volume => volume.name == path.names[0]);
            let doc = volume.items.find(doc => doc.name == path.names[1]);
            return react["createElement"]("td", null,
                doc.title,
                " ",
                path.chapterIndex + 1);
        };
        return (react["createElement"]("div", { className: Object(lib_es2015["style"])({ padding: '0 1em 1em' }) },
            react["createElement"]("table", { className: Object(lib_es2015["style"])(lib["flex"], {
                    borderCollapse: 'separate',
                    width: '100%',
                    $nest: {
                        '& td:last-child, & th:last-child': {
                            textAlign: 'right',
                        },
                        '& td:not(:last-child), & th:not(:last-child)': {
                            paddingRight: '1em',
                        },
                        '& th, & tr:not(:last-child) td': { paddingBottom: '0.5em' },
                    }
                }) },
                react["createElement"]("thead", null,
                    react["createElement"]("tr", null,
                        react["createElement"](Head, { text: 'Actual' }),
                        react["createElement"](Head, { text: 'Guess' }),
                        react["createElement"](Head, { text: 'Score' }))),
                react["createElement"]("tbody", null, outcomes.map(outcome => react["createElement"]("tr", null,
                    renderPath(outcome.actual),
                    renderPath(outcome.guess),
                    react["createElement"]("td", null, outcome.score)))))));
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
        return (react["createElement"]("div", { className: Object(lib_es2015["style"])(lib["fillParent"], lib["horizontal"], lib["someChildWillScroll"], {
                background: 'white',
                $nest: { '& .icon': { height: '6.25vh' } },
            }), ref: box => this.box = box },
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
var react_dom = __webpack_require__(6);
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
        let uri = 'https://tjpalmer.github.io/kjv.st/volumes.json';
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


/***/ })

},[8]);