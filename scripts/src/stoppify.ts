import {Chapter} from '../../src/text';
import {
  existsSync, mkdirSync, open, readdirSync, readFileSync, statSync,
  writeFileSync,
} from 'fs';
import {join} from 'path';
import {argv} from 'process';

let {cdf} = require('chi-squared');

let inputDir = argv[2];

let chapterCount = 0;
let textSize = 0;
let bags = [] as Bag[];
for (let chapter of loadChapters(inputDir)) {
  bags.push(baggify(textify(chapter)));
  ++chapterCount;
}
console.log(`Chapters: ${chapterCount}`);

stoppify(bags);

// type Bag = Term[];
type Bag = Map<string, number>;

type Term = [string, number];
// interface Term {
//   count: number;
//   word: string;
// }

function baggify(text: string): Bag {
  let counts = new Map<string, number>();
  let words = text.toLowerCase().split(
    // 201c and 201d are quotation marks.
    // TODO Why others do I need?
    /[\,.;:?!"\u201c\u201d#$%&()\[\]{}\/\\ 0-9\f\n\r\t]+/,
  );
  return countBag(words.filter(x => x).map(word => ([word, 1] as Term)));
}

function countBag(terms: Iterable<Term>) {
  let bag = new Map<string, number>();
  for (let term of terms) {
    bag.set(term[0], (bag.get(term[0]) || 0) + term[1]);
  }
  return bag;
}

function listBag(bag: Bag) {
  return Array.from(bag).sort((a, b) => b[1] - a[1]);
}

function* loadChapters(dir: string): IterableIterator<Chapter> {
  for (let kid of readdirSync(dir)) {
    let abs = join(dir, kid);
    if (statSync(abs).isDirectory()) {
      yield* loadChapters(abs);
    } else if (kid.match(/^ch.*\.json/)) {
      yield JSON.parse(readFileSync(abs).toString()) as Chapter;
    }
  }
}

function normalizedBag(bag: Bag) {
  let sum = Array.from(bag).reduce((sum, term) => sum + term[1], 0);
  return new Map(Array.from(bag).map(
    ([word, count]) => [word, count / sum] as [string, number]),
  );
}

function scoreWords(bags: Bag[], combo: Bag, ignores: Iterable<string> = []) {
  let sum = 0;
  let scores = bags.map(bag => {
    sum += similarity(bag, combo, ignores);
  });
  return sum / bags.length;
}

function similarity(a: Bag, b: Bag, ignores: Iterable<string> = []) {
  let sum = 0;
  // Only count for a, presuming a is smaller, so hopefully faster even if less
  // accurate.
  // let scale = 1.1;
  let count = 0;
  let ignoreSet = new Set(ignores);
  let dot = 0;
  let normA = 0;
  let normB = 0;
  for (let [word, countA] of a) {
    let countB = (b.get(word) || 0) + 1;
    ++count;
    normA += countA * countA;
    normB += countB * countB;
    // Ignore.
    if (ignoreSet.has(word)) {
      continue;
    }
    dot += countA * countB;
    // countA *= scale;
    // countB *= scale;
    let diff = countA - countB;
    let value = (diff * diff);
    sum += value;
  }
  // return 1 - Math.sqrt(sum / a.size);
  // return cdf(sum, count - 1);
  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}

function stoppify(bags: Bag[]) {
  let combo = countBag(function* allBags() {
    for (let bag of bags) {
      yield* bag;
    }
  }());
  // let comboMap =
  //   new Map(combo.map(term => [term.word, term.count] as [string, number]));
  // let counts = combo.map(term => term.count);
  // let words = combo.map(term => term.word);
  combo = normalizedBag(combo);
  // TODO I had the next two lines in. Not sure of the debug purpose.
  // TODO I commented them out so I'd stop getting compiler errors.
  // console.log(combo.size);
  // return;
  // bags.map(bag => {
  //   // let map = new Map(
  //   //   bag.map(term => [term.word, term.count] as [string, number]),
  //   // );
  //   // return words.map(word => map.get(word) || 0);
  //   Array.from(bag).map(([word, count]) => combo.get(word) || 0);
  // })
  // normalizeBag(combo);
  // bags.forEach(bag => normalizeBag(bag));
  // console.log(combo);
  let words = listBag(combo).map(([word, _]) => word);
  // words.reverse();
  bags = bags.map(bag => normalizedBag(bag));
  let ignores = [] as string[];
  let baseScore = scoreWords(bags, combo);
  console.log('-', baseScore);
  console.log('-', similarity(bags[0], bags[1]));
  console.log('-', similarity(bags[2], bags[3]));
  console.log('-', similarity(bags[3], bags[1000]));
  // console.log(listBag(bags[0]));
  // console.log(listBag(bags[3]));
  // console.log(listBag(bags[1000]));
  let stops = [] as string[];
  for (let word of words.slice(0, 100)) {
    // ignores.push(word);
    let score = baseScore - scoreWords(bags, combo, [word]);
    if (score >= 0.001) {
      console.log(word, score);
      stops.push(word);
    }
    if (word == 'even') {
      break;
    }
  }
  console.log('-', scoreWords(bags, combo, stops));
  console.log('-', similarity(bags[0], bags[1], stops));
  console.log('-', similarity(bags[2], bags[3], stops));
  console.log('-', similarity(bags[3], bags[1000], stops));
}

function textify(chapter: Chapter) {
  let verses = [];
  for (let paragraph of chapter.paragraphs) {
    for (let verse of paragraph.verses) {
      verses.push(verse.text);
    }
  }
  // We're not concerned with exact formatting here.
  return verses.join(' ');
}
