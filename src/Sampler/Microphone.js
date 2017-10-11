import React from 'react';
import Tone from 'tone';
import {
  visualize,
  stopVisualization
} from './Oscilloscope'

const audioContext = new AudioContext();
// const navigator = window.navigator;
const navigator.getUserMedia = (
    navigator.getUserMedia ||
    navigator.webkitGetUserMedia ||
    navigator.mozGetUserMedia ||
    navigator.msGetUserMedia
);

class Microphone extends React.Component {
  constructor(props){
    super(props)
    this.state = {
      canvas: null,
      canvasCtx: null,
      sourceBuffer: null,
      analyser: null,
      isRecording: false,
      theRecording: null,
      recorder: null,
    }
  }

  componentWillMount() {
    this.initializeMicrophone()
  }

  startVisualization() {
    const canvas = document.querySelector('.audio-visualization')
    const canvasCtx = canvas.getContext('2d')
    this.setState({ canvas, canvasCtx }, () => {
      visualize(this.state.canvas, this.state.canvasCtx, this.state.analyser)
    })
  }

  initializeMicrophone() {
    navigator.getUserMedia(
      {
         "audio": {
             "mandatory": {
                 "googEchoCancellation": "false",
                 "googAutoGainControl": "false",
                 "googNoiseSuppression": "false",
                 "googHighpassFilter": "false"
             },
             "optional": []
         },
      }, (stream) => this.createStream(stream),
      (err) => { console.log('error', err) }
    );
  }

  createStream(stream) {
	  var inputPoint = audioContext.createGain();

	  // create an AudioNode from the stream.
	  var audioInput = audioContext.createMediaStreamSource(stream);
	  audioInput.connect(inputPoint);

	  // create analyser node
	  var analyserNode = audioContext.createAnalyser();
	  analyserNode.fftSize = 2048;
	  inputPoint.connect( analyserNode );

    //create recorder
    const recorder = new window.Recorder( inputPoint );
    this.setState({ analyser: analyserNode, recorder })
    var zeroGain = audioContext.createGain();
    zeroGain.gain.value = 0.0;
    inputPoint.connect( zeroGain );
    zeroGain.connect( audioContext.destination );

  }

  record() {
    this.setState({ isRecording: true }, () => {
      // actually record
      this.startVisualization();
      this.state.recorder.record();
    })
	}

  stopRecording() {
    stopVisualization(this.state.canvas, this.state.canvasCtx)
    this.state.recorder.getBuffers(buffers => {
      var canvas = document.querySelector('.audio-visualization');
      this.drawBuffer( canvas.width, canvas.height, canvas.getContext('2d'), buffers[0] );

      this.state.recorder.exportWAV(blob => {
        const url = window.URL.createObjectURL(blob);
        fetch(url)
          .then(resp => resp.arrayBuffer())
          .then(arrayBuffer => audioContext.decodeAudioData(arrayBuffer))
          .then(audioBuffer => {
            this.setState({ sourceBuffer: audioBuffer });
            const source = audioContext.createBufferSource();
            source.buffer = audioBuffer;
            source.connect(audioContext.destination);
            source.start();
          });
      });
    });

  }

  drawBuffer( width, height, context, data ) {
    var step = Math.ceil( data.length / width );
    var amp = height / 2;
    context.fillStyle = "#D63953";
    context.clearRect(0,0,width,height);
    for(var i=0; i < width; i++){
      var min = 1.0;
      var max = -1.0;
      for (var j=0; j<step; j++) {
        var datum = data[(i*step)+j];
        if (datum < min)
            min = datum;
        if (datum > max)
            max = datum;
      }
      context.fillRect(i,(1+min)*amp,1,Math.max(1,(max-min)*amp));
    }
  }

  stopRecordingOrPlaySample() {
    if (!this.state.sourceBuffer) {
      this.stopRecording();
      this.setState({ isRecording: false });
    } else {
      this.playSample();
    }
  }

  playSample() {
    const source = audioContext.createBufferSource();
    source.buffer = this.state.sourceBuffer;
    source.connect(audioContext.destination);
    source.start();
  }

  removeSource() {
    this.setState({ sourceBuffer: null })
    this.state.recorder.clear();
  }

  render() {
    return (
    	<div>
        <div className='canvas-container' style={{height: '100px', width: '300px'}}>
          <canvas className='audio-visualization'
            onClick={() => this.stopRecordingOrPlaySample()}
            style={{height: '100px', width: '300px'}}
          />
        </div>
        {this.state.isRecording
          ? <button onClick={() => this.removeSource()}>Remove Recording</button>
          : <button onClick={() => this.record()}>Record</button>
        }

	    </div>
    );
  }
}

export default Microphone;