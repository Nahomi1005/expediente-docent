/**
 *
 * More information about configuration can be found at:
 *
 * truffleframework.com/docs/advanced/configuration
 *
 */
const HDWalletProvider = require ('truffle-hdwallet-provider');

const mnemonic = 'armed omit twin sniff mouse carbon circle deposit ginger noodle butter radio';
module.exports = {

  networks: {
    
     development: {
      host: "127.0.0.1",
      port: 7545,           
      network_id: "*", 
      gas: 5000000,  
    },
    rinkeby: {
      provider: () => new HDWalletProvider(mnemonic, 'https://rinkeby.infura.io/v3/11a2537dc55f483ead5a0d1cb1cc6185'),
      network_id: 4,
    }
  }
}
