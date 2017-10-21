import {App, AppView, Library} from './';
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
  let uri = 'https://tjpalmer.github.io/kjv.st/volumes.json';
  let volumes: Library;
  try {
    volumes = await load(uri);
  } catch {
    // Dev workaround.
    uri = 'http://localhost:52119/volumes.json';
    volumes = await load(uri);
  }
  for (let volume of volumes.items) {
    volume.uri = uri;
  }
  // Now do our work.
  render(<AppView library={volumes}/>, document.getElementById('root'));
}

async function load(uri: string) {
  return await (await fetch(uri)).json() as Library;
}
