import React from 'react';
import Tone from 'tone';

import StepColumn from './StepColumn'
import '../index.css';
const synth = new Tone.Synth({
	oscillator: {
		type: 'square'
	},
	envelope: {
		attack: 0.005,
		decay: 0.1,
		sustain: 0.3 ,
		release: 1
	}
})

const filter = new Tone.Filter({
	type: 'lowpass',
	frequency: 280,
	rolloff: -24,
	Q: 1,
	gain: 0,
})

const highFilter = new Tone.Filter({
	type: 'bandpass',
	frequency: 600,
	rolloff: -12,
	Q: 1,
	gain: 0,
})

const lfo = new Tone.LFO({
	type: 'sine',
	min: 250,
	max: 800,
	phase: 0,
	frequency: 0.8,
	amplitude: 1,
}).start()

const delay = new Tone.PingPongDelay(0.75, 0.7);
delay.wet.value = 0.4;

lfo.connect(filter.frequency)

synth.connect(filter)
// synth.connect(highFilter)
// highFilter.connect(delay)
// delay.toMaster();
filter.toMaster();

window.Tone = Tone;

const basicStepInfo = {
	id: null,
	key: null,
	octave: 4,
}

const newStep = () => Object.assign({}, basicStepInfo);
const stepLength = Array.apply(null, Array(16)).map(i => i);


class Sequencer extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			0: newStep(),
			1: newStep(),
			2: newStep(),
			3: newStep(),
			4: newStep(),
			5: newStep(),
			6: newStep(),
			7: newStep(),
			8: newStep(),
			9: newStep(),
			10: newStep(),
			11: newStep(),
			12: newStep(),
			13: newStep(),
			14: newStep(),
			15: newStep(),
			activeStep: null,
			octaveMode: false,
			repeatId: null
		}
	}

	componentDidMount() {
		this.initialize();
	}

	componentWillUnmount() {
		Tone.Transport.clear(this.state.repeatId)
		this.setState({ repeatId: null })
	}

	initialize() {
		const repeatId = Tone.Transport.scheduleRepeat(() => {
			if (Number.isInteger(this.state.activeStep) && this.state.activeStep !== 15) {
				this.setState({ activeStep: this.state.activeStep + 1 })
			} else {
				this.setState({ activeStep: 0 })
			}
		}, '16n');
		Tone.Transport.loop = true;
		Tone.Transport.loopStart = '0';
		Tone.Transport.loopEnd = '1m';
		Tone.Transport.loopLength = 1;
		this.setState({ activeStep: 0, repeatId })
		Tone.Transport.start();
	}

	scheduleNote(key, octave, stepIndex) {
		const measure = `0:0:${stepIndex % 16}`;
		const timelineIndex = Tone.Transport.schedule(() => synth.triggerAttackRelease(`${key}${octave}`, '16n'), measure);
		this.setState({ [stepIndex]: {
			id: timelineIndex,
			key: key,
			octave: this.state[stepIndex].octave,
		}})
	}

	setNote(key, stepIndex) {
		if (this.state[stepIndex].id) { this.removeScheduledNote(stepIndex) }
		this.setState({ [stepIndex]: {
				id: this.state[stepIndex].id,
				key: key,
				octave: this.state[stepIndex].octave,
			}
		}, () => this.scheduleNote(this.state[stepIndex].key, this.state[stepIndex].octave, stepIndex))
	}

	removeScheduledNote(stepIndex) {
		Tone.Transport.clear(this.state[stepIndex].id);
		this.setState({ [stepIndex]: {
			id: null,
			key: null,
			octave: this.state[stepIndex].octave,
			}})
	}

	toggleMode() { this.setState({ octaveMode: !this.state.octaveMode }); }

	changeOctave(octave, stepIndex) {
		this.setState({ [stepIndex]: {
				id: this.state[stepIndex].id,
				key: this.state[stepIndex].key,
				octave: octave,
			}
		}, () => {
			if (this.state[stepIndex].id) {
				this.removeScheduledNote(stepIndex)
			}
			if (this.state[stepIndex].key) {
				this.scheduleNote(this.state[stepIndex].key, this.state[stepIndex].octave, stepIndex)
			}
		})
	}

  render() {
    return (
    	<div className="step-channel-container">
    		{stepLength.map((step, i) =>
    			<StepColumn
    				key={i}
    				activeStep={(this.state.activeStep === i)}
    				stepNumber={i}
    				changeNote={note => this.setNote(note, i)}
    				removeStep={() => this.removeScheduledNote(i)}
    				octaveMode={this.state.octaveMode}
    				activeOctave={this.state[i].octave}
    				changeOctave={oct => this.changeOctave(oct, i)}
  				/>
    		)}
    		<button onClick={() => this.toggleMode()}>Change Mode</button>
    	</div>
    );
  }
}

export default Sequencer;
