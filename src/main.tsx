import {App, AppView, Volume} from './';
import {normalize, setupPage} from 'csstips';
import * as React from 'react';
import {Component} from 'react';
import {render} from 'react-dom';

window.addEventListener('load', init);

async function init() {
  // Setup, including removing the preload element.
  document.getElementById('preload')!.remove();
  normalize();
  setupPage('#root');
  // Figure out where our default volume is.
  let uri = '/kjv.st/volume.json';
  let volume: Volume;
  try {
    volume = await load(uri);
  } catch {
    // Dev workaround.
    uri = 'http://localhost:52119/volume.json';
    volume = await load(uri);
  }
  volume.uri = uri;
  // Now do our work.
  let app = {library: {items: [volume]}, path: []};
  render(<AppView {...app}/>, document.getElementById('root'));
}

async function load(uri: string) {
  return await (await fetch(uri)).json() as Volume;
}
