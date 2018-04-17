/* Account Tracker
 *
 * This module is responsible for tracking any number of accounts
 * and caching their current balances & transaction counts.
 *
 * It also tracks transaction hashes, and checks their inclusion status
 * on each new block.
 */

const async = require('async')
const EthQuery = require('eth-query')
const ObservableStore = require('obs-store')
const EventEmitter = require('events').EventEmitter
function noop () {}


class AccountTracker extends EventEmitter {

  constructor (opts = {}) {
    super()

    const initState = {
      accounts: {},
      currentBlockGasLimit: '',
    }
    this.store = new ObservableStore(initState)

    this._provider = opts.provider
  }

  //
  // public
  //

  syncWithAddresses (addresses) {
    const accounts = this.store.getState().accounts
    const locals = Object.keys(accounts)

    const toAdd = []
    addresses.forEach((upstream) => {
      if (!locals.includes(upstream)) {
        toAdd.push(upstream)
      }
    })

    const toRemove = []
    locals.forEach((local) => {
      if (!addresses.includes(local)) {
        toRemove.push(local)
      }
    })

    toAdd.forEach(upstream => this.addAccount(upstream))
    toRemove.forEach(local => this.removeAccount(local))
    this._updateAccounts()
  }

  addAccount (address) {
    const accounts = this.store.getState().accounts
    accounts[address] = {}
    this.store.updateState({ accounts })
    this._updateAccount(address)
  }

  removeAccount (address) {
    const accounts = this.store.getState().accounts
    delete accounts[address]
    this.store.updateState({ accounts })
  }

  //
  // private
  //

  _updateAccounts (cb = noop) {
    const accounts = this.store.getState().accounts
    const addresses = Object.keys(accounts)
    async.each(addresses, this._updateAccount.bind(this), cb)
  }

  _updateAccount (address, cb = noop) {
    this._getAccount(address, (err, result) => {
      if (err) return cb(err)
      result.address = address
      const accounts = this.store.getState().accounts
      // only populate if the entry is still present
      if (accounts[address]) {
        accounts[address] = result
        this.store.updateState({ accounts })
      }
      cb(null, result)
    })
  }

  _getAccount (address, cb = noop) {
    const query = this._query
  }

}

module.exports = AccountTracker
