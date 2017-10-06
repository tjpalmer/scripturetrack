import {App, AppView, Library} from './';
import {normalize, setupPage} from 'csstips';
import * as React from 'react';
import {Component} from 'react';
import {render} from 'react-dom';

async function init() {
  // Setup, including removing the preload element.
  document.getElementById('preload')!.remove();
  normalize();
  setupPage('#root');
  // Now do our work.
  let library = await (await fetch('texts/texts.json')).json() as Library;
  let app = {library, path: []};
  render(<AppView {...app}/>, document.getElementById('root'));
}

window.addEventListener('load', init);
