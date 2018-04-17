const EventEmitter = require('events').EventEmitter
const async = require('async')
const Dnode = require('dnode')
const launchMetamaskUi = require('../../ui')
const setupMultiplex = require('./lib/stream-utils.js').setupMultiplex


module.exports = initializePopup


function initializePopup ({ container, connectionStream }, cb) {
  //TODO: remove comment
  console.log("Init")
  // setup app
  async.waterfall([
    (cb) => connectToAccountManager(connectionStream, cb),
    (accountManager, cb) => launchMetamaskUi({ container, accountManager }, cb),
  ], cb)
}

function connectToAccountManager (connectionStream, cb) {
  // setup communication with background
  // setup multiplexing
  var mx = setupMultiplex(connectionStream)
  // connect features
  setupControllerConnection(mx.createStream('controller'), cb)
}

function setupControllerConnection (connectionStream, cb) {
  // this is a really sneaky way of adding EventEmitter api
  // to a bi-directional dnode instance
  var eventEmitter = new EventEmitter()
  var accountManagerDnode = Dnode({
    sendUpdate: function (state) {
      eventEmitter.emit('update', state)
    },
  })
  connectionStream.pipe(accountManagerDnode).pipe(connectionStream)
  accountManagerDnode.once('remote', function (accountManager) {
    // setup push events
    accountManager.on = eventEmitter.on.bind(eventEmitter)
    cb(null, accountManager)
  })
}
