import React, { Component } from 'react';
import './App.css';
import dictionary from './dictionary.json';
let nlp = require('compromise');


class Text {
  constructor() {
    fetch('/texts.txt')
    .then(response => {
      return response.text();
    })
    .then(data => {
      this.data = data;
    });
  }

  toString() {
    return this.data;
  }

  lookUp(search) {

    let text = this.data.split(/[\.\!]+\s*|\n+\s*/).map(text => text.replace(/\(.+\)/,'')).filter(text => text.indexOf(search) > -1)[0];

    try{
      text = text.split(search);
      return (
        <span>
          {text[0]}
          <b>{search}</b>
          {text[1]}
        </span>
      );
    } catch(e) {
      return '';
    }
    
  }
}
let text = new Text();


class Card extends Component {

  constructor(props) {
    super(props);

    this.state = {
      defined: false,
      example: '',
      selectedDescriptor: Object.keys(props.descriptors)[0]
    };
  }


  lookUp() {
    if(this.state.defined == false && this.props.selected == true){
      this.setState({
        defined: true,
        example: text.lookUp(this.state.selectedDescriptor+' '+this.props.word)
      })
    }
  }

  render() {
    let props = this.props;

    let descriptors = Object.keys(props.descriptors);
    descriptors = descriptors.sort((a,b) => {
      return props.descriptors[a] > props.descriptors[b] ? -1 : 1;
    });

    let mostPopularDescriptor = props.descriptors[descriptors[0]],
        scalerExponent = 1/2;

    this.lookUp();

    if(this.props.selected){
      return(
        <div className="Card-selected" onClick={this.props.onClick}>
          <h2 className="Word">{props.word}</h2>
          <p className="WordExample">{this.state.example}</p>
          <p>{props.type === 'verb' ? 'adv. ' : 'adj. '} 
            {descriptors.map((d,i) => {

              let opacity = props.descriptors[d]/mostPopularDescriptor**scalerExponent;

              let onClick = (e) => {
                e.stopPropagation();
                this.setState({
                  defined: false,
                  selectedDescriptor: d
                });
              };

              return (
                <span key={i} className="descriptor" style={{opacity: opacity}} onClick={onClick}>
                  {d}{i+1 < descriptors.length ? ', ' : ''} 
                </span>
              );
            })}
          </p>
        </div>
      );
    }

    else{
      return(
        <div className="Card" onClick={this.props.onClick}>
          <h2 className="Word">{props.word}</h2>
          <span className="WordType">{props.type}</span>
          <p>{props.type === 'verb' ? 'adv. ' : 'adj. '} 
            {descriptors.slice(0,10).map((d,i) => {

              let opacity = props.descriptors[d]/mostPopularDescriptor**scalerExponent;
              return (
                <span key={i} style={{opacity: opacity}}>
                  {d}{i+1 < descriptors.length ? ', ' : ''} 
                </span>
              );
            })}
          </p>
        </div>
      );
    }
    
  }
}



class App extends Component {

  constructor() {
    super();

    let squashedDictionary = [];

    let getWordType = (type) => {
      Object.keys(dictionary[type])
      .forEach(word => {

        squashedDictionary.push({
          word: word,
          type: type,
          descriptors: dictionary[type][word]
        });
      });
    }
    
    Object.keys(dictionary).forEach(type => getWordType(type));

    squashedDictionary.sort((a,b) => {
      return a.word > b.word ? 1 : -1;
    });

    this.state = {
      search: window.location.href.split("?search=")[1] || '',
      dictionary: squashedDictionary,
      headerStuck: window.pageYOffset > 110,
      scroll: window.pageYOffset,
      selected: ''
    }

    window.onscroll = () => {
      if(window.pageYOffset <= 110)
        this.setState({headerStuck: false, scroll: window.pageYOffset});

      else if(window.pageYOffset > 110)
        this.setState({headerStuck: true, scroll: window.pageYOffset});
    };
  }

  updateSearch(e) {
    let search = e.target.value.toLowerCase();

    let urlSplit = window.location.href.split( "?" ), 
        obj = { 
          Url: urlSplit[0] + (search.length > 0 ? `?search=${e.target.value}` : '')
        };

    clearTimeout(this.timeout);
    this.timeout = setTimeout(() => {
      history.pushState(obj, obj.Title, obj.Url);
    }, 300);

    this.setState({
      search: search
    });
  }

  render() {

    let search = this.state.search,
        results = this.state.dictionary
    .filter(obj => obj.word.indexOf(search.replace(/s$/,'')) >= 0)
    .sort(obj => {
      return search !== '' && obj.word.indexOf(search) === 0 ? -1 : 0;
    })
    .sort(obj => {
      return obj.word === search ? -1 : 0;
    })
    .slice(0,50);

    return (
      <div className="App">
        <div style={{height: this.state.headerStuck ? '87px' : 200-this.state.scroll}} className={this.state.headerStuck ? "App-header App-header-sticky" : "App-header"}>
          <h1 style={{marginTop: this.state.headerStuck ? Math.max(150-this.state.scroll,16) : 20}}>Collocation Dictionary</h1>
          <input className={this.state.headerStuck ? "hidden" : "Input"} value={this.state.search} placeholder="type a word to search..." onChange={e => this.updateSearch(e)}/>
        </div>

        {results.map((r, i) => {

          let key = r.type+r.word;
          let onClick = () => {
            if(this.state.selected == key)
              this.setState({selected: ''});
            else
              this.setState({selected: key});
          };

          let selected = this.state.selected == key || this.state.selected == '' && r.word == search || results.length == 1;

          return (
            <Card key={key} selected={selected} word={r.word} type={r.type} descriptors={r.descriptors} onClick={onClick}/>
          );
        })}

      </div>
    );
  }
}

export default App;
