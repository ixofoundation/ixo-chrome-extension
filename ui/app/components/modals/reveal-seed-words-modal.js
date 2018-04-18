const Component = require('react').Component
const PropTypes = require('prop-types')
const h = require('react-hyperscript')
const inherits = require('util').inherits
const connect = require('react-redux').connect
const ethUtil = require('ethereumjs-util')
const actions = require('../../actions')
const AccountModalContainer = require('./account-modal-container')
const { getSelectedIdentity } = require('../../selectors')
const ReadOnlyInput = require('../readonly-input')
const copyToClipboard = require('copy-to-clipboard')
const QrView = require('../qr-code')
const qrCode = require('qrcode-npm').qrcode



function mapStateToProps (state) {
  return {
    warning: state.appState.warning,
    privateKey: state.appState.accountDetail.privateKey,
    mnemonic: state.appState.accountDetail.mnemonic,
    network: state.metamask.network,
    selectedIdentity: getSelectedIdentity(state),
    previousModalState: state.appState.modal.previousModalState.name,
  }
}

function mapDispatchToProps (dispatch) {
  return {
    exportAccount: (password, address) => dispatch(actions.requestRevealSeedWords(password)),
    showAccountDetailModal: () => dispatch(actions.showModal({ name: 'ACCOUNT_DETAILS' })),
    hideModal: () => dispatch(actions.hideModal()),
  }
}

inherits(RevealSeedWordsModal, Component)
function RevealSeedWordsModal () {
  Component.call(this)

  this.state = {
    password: '',
    privateKey: null,
    mnemonic: ''
  }
}

RevealSeedWordsModal.contextTypes = {
  t: PropTypes.func,
}

module.exports = connect(mapStateToProps, mapDispatchToProps)(RevealSeedWordsModal)


RevealSeedWordsModal.prototype.exportAccountAndRevealSeedWords = function (password, address) {
  const { exportAccount } = this.props

  exportAccount(password, address)
    .then(mnemonic => this.setState({ mnemonic }))
}

RevealSeedWordsModal.prototype.renderPasswordLabel = function (mnemonic) {
  return h('span.private-key-password-label', mnemonic
    ? this.context.t('copySeedWords')
    : this.context.t('typePassword')
  )
}
RevealSeedWordsModal.prototype.renderQRCode = function (mnemonic) {
  if(mnemonic){
    const qrImage = qrCode(7, 'M')
    qrImage.addData(mnemonic)
    qrImage.make()
    return h('div.modal-body-qrcode', {
      style: {},
      dangerouslySetInnerHTML: {
        __html: qrImage.createTableTag(4),
      },
    })
  }else{
    return null
  }
}

RevealSeedWordsModal.prototype.renderPasswordInput = function (mnemonic) {

  return mnemonic
  ? h(ReadOnlyInput, {
        wrapperClass: 'private-key-password-display-wrapper',
        inputClass: 'private-key-password-display-textarea',
        textarea: true,
        value: mnemonic,
        onClick: () => copyToClipboard(mnemonic),
    })
    : h('input.private-key-password-input', {
      type: 'password',
      onChange: event => this.setState({ password: event.target.value }),
    })
}

RevealSeedWordsModal.prototype.renderButton = function (className, onClick, label) {
  return h('button', {
    className,
    onClick,
  }, label)
}

RevealSeedWordsModal.prototype.renderButtons = function (mnemonic, password, address, hideModal) {
  return h('div.export-private-key-buttons', {}, [
    !mnemonic && this.renderButton(
      'btn-secondary--lg export-private-key__button export-private-key__button--cancel',
      () => hideModal(),
      'Cancel'
    ),

    (mnemonic
      ? this.renderButton('btn-primary--lg export-private-key__button', () => hideModal(), this.context.t('done'))
      : this.renderButton('btn-primary--lg export-private-key__button', () => this.exportAccountAndRevealSeedWords(this.state.password, address), this.context.t('confirm'))
    ),

  ])
}

RevealSeedWordsModal.prototype.render = function () {
  const {
    selectedIdentity,
    warning,
    showAccountDetailModal,
    hideModal,
    previousModalState,
  } = this.props
  const { name, address } = selectedIdentity

  const { mnemonic } = this.state

  return h(AccountModalContainer, {
    showBackButton: previousModalState === 'ACCOUNT_DETAILS',
    backButtonAction: () => showAccountDetailModal(),
  }, [

      h('span.account-name', name),

      h(ReadOnlyInput, {
        wrapperClass: 'ellip-address-wrapper',
        inputClass: 'qr-ellip-address ellip-address',
        value: address,
      }),

      h('div.account-modal-divider'),

      h('span.modal-body-title', this.context.t('revealSeedWords')),

      h('div.private-key-password', {}, [
        this.renderQRCode(mnemonic),

        this.renderPasswordLabel(mnemonic),

        this.renderPasswordInput(mnemonic),

        !warning ? null : h('span.private-key-password-error', warning),
      ]),

      h('div.private-key-password-warning', this.context.t('revealSeedWordsWarning')),

      this.renderButtons(mnemonic, this.state.password, address, hideModal),

  ])
}
