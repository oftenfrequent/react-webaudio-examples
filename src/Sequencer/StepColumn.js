import React from 'react';
import PropTypes from 'prop-types'
import classNames from 'classnames';

import Button from './Button'
const noteBank = ["C","C#","D","D#","E","F","F#","G","G#","A","A#","B"];

class StepColumn extends React.Component {
	static propTypes = {
    changeNote: PropTypes.func.isRequired,
    removeStep: PropTypes.func.isRequired,
    activeStep: PropTypes.bool.isRequired,
    stepNumber: PropTypes.number.isRequired,
    octaveMode: PropTypes.bool.isRequired,
    activeOctave: PropTypes.number.isRequired,
    changeOctave: PropTypes.func.isRequired,
	}

  constructor(props) {
    super(props);
    this.state = {
      activeIndex: null,
    }
  }

  changeNote(i) {
    if (this.props.octaveMode) {
      if (this.props.activeOctave !== i-2) {
        this.props.changeOctave(i - 2)
      }
    } else {
      if (this.state.activeIndex === i) {
        this.props.removeStep(this.props.stepNumber)
        this.setState({activeIndex: null})
      } else {
        this.props.changeNote(noteBank[i])
        this.setState({activeIndex: i})
      }
    }
  }



  render() {
    const contClasses = classNames('column-container',{active: this.props.activeStep })

    return (
    	<div className={contClasses}>
        {noteBank.map((note,i) =>
          <Button
            key={note}
            order={i}
            active={this.props.octaveMode ? (this.props.activeOctave === i-2) : (this.state.activeIndex === i)}
            onClick={() => this.changeNote(i)}
            sharpOrFlat={(note.indexOf('#') > -1 && !this.props.octaveMode)}
          />
        )}
        <h1>{this.props.stepNumber}</h1>
    	</div>
    );
  }
}

export default StepColumn;