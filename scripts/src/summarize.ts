import {argv} from 'process';
import {open, readdirSync} from 'fs';

function read() {
  let names = readdirSync(argv[2]).filter(name => name.endsWith('.usfm'));
  console.log(names);
}

read();
