export interface Doc {

  size: number;

  title: string;

  titleFull: string;

}

export function usfmParse(text: string) {
  let doc = {} as Doc;
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
      line = line.replace(/\\\w+\*?/g, '');
      lines.push(line);
      size += line.length + 1;
    }
  }
  doc.size = size;
  return doc;
}

function stripTag(line: string) {
  return line.replace(/^\S+\s+/, '');
}
