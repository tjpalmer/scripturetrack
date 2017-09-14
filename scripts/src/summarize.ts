import {argv} from 'process';
import {join} from 'path';
import {open, readdirSync, readFileSync} from 'fs';
import {usfmParse} from '../../src/index';

function summarizeText(dir: string) {
  let names = readdirSync(dir).filter(name => name.endsWith('.usfm')).sort();
  let items = names.map(key => {
    let path = join(dir, key);
    let content = readFileSync(path).toString();
    usfmParse(content);
    return {key, size: content.length};
  });
  return {items};
}

function summarizeTexts(baseDir: string) {
  let textDirs = readdirSync(baseDir).sort();
  let summary = {
    items: textDirs.map(key => ({key, ...summarizeText(join(baseDir, key))})),
  };
  console.log(summary);
  console.log(summary.items[0].items.slice(0, 3));
}

summarizeTexts(argv[2]);
