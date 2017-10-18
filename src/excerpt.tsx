import {Chapter, Indexed, arrayify, random} from './';
import {flex, padding, vertical} from 'csstips';
import * as React from 'react';
import {Component, PureComponent} from 'react';
import ChevronDown from 'react-feather/dist/icons/chevron-down';
import ChevronUp from 'react-feather/dist/icons/chevron-up';
import {style} from 'typestyle';

export class ExcerptScroller
  extends PureComponent<
    {chapter?: Chapter},
    {bottom: boolean, ready: boolean, page?: number, top: boolean}
  >
  implements Scroller
{

  markEnd(top: boolean, bottom: boolean): void {
    this.setState({bottom, ready: true, top});
  }

  render() {
    let {chapter} = this.props;
    let {bottom, page, ready, top} = this.state || {} as any;
    return (
      <div className={style(flex, vertical)}>
        <ScrollButton scroller={this} dir='up' end={top || !ready}/>
        <ExcerptView page={page} scroller={this} {...{chapter}}/>
        <ScrollButton scroller={this} dir='down' end={bottom || !ready}/>
      </div>
    );
  }

  scroll(dir: 'up' | 'down'): void {
    if (this.state.page != undefined) {
      let offset = dir == 'up' ? -1 : 1;
      this.setState({page: this.state.page! + offset});
    }
  }

  setPage(page: number) {
    this.setState({page});
  }

}

class ExcerptView extends PureComponent<
  {chapter?: Chapter, page?: number, scroller: Scroller}, {ready?: boolean}
> {
  // This is a PureComponent, because chapter object identity should stay
  // constant for a single shuffle, so it avoids needless rerender.

  componentDidUpdate() {
    let {container} = this;
    if (container) {
      this.split();
      if (!this.watchingResize) {
        let listener = () => {
          if (!(this.container && document.contains(this.container))) {
            // Just as a failsafe.
            this.maxHeight = window.innerHeight * 5 / 8;
            window.removeEventListener('resize', listener);
            this.watchingResize = false;
          }
          // TODO Remember where are in text rather than random jumping.
          this.setState({ready: false});
          window.setTimeout(() => {
            this.splits = [];
            this.split();
          }, 100);
        };
        window.addEventListener('resize', listener);
        this.watchingResize = true;
      }
    }
  }

  container?: HTMLElement;

  maxHeight = window.innerHeight * 5 / 8;

  render() {
    let {chapter} = this.props;
    let {ready} = this.state || {} as any;
    let minScreen = Math.min(screen.height, screen.width) / devicePixelRatio;
    let fontSize = minScreen / 24;
    return (
      <div
        className={style(
          {
            // When I had 'sans-serif' as a fallback, Chrome used it, despite
            // the custom font being available.
            fontFamily: 'Excerpt',
            fontSize: `${fontSize}px`,
            height: `${this.maxHeight}px`,
            letterSpacing: '-0.05em',
            overflow: 'hidden',
            position: 'relative',
            visibility: ready ? 'visible' : 'hidden',
            wordSpacing: '0.1em',
          },
          padding(0, '1em'),
        )}
        ref={element => this.container = element!}
      >{
        chapter && chapter.paragraphs!.map((paragraph, paragraphIndex) =>
          <p
            className={style({
              lineHeight: 1.5,
              // Narrow betweens, with indent for contrast.
              margin: '0.3em auto',
              maxWidth: '25em',
              textIndent: '1.5em',
              // Full margin at ends.
              $nest: {
                '&:first-child': {
                  marginTop: '1em',
                },
                '&:last-child': {
                  marginBottom: '1em',
                },
              },
            })}
          >{
            paragraph.verses.map(verse => <span>{verse.text} </span>)
          }</p>
        )
      }</div>
    );
  }

  split() {
    // Actually, watch repeatedly until things stop changing.
    setTimeout(() => {
      let {container, maxHeight, props, splits} = this;
      // TODO Check for changed splits rather than any splits or chapter change.
      let splitIndex: number | undefined = this.props.page;
      if (container && !(
        splits.length && this.splitChapter == this.props.chapter
      )) {
        this.splitChapter = this.props.chapter;
        // Find splits.
        splits = this.splits = calculateLineSplits(container);
        // Pick one.
        splitIndex = Math.floor(splits.length * random());
        // Go to it.
        this.props.scroller.setPage(splitIndex!);
        // Show ourselves.
        this.setState({ready: true});
      }
      if (container && splitIndex != undefined) {
        let split = splits[splitIndex];
        let height = split.height;
        container.style.height = `${height}px`;
        let extra = maxHeight - height;
        if (extra >= 0) {
          // TODO Why do we go too far sometimes? On single-paragraph chapters?
          let extraTop = Math.floor(extra / 2);
          let extraBottom = extra - extraTop;
          container.style.marginTop = `${extraTop}px`;
          container.style.marginBottom = `${extraBottom}px`;
        }
        container.scrollTop = split.top;
        // Update limits.
        this.props.scroller.markEnd(
          splitIndex == 0, splitIndex == splits.length - 1,
        );
      }
    }, 100);
  }

  splitChapter?: Chapter;

  splits: Split[] = [];

  watchingResize = false;

}

class ScrollButton extends Component<
  {dir: 'up' | 'down', end: boolean, scroller: Scroller}, {}
> {

  render() {
    let {dir, end, scroller} = this.props;
    let size = window.innerHeight / 16;
    return (
      <div
        className={style(
          flex,
          vertical,
          {
            color: end ? '#bbb' : 'black',
            fontSize: '4em',
            textAlign: 'center',
          }
        )}
      >
        <div className={style(flex)}></div>
        <div className={style(flex)}>
          <span
            className={style({cursor: 'default', padding: '1em'})}
            onClick={() => !end && scroller.scroll(dir)}
          >{
            dir == 'up' ?
              <ChevronUp size={size}/> :
              <ChevronDown size={size}/>
          }</span>
        </div>
        <div className={style(flex)}></div>
      </div>
    );
  }

}

interface Scroller {
  
  markEnd(top: boolean, bottom: boolean): void;

  scroll(dir: 'up' | 'down'): void;

  setPage(page: number): void;
  
}
  
function calculateLineSplits(box: HTMLElement) {
  // Set limits.
  let total = window.innerHeight;
  // TODO For orphan control.
  // TODO let minHeight = total * 3 / 8;
  let maxHeight = total * 5 / 8;
  // Calculate splits.
  let splits: Split[] = [];
  // Get lines, then iterate on them.
  let lines = findLines(box);
  let lastLine = lines[0];
  let lastTop = lastLine.top;
  let split = {height: 0, top: lastTop};
  let pushSplit = () => {
    split.height = lastLine.bottom - split.top;
    splits.push(split);
    split = {height: 0, top: lastTop};
  };
  for (let line of lines) {
    let distance = line.bottom - lastTop;
    if (distance > maxHeight) {
      // TODO Orphan control.
      lastTop = line.top;
      pushSplit();
    }
    lastLine = line;
  }
  pushSplit();
  // Option debug visuals.
  // drawSplits();
  // All done.
  return splits;
}

function drawSplits(box: HTMLElement, splits: Split[]) {
  for (let split of arrayify(box.querySelectorAll('.split'))) {
    split.remove();
  }
  let rect = box.querySelector('p')!.getBoundingClientRect();
  let x = rect.left;
  let width = rect.width;
  let addSplit = (y: number, color: string) => {
    let split = document.createElement('div');
    split.setAttribute('class', 'split');
    split.setAttribute('style', `
      background: ${color};
      height: 1px;
      left: ${x}px;
      position: absolute;
      top: ${y}px;
      width: ${width}px;
    `);
    box.appendChild(split);
  };
  for (let split of splits) {
    addSplit(split.top, 'black');
    addSplit(split.top + split.height, 'red');
  }
}

interface Line {
  bottom: number;
  chunkBegin: boolean;
  chunkEnd: boolean;
  top: number;
};

interface Split {
  height: number;
  top: number;
}

function findLines(box: HTMLElement) {
  type Edge = {top: boolean, y: number};
  let {max, min} = Math;
  let lines: Line[] = [];
  let offset = box.scrollTop - box.offsetTop;
  for (let para of arrayify(box.children as any as Indexed<HTMLElement>)) {
    // Gather up top and bottom edges.
    let edges: Edge[] = [];
    let total = 0;
    for (let span of arrayify(para.children as any as Indexed<HTMLElement>)) {
      for (let rect of arrayify(span.getClientRects())) {
        edges.push({top: true, y: rect.top + offset});
        edges.push({top: false, y: rect.bottom + offset});
        ++total;
      }
    }
    // Sort them by y.
    edges.sort((a, b) => a.y - b.y);
    // We expect repeats in all browsers and get way bunches in Chrome, so
    // remove consecutive tops and bottoms.
    // All this should work if bottoms don't overlap later tops.
    // Also presumes we have at least one line.
    let makeLine = (): Line => ({
      bottom: -Infinity, chunkBegin: false, chunkEnd: false, top: Infinity,
    });
    let line = makeLine();
    line.chunkBegin = true;
    for (let edge of edges) {
      // Top.
      if (edge.top) {
        if (isFinite(line.bottom)) {
          lines.push(line);
          line = makeLine();
        }
        line.top = min(line.top, edge.y);
      } else {
        // Bottom.
        line.bottom = max(line.bottom, edge.y);
      }
    }
    line.chunkEnd = true;
    lines.push(line);
  }
  // All done.
  return lines;
}

// function pruneNears(values: number[], near: number, keepLast: boolean) {
//   if (!values.length) {
//     return values.slice();
//   }
//   let {abs} = Math;
//   let kept = values[0];
//   let result = [];
//   for (let value of values) {
//     if (abs(value - kept) <= near) {
//       console.log(`pruned ${value}`);
//       if (keepLast) {
//         kept = value;
//       }
//     } else {
//       result.push(kept);
//       kept = value;
//     }
//   }
//   result.push(kept);
//   return result;
// }
