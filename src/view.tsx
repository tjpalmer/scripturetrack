import {
  Chapter, Doc, Library, Paragraph, Volume, findIndexOffset, usfmParse,
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

  chapter?: Chapter;

  chapterIndex?: number;

  path: Array<string>;

  scores: Array<{guess: Array<string>, path: Array<string>, score: number}>;

  selected?: [string, string];

  showAnswer?: boolean;

}

export class AppView extends Component<App, AppState> {

  constructor(props: App) {
    super(props);
    this.setState({scores: []});
    this.shuffle();
  }

  render() {
    let {chapter, path, selected, showAnswer} = this.state;
    let answer = showAnswer ? path : undefined;
    return (
      <div className={style(fillParent, horizontal)}>
        {/* {
          this.state.showAnswer &&
          <div className={style({
            background: 'white',
            border: '0.1em solid black',
            fontSize: '200%',
            left: '50%',
            padding: '1em',
            position: 'fixed',
            top: '50%',
          })}>
            <div className={style({marginBottom: '1em'})}>
              Yo, dawg!
            </div>
            <div className={style({textAlign: 'center'})}>
              <button type="button">Next</button>
            </div>
          </div>
        } */}
        <ExcerptView {...{chapter}}/>
        <LibraryView
          app={this} {...{answer, selected}} {...this.props.library}
        />
      </div>
    );
  }

  select(path?: [string, string]) {
    console.log('select', path);
    this.setState({selected: path});
  }

  showAnswer() {
    this.setState({showAnswer: true});
    // this.shuffle();
  }

  shuffle() {
    let {library} = this.props;
    for (let volume of library.items) {
      volume.size = volume.items.reduce((size, doc) => size + doc.size, 0);
    }
    let end = library.items.reduce((size, volume) => size + volume.size!, 0);
    let charIndex = random() * end;
    let {item: volume, offset: volumeOffset} =
      findIndexOffset(charIndex, library.items as any);
    let {index: docIndex, offset} = findIndexOffset(volumeOffset, volume.items);
    let path = [volume.name, volume.items[docIndex].name];
    // Set text to undefined before we try loading, so we don't flash to random
    // spot of current text.
    this.setState({
      chapter: undefined,
      chapterIndex: undefined,
      path,
      selected: undefined,
      showAnswer: false,
    });
    fetch(['texts', ...path].join('/')).then(response => {
      response.text().then(text => {
        let doc = usfmParse(text, true);
        let {index: chapterIndex, item: chapter, offset: chapterOffset} =
          findIndexOffset(offset, doc.chapters!);
        console.log(path, chapterIndex);
        text = doc.text!;
        console.log(offset, text.length);
        this.setState({chapter, chapterIndex});
      });
    });
  }

}

export class DocView extends Component<
  Doc & {
    answer: boolean,
    selected: boolean,
    volume: VolumeView,
  }, {}
> {

  onClick = () => {
    let {name, volume} = this.props;
    volume.props.library.props.app.select([volume.props.name, name]);
  }

  render() {
    let {answer, selected, title, volume} = this.props;
    let className: string;
    if (answer) {
      className = style({
        color: 'green', fontSize: '150%', fontWeight: 'bold',
        ...(selected && highlight as any)
      });
    } else {
      className = style({
        ...(selected && highlight as any),
        $nest: {
          '&:hover': highlight as any,
        },
      });
    }
    return (
      <div
        {...{className}}
        onClick={this.onClick}
        ref={element => {
          if (answer) {
            volume.props.library.answerElement = element!;
          }
        }}
      >{
        title
      }</div>
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
        chapter && chapter.paragraphs.map((paragraph, paragraphIndex) =>
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
    answer?: Array<string>,
    app: AppView,
    selected: [string, string] | undefined,
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
    let {answer, selected} = this.props;
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
                answer && volume.name == answer[0] ? answer[1] : undefined
              }
              key={volume.name}
              library={this}
              selected={
                selected && volume.name == selected[0] ? selected[1] : undefined
              }
              {...volume}
            /></p>,
          )}
        </div>
        <div className={style(content, padding('1em'))}>
          <button disabled={!selected} onClick={this.makeGuess} type='button'>
            {answer ? "Next Excerpt" : "Make Guess"}
          </button>
        </div>
      </div>
    );
  }

}

export class VolumeView extends Component<
  Volume & {
    answer: string | undefined,
    library: LibraryView,
    selected: string | undefined,
  }, {}
> {

  render() {
    let {answer, selected} = this.props;
    return (
      <div>
        {this.props.title}
        <ul>
          {this.props.items.map(doc =>
            <li><DocView
              {...doc}
              answer={answer == doc.name}
              key={doc.name}
              selected={selected == doc.name}
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
