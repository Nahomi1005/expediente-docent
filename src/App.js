import React from 'react';
import './App.css';
import { Navbar,  NavbarBrand, Nav, NavItem, NavLink, Row, Col, Container} from 'reactstrap';
import logo from './logo.jpg';
import ipfs from './ipfs';
import Curriculum from "./Curriculum.json";
import Web3 from 'web3';
import {ExpedienteService} from "./expedienteService.js";

class App extends React.Component {

  constructor(props) {
    super(props);

    //Estados para manejar el componente
    this.state = { 
      web3 : null,
      account: undefined,
      buffer: null, //Le asignamos un valor inicial  
      ipfsHash: '', //Guardar el IPFSHASH
      contract: null, //Guardar la instancia del contrato
      balance: 0,  //Para mostrar el balance de Metamask
      files: [], //Para getFiles()
      price: [], //Recupera los precios de subir los archivos
      aspiranteFiles: [] //Recupera los archivos de los aspirantes
    }

    this.captureFile = this.captureFile.bind(this); //inputfile-Cargar y formatear el archivo
    this.onSubmit = this.onSubmit.bind(this); //Enviar archivo a la IPFS
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

    //Llama a los métodos del contrato
    this.expedienteService = new ExpedienteService(this.state.contract);

    /*Hacemos una Sección aquí para llamar a las funciones
      que tienen que ver con la interfaz de usuario
      (Balance, despliegue de archivos, ver usuarios)
      No con la subida de archivos a la IPFS              */

      this.load();//Llama a getBalance(), getFiles(), getAspiranteFiles(),

      /*A partir de aquí continuamos con el proceso de guardar
      el Hash de la IPFS en el contrato*/

  }
 
    //Cargamos la libreria de Web3 para interactuar con el contrato
    async loadWeb3(){
      if (window.ethereum){
        window.web3 = new Web3(window.ethereum)
        await window.ethereum.enable()
      } if (window.web3) {
          window.web3 = new Web3(window.web3.currentProvider)
      } else {
        window.alert('¡No tienes Metamask Instalado!\n Por favor, instala Metamask. https://metamask.io/')
      }
      this.setState({web3: window.web3}); //Habilita el web3
    }
  
  //Inicializa Web3 para conectar con la Blockchain
  async loadBlockchainData() { 
    //Obtener la cuenta
   const web3 = window.web3;
   const accounts = await web3.eth.getAccounts()
    this.setState({account: accounts[0]})
    console.log(accounts, "CUENTA")

     //Obtener la red
    const networkId = await web3.eth.net.getId();
    console.log(networkId)

    const networkData = Curriculum.networks[networkId];
    console.log(networkData, "RED")
    
    if (networkData) {
      //Obtener abi
      const abi = Curriculum.abi
      console.log(abi, "ABI")
  
      //Obtener la dirección
      const address = networkData.address
      console.log(address, "DIRECCION DEL CONTRATO")


      //Fetch Contrato
     const contract = new web3.eth.Contract(abi, address)//Creamos una instancia del contrato

      this.setState({contract})//Guardamos en el estado, la instancia del contrato


    // const ipfsHash = await contract.methods.get().call()//Llamamos al método get() del contrato

     //this.setState({ipfsHash})//Guardamos lo que recuperamos del contrato en el estado

      console.log(this.state.ipfsHash, "LOADBLOCKCHAINDATA");

    } else {
        window.alert('El Smart Contract no ha sido desplegado en la red.')
    }

  }

  //Proceso de cargar y formatear el archivo para ser enviado a la red IPFS
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

  //Enviamos a la IPFS
  //Guardamos el Hash en el contrato
  onSubmit(event,i){
   event.preventDefault();
    ipfs.add(this.state.buffer,(error, result) => {
    const ipfsHash = result[0].hash
    this.setState({ipfsHash}); //Hash del resultado
    console.log("ONSUBMIT ", this.state.ipfsHash);
     
    //Cargar archivo 
    this.UpFiles(i);

   
      if(error) {
        console.error(error);
        return
      }


      //Conectar con la Blockchain para llamar a set de la variable ipfsHash
   /*   this.state.contract.methods.set(ipfsHash).send({from: this.state.account}).then((r) => {
          this.setState({ ipfsHash})
      })
     console.log(this.state.ipfsHash + " IPFSHASH");
     */
    });

   

 

  }

  //Convertir de Wei a Ether
  converter(wei) {
    const etherValue = Web3.utils.fromWei(wei, 'ether');
    return etherValue
  }

//Obtener los nombres de los archivos que va a cargar el aspirante
//Es para indicarle que carge Foto Carnet, Certificados...
 async getFilesViejo() {

  let total = await this.getTotalFiles();//Lee la cantidad de tipos de archivos que puede cargar el aspirante
  let files = [];//Guardamos los nombres de los archivos
  let price = [] //Guardamos los precios de los archivos

 for(var i = 0; i < total; i++){
      let file = (await this.state.contract.methods.getFilesName(i).call());
      files.push(file); //Llenamos el array con los nombres de los archivos

      let fileprice = (await this.state.contract.methods.getFilesPrice(i).call());
      price.push(this.converter(fileprice)); //Llenamos los precios de los archivos en ether 
    
  /*   

      //Esta fracción de código hay que colocarlo en el render para mostrar los precios
          <div>
                {this.state.price.map((price,i) => {
                                return <div key={i}>
                                            <span>{price}<strong> ETH</strong></span>
                                        </div>
                })}
          </div> 
     */

  } 

  this.setState({files}); //Lo guardamos en el estado
  this.setState({price}); //Lo guardamos en el estado

  return files;

}

//Ejecuta todos los métodos para la intefaz
  async load() {
      this.getBalance(); //Cantidad de Ether en la cta de Ethereum
      this.getFiles(); //Desplegar los archivos que va a cargar el aspirante
      this.getAspiranteFiles(); //Obtener los archivos que ha subido el aspirante
     // this.getRefundableEther();
    }

 /* 
 //FormularioViejo: El formulario general para cargar y enviar archivos a la nube IPFS
 <form className= "texto-centrado" onSubmit={this.onSubmit}>
          <label htmlFor="inputFile" className="btn btn-light btn-outline-primary btn-sm">Subir Archivos</label>
          <input type='file' id="inputFile" className="input-file" onChange={this.captureFile} />
          
          <label htmlFor="submitFile" className="btn btn-light btn-outline-secondary btn-sm">Enviar Datos</label>
          <input type='submit' id="submitFile" className="input-file"/>
</form>

//FormularioNuevo para desplegar el array de archivos que puede cargar el usuario
 <form className= "texto-centrado" onSubmit={this.onSubmit}>
      <label htmlFor="inputFile" className="btn btn-light btn-outline-primary btn-sm">Subir Archivos</label>
      <input type='file' id="inputFile" className="input-file" onChange={this.captureFile} />
      <label htmlFor="submitFile" className="btn btn-light btn-outline-secondary btn-sm">Enviar Datos</label>
      <input type='submit' id="submitFile" className="input-file"/>
 </form>
*/

/* A partir de aquí vemos los métodos que llaman a expedienteService.js */


 //Obtener el balance de la cuenta de Metamask
 async getBalance() {
    
  let weiBalance = await this.state.web3.eth.getBalance(this.state.account);

  this.setState({
      balance: this.converter(weiBalance)
  });
}


//Obtener los nombres de los archivos que va a cargar el aspirante
//Es para indicarle que carge Foto Carnet, Certificados...
async getFiles() {
  let files = await this.expedienteService.getFiles();
  this.setState({
    files
  })

}

//Cargar el archivo desde el contrato
async UpFiles(fileIndex) {


  console.log("UPFILES ", this.state.ipfsHash);
  await this.expedienteService.UpFiles(fileIndex, this.state.account, this.state.ipfsHash);

}

//Obtener los archivos de los aspirantes
async getAspiranteFiles(){
  let aspiranteFiles = await this.expedienteService.getAspiranteFiles(this.state.account);
  this.setState({
    aspiranteFiles
  });

  console.log("aspiranteFiles: ", this.state.aspiranteFiles);
}

//Obtener un archivo específico de un aspirante
async getOneFile(account, i){
  let ipfsHash = await this.expedienteService.getOneFile(account, i);
  this.setState({
    ipfsHash
  });

  console.log(this.state.ipfsHash, "GETONEFILE APP");
  console.log(ipfsHash, "GETONEFILE APP");
}

render() {
      return (
        <div className="App">

              {/* Header de la Web*/}
              <header className="App-header" >
                   <meta name="viewport" content="width=device-width, user-scalable=no" />
                        Cuenta: {this.state.account} 
              </header>

             {/* Cuerpo de la Web*/}
              <div className= "Container">

                       {/* Menu principal de la Web*/}
                        <Navbar color="light" light expand="md">

                                {/* Logo de la Web*/}
                                <NavbarBrand href="/" className="App-brand"> <img src={logo} alt="Uneg" className="img-fluid"/>
                                    <span className="span-brand">{' '}</span>
                                </NavbarBrand>

                                {/* Enlaces Internos de la Web*/}
                                <Nav className="ml-auto" navbar>
                                    <NavItem>
                                        <NavLink href="/"></NavLink>
                                    </NavItem>
                                </Nav>
                        </Navbar> 

                            {/* Página Principal*/}
                            <div className="pure-g">
                                  <div className= "pure-u-1-1">
                                        <h1 className= "titulo-h1">Registro del Expediente Docente</h1>
                                        <p className= "texto-centrado">Estas credenciales se encontrarán en la red IPFS y la red de Ethereum</p>
                                        
                                        {/* Recuperar el archivo con el hash de la IPFS*/}
                                        <img src={`https://ipfs.io/ipfs/${this.state.ipfsHash}`} alt=""/>

                                        <h6 className= "texto-centrado-h2"><strong>Ingrese la información solicitada a continuación:</strong></h6>
                                  </div>
                            </div>


                        <Container fluid="md">

                            
                            <Row className= "row">
                                <Col sm className= "col"> 

                                      {/* Recuperar el balance de la cuenta*/}
                                      <span><strong>Balance: </strong> {this.state.balance} <strong>ETH</strong></span>
                                </Col>
                            </Row>

                            <Row className= "row">
                                  <Col sm className= "col">

                                      {/* Mostrar los botones para subir los archivos*/} 
                                      <div className= "divFiles">

                                            {/* Hacemos un mapeo para recorrer el estado files[],
                                                que llenamos en getFiles(),
                                                con los valores del contrato*/}

                                            {this.state.files.map((file, i) => {

                                                  return <div key = {i}> {/* El índice identifica cada <div> con Key*/} 

                                                              <span className= "texto-izq">{file.name} - cost: {this.converter(file.price)} </span>

                                                              <div>
                                                                    <label htmlFor="inputFile" className="btn btn-light btn-outline-primary btn-sm">Cargar</label>
                                                                    <input type='file' id="inputFile" className="input-file" onChange={this.captureFile} />
                                                                    <button className="btn btn-light btn-outline-secondary btn-sm btn-Right" onClick={(event) => this.onSubmit(event, i)}>Enviar</button>
                                                      
                                                              </div>

                                                          </div>


                                                  })}
                                                  
                                      </div>
                                  </Col>
                           </Row>
                                
                            <Row className= "row">
                                       <Col sm  className= "col">
                                            
                                            {this.state.aspiranteFiles.map((file, i) => {
                                                    return <div key = {i}>
                                                            {/*<button className="btn btn-light btn-outline-secondary btn-sm btn-Right" onClick={(event) => this.getOneFile(this.state.account, i)}>Mostrar</button>*/}
                                                            {file.name} - cost: {this.converter(file.price)} ETH - hash: <img className = "img" src={`https://ipfs.io/ipfs/${file.hashFile}`} alt=""/>
                                                    </div>
                                             })}

                                        </Col>
                            </Row>

                        </Container>
              </div>

            
        </div>
        
      );
      
}

}

export default App;
