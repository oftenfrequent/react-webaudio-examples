import React from 'react';
import { Link } from 'react-router-dom'
export default class Header extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      keysDown: [],
    }
  }
  render(){
    return(
      <header>
        <nav>
          <ul>
            <li><Link to='/'>Simple Play</Link></li>
            <li><Link to='/booth'>Booth</Link></li>
            <li><Link to='/sampler'>Sampler</Link></li>
            <li><Link to='/sequencer'>Sequencer</Link></li>
            <li><Link to='/synth'>Synth</Link></li>
          </ul>
        </nav>
      </header>
    )
  }
}
