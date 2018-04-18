import h from 'react-hyperscript'
import { Component } from 'react'
import PropTypes from 'prop-types'
import {connect} from 'react-redux'
import { withRouter } from 'react-router-dom'
import { compose } from 'recompose'
import {closeWelcomeScreen} from './actions'
import { INITIALIZE_CREATE_PASSWORD_ROUTE } from './routes'

class WelcomeScreen extends Component {
  static propTypes = {
    closeWelcomeScreen: PropTypes.func.isRequired,
    welcomeScreenSeen: PropTypes.bool,
    history: PropTypes.object,
  }

  constructor (props) {
    super(props)
  }

  componentWillMount () {
    const { history, welcomeScreenSeen } = this.props

    if (welcomeScreenSeen) {
      history.push(INITIALIZE_CREATE_PASSWORD_ROUTE)
    }
  }

  initiateAccountCreation = () => {
    this.props.closeWelcomeScreen()
    this.props.history.push(INITIALIZE_CREATE_PASSWORD_ROUTE)
  }

  render () {
    return h('div.welcome-screen', [

        h('div.welcome-screen__info', [

          h('img.ixo-icon', {
            height: 200,
            width: 200,
            src: '/images/ixo-logo.svg',
          }),

          h('div.welcome-screen__info__header', 'Welcome to the'),
          h('div.welcome-screen__info__header', 'ixo Credential Manager'),

          h('div.welcome-screen__info__copy', 'The ixo Credential Manager securely stores your digital identity in a vault for signing ixo network requests.'),


          h('button.welcome-screen__button', {
            onClick: this.initiateAccountCreation,
          }, 'Continue'),

        ]),

    ])
  }
}

const mapStateToProps = ({ metamask: { welcomeScreenSeen } }) => {
  return {
    welcomeScreenSeen,
  }
}

export default compose(
  withRouter,
  connect(
    mapStateToProps,
    dispatch => ({
      closeWelcomeScreen: () => dispatch(closeWelcomeScreen()),
    })
  )
)(WelcomeScreen)
