import React from 'react';
import {
  visualize,
  stopVisualization
} from './Oscilloscope'

const navigator = window.navigator;
navigator.getUserMedia = (
    navigator.getUserMedia ||
    navigator.webkitGetUserMedia ||
    navigator.mozGetUserMedia ||
    navigator.msGetUserMedia
);

class Pad extends React.Component {
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
    const canvas = document.querySelector(`.visualizer${this.props.index}`)
    const canvasCtx = canvas.getContext('2d')
    this.setState({ canvas, canvasCtx }, () => {
      visualize(this.state.canvas, this.state.canvasCtx, this.state.analyser, this.props.viewSignal)
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
      }, (stream) => this.createStream(stream), function (err) {
        console.log('error', err)
      }
    );
  }

  createStream(stream) {
	  var inputPoint = this.props.context.createGain();

	  // create an AudioNode from the stream.
	  var audioInput = this.props.context.createMediaStreamSource(stream);
	  audioInput.connect(inputPoint);

	  // create analyser node
	  var analyserNode = this.props.context.createAnalyser();
	  analyserNode.fftSize = 2048;
	  inputPoint.connect( analyserNode );

    //create recorder
    const recorder = new window.Recorder( inputPoint );
    this.setState({ analyser: analyserNode, recorder })
    var zeroGain = this.props.context.createGain();
    zeroGain.gain.value = 0.0;
    inputPoint.connect( zeroGain );
    zeroGain.connect( this.props.context.destination );

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
      var canvas = document.querySelector(`.visualizer${this.props.index}`);
      this.drawBuffer( canvas.width, canvas.height, canvas.getContext('2d'), buffers[0] );

      this.state.recorder.exportWAV(blob => {
        const url = window.URL.createObjectURL(blob);
        fetch(url)
          .then(resp => resp.arrayBuffer())
          .then(arrayBuffer => this.props.context.decodeAudioData(arrayBuffer))
          .then(audioBuffer => {
            this.setState({ sourceBuffer: audioBuffer, isRecording: false });
            const source = this.props.context.createBufferSource();
            source.buffer = audioBuffer;
            source.connect(this.props.context.destination);
          });
      });
    });

  }

  drawBuffer( width, height, context, data ) {
    var step = Math.ceil( data.length / width );
    var amp = height / 2;
    context.fillStyle = 'rgb(128,128,128)';
    context.fillRect(0, 0, width, height);
    context.fillStyle = "rgb(255,255,0)";
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

  recordOrStopRecordingOrPlaySample() {
    if (!this.state.sourceBuffer && !this.state.isRecording) {
      this.record();
    } else if (!this.state.sourceBuffer && this.state.isRecording) {
      this.stopRecording();
    } else {
      this.playSample();
    }
  }

  playSample() {
    const source = this.props.context.createBufferSource();
    source.buffer = this.state.sourceBuffer;
    source.connect(this.props.context.destination);
    source.start();
  }

  removeSource() {
    this.setState({ sourceBuffer: null });
    this.state.recorder.clear();
    var canvas = document.querySelector(`.visualizer${this.props.index}`);
    this.resetCanvas( canvas.width, canvas.height, canvas.getContext('2d') );
  }

  resetCanvas( width, height, context ) {
    context.clearRect(0, 0, width, height);
  }

  render() {
    return (
    	<div className="pad-container">
        <div className='canvas-container'>
          <canvas className={`visualizer visualizer${this.props.index}`}
            onClick={() => this.recordOrStopRecordingOrPlaySample()}
          />
        </div>
        {this.state.sourceBuffer
          ? <button onClick={() => this.removeSource()}>X</button>
          : null
        }

	    </div>
    );
  }
}

export default Pad;
