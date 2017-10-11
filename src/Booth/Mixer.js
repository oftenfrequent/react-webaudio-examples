import React, { Component } from 'react';

class Mixer extends Component {
  constructor(props) {
    super(props);
    this.state = {
      left: this.props.context.createGain(),
      right: this.props.context.createGain(),
      crossLeft: this.props.context.createGain(),
      crossRight: this.props.context.createGain(),
      main: this.props.context.createGain(),
    }
  }

  componentWillMount() {
    this.props.onInitialize(this.state.left, this.state.right);

    this.state.left.connect(this.state.crossLeft);
    this.state.right.connect(this.state.crossRight);
    this.state.crossLeft.connect(this.state.main);
    this.state.crossRight.connect(this.state.main);
    this.state.main.connect(this.props.context.destination);
  }

  changeGain(e, section) {
    const element = e.target;
    const gain = parseInt(element.value, 10) / parseInt(element.max, 10);
    if (section === 'left') {
      const gainNode = this.state.left;
      gainNode.gain.value = gain;
    } else if (section === 'right') {
      const gainNode = this.state.right;
      gainNode.gain.value = gain;
    } else {
      const gainNode = this.state.main;
      gainNode.gain.value = gain;
    }
  }

  changeMix(e) {
    const element = e.target;
    const x = parseInt(element.value, 10) / parseInt(element.max, 10);
    const gainLeft = Math.cos(x * 0.5*Math.PI);
    const gainRight = Math.cos((1.0 - x) * 0.5*Math.PI);
    const gainNodeL = this.state.crossLeft;
    const gainNodeR = this.state.crossRight;
    gainNodeL.gain.value = gainLeft;
    gainNodeR.gain.value = gainRight;
  };

  render() {
    return (
      <div className="mixer">
        <div className="channel">
          <input type="range" min={0} max={100} defaultValue={100} onChange={(e) => this.changeGain(e, 'left')} />
          <h5>1</h5>
        </div>
        <div className="channel">
          <input type="range" min={0} max={100} defaultValue={100} onChange={(e) => this.changeGain(e, 'right')} />
          <h5>2</h5>
        </div>
        <div className="channel">
          <input type="range" min={0} max={100} defaultValue={100} onChange={(e) => this.changeGain(e, 'main')} />
          <h5>master</h5>
        </div>
        <div className="crossfader">
          <input type="range" min={0} max={100} defaultValue={50} onChange={(e) => this.changeMix(e)} />
        </div>
      </div>
    );
  }
}

export default Mixer;
