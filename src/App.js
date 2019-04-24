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
              <p>{type === 'noun' ? 'adj.' : 'adv.'} {adjs.join(', ')}</p>
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
      dictionary: squashedDictionary
    }
  }

  updateSearch(e) {
    let search = e.target.value;

    let urlSplit = window.location.href.split( "?" ), 
        obj = { 
          Title : "New title", 
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

    let results = this.state.dictionary
    .filter(obj => obj.word.indexOf(this.state.search) >= 0)
    .map(obj => obj.div);

    return (
      <div className="App">
        <div className="App-header">
          <h1>Collocation Dictionary</h1>
          <input className="Input" value={this.state.search} placeholder="type a word to search..." onChange={e => this.updateSearch(e)}/>
        </div>

        {results}

      </div>
    );
  }
}

export default App;
