const Component = require('react').Component
const PropTypes = require('prop-types')
const h = require('react-hyperscript')
const inherits = require('util').inherits
const connect = require('react-redux').connect
const actions = require('../../actions')
const AccountModalContainer = require('./account-modal-container')
const { getSelectedIdentity } = require('../../selectors')
const genAccountLink = require('../../../lib/account-link.js')
const QrView = require('../qr-code')
const EditableLabel = require('../editable-label')

function mapStateToProps (state) {
  return {
    network: state.metamask.network,
    selectedIdentity: getSelectedIdentity(state),
  }
}

function mapDispatchToProps (dispatch) {
  return {
    // Is this supposed to be used somewhere?
    showQrView: (selected, identity) => dispatch(actions.showQrView(selected, identity)),
    showExportPrivateKeyModal: () => {
      dispatch(actions.showModal({ name: 'EXPORT_PRIVATE_KEY' }))
    },
    revealSeedWords: () => {
      dispatch(actions.showModal({name: 'REVEAL_SEED_CONFIRMATION'}))
    },
    hideModal: () => dispatch(actions.hideModal()),
    saveAccountLabel: (address, label) => dispatch(actions.saveAccountLabel(address, label)),
  }
}

inherits(AccountDetailsModal, Component)
function AccountDetailsModal () {
  Component.call(this)
}

AccountDetailsModal.contextTypes = {
  t: PropTypes.func,
}

module.exports = connect(mapStateToProps, mapDispatchToProps)(AccountDetailsModal)


// Not yet pixel perfect todos:
  // fonts of qr-header

AccountDetailsModal.prototype.render = function () {
  const {
    selectedIdentity,
    network,
    revealSeedWords,
    showExportPrivateKeyModal,
    saveAccountLabel,
  } = this.props
  const { name, address } = selectedIdentity

  return h(AccountModalContainer, {}, [
      h(EditableLabel, {
        className: 'account-modal__name',
        defaultValue: name,
        onSubmit: label => saveAccountLabel(address, label),
      }),

      h(QrView, {
        Qr: {
          data: address,
        },
      }),

      h('div.account-modal-divider'),

      // Holding on redesign for Export Private Key functionality
      h('button.btn-primary.account-modal__button', {
        onClick: () => revealSeedWords(),
      }, this.context.t('revealSeedWords')),

      // Holding on redesign for Export Private Key functionality
/*
      h('button.btn-primary.account-modal__button', {
        onClick: () => showExportPrivateKeyModal(),
      }, this.context.t('exportPrivateKey')),
*/
  ])
}
