import {Doc, Library, Volume} from './index';
import * as React from 'react';
import {Component} from 'react';

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
