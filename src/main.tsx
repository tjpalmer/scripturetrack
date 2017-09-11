/// <reference path="../node_modules/@types/react/index.d.ts" />

import * as React from 'react';
import * as ReactDOM from 'react-dom';

function init() {
  ReactDOM.render(
    <Clock/>,
    // document.getElementById('root'),
    document.body,
  );
}

window.addEventListener('load', init);

class Clock extends React.Component<{}, {date: Date}> {

  constructor(props: {}) {
    super(props);
    this.state = {date: new Date()};
  }

  componentDidMount() {
    this.timerID = setInterval(() => this.tick(), 1000);
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
