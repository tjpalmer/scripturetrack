import {usfmParse} from '../../src/index';
import {load} from 'cheerio';
import {open, readdirSync, readFileSync, writeFileSync} from 'fs';
import {argv} from 'process';
import {join} from 'path';

function summarizeText(dir: string) {
  // Overall metadata.
  let coprDoc = load(readFileSync(join(dir, 'copr.htm')).toString());
  let title = coprDoc('title').text().trim();
  // Read info on each book file.
  let keys = readdirSync(dir).filter(name => name.endsWith('.usfm')).sort();
  let items = keys.map(key => {
    let path = join(dir, key);
    let content = readFileSync(path).toString();
    usfmParse(content);
    return {key, size: content.length};
  });
  return {items, title};
}

function summarizeTexts(baseDir: string) {
  let textDirs = readdirSync(baseDir).sort();
  let summary = {
    items: textDirs.map(key => ({key, ...summarizeText(join(baseDir, key))})),
  };
  return summary;
}

let baseDir = argv[2];
let summary = summarizeTexts(baseDir);
console.log(summary);
console.log(summary.items[0].items.slice(0, 3));
writeFileSync(join(baseDir, 'texts.json'), JSON.stringify(summary));
