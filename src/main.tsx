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
  let hash = window.location.hash;
  let lds = !!hash.match('lds');
  let uris = ['https://tjpalmer.github.io/kjv.st/volumes.json'];
  if (lds) {
    uris.push('https://tjpalmer.github.io/mbo.st/volumes.json');
  }
  let volumes: Library = {items: []};
  let loadVolumes = async (uris: string[]) => {
    let libs = await Promise.all(uris.map(uri => load(uri)));
    for (let lib of libs) {
      volumes.items.push(...lib.items);
    }
  }
  try {
    await loadVolumes(uris);
  } catch {
    // Dev workaround.
    uris = ['http://localhost:52119/volumes.json'];
    if (lds) {
      uris.push('http://localhost:52120/volumes.json');
    }
    await loadVolumes(uris);
  }
  // Now do our work.
  render(<AppView library={volumes}/>, document.getElementById('root'));
}

async function load(uri: string) {
  let lib = await (await fetch(uri)).json() as Library;
  for (let volume of lib.items) {
    volume.uri = uri;
  }
  return lib;
}
