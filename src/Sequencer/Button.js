import React from 'react';
import PropTypes from 'prop-types'
import classNames from 'classnames';

class Button extends React.Component {
	static propTypes = {
		// key: PropTypes.string.isRequired,
		order: PropTypes.number.isRequired,
		onClick: PropTypes.func.isRequired,
		active: PropTypes.bool.isRequired,
		sharpOrFlat: PropTypes.bool.isRequired,
	}

  render() {
  	const contClasses = classNames('button-container', {
  		active: this.props.active,
  		sharp: this.props.sharpOrFlat,
  	})
    return (
    	<div className={contClasses} onClick={() => this.props.onClick()} style={{order: this.props.order}} />
    );
  }
}

export default Button;