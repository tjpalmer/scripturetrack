import {sum} from './';

export interface Chapter {

  number?: number;

  paragraphs: Array<Paragraph>;

  size: number;

}

export interface Doc extends DocSelf {

  name: string;

}

export interface DocSelf {
  // DocSelf doesn't know its context.
  // It gets the uglier name because usually I care about docs with names on
  // them.

  chapterSizes?: Array<number>;

  chapters?: Array<Chapter>;

  id: string;

  size: number;

  title: string;

  // titleFull: string;
  
}

export interface IndexItemOffset<Item> {
  index: number;
  item: Item;
  offset: number;
}

export interface Paragraph {

  size: number;

  verses: Array<Verse>;
  
}
  
export interface Volume {

  items: Array<Doc>;

  name: string;

  size?: number;

  title: string;

  uri?: string;

}

export interface Library {

  items: Array<Volume>;

}

export interface Path {
  chapterIndex: number;
  names: Array<string>;
}

export interface Verse {

  number?: number;

  text: string;

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

export function findLibraryTextOffset(library: Library, path: Path) {
  let offset = 0;
  for (let volume of library.items) {
    if (volume.name == path.names[0]) {
      // Right volume.
      for (let doc of volume.items) {
        if (doc.name == path.names[1]) {
          // Right document.
          // Add up to our point.
          let {chapterSizes} = doc;
          if (!chapterSizes) {
            // Support either sizes or actual chapters, just to be flexible.
            chapterSizes = doc.chapters!.map(chapter => chapter.size);
          }
          chapterSizes = chapterSizes.slice(0, path.chapterIndex + 1);
          // But go for the midpoint of the chapter in question, and we're done.
          offset += sum(chapterSizes) - chapterSizes.slice(-1)[0] / 2;
          return offset;
        } else {
          offset += doc.size;
        }
      }
    } else {
      offset += volume.size!;
    }
  }
  throw new Error('path not found');
}
