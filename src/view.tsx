import {Doc, Library, Volume, usfmParse} from './index';
import * as React from 'react';
import {Component} from 'react';

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
    let {library} = props;
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

  render() {
    let {offset, text} = this.state;
    return (
      <div>
        {text && <div>{text.slice(offset, offset + 1000)}</div>}
        <LibraryView {...this.props.library}/>
      </div>
    );
  }

}

export class DocView extends Component<Doc, {}> {

  render() {
    return (
      <div>{this.props.title} - {this.props.size}</div>
    );
  }

}

export class LibraryView extends Component<Library, {}> {

  render() {
    return (
      <ul>
        {this.props.items.map(volume => <li><VolumeView {...volume}/></li>)}
      </ul>
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
  let ints = new Uint8Array(8);
  crypto.getRandomValues(ints);
  ints[7] = 0x3f;
  ints[6] |= 0xf0;
  return new DataView(ints.buffer).getFloat64(0, true) - 1;
}
