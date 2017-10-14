import {
  Chapter, Doc, IndexItemOffset, Indexed, Library, Paragraph, Path, Volume,
  arrayify, findIndexOffset, findLibraryTextOffset, random, sum,
} from './';
import {
  content, fillParent, flex, horizontal, margin, padding, scrollY,
  someChildWillScroll, vertical, width,
} from 'csstips';
import * as React from 'react';
import {Component, PureComponent} from 'react';
import {style, types as styletypes} from 'typestyle';

export interface App {

  library: Library;

}

export interface AppState {

  actual?: Path;

  chapter?: Chapter;

  chapterIndex?: number;

  count: number;

  outcomes: Outcome[];

  quizLength: number;
  
  guess?: Path;

  showAnswer?: boolean;

}

export type CSSProperties = styletypes.CSSProperties;

export interface Outcome {
  actual: Path;
  guess: Path;
  score: number;
}

export class AppView extends Component<App, AppState> {

  constructor(props: App) {
    super(props);
    this.setState({
      count: 0,
      outcomes: [],
      quizLength: 5,
    });
    this.shuffle();
  }

  guess(guess?: Path) {
    this.setState({guess});
  }

  render() {
    let {actual, chapter, count, guess, showAnswer} = this.state;
    let answer = showAnswer ? actual : undefined;
    return (
      <div className={style(fillParent, horizontal, someChildWillScroll)}>
        <ExcerptView {...{chapter}}/>
        <LibraryView
          app={this}
          {...{answer, count, guess}}
          {...this.props.library}
        />
      </div>
    );
  }

  showAnswer() {
    let {actual, guess, outcomes} = this.state;
    let score = scoreGuess(this.props.library, actual!, guess!);
    outcomes = outcomes.slice();
    outcomes.push({actual: actual!, guess: guess!, score});
    this.setState({outcomes, showAnswer: true});
  }

  shuffle() {
    let {library} = this.props;
    let {outcomes, quizLength} = this.state;
    // Calculate total text size, and choose a point in all the text.
    for (let volume of library.items) {
      volume.size = volume.items.reduce((size, doc) => size + doc.size, 0);
    }
    // Uniform volume selection.
    // TODO Multinomial weighted once that option's in place.
    let volumeIndex = Math.floor(random() * library.items.length);
    let volume = library.items[volumeIndex];
    // Figure out what document and chapter we're in.
    let volumeOffset = random() * volume.size!;
    let {index: docIndex, item: doc, offset} =
      findIndexOffset(volumeOffset, volume.items);
    let names = [volume.name, volume.items[docIndex].name];
    let {index: chapterIndex} =
      findIndexOffset(offset, doc.chapterSizes!, size => size);
    // Set text to undefined before we try loading, so we don't flash to random
    // spot of current text.
    this.setState({
      actual: {chapterIndex, names},
      chapter: undefined,
      chapterIndex,
      count: this.state.count + 1,
      guess: undefined,
      outcomes: outcomes.length < quizLength ? outcomes : [],
      showAnswer: false,
    });
    // Load the chapter that we want.
    let base = volume.uri!.replace(/\/[^/]*$/, '');
    let chapterUri = [base, names[1], `ch${chapterIndex}.json`].join('/');
    fetch(chapterUri).then(response => {
      response.text().then(text => {
        this.setState({chapter: JSON.parse(text), chapterIndex});
      });
    });
  }

}

export class ChapterView extends Component<
  {answer?: Path, doc: DocView, guess?: Path, index: number}, {}
> {

  onClick = () => {
    let {doc, index, guess} = this.props;
    let {volume} = doc.props;
    let {answer: anyAnswer, app} = volume.props.library.props;
    if (!anyAnswer) {
      if (guess) {
        // Unguess this.
        app.guess();
      } else {
        // Guess it.
        app.guess({
          chapterIndex: index, names: [volume.props.name, doc.props.name],
        });
      }
    }
  }

  render() {
    let {answer, doc, guess, index} = this.props;
    let {library} = doc.props.volume.props;
    let className: string;
    let common = {
      letterSpacing: '-0.05em',
      minWidth: '1.3em',
      padding: '0.2em',
      textAlign: 'center',
    };
    if (answer) {
      className = style({
        color: 'green', fontSize: '150%', fontWeight: 'bold',
        ...(guess && highlight as any),
        ...common,
      });
    } else {
      className = style({
        ...(guess && highlight as any),
        ...common,
        $nest: !library.props.answer && {
          '&:hover': highlight as any,
        },
      });
    }
    return <li
      {...{className}}
      ref={element => {
        if (answer) {
          library.answerElement = element!;
        }
      }}
      onClick={this.onClick}
    >{index + 1}</li>;    
  }

}

export interface DocProps extends Doc {
  answer? :Path,
  guess?: Path,
  volume: VolumeView,
}

export class DocView extends Component<DocProps, {expanded: boolean}> {

  constructor(props: DocProps) {
    super(props);
    this.setState({expanded: !!props.answer});
  }

  onClick = () => {
    let {guess, name, volume} = this.props;
    let {library} = volume.props;
    if (!(guess || library.props.answer)) {
      this.setState({expanded: !this.state.expanded})
    }
  }

  render() {
    let {answer, guess, title, volume} = this.props;
    let {expanded} = this.state;
    let {answer: anyAnswer} = volume.props.library.props;
    return (
      <div>
        <div
          className={style(
            !(anyAnswer || guess) && {$nest: {'&:hover': {fontWeight: 'bold'}}},
          )}
          onClick={this.onClick}
        >{title}</div>
        <ul className={style({
          display: 'flex',
          flexDirection: 'row',
          flexWrap: 'wrap',
          listStyle: 'none',
          padding: 0,
        })}>
          {(answer || expanded || guess) && this.props.chapterSizes!.map(
            (_, chapterIndex) => <ChapterView
              answer={
                answer && answer.chapterIndex == chapterIndex ?
                  answer : undefined
              }
              doc={this}
              guess={
                guess && guess.chapterIndex == chapterIndex ? guess : undefined
              }
              index={chapterIndex}
            />,
          )}
        </ul>
      </div>
    );
  }

}

export class ExcerptView extends PureComponent<{chapter?: Chapter}, {}> {
  // This is a PureComponent, because chapter object identity should stay
  // constant for a single shuffle, so it avoids needless rerender.

  componentDidUpdate() {
    let {container} = this;
    if (container) {
      let extraHeight = container.scrollHeight - container.offsetHeight;
      let offset = extraHeight * random();
      container.scrollTop = offset;
      setTimeout(() => calculateLineSplits(container!), 100);
    }
  }

  container?: HTMLElement;

  render() {
    let {chapter} = this.props;
    return (
      <div
        className={style(
          flex, {
            // When I had 'sans-serif' as a fallback, Chrome used it, despite
            // the custom font being available.
            fontFamily: 'Excerpt',
            fontSize: '250%',
            letterSpacing: '-0.05em',
            position: 'relative',
            wordSpacing: '0.1em',
          },
          padding(0, '1em'),
          scrollY,
        )}
        ref={element => this.container = element!}
      >{
        chapter && chapter.paragraphs!.map((paragraph, paragraphIndex) =>
          <p
            className={style({
              lineHeight: 1.5,
              // Narrow betweens, with indent for contrast.
              margin: '0.3em auto',
              maxWidth: '25em',
              textIndent: '1.5em',
              // Full margin at ends.
              $nest: {
                '&:first-child': {
                  marginTop: '1em',
                },
                '&:last-child': {
                  marginBottom: '1em',
                },
              },
            })}
          >{
            paragraph.verses.map(verse => <span>{verse.text} </span>)
          }</p>
        )
      }</div>
    );
  }

}

export class LibraryView extends Component<
  Library & {
    answer?: Path,
    app: AppView,
    count: number,
    guess?: Path,
  }, {}
> {

  answerElement?: HTMLElement;

  componentDidUpdate() {
    let {answerElement} = this;
    if (answerElement) {
      answerElement.scrollIntoView({behavior: 'smooth'});
    }
  }

  makeGuess = () => {
    let {answer, app} = this.props;
    if (answer) {
      app.shuffle();
    } else {
      app.showAnswer();
    }
  };

  render() {
    let {answer, app, count, guess} = this.props;
    let {outcomes, quizLength} = app.state;
    if (!answer) {
      this.answerElement = undefined;
    }
    let last = outcomes.length == quizLength;
    let score = outcomes.length ? outcomes.slice(-1)[0].score : 0;
    return (
      <div className={style(
        {fontSize: '150%'}, content, vertical, width('25%')
      )}>
        <div className={style(
          flex, margin(0), padding(0, '1em'), scrollY, {cursor: 'default'},
        )}>
          {this.props.items.map(volume =>
            <VolumeView
              answer={
                answer && answer.names[0] == volume.name ? answer : undefined
              }
              guess={guess && guess.names[0] == volume.name ? guess : undefined}
              key={volume.name + count}
              library={this}
              {...{count, ...volume}}
            />,
          )}
        </div>
        <div className={style(
          content,
          horizontal,
          {
            borderTop: '1px solid black',
            margin: '0 0.5em',
            padding: '1em 0.5em 0',
          }
        )}>
          <div className={style(flex)}>
            Round {outcomes.length + (answer ? 0 : 1)} / {quizLength}
          </div>
          <div>
            {
              answer &&
              <span>
                + {outcomes.slice(-1)[0].score}
              </span>
            }
          </div>
        </div>
        <div className={style(content, horizontal, {padding: '1em'})}>
          <div className={style(flex)}>
            <button disabled={!guess} onClick={this.makeGuess} type='button'>
              {answer ? (last ? 'New Game!' : 'Next Excerpt') : 'Make Guess'}
            </button>
          </div>
          <div>
            {last ? 'Final ' : ''}
            Score {sum(function* score() {
              for (let outcome of outcomes) {
                yield outcome.score;
              }
            }())}
          </div>
        </div>
      </div>
    );
  }

}

export interface VolumeProps extends Volume {
  answer?: Path,
  count: number,
  guess?: Path,
  library: LibraryView,
}

export class VolumeView extends Component<VolumeProps, {expanded: boolean}> {

  constructor(props: VolumeProps) {
    super(props);
    this.setState({expanded: !!props.answer});
  }

  onClick = () => {
    let {guess, library, name} = this.props;
    if (!(guess || library.props.answer)) {
      this.setState({expanded: !this.state.expanded})
    }
  }

  render() {
    let {answer, count, guess, library} = this.props;
    let {answer: anyAnswer} = library.props;
    let {expanded} = this.state;
    let extraStyle: CSSProperties =
      !(anyAnswer || guess) ? {$nest: {'&:hover': {fontSize: '120%'}}} : {};
    let expandStyle: CSSProperties =
      answer || expanded || guess ? {} : {display: 'none'};
    return (
      <div>
        <h2
          className={style({
            fontSize: '110%',
            marginBottom: '0.2em',
            ...extraStyle,
          })}
          onClick={this.onClick}
        >{this.props.title}</h2>
        <ul className={style({
          listStyle: 'none',
          marginTop: 0,
          padding: 0,
        })}>
          {this.props.items.map(doc =>
            <li className={style(expandStyle)}><DocView
              {...doc}
              answer={
                answer && answer.names[1] == doc.name ? answer : undefined
              }
              guess={guess && guess.names[1] == doc.name ? guess : undefined}
              // Force a rerender on new shuffle by appended count to key.
              key={doc.name + count}
              volume={this}
            /></li>,
          )}
        </ul>
      </div>
    );
  }

}

function calculateLineSplits(box: HTMLElement) {
  let total = window.innerHeight;
  let minHeight = total * 3 / 8;
  let maxHeight = total * 5 / 8;
  let lines = findLines(box);
  // console.log(box.scrollTop);
  for (let split of arrayify(box.querySelectorAll('.split'))) {
    split.remove();
  }
  let rect = box.querySelector('p')!.getBoundingClientRect();
  let x = rect.left;
  let width = rect.width;
  let addSplit = (y: number, color: string) => {
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
  let lastLine = lines[0];
  let lastTop = lastLine.top;
  addSplit(lastTop, 'black');
  for (let line of lines) {
    // addSplit(line.top, 'blue');
    // addSplit(line.bottom, 'green');
    let distance = line.bottom - lastTop;
    if (distance > maxHeight) {
      // TODO Orphan control.
      addSplit(lastLine.bottom, 'red');
      lastTop = line.top;
      addSplit(lastTop, 'black');
    }
    lastLine = line;
  }
  addSplit(lastLine.bottom, 'red');
}

interface Line {
  bottom: number;
  chunkBegin: boolean;
  chunkEnd: boolean;
  top: number;
};

function findLines(box: HTMLElement) {
  type Edge = {top: boolean, y: number};
  let {max, min} = Math;
  let lines: Line[] = [];
  let offset = box.scrollTop;
  for (let para of arrayify(box.children as any as Indexed<HTMLElement>)) {
    // Gather up top and bottom edges.
    let edges: Edge[] = [];
    let total = 0;
    for (let span of arrayify(para.children as any as Indexed<HTMLElement>)) {
      for (let rect of arrayify(span.getClientRects())) {
        edges.push({top: true, y: rect.top + offset});
        edges.push({top: false, y: rect.bottom + offset});
        ++total;
      }
    }
    // Sort them by y.
    edges.sort((a, b) => a.y - b.y);
    // We expect repeats in all browsers and get way bunches in Chrome, so
    // remove consecutive tops and bottoms.
    // All this should work if bottoms don't overlap later tops.
    // Also presumes we have at least one line.
    let makeLine = (): Line => ({
      bottom: -Infinity, chunkBegin: false, chunkEnd: false, top: Infinity,
    });
    let line = makeLine();
    line.chunkBegin = true;
    for (let edge of edges) {
      // Top.
      if (edge.top) {
        if (isFinite(line.bottom)) {
          lines.push(line);
          line = makeLine();
        }
        line.top = min(line.top, edge.y);
      } else {
        // Bottom.
        line.bottom = max(line.bottom, edge.y);
      }
    }
    line.chunkEnd = true;
    lines.push(line);
  }
  // All done.
  return lines;
}

let highlight: CSSProperties = {
  background: 'silver',
  fontWeight: 'bold',
};

// function pruneNears(values: number[], near: number, keepLast: boolean) {
//   if (!values.length) {
//     return values.slice();
//   }
//   let {abs} = Math;
//   let kept = values[0];
//   let result = [];
//   for (let value of values) {
//     if (abs(value - kept) <= near) {
//       console.log(`pruned ${value}`);
//       if (keepLast) {
//         kept = value;
//       }
//     } else {
//       result.push(kept);
//       kept = value;
//     }
//   }
//   result.push(kept);
//   return result;
// }

function scoreGuess(library: Library, actual: Path, guess: Path) {
  // Presume that the order of volumes is vaguely meaningful or at least
  // interesting.
  // TODO Alternative is to presume disconnect and give either 0 or reserve a
  // TODO portion of the score for text similarity.
  if (actual.names[0] != guess.names[0]) {
    // No points for wrong volume at this point.
    return 0;
  }
  // Narrow down to just the correct volume.
  let volume = library.items.find(volume => volume.name == actual.names[0])!;
  library = {items: [volume]};
  // Now see how close we are.
  let actualOffset = findLibraryTextOffset(library, actual);
  let guessOffset = findLibraryTextOffset(library, guess);
  let distance = Math.abs(actualOffset - guessOffset);
  // Go in units of half pages, so we can explain more easily.
  let wordsPerPage = 2000;
  let librarySize = sum(library.items.map(volume => volume.size!));
  // Closeness between -(x - 1) and 1.
  console.log(distance / wordsPerPage, librarySize / wordsPerPage);
  let closeness = 1 - 5 * (distance / librarySize);
  // Go between 0 and 10 with softplus.
  // Softplus allows a peak near the correct place and somewhat linear falloff.
  let softplus = Math.log(1 + Math.exp(10 * closeness));
  return Math.round(50 * softplus);
}
