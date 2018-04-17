const injectCss = require('inject-css')
const UiCss = require('../../ui/css')
const startPopup = require('./popup-core')
const PortStream = require('./lib/port-stream.js')
const isPopupOrNotification = require('./lib/is-popup-or-notification')
const extension = require('extensionizer')
const ExtensionPlatform = require('./platforms/extension')
const NotificationManager = require('./lib/notification-manager')
const notificationManager = new NotificationManager()
const setupRaven = require('./lib/setupRaven')


  //TODO: remove
  console.log("Starting...");

start().catch(log.error)

async function start() {
  //TODO: remove
  console.log("Starting...");

  // create platform global
  global.platform = new ExtensionPlatform()

  // setup sentry error reporting
  const release = global.platform.getVersion()
  //setupRaven({ release })

  // inject css
  // const css = MetaMaskUiCss()
  // injectCss(css)

  // identify window type (popup, notification)
  const windowType = isPopupOrNotification()
  global.METAMASK_UI_TYPE = windowType
  closePopupIfOpen(windowType)

  // setup stream to background
  const extensionPort = extension.runtime.connect({ name: windowType })
  const connectionStream = new PortStream(extensionPort)

  // start ui
  const container = document.getElementById('app-content')
  startPopup({ container, connectionStream }, (err, store) => {
    if (err) return displayCriticalError(err)

    // Code commented out until we begin auto adding users to NewUI
    // const { isMascara, identities = {}, featureFlags = {} } = store.getState().metamask
    // const firstTime = Object.keys(identities).length === 0
    const { isMascara, featureFlags = {} } = store.getState().metamask

    let css = UiCss()
    let deleteInjectedCss = injectCss(css)

    store.subscribe(() => {
      const state = store.getState()
      if (state.appState.shouldClose) notificationManager.closePopup()
    })
  })


  function closePopupIfOpen (windowType) {
    if (windowType !== 'notification') {
      // should close only chrome popup
      notificationManager.closePopup()
    }
  }

  function displayCriticalError (err) {
    container.innerHTML = '<div class="critical-error">The ixo Credential Provider app failed to load: please open and close MetaMask again to restart.</div>'
    container.style.height = '80px'
    log.error(err.stack)
    throw err
  }

}
