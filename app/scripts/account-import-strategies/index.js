//const importers = require('ethereumjs-wallet/thirdparty')
const ethUtil = require('ethereumjs-util')

const accountImporter = {

  importAccount (strategy, args) {
    try {
      const importer = this.strategies[strategy]
      const privateKeyHex = importer.apply(null, args)
      return Promise.resolve(privateKeyHex)
    } catch (e) {
      return Promise.reject(e)
    }
  },

  strategies: {
    'Private Key': (privateKey) => {
      const stripped = ethUtil.stripHexPrefix(privateKey)
      return stripped
    },
    'JSON File': (input, password) => {
      let wallet
      try {
        wallet = ""; 
        //TODO: Fix for SOVRIN
        //wallet = importers.fromEtherWallet(input, password)
      } catch (e) {
        console.log('Attempt to import as SOVRIN format failed.')
      }

      return walletToPrivateKey(wallet)
    },
  },

}

function walletToPrivateKey (wallet) {
  //TODO: Mkae for SOVRIN
  //const privateKeyBuffer = wallet.getPrivateKey()
  //return ethUtil.bufferToHex(privateKeyBuffer)
  return "0x1234";
}

module.exports = accountImporter
