import {Doc, Library, Volume} from '../../src/text';
import {usfmParse} from '../../src/usfm';
import {load} from 'cheerio';
import {
  existsSync, mkdirSync, open, readdirSync, readFileSync, statSync,
  writeFileSync,
} from 'fs';
import {argv} from 'process';
import {join} from 'path';

function loadText(dir: string) {
  // Overall metadata.
  let coprDoc = load(readFileSync(join(dir, 'copr.htm')).toString());
  let title = coprDoc('title').text().trim();
  // Read info on each book file.
  let names = readdirSync(dir).filter(name => name.endsWith('.usfm')).sort(
    (a, b) => Number(a.split('-')[0]) - Number(b.split('-')[0]),
  );
  let items = names.map(name => {
    let path = join(dir, name);
    let content = readFileSync(path).toString();
    let doc = usfmParse(content, true);
    return {name, ...doc} as Doc;
  });
  return {items, title};
}

function loadTexts(baseDir: string) {
  let textDirs = readdirSync(baseDir).sort().filter(
    name => statSync(join(baseDir, name)).isDirectory(),
  );
  let summary = {
    items: textDirs.map(name => ({
      name, ...loadText(join(baseDir, name)),
    }) as Volume),
  };
  return summary;
}

let apocryphaIds = [
  'TOB', 'JDT', 'ESG', 'WIS', 'SIR', 'BAR', 'S3Y', 'SUS', 'BEL', '1MA', '2MA',
  '1ES', 'MAN', '2ES',
];
let deuterocanonIds = [
  'TOB', 'JDT', 'ESG', 'WIS', 'SIR', 'BAR', '1MA', '2MA', '1ES', 'MAN', 'PS2',
  '3MA', '2ES', '4MA', 'DAG',
];
let oldTestamentIds = new Set([
  'GEN', 'EXO', 'LEV', 'NUM', 'DEU', 'JOS', 'JDG', 'RUT', '1SA', '2SA', '1KI',
  '2KI', '1CH', '2CH', 'EZR', 'NEH', 'EST', 'JOB', 'PSA', 'PRO', 'ECC', 'SNG',
  'ISA', 'JER', 'LAM', 'EZK', 'DAN', 'HOS', 'JOL', 'AMO', 'OBA', 'JON', 'MIC',
  'NAM', 'HAB', 'ZEP', 'HAG', 'ZEC', 'MAL',
]);
let newTestamentIds = new Set([
  'MAT', 'MRK', 'LUK', 'JHN', 'ACT', 'ROM', '1CO', '2CO', 'GAL', 'EPH', 'PHP',
  'COL', '1TH', '2TH', '1TI', '2TI', 'TIT', 'PHM', 'HEB', 'JAS', '1PE', '2PE',
  '1JN', '2JN', '3JN', 'JUD', 'REV',
]);

let inputDir = argv[2];
let outputDir = argv[3];
if (!(inputDir && outputDir)) {
  throw Error('need input and output dirs');
}
let summary = loadTexts(inputDir);
// console.log(summary);
// console.log(summary.items[0].items.slice(0, 3));
// writeFileSync(join(inputDir, 'texts.json'), JSON.stringify(summary));

if (!existsSync(outputDir)) {
  mkdirSync(outputDir);
}
for (let volume of summary.items) {
  // Just keep kjv for now.
  if (!volume.name.match(/kjv/)) {
    continue;
  }
  // Volume dir.
  volume.name = volume.name.replace(/_.*/, '');
  let volumesDir = join(outputDir); //, volume.name);
  if (!existsSync(volumesDir)) {
    mkdirSync(volumesDir);
  }
  console.log(volumesDir);
  // Retitle.
  switch (volume.name) {
    case 'eng-kjv': {
      volume.title = 'Holy Bible (KJV)';
      break;
    }
    case 'eng-web': {
      volume.title = 'Holy Bible (WEB)';
      break;
    }
    default: {
      throw Error(`unrecognized name: ${volume.name}`);
    }
  }
  // Split volumes.
  let oldTestament: Volume = {
    items: [],
    name: 'kjv-ot',
    title: 'Old Testament (KJV)',
  };
  let newTestament: Volume = {
    items: [],
    name: 'kjv-nt',
    title: 'New Testament (KJV)',
  };
  // Documents.
  // Skip extras for now.
  volume.items = volume.items.filter(doc =>
    apocryphaIds.indexOf(doc.id) < 0 && deuterocanonIds.indexOf(doc.id) < 0
  );
  // Loop on the rest.
  for (let doc of volume.items) {
    // Doc dir.
    doc.name = doc.name.replace(/\..*/, '');
    let docDir = join(volumesDir, doc.name);
    if (!existsSync(docDir)) {
      mkdirSync(docDir);
    }
    // console.log(docDir);
    // Chapter files.
    doc.chapters!.forEach((chapter, index) => {
      let chapterPath = join(docDir, `ch${index}.json`);
      if (!existsSync(chapterPath)) {
        writeFileSync(chapterPath, JSON.stringify(chapter));
      }
    });
    // Change to summary for later saving.
    doc.chapterSizes = doc.chapters!.map(chapter => chapter.size);
    delete doc.chapters;
    // Put in right volume.
    let splitVolume =
      oldTestamentIds.has(doc.id) ? oldTestament :
      newTestamentIds.has(doc.id) ? newTestament :
      undefined;
    if (!splitVolume) {
      // Not keeping for now.
      continue;
    }
    splitVolume.items.push(doc);
  }
  let volumes: Library = {items: [oldTestament, newTestament]};
  // Save volume summary.
  let volumesPath = join(volumesDir, 'volumes.json');
  writeFileSync(volumesPath, JSON.stringify(volumes));
}
