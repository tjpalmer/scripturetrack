export interface Chapter {

  number?: number;

  paragraphs: Array<Paragraph>;

  size: number;

}

export interface DocSelf {

  chapters?: Array<Chapter>;

  size: number;

  text?: string;

  title: string;

  titleFull: string;

}

export interface Doc extends DocSelf {

  name: string;

}

export interface Paragraph {

  size: number;

  verses: Array<Verse>;
  
}
  
export interface Volume {

  items: Array<Doc>;

  name: string;

  title: string;

}

export interface Library {

  items: Array<Volume>;

}

export interface Verse {

  number?: number;

  text: string;

}
  
export function usfmParse(text: string, includeText?: boolean) {
  let doc = {} as DocSelf;
  let lines = [];
  let size = 0;
  let chapter = {paragraphs: [], size: 0} as Chapter;
  let chapters = [] as Array<Chapter>;
  let paragraph = {size: 0, verses: []} as Paragraph;
  let line: string;
  let finishChapter = () => {
    if (includeText) {
      finishParagraph();
      if (chapter.number || chapter.paragraphs.length) {
        chapter.size = chapter.paragraphs.reduce(
          (size, paragraph) => size + paragraph.size, 0,
        );
        chapters.push(chapter);
      }
      chapter = {number: +line, paragraphs: [], size: 0};
    }
  };
  let finishParagraph = () => {
    if (includeText) {
      if (paragraph.verses.length) {
        paragraph.size = paragraph.verses.reduce(
          (size, verse) => size + verse.text.length, 0,
        );
        chapter.paragraphs.push(paragraph);
      }
      paragraph = {size: 0, verses: []};
    }
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
        doc.title = stripTag(line);
        break;
      }
      case 'id':
      case 'toc1':
      case 'toc2':
      case 'toc3': {
        // Just skip these extra titles and such.
        break;
      }
      case 'imt1':
      case 'mt1': {
        doc.titleFull = stripTag(line);
        break;
      }
      case 'p': {
        finishParagraph();
        break;
      }
      default: {
        // Remove Strong's references.
        line = line.replace(/\|[^\\]*/g, '')
        // Remove footnotes.
        line = line.replace(/\\f\b.*?\\f\*/g, '');
        // Remove other tags.
        line = line.replace(/\\\+?\w+\*?/g, '');
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
    doc.text = lines.join('\n') + '\n';
  }
  return doc;
}

function stripTag(line: string) {
  return line.replace(/^\S+\s+/, '');
}
