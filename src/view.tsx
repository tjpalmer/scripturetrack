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

  chapterOffset?: number;

  offset: number;

  path: Array<string>;

  selected?: [string, string];

  text?: string;

}

export class AppView extends Component<App, AppState> {

  constructor(props: App) {
    super(props);
    this.shuffle();
  }

  render() {
    let {chapter, chapterOffset, offset, text} = this.state;
    return (
      <div className={style(fillParent, horizontal)}>
        <ExcerptView {...{chapter, chapterOffset, offset, text}}/>
        <LibraryView
          app={this} selected={this.state.selected} {...this.props.library}
        />
      </div>
    );
  }

  select(path?: [string, string]) {
    console.log('select', path);
    this.setState({selected: path});
  }

  shuffle() {
    let {library} = this.props;
    let end = 0;
    let begins = library.items.map(volume =>
      volume.items.map(doc => {
        let prev = end;
        end += doc.size;
        return prev;
      })
    );
    let charIndex = random() * end;
    let volumeIndex = -1;
    let volumeBegins = begins.reverse().find((docBegins, index) => {
      volumeIndex = begins.length - index - 1;
      return docBegins[0] <= charIndex;
    })!;
    let docIndex = -1;
    let docBegin = volumeBegins.reverse().find((docBegin, index) => {
      docIndex = volumeBegins.length - index - 1;
      return docBegin <= charIndex;
    })!;
    console.log(
      charIndex, volumeIndex, docIndex,
      library.items[volumeIndex].items[docIndex],
    );
    let volume = library.items[volumeIndex];
    let path = [volume.name, volume.items[docIndex].name];
    let offset = charIndex - docBegin;
    // Set text to undefined before we try loading, so we don't flash to random
    // spot of current text.
    this.setState({
      chapter: undefined, chapterIndex: undefined, path, selected: undefined,
      text: undefined,
    });
    fetch(['texts', ...path].join('/')).then(response => {
      response.text().then(text => {
        let doc = usfmParse(text, true);
        let {index: chapterIndex, item: chapter, offset: chapterOffset} =
          findIndexOffset(
            offset, doc.chapters!, chapter => chapter.size,
          );
        text = doc.text!;
        console.log(offset, text.length);
        this.setState({chapter, chapterIndex, chapterOffset, text, offset});
      });
    });
  }

}

export class DocView extends Component<
  Doc & {
    selected: boolean,
    volume: VolumeView,
  }, {}
> {

  onClick = () => {
    let {name, volume} = this.props;
    volume.props.library.props.app.select([volume.props.name, name]);
  }

  render() {
    return (
      <div className={style({
        ...(this.props.selected && highlight as any),
        $nest: {
          '&:hover': highlight as any,
        },
      })} onClick={this.onClick}>{this.props.title}</div>
    );
  }

}

export class ExcerptView extends PureComponent<{
  chapter?: Chapter, chapterOffset?: number, offset?: number, text?: string,
}, {}> {
  // This is a PureComponent, because chapter object identity should stay
  // constant for a single shuffle, so it avoids needless rerender.

  componentDidUpdate() {
    // TODO Replace this with random y offset!!!
    if (this.startElement) {
      this.startElement.scrollIntoView(true);
    }
  }

  render() {
    let {chapter, chapterOffset, offset, text} = this.props;
    let paragraphOffsetIndex = chapter && findIndexOffset(
      chapterOffset!, chapter.paragraphs, paragraph => paragraph.size,
    ).index;
    return (
      <div className={style(
        flex, {
          // When I had 'sans-serif' as a fallback, Chrome used it, despite
          // the custom font being available.
          fontFamily: 'Excerpt',
          fontSize: '200%',
        },
        padding(0, '1em'),
        scrollY,
      )}>{
        chapter && chapter.paragraphs.map((paragraph, paragraphIndex) =>
          <p
            className={style({
              // Narrow betweens, with indent for contrast.
              margin: '0.5em 0',
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
            ref={element => {
              if (paragraphIndex == paragraphOffsetIndex) {
                this.startElement = element!;
              }
            }}
          >{
            paragraph.verses.map(verse => <span>{verse.text} </span>)
          }</p>
        )
      }</div>
    );
  }

  startElement?: HTMLElement;

}

export class LibraryView extends Component<
  Library & {
    app: AppView,
    selected: [string, string] | undefined,
  }, {}
> {

  makeGuess = () => {
    this.props.app.shuffle();
  };

  render() {
    let {selected} = this.props;
    return (
      <div className={style(content, vertical, width('25%'))}>
        <div className={style(
          flex, margin(0), padding(0, '1em'), scrollY, {cursor: 'default'},
        )}>
          {this.props.items.map(volume =>
            <p><VolumeView
              key={volume.name}
              library={this} {...volume}
              selected={
                selected && volume.name == selected[0] ? selected[1] : undefined
              }
            /></p>,
          )}
        </div>
        <div className={style(content, padding('1em'))}>
          <button disabled={!selected} onClick={this.makeGuess} type='button'>
            Make Guess
          </button>
        </div>
      </div>
    );
  }

}

export class VolumeView extends Component<
  Volume & {
    library: LibraryView,
    selected: string | undefined,
  }, {}
> {

  render() {
    let {selected} = this.props;
    return (
      <div>
        {this.props.title}
        <ul>
          {this.props.items.map(doc =>
            <li><DocView
              key={doc.name}
              selected={selected == doc.name}
              volume={this} {...doc}
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
