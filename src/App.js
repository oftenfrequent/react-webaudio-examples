import React, { Component } from 'react';
import { Switch,Route } from 'react-router-dom'
import Header from './Header';
import Sequencer from './Sequencer/Sequencer';
import Synth from './Synth';
import Sampler from './Sampler/Sampler';
import SimplePlay from './simplePlay';
import Booth from './Booth/Booth';

class App extends Component {

  render() {
    return (
      <div className="App">
      <Header/>
      <Switch>
        <Route exact path='/' component={SimplePlay}/>
        <Route path='/booth' component={Booth}/>
        <Route path='/sampler' component={Sampler}/>
        <Route path='/sequencer' component={Sequencer}/>
        <Route path='/synth' component={Synth}/>
        </Switch>
      </div>
    );
  }
}

export default App;
