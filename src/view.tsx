import {Doc, Library, Volume, usfmParse} from './';
import {
  content, fillParent, flex, horizontal, margin, padding, scrollY, vertical,
  width,
} from 'csstips';
import * as React from 'react';
import {Component} from 'react';
import {style} from 'typestyle';

export interface App {

  library: Library;

}

export interface AppState {

  offset: number;

  path: Array<string>;

  text?: string;

}

export class AppView extends Component<App, AppState> {

  constructor(props: App) {
    super(props);
    this.shuffle();
  }

  render() {
    let {offset, text} = this.state;
    return (
      <div className={style(fillParent, horizontal)}>
        <div className={style(
          flex, {
            // When I had 'sans-serif' as a fallback, Chrome used it, despite
            // the custom font being available.
            fontFamily: 'Excerpt',
            fontSize: '200%',
          },
          padding(0, '1em'),
          scrollY,
        )}>
          <p>
            {text && text.slice(offset, offset + 1000)}
          </p>
        </div>
        <LibraryView appView={this} {...this.props.library}/>
      </div>
    );
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
    let path = [volume.key, volume.items[docIndex].key];
    let offset = charIndex - docBegin;
    fetch(['texts', ...path].join('/')).then(response => {
      response.text().then(text => {
        text = usfmParse(text, true).text!;
        console.log(offset, text.length);
        this.setState({text});
      });
    });
    this.setState({offset, path});
  }

}

export class DocView extends Component<Doc, {}> {

  onClick = () => {
    console.log(this.props.title);
  }

  render() {
    return (
      <div className={style({
        $nest: {
          '&:hover': {
            background: 'orange',
            fontWeight: 'bold',
          }
        },
      })} onClick={this.onClick}>{this.props.title}</div>
    );
  }

}

export class LibraryView extends Component<Library & {appView: AppView}, {}> {

  makeGuess = () => {
    this.props.appView.shuffle();
  };

  render() {
    return (
      <div className={style(content, vertical, width('25%'))}>
        <div className={style(
          flex, margin(0), padding(0, '1em'), scrollY, {cursor: 'default'},
        )}>
          {this.props.items.map(volume => <p><VolumeView {...volume}/></p>)}
        </div>
        <div className={style(content, padding('1em'))}>
          <button onClick={this.makeGuess} type='button'>Make Guess</button>
        </div>
      </div>
    );
  }

}

export class VolumeView extends Component<Volume, {}> {

  render() {
    return (
      <div>
        {this.props.title}
        <ul>
          {this.props.items.map(doc => <li><DocView {...doc}/></li>)}
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
