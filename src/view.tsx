import {
  Chapter, Doc, IndexItemOffset, Library, Paragraph, Volume, findIndexOffset,
  usfmParse,
} from './';
import {
  content, fillParent, flex, horizontal, margin, padding, scrollY, vertical,
  width,
} from 'csstips';
import * as React from 'react';
import {Component, PureComponent} from 'react';
import {style} from 'typestyle';

export interface App {

  library: Library;

}

export interface AppState {

  actual?: Path;

  chapter?: Chapter;

  chapterIndex?: number;

  guess?: Path;

  // scores: Array<{guess: Array<string>, path: Array<string>, score: number}>;

  showAnswer?: boolean;

}

export interface Path {
  chapterIndex: number;
  names: Array<string>;
}

export class AppView extends Component<App, AppState> {

  constructor(props: App) {
    super(props);
    this.setState({
      // scores: [],
    });
    this.shuffle();
  }

  guess(guess?: Path) {
    this.setState({guess});
  }

  render() {
    let {actual, chapter, guess, showAnswer} = this.state;
    let answer = showAnswer ? actual : undefined;
    return (
      <div className={style(fillParent, horizontal)}>
        <ExcerptView {...{chapter}}/>
        <LibraryView
          app={this}
          {...{answer, guess}}
          {...this.props.library}
        />
      </div>
    );
  }

  showAnswer() {
    this.setState({showAnswer: true});
  }

  shuffle() {
    let {library} = this.props;
    // Calculate total text size, and choose a point in all the text.
    for (let volume of library.items) {
      volume.size = volume.items.reduce((size, doc) => size + doc.size, 0);
    }
    let end = library.items.reduce((size, volume) => size + volume.size!, 0);
    let charIndex = random() * end;
    // Figure out what document and chapter we're in.
    let {item: volume, offset: volumeOffset} =
      findIndexOffset(charIndex, library.items as any) as
      IndexItemOffset<Volume>;
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
      guess: undefined,
      showAnswer: false,
    });
    // TODO Store and load individual chapters rather than whole docs.
    fetch(['texts', ...names].join('/')).then(response => {
      response.text().then(text => {
        let doc = usfmParse(text, true);
        this.setState({chapter: doc.chapters![chapterIndex], chapterIndex});
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
    let {app} = volume.props.library.props;
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

  render() {
    let {answer, doc, guess, index} = this.props;
    let {library} = doc.props.volume.props;
    let className: string;
    if (answer) {
      className = style({
        color: 'green', fontSize: '150%', fontWeight: 'bold',
        ...(guess && highlight as any)
      });
    } else {
      className = style({
        ...(guess && highlight as any),
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
    // TODO This resets on answer change, I guess since the props change.
    // TODO Really, though, I want all collapsed on fresh. How to do that?
    this.setState({expanded: !!props.answer});
  }

  onClick = () => {
    let {name, volume} = this.props;
    let {library} = volume.props;
    if (!library.props.answer) {
      this.setState({expanded: !this.state.expanded})
    }
  }

  render() {
    let {answer, guess, title, volume} = this.props;
    let {expanded} = this.state;
    return (
      <div>
        <div
          className={style({$nest: {'&:hover': {fontWeight: 'bold'}}})}
          onClick={this.onClick}
        >{title}</div>
        <ul>
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
            fontSize: '200%',
          },
          padding(0, '1em'),
          scrollY,
        )}
        ref={element => this.container = element!}
      >{
        chapter && chapter.paragraphs!.map((paragraph, paragraphIndex) =>
          <p
            className={style({
              // Narrow betweens, with indent for contrast.
              margin: '0.3em auto',
              maxWidth: '30em',
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
    let {answer, guess} = this.props;
    if (!answer) {
      this.answerElement = undefined;
    }
    return (
      <div className={style(content, vertical, width('25%'))}>
        <div className={style(
          flex, margin(0), padding(0, '1em'), scrollY, {cursor: 'default'},
        )}>
          {this.props.items.map(volume =>
            <p><VolumeView
              answer={
                answer && answer.names[0] == volume.name ? answer : undefined
              }
              guess={guess && guess.names[0] == volume.name ? guess : undefined}
              key={volume.name}
              library={this}
              {...volume}
            /></p>,
          )}
        </div>
        <div className={style(content, padding('1em'))}>
          <button disabled={!guess} onClick={this.makeGuess} type='button'>
            {answer ? "Next Excerpt" : "Make Guess"}
          </button>
        </div>
      </div>
    );
  }

}

export class VolumeView extends Component<
  Volume & {
    answer?: Path,
    guess?: Path,
    library: LibraryView,
  }, {}
> {

  render() {
    let {answer, guess} = this.props;
    return (
      <div>
        {this.props.title}
        <ul>
          {this.props.items.map(doc =>
            <li><DocView
              {...doc}
              answer={
                answer && answer.names[1] == doc.name ? answer : undefined
              }
              guess={guess && guess.names[1] == doc.name ? guess : undefined}
              key={doc.name}
              volume={this}
            /></li>,
          )}
        </ul>
      </div>
    );
  }

}

export function random() {
  // Generate 8 bytes.
  let ints = new Uint8Array(8);
  crypto.getRandomValues(ints);
  // Manipulate exponent and sign.
  ints[7] = 0x3f;
  ints[6] |= 0xf0;
  // Read as little-endian double, and subtract 1 for just fraction.
  return new DataView(ints.buffer).getFloat64(0, true) - 1;
}

let highlight = {
  background: 'silver',
  fontWeight: 'bold',
};
