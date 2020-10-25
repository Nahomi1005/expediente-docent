import React from 'react';
import './App.css';
import { Navbar,  NavbarBrand, Nav, NavItem, NavLink} from 'reactstrap';
import logo from './logo.jpg';
import ipfs from './ipfs';
import Curriculum from "./Curriculum.json";
import Web3 from 'web3';

class App extends React.Component {

  constructor(props) {
    super(props);

    this.state = { 
      web3 : null,
      account: '',
      buffer: null, //Le asignamos un valor inicial  
      ipfsHash: '',
      contract: null,
    }

    this.captureFile = this.captureFile.bind(this); //inputfile
    this.onSubmit = this.onSubmit.bind(this);
  }

  //Obtener la cuenta
  //Obtener la red
  //Obtener el Smart Contract
  //---> ABI
  //--> Address
  //Obtener ipfsHash

  //Función de React que permite llamar otra función antes de render.
  //Actualización de componentWillMount()
  async componentDidMount() {
    await this.loadWeb3();
    await this.loadBlockchainData();
  }

  //Inicializa Web3 para conectar con la Blockchain
  async loadBlockchainData() { 
    //Obtener la cuenta
   const web3 = window.web3;
   const accounts = await web3.eth.getAccounts()
    this.setState({account: accounts[0]})
    console.log(accounts)
 
     //Obtener la red
    const networkId = await web3.eth.net.getId();
    console.log(networkId)
    const networkData = Curriculum.networks[networkId];
    console.log(networkData)
    
    if (networkData) {
      //Obtener abi
      const abi = Curriculum.abi
      console.log(abi)
      //Obtener la dirección
      const address = networkData.address
      console.log(address)
      //Fetch Contrato
     const contract = new web3.eth.Contract(abi, address)
      this.setState({contract})
      const ipfsHash = await contract.methods.get().call()

      this.setState({ipfsHash})
      console.log(ipfsHash)
    } else {
        window.alert('El Smart Contract no ha sido desplegado en la red.')
    }

  }

  async loadWeb3(){
    if (window.ethereum){
      window.web3 = new Web3(window.ethereum)
      await window.ethereum.enable()
    } if (window.web3) {
        window.web3 = new Web3(window.web3.currentProvider)
    } else {
      window.alert('¡No tienes Metamask Instalado!\n Por favor, instala Metamask.')
    }
  }

  captureFile(event){
    console.log('capture file...');
    event.preventDefault();
    const file = event.target.files[0]; //Leer el Archivo
    const reader = new window.FileReader();
    reader.readAsArrayBuffer(file); //Se transforma un tipo de dato que la red de ipfs puede entender
    reader.onloadend = () => { //Acceder al resultado ya cargado
        this.setState({ buffer: Buffer(reader.result)}); //Enviamos el array de datos al Buffer
        console.log('buffer',this.state.buffer);
      }
  }

  onSubmit(event){
   event.preventDefault();
    ipfs.add(this.state.buffer,(error, result) => {
    const ipfsHash = result[0].hash
    this.setState({ipfsHash}); //Hash del resultado

      if(error) {
        console.error(error);
        return
      }

      //Conectar con la Blockchain
      this.state.contract.methods.set(ipfsHash).send({from: this.state.account}).then((r) => {
          this.setState({ ipfsHash})
      })
     console.log('ipfsHash', this.state.ipfsHash);
    });
   
  }

  render() {
      return (
        <div className="App">
          <header className="App-header" >
              <meta name="viewport" content="width=device-width, user-scalable=no" />
              Cuenta: {this.state.account} 
           </header>

          <div className= "Container">

              <Navbar color="light" light expand="md">
                    <NavbarBrand href="/" className="App-brand"> <img src={logo} alt="Uneg" className="img-fluid"/>
                    <span className="span-brand">{' '} Concurso de Credenciales</span>
                    </NavbarBrand>
                    <Nav className="ml-auto" navbar>
                        <NavItem>
                            <NavLink href="/"></NavLink>
                        </NavItem>
                    </Nav>
                </Navbar> 

                <div className="pure-g">
                  <div className= "pure-u-1-1">
                        <h1 className= "titulo-h1">Bienvenido al Concurso de Credenciales</h1>
                        <p className= "texto-centrado">Estas credenciales se encontrarán en la red IPFS y la red de Ethereum</p>
                        <img src={`https://ipfs.io/ipfs/${this.state.ipfsHash}`} alt=""/>
                        <h2 className= "texto-centrado-h2">Ingrese sus Credenciales</h2>
                        <form className= "texto-centrado" onSubmit={this.onSubmit}>
                            <label htmlFor="inputFile" className="btn btn-light btn-outline-primary btn-sm">Subir Archivos</label>
                            <input type='file' id="inputFile" className="input-file" onChange={this.captureFile} />
                            <label htmlFor="submitFile" className="btn btn-light btn-outline-secondary btn-sm">Enviar Datos</label>
                            <input type='submit' id="submitFile" className="input-file"/>
                        </form>
                  </div>
                </div>
        
           </div>
        
        </div>
        
      );
      
}

}

export default App;
