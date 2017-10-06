import {Chapter, DocSelf, Paragraph} from './';

export function usfmParse(text: string, includeText?: boolean) {
  let doc = {} as DocSelf;
  let lines = [];
  let size = 0;
  let chapter = {paragraphs: [], size: 0} as Chapter;
  let chapterCount = 0;
  let chapters = [] as Array<Chapter>;
  let paragraph = {size: 0, verses: []} as Paragraph;
  let line: string;
  let finishChapter = () => {
    finishParagraph();
    if (chapter.number || chapter.paragraphs!.length) {
      chapter.size = chapter.paragraphs!.reduce(
        (size, paragraph) => size + paragraph.size, 0,
      );
      chapters.push(chapter);
    }
    chapter = {number: +line, paragraphs: [], size: 0};
  };
  let finishParagraph = () => {
    if (paragraph.verses.length) {
      paragraph.size = paragraph.verses.reduce(
        (size, verse) => size + verse.text.length, 0,
      );
      chapter.paragraphs!.push(paragraph);
    }
    paragraph = {size: 0, verses: []};
  };
  for (line of text.split('\n')) {
    line = line.trim();
    // Extract type.
    let split = line.search(/\s|$/);
    let type = line.slice(1, split);
    line = line.slice(split).trim();
    // Switch on type.
    switch (type) {
      case 'c': {
        finishChapter();
        break;
      }
      case 'h': {
        doc.title = line;
        break;
      }
      case 'id': {
        doc.id = line.slice(0, line.search(/\s|$/));
        break;
      }
      case 'imt1':
      case 'mt1': {
        // We're not using this so far, so don't take up space.
        // doc.titleFull = line;
        break;
      }
      case 'p': {
        finishParagraph();
        break;
      }
      case 'toc1':
      case 'toc2':
      case 'toc3': {
        // Just skip these extra titles and such.
        break;
      }
      default: {
        // Remove Strong's references.
        line = line.replace(/\|[^\\]*/g, '')
        // Remove footnotes and cross references.
        line = line.replace(/\\f\b.*?\\f\*/g, '');
        line = line.replace(/\\x\b.*?\\x\*/g, '');
        // Remove other tags.
        line = line.replace(/\\\+?\w+\*?/g, '');
        // Remove degree and paragraph chars.
        // I don't know why there are degree chars.
        line = line.replace(/\xb0|\xb6/g, '');
        let number: number | undefined;
        switch (type) {
          // TODO ip
          case 'v': {
            let split = line.search(/\s|$/);
            number = +line.slice(0, split);
            line = line.slice(split).trim();
            break;
          }
          // No extra steps for others.
          default: break;
        }
        paragraph.verses.push({number, text: line});
        lines.push(line);
        size += line.length + 1;
      }
    }
  }
  finishChapter();
  doc.size = size;
  if (includeText) {
    doc.chapters = chapters;
  } else {
    doc.chapterSizes = chapters.map(chapter => chapter.size);
  }
  return doc;
}

export interface IndexItemOffset<Item> {
  index: number;
  item: Item;
  offset: number;
}

// Default sizer.
export function findIndexOffset<Item extends {size: number}>(
  offset: number, items: Array<Item>,
): IndexItemOffset<Item>;
// Explicit sizer.
export function findIndexOffset<Item>(
  offset: number, items: Array<Item>, sizer: (item: Item) => number,
): IndexItemOffset<Item>;
// Implementation.
export function findIndexOffset<Item>(
  offset: number, items: Array<Item>, sizer?: (item: Item) => number,
) {
  if (!sizer) {
    sizer = (item: Item) => (item as any).size;
  }
  let end = 0;
  let chapterBegins = items.map(item => {
    let prev = end;
    end += sizer!(item);
    return prev;
  });
  let itemIndex = 0;
  let itemBegin = chapterBegins.reverse().find(
    (chapterBegin, index) => {
      itemIndex = chapterBegins.length - index - 1;
      return chapterBegin <= offset;
    },
  ) || 0;
  let item = items[itemIndex];
  return {index: itemIndex, item, offset: offset - itemBegin};
}

function stripTag(line: string) {
  return line.replace(/^\S+\s+/, '');
}
