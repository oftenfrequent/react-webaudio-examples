import React from 'react';
import Pad from './Pad';

const audioContext = new AudioContext();

class Sampler extends React.Component {
  constructor(props){
    super(props)
    this.state = {
      pads: 1,
      viewSignal: true,
    }
  }

  addNewPad() {
    this.setState({ pads: this.state.pads + 1 });
  }

  toggleVisualization() {
    this.setState({ viewSignal: !this.state.viewSignal });
  }

  render() {
    const pads = Array.apply(null, Array(this.state.pads)).map((x, i) => i )
    return (
      <div>
        <button onClick={() => this.toggleVisualization()}>Toggle Visualization</button>
        <div className="sampler-container">
          {pads.map( (num, i) =>
            <Pad
              key={i}
              index={i}
              context={audioContext}
              viewSignal={this.state.viewSignal}
            />
          )}
          <div className="pad-container new" onClick={() => this.addNewPad()}>
            <h1>Add</h1>
          </div>
        </div>
      </div>
    );
  }
}

export default Sampler;