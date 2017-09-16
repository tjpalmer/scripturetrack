/// <reference path="../node_modules/@types/react/index.d.ts" />

import {Doc, Library, Volume} from './index';
import * as React from 'react';
import {Component} from 'react';
import {render} from 'react-dom';

async function init() {
  let library = await (await fetch('texts/texts.json')).json() as Library;
  render(<LibraryView {...library}/>, document.getElementById('root'));
}

window.addEventListener('load', init);

class Clock extends Component<{}, {date: Date}> {

  constructor(props: {}) {
    super(props);
    this.state = {date: new Date()};
  }

  componentDidMount() {
    this.timerID = window.setInterval(() => this.tick(), 1000);
  }

  componentWillUnmount() {
    clearInterval(this.timerID);
  }

  tick() {
    this.setState({date: new Date()});
  }

  render() {
    return (
      <div>
        <h1>Hello, world!</h1>
        <h2>It is {this.state.date.toLocaleTimeString()}.</h2>
      </div>
    );
  }

  timerID: number;

}

class DocView extends Component<Doc, {}> {
  //
}

class LibraryView extends Component<Library, {}> {

  constructor(props: Library) {
    super(props);
    console.log(props);
  }

  render() {
    return (
      <ul>
        {this.props.items.map(volume => <li>{volume.title}</li>)}
      </ul>
    );
  }

}

class VolumeView extends Component<Volume, {}> {
  //
}
