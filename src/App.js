import React, { Component } from 'react';
import './App.css';
import dictionary from './dictionary.json';

class App extends Component {

  constructor() {
    super();

    let squashedDictionary = [];

    let getWordType = (type) => {
      Object.keys(dictionary[type])
      .forEach(word => {

        let words = dictionary[type][word],
        adjs = Object.keys(words).sort((a,b) => {
          return words[a] > words[b] ? -1 : 1;
        }).slice(0, 10);

        squashedDictionary.push({
          word: word,
          div: (
            <div key={type+word} className="Card">
              <h2 className="Word">{word}</h2>
              <span className="WordType">{type}</span>
              <p>{type === 'verb' ? 'adv.' : 'adj.'} {adjs.join(', ')}</p>
            </div>
          )
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
      scroll: window.pageYOffset
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
    .sort(obj => search !== '' && obj.word.indexOf(search) === 0 ? -1 : 0)
    .map(obj => obj.div)
    .slice(0,50);

    return (
      <div className="App">
        <div style={{height: this.state.headerStuck ? '87px' : 200-this.state.scroll}} className={this.state.headerStuck ? "App-header App-header-sticky" : "App-header"}>
          <h1 style={{'margin-top': this.state.headerStuck ? Math.max(150-this.state.scroll,16) : 20}}>Collocation Dictionary</h1>
          <input className={this.state.headerStuck ? "hidden" : "Input"} value={this.state.search} placeholder="type a word to search..." onChange={e => this.updateSearch(e)}/>
        </div>

        {results}

      </div>
    );
  }
}

export default App;
