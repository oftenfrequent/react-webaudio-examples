import React from 'react';
import 'whatwg-fetch';

class Turntable extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			sourceBuffer: null,
			source: null,
      playbackValue: 800,
			playing: false,
			timeStarted: null,
			lengthPaused: null,
			manualEnd: null,

		}
	}

	async componentWillMount() {
		const sourceBuffer = await this.getAudioBuffers(this.props.song);
  	this.setState({ sourceBuffer });
	}
	componentWillUnmount(){
		if (this.state.source) this.state.source.stop();
	}
	async getAudioBuffers (url) {
		const response = await fetch(url)
		const arrayBuffer = await response.arrayBuffer()
		return this.props.context.decodeAudioData(arrayBuffer)
	}

	play() {
		if (!this.state.playing) {
	    const source = this.props.context.createBufferSource();
			source.buffer = this.state.sourceBuffer;

			source.onended = () => this.ended();
		  source.playbackRate.value = 1 + (this.state.playbackValue - 800) / 10000;

		  let timeStarted = Date.now();
			if (this.state.timePaused) {
				const lengthPlayedInMiliseconds = ((this.state.timePaused - this.state.timeStarted));
			  timeStarted = timeStarted - lengthPlayedInMiliseconds;
				source.start(0, lengthPlayedInMiliseconds / 1000);
			} else {
				source.start();
			}

			this.setState({ source, playing: true, timeStarted }, () => {
				this.props.onNewSource(this.state.source);
			});

		} else {
			this.setState({ playing: false, timePaused: Date.now(), manualEnd: true, }, () => {
				this.state.source.stop();
			})
		}
	}

	ended() {
		if (this.state.manualEnd) {
			this.setState({ playing: false, source: null });
		} else {
			this.setState({ playing: false, source: null, timeStarted: null, timePaused: null, manualEnd: false });
		}
	}


	changePlaybackRate(e) {
	  const element = e.target;
	  const playbackPercentChange = (element.value - 800) / 10000;
    const playbackRate = 1 + playbackPercentChange;
    this.setState({ playbackValue: element.value })
	  if (this.state.source) {
	  	const source = this.state.source;
		  source.playbackRate.value = playbackRate;
	  }
	};

  render() {
    return (
    	<div className="turntable">
	      <button onClick={() => this.play()}>{this.state.playing ? 'Stop' : 'Play' }</button>
	      <input type="range" min={0} max={1600} value={this.state.playbackValue} onChange={(e) => this.changePlaybackRate(e)} />
	    </div>
    );
  }
}

export default Turntable;
