import React, { Component } from 'react';

import Turntable from './Turntable';
import Mixer from './Mixer';
import tracks from '../assets/sources';

const context = new AudioContext();

class Booth extends Component {
  constructor(props) {
    super(props);
    this.state = {
      sourceLeft: null,
      sourceRight: null,
      gainLeft: null,
      gainRight: null,
    }
  }

  setGainNodes(left, right) {
    this.setState({ gainLeft: left, gainRight: right });
  }

  connectToMixer(src, side) {
    if (side === 'l') {
      this.setState({ sourceLeft: src }, () => {
        this.state.sourceLeft.connect(this.state.gainLeft)
      })
    } else {
      this.setState({ sourceRight: src }, () => {
        this.state.sourceRight.connect(this.state.gainRight)
      });
    }
  }


  render() {
    return (
      <div className="booth">
        <Turntable
          context={context}
          song={tracks.turntableLeft}
          onNewSource={src => this.connectToMixer(src, 'l')}
        />
        <Mixer
          context={context}
          onInitialize={(l,r) => this.setGainNodes(l,r)}
        />
        <Turntable
          context={context}
          song={tracks.turntableRight}
          onNewSource={src => this.connectToMixer(src, 'r')}
        />
      </div>
    );
  }
}

export default Booth;
