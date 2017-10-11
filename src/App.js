import React, { Component } from 'react';

import Sequencer from './Sequencer/Sequencer';
import Synth from './Synth';
import Sampler from './Sampler/Sampler';
import SimplePlay from './simplePlay';
import Booth from './Booth/Booth';

class App extends Component {

  render() {
    return (
      <div className="App">
        <SimplePlay />
        <Booth />
        <Sampler />
        <Sequencer />
        <Synth />
      </div>
    );
  }
}

export default App;
