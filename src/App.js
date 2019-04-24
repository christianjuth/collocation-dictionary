import React, { Component } from 'react';
import './App.css';
import dictionary from './dictionary.json';

class App extends Component {

  constructor() {
    super();

    this.state = {
      search: '',
      dictionary: dictionary.nouns
    }
  }

  updateSearch(e) {
    this.setState({
      search: e.target.value
    });
  }

  render() {
    return (
      <div className="App">
        <div className="App-header">
          <h1>Collocation Dictionary</h1>
          <input className="Input" value={this.state.search} placeholder="type a word to search..." onChange={e => this.updateSearch(e)} 
            autocapitalize="off" 
            autocomplete="off"
            spellcheck="false" 
            autocorrect="off"/>
        </div>

        {
          Object.keys(this.state.dictionary)
          .filter(word => word.indexOf(this.state.search) >= 0)
          .slice(0, 50)
          .map(word => {

            let words = this.state.dictionary[word],
            adjs = Object.keys(words).sort((a,b) => {
              return words[a] > words[b] ? -1 : 1;
            }).slice(0, 10);

            return (
              <div key={word} className="Card">
                <h2>{word}</h2>
                <p>adj. {adjs.join(', ')}</p>
              </div>
            )
          })
        }

      </div>
    );
  }
}

export default App;
