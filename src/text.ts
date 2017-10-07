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

export interface Verse {

  number?: number;

  text: string;

}
