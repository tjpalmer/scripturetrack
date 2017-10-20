import {
  AppView, Chapter, CSSProperties, Doc, Library, Outcome, Path, Volume, sum,
} from './';
import {
  content, flex, horizontal, margin, padding, scrollY, vertical, width,
} from 'csstips';
import * as React from 'react';
import {Component} from 'react';
import {ChevronsLeft, ChevronsRight, Settings} from './feather';
import {style} from 'typestyle';

class ChapterView extends Component<
  {answer?: Path, doc: DocView, guess?: Path, index: number}, {}
> {

  onClick = () => {
    let {doc, index, guess} = this.props;
    let {volume} = doc.props;
    let {answer: anyAnswer, app} = volume.props.library.props;
    if (!anyAnswer) {
      if (guess) {
        // Unguess this.
        app.guess();
      } else {
        // Guess it.
        app.guess({
          chapterIndex: index, names: [volume.props.name, doc.props.name],
        });
      }
    }
  }

  render() {
    let {answer, doc, guess, index} = this.props;
    let {library} = doc.props.volume.props;
    let className: string;
    let common = {
      letterSpacing: '-0.05em',
      minWidth: '1.3em',
      padding: '0.2em',
      textAlign: 'center',
    };
    if (answer) {
      className = style({
        color: 'green', fontSize: '150%', fontWeight: 'bold',
        ...(guess && highlight as any),
        ...common,
      });
    } else {
      className = style({
        ...(guess && highlight as any),
        ...common,
        $nest: !library.props.answer && {
          '&:hover': highlight as any,
        },
      });
    }
    return <li
      {...{className}}
      ref={element => {
        if (answer) {
          library.answerElement = element!;
        }
      }}
      onClick={this.onClick}
    >{index + 1}</li>;    
  }

}

interface DocProps extends Doc {
  answer? :Path,
  guess?: Path,
  volume: VolumeView,
}

class DocView extends Component<DocProps, {expanded: boolean}> {

  constructor(props: DocProps) {
    super(props);
    this.state = {expanded: !!props.answer};
  }

  onClick = () => {
    let {guess, name, volume} = this.props;
    let {library} = volume.props;
    if (!(guess || library.props.answer)) {
      this.setState({expanded: !this.state.expanded})
    }
  }

  render() {
    let {answer, guess, title, volume} = this.props;
    let {expanded} = this.state;
    let {answer: anyAnswer} = volume.props.library.props;
    return (
      <div>
        <div
          className={style(
            !(anyAnswer || guess) && {$nest: {'&:hover': {fontWeight: 'bold'}}},
          )}
          onClick={this.onClick}
        >{title}</div>
        <ul className={style({
          display: 'flex',
          flexDirection: 'row',
          flexWrap: 'wrap',
          listStyle: 'none',
          padding: 0,
        })}>
          {(answer || expanded || guess) && this.props.chapterSizes!.map(
            (_, chapterIndex) => <ChapterView
              answer={
                answer && answer.chapterIndex == chapterIndex ?
                  answer : undefined
              }
              doc={this}
              guess={
                guess && guess.chapterIndex == chapterIndex ? guess : undefined
              }
              index={chapterIndex}
            />,
          )}
        </ul>
      </div>
    );
  }

}

export class LibraryView extends Component<
  Library & {
    answer?: Path,
    app: AppView,
    count: number,
    guess?: Path,
  }, {
    shown?: boolean,
  }
> {

  answerElement?: HTMLElement;

  componentDidUpdate() {
    let {answerElement} = this;
    if (answerElement) {
      answerElement.scrollIntoView({behavior: 'smooth'});
    }
  }

  makeGuess = () => {
    let {answer, app} = this.props;
    if (answer) {
      this.setState({shown: false});
      app.shuffle();
    } else {
      app.showAnswer();
    }
  };

  render() {
    let {answer, app, count, guess, items: volumes} = this.props;
    let {outcomes, quizLength} = app.state;
    let {shown} = this.state || {} as any;
    if (!answer) {
      this.answerElement = undefined;
    }
    let last = outcomes.length == quizLength;
    let score = outcomes.length ? outcomes.slice(-1)[0].score : 0;
    let iconSize = 6.25;
    return (
      <div
        className={style(
          content,
          vertical,
          {
            background: 'white',
            borderLeft: '1px solid black',
            bottom: 0,
            fontSize: `3.125vh`,
            right: shown ? 0 : '-90vmin',
            position: 'fixed',
            width: `90vmin`,
            top: 0,
          },
        )}
      >
        <div
          className={style({
            display: shown ? 'none' : 'block',
            left: `-${iconSize * 6 / 4}vh`,
            padding: `${iconSize / 4}vh`,
            position: 'absolute',
          })}
          onClick={this.togglePanel}
        >
          <ChevronsLeft/>
        </div>
        <div className={style({
          background: 'rgba(255, 255, 255, 0.2)',
          position: 'absolute',
          right: 0,
        })}>
          <div className={style({padding: '0.5em'})} onClick={this.togglePanel}>
            <ChevronsRight/>
          </div>
          <div className={style({padding: '0.5em'})}>
            <Settings
              color='#bbb'
              className={style({padding: '0.9375vh'})}
            />
          </div>
        </div>
        <div className={style(
          flex, margin(0), scrollY, {
            cursor: 'default',
            paddingLeft: '1em',
            paddingRight: `${iconSize}vh`,
          },
        )}>
          {this.props.items.map(volume =>
            <VolumeView
              answer={
                answer && answer.names[0] == volume.name ? answer : undefined
              }
              guess={guess && guess.names[0] == volume.name ? guess : undefined}
              key={volume.name + count}
              library={this}
              {...{count, ...volume}}
            />,
          )}
        </div>
        <div className={style(
          content,
          horizontal,
          {
            borderTop: '1px solid black',
            margin: '0 0.5em',
            padding: '1em 0.5em 0',
          }
        )}>
          <div className={style(flex)}>
            Round {outcomes.length + (answer ? 0 : 1)} / {quizLength}
          </div>
          <div>
            {
              answer &&
              <span>
                + {outcomes.slice(-1)[0].score}
              </span>
            }
          </div>
        </div>
        <div className={style(content, horizontal, {padding: '1em'})}>
          <div className={style(flex)}>
            <button disabled={!guess} onClick={this.makeGuess} type='button'>
              {answer ? (last ? 'New Game!' : 'Next Excerpt') : 'Make Guess'}
            </button>
          </div>
          <div>
            {last ? 'Final ' : ''}
            Score {sum(function* score() {
              for (let outcome of outcomes) {
                yield outcome.score;
              }
            }())}
          </div>
        </div>
        {last && <SummaryView {...{outcomes, volumes}}/>}
      </div>
    );
  }

  togglePanel = () => {
    this.setState({shown: !(this.state || {} as any).shown});
  };

}

class SummaryView extends Component<
  {outcomes: Outcome[], volumes: Volume[]}, {}
> {

  render() {
    let {outcomes, volumes} = this.props;
    let thClass = style({textAlign: 'left'});
    let Head = ({text}: {text: string}) => <th className={thClass}>{text}</th>;
    let renderPath = (path: Path) => {
      let volume = volumes.find(volume => volume.name == path.names[0])!;
      let doc = volume.items.find(doc => doc.name == path.names[1])!;
      return <td>{doc.title} {path.chapterIndex + 1}</td>;
    };
    return (
      <div className={style({padding: '0 1em 1em'})}>
        <table className={style(
          flex,
          {
            borderCollapse: 'separate',
            borderSpacing: '1em 0.5em',
            width: '100%',
          },
        )}>
          <thead>
            <tr>
              <Head text='Actual'/><Head text='Guess'/><Head text='Score'/>
            </tr>
          </thead>
          <tbody>{
            outcomes.map(outcome => <tr>
              {renderPath(outcome.actual)}
              {renderPath(outcome.guess)}
              <td>+ {outcome.score}</td>
            </tr>)
          }</tbody>
        </table>
      </div>
    );
  }

}

interface VolumeProps extends Volume {
  answer?: Path,
  count: number,
  guess?: Path,
  library: LibraryView,
}

class VolumeView extends Component<VolumeProps, {expanded: boolean}> {

  constructor(props: VolumeProps) {
    super(props);
    this.state = {expanded: !!props.answer};
  }

  onClick = () => {
    let {guess, library, name} = this.props;
    if (!(guess || library.props.answer)) {
      this.setState({expanded: !this.state.expanded})
    }
  }

  render() {
    let {answer, count, guess, library} = this.props;
    let {answer: anyAnswer} = library.props;
    let {expanded} = this.state;
    let extraStyle: CSSProperties =
      !(anyAnswer || guess) ? {$nest: {'&:hover': {fontSize: '120%'}}} : {};
    let expandStyle: CSSProperties =
      answer || expanded || guess ? {} : {display: 'none'};
    return (
      <div>
        <h2
          className={style({
            fontSize: '110%',
            marginBottom: '0.2em',
            ...extraStyle,
          })}
          onClick={this.onClick}
        >{this.props.title}</h2>
        <ul className={style({
          listStyle: 'none',
          marginTop: 0,
          padding: 0,
        })}>
          {this.props.items.map(doc =>
            <li className={style(expandStyle)}><DocView
              {...doc}
              answer={
                answer && answer.names[1] == doc.name ? answer : undefined
              }
              guess={guess && guess.names[1] == doc.name ? guess : undefined}
              // Force a rerender on new shuffle by appended count to key.
              key={doc.name + count}
              volume={this}
            /></li>,
          )}
        </ul>
      </div>
    );
  }

}

let highlight: CSSProperties = {
  background: 'silver',
  fontWeight: 'bold',
};
