/*global Web3*/
cleanContextForImports()
//TODO: Replace folloing line with ixo.js
// require('web3/dist/web3.min.js')
const log = require('loglevel')
const LocalMessageDuplexStream = require('post-message-stream')
// const PingStream = require('ping-pong-stream/ping')
// const endOfStream = require('end-of-stream')
const setupDappAutoReload = require('./lib/auto-reload.js')
const MetamaskInpageProvider = require('./lib/inpage-provider.js')
restoreContextAfterImports()

const METAMASK_DEBUG = process.env.METAMASK_DEBUG
window.log = log
log.setDefaultLevel(METAMASK_DEBUG ? 'debug' : 'warn')


//
// setup plugin communication
//

// setup background connection
var metamaskStream = new LocalMessageDuplexStream({
  name: 'inpage',
  target: 'contentscript',
})

// compose the inpage provider
var inpageProvider = new MetamaskInpageProvider(metamaskStream)

//
// setup web3
//

if (typeof window.ixo !== 'undefined') {
  throw new Error(`ixo detected another ixo.
     ixo Credential handler will not work reliably with another ixo extension.
     Please remove one and try again.`)
}
//TODO: Fix this
var ixo = {"inpageProvider": inpageProvider, "Test":"test"};// new Web3(inpageProvider)
ixo.setProvider = function () {
  log.debug('ixo - overrode web3.setProvider')
}
window.ixo = ixo;
log.debug('ixo Credential handler injected')
// export global web3, with usage-detection
//TODO: Following lines removed
//setupDappAutoReload(web3, inpageProvider.publicConfigStore)

// set web3 defaultAccount

//inpageProvider.publicConfigStore.subscribe(function (state) {
//  web3.eth.defaultAccount = state.selectedAddress
//})

//
// util
//

// need to make sure we aren't affected by overlapping namespaces
// and that we dont affect the app with our namespace
// mostly a fix for web3's BigNumber if AMD's "define" is defined...
var __define

function cleanContextForImports () {
  __define = global.define
  try {
    global.define = undefined
  } catch (_) {
    console.warn('ixo - global.define could not be deleted.')
  }
}

function restoreContextAfterImports () {
  try {
    global.define = __define
  } catch (_) {
    console.warn('ixo - global.define could not be overwritten.')
  }
}
