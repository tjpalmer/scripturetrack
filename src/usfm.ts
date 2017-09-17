export interface SelfDoc {

  size: number;

  text?: string;

  title: string;

  titleFull: string;

}

export interface Doc extends SelfDoc {

  key: string;

}

export interface Volume {

  items: Array<Doc>;

  key: string;

  title: string;

}

export interface Library {

  items: Array<Volume>;

}

export function usfmParse(text: string, includeText?: boolean) {
  let doc = {} as SelfDoc;
  let lines = [];
  let size = 0;
  for (let line of text.split('\n')) {
    line = line.trim();
    // TODO Extract start first.
    if (line.startsWith('\\h')) {
      doc.title = stripTag(line);
    } else if (line.startsWith('\\mt1') || line.startsWith('\\imt1')) {
      doc.titleFull = stripTag(line);
    } else {
      // Remove Strong's references.
      line = line.replace(/\|[^\\]*/g, '')
      // Remove footnotes.
      line = line.replace(/\\f\b.*?\\f\*/g, '');
      // Remove other tags.
      line = line.replace(/\\\+?\w+\*?/g, '');
      lines.push(line);
      size += line.length + 1;
    }
  }
  doc.size = size;
  if (includeText) {
    doc.text = lines.join('\n') + '\n';
  }
  return doc;
}

function stripTag(line: string) {
  return line.replace(/^\S+\s+/, '');
}
