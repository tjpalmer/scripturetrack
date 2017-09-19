import {Doc, Volume, usfmParse} from '../../src/usfm';
import {load} from 'cheerio';
import {open, readdirSync, readFileSync, statSync, writeFileSync} from 'fs';
import {argv} from 'process';
import {join} from 'path';

function summarizeText(dir: string) {
  // Overall metadata.
  let coprDoc = load(readFileSync(join(dir, 'copr.htm')).toString());
  let title = coprDoc('title').text().trim();
  // Read info on each book file.
  let names = readdirSync(dir).filter(name => name.endsWith('.usfm')).sort();
  let items = names.map(name => {
    let path = join(dir, name);
    let content = readFileSync(path).toString();
    let doc = usfmParse(content);
    return {name, ...doc} as Doc;
  });
  return {items, title};
}

function summarizeTexts(baseDir: string) {
  let textDirs = readdirSync(baseDir).sort().filter(
    name => statSync(join(baseDir, name)).isDirectory()
  );
  let summary = {
    items: textDirs.map(name => ({
      name, ...summarizeText(join(baseDir, name)),
    }) as Volume),
  };
  return summary;
}

let baseDir = argv[2];
let summary = summarizeTexts(baseDir);
console.log(summary);
console.log(summary.items[0].items.slice(0, 3));
writeFileSync(join(baseDir, 'texts.json'), JSON.stringify(summary));
