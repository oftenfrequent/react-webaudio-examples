import React from 'react';
import 'whatwg-fetch';

import tracks from './assets/sources.example';

const context = new AudioContext();

class SimplePlay extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			sourceBuffer: null,
			reverbBuffer: null,
			gain1: null,
			gain2: null,
      source: null,
      playing: false,
		}
	}

	async componentWillMount() {
		const sourceBuffer = await this.getAudioBuffers(tracks.simpleSong);
		const reverbBuffer = await this.getAudioBuffers(tracks.reverbImpulse);

		const gain1 = context.createGain();
    gain1.gain.value = 1;
		const gain2 = context.createGain();
    gain2.gain.value = 0;

  	this.setState({
  		sourceBuffer,
  		reverbBuffer,
  		gain1,
  		gain2,
  	});
	}

	async getAudioBuffers (url) {
		const response = await fetch(url)
		const arrayBuffer = await response.arrayBuffer()
		return context.decodeAudioData(arrayBuffer)
	}

	play() {
    const source = context.createBufferSource();
		source.buffer = this.state.sourceBuffer;

    const filter = context.createBiquadFilter();
    filter.type = "allpass";
    filter.frequency.value = 400;

  	const convolver = context.createConvolver();
  	convolver.buffer = this.state.reverbBuffer;

    source.connect(convolver);
    source.connect(this.state.gain1);
    convolver.connect(this.state.gain2);

    this.state.gain1.connect(filter);
    this.state.gain2.connect(filter);

    filter.connect(context.destination);

		source.start();
    this.setState({ playing: true, source });
	}

  stop() {
    this.state.source.stop();
    this.setState({ playing: false, source: null });
  }


	changeMix(e) {
	  const element = e.target;
	  const x = parseInt(element.value, 10) / parseInt(element.max, 10);
	  const gain1 = x;
	  const gain2 = 1.0 - x;
    const gainNodeL = this.state.gain1;
    const gainNodeR = this.state.gain2;
    gainNodeL.gain.value = gain1;
    gainNodeR.gain.value = gain2;
	};

  render() {
    return (
    	<div className="simple-play">
        {this.state.playing
  	      ? <button onClick={() => this.stop()}>Stop</button>
          : <button onClick={() => this.play()}>Play</button>
        }
	      <input type="range" min={0} max={100} defaultValue={100} onChange={(e) => this.changeMix(e)} />
	    </div>
    );
  }
}

export default SimplePlay;
