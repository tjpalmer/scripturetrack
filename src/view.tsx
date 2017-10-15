import {
  Chapter, ExcerptScroller, Library, LibraryView, Path, findIndexOffset,
  findLibraryTextOffset, random, sum,
} from './';
import {fillParent, horizontal, someChildWillScroll} from 'csstips';
import * as React from 'react';
import {Component} from 'react';
import {style, types as styletypes} from 'typestyle';

export interface App {

  library: Library;

}

export interface AppState {

  actual?: Path;

  chapter?: Chapter;

  chapterIndex?: number;

  count: number;
  
  guess?: Path;

  outcomes: Outcome[];

  quizLength: number;

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
    this.state = {
      count: 0,
      outcomes: [],
      quizLength: 5,
    };
    this.shuffle(true);
  }

  guess(guess?: Path) {
    this.setState({guess});
  }

  render() {
    let {actual, chapter, count, guess, showAnswer} = this.state;
    let answer = showAnswer ? actual : undefined;
    return (
      <div className={style(fillParent, horizontal, someChildWillScroll)}>
        <ExcerptScroller {...{chapter}}/>
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

  shuffle(first?: boolean) {
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
    let newState = {
      actual: {chapterIndex, names},
      chapter: undefined,
      chapterIndex,
      count: this.state.count + 1,
      guess: undefined,
      outcomes: outcomes.length < quizLength ? outcomes : [],
      showAnswer: false,
    };
    if (first) {
      Object.assign(this.state, newState);
    } else {
      this.setState(newState);
    }
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
