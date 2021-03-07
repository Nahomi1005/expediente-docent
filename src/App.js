import React from 'react';
import './App.scss';
import { Navbar,  NavbarBrand, Nav, NavItem, NavLink, Row, Col, Container} from 'reactstrap';
import brand from './brand.png';
import ipfs from './ipfs';
import Curriculum from "./Curriculum.json";
import Aspirante from "./Aspirante.json"
import Web3 from 'web3';
import {ExpedienteService} from "./expedienteService.js";
import { Login, Register } from "./login/index";

class App extends React.Component {

  constructor(props) {
    super(props);

    //Estados para manejar el componente
    this.state = { 
      web3 : null,
      account: '',
      buffer: null, //Le asignamos un valor inicial  
      ipfsHash: '', //Guardar el IPFSHASH
      contract: null, //Guardar la instancia del contrato Curriculum
      aspirante: null, //Guardar la instancia del contrato Aspirante
      balance: 0,  //Para mostrar el balance de Metamask
      files: [], //Para getFiles()
      price: [], //Recupera los precios de subir los archivos
      aspiranteFiles: [], //Recupera los archivos de los aspirantes
      isLogginActive: true //Login
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

    //login
    //Add .right by default
    this.rightSide.classList.add("right");

    //Llama a los métodos del contrato Curriculum
    this.expedienteService = new ExpedienteService(this.state.contract);
    
    ////Llama a los métodos del contrato Aspirante
    this.expedienteServiceA = new ExpedienteService(this.state.aspirante);

    /*Hacemos una Sección aquí para llamar a las funciones
      que tienen que ver con la interfaz de usuario
      (Balance, despliegue de archivos, ver usuarios)
      No con la subida de archivos a la IPFS              */

      this.load();//Llama a getBalance(), getFiles(), getAspiranteFiles(),

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

           //Reiniciar Interfaz, si Hay cambio de cuenta en Metamask
         window.ethereum.on('accountsChanged', (accounts) => {

                  //Se actualiza el valor de la cuenta
                  this.setState({account: accounts[0]}, () => {
                       this.load();

                  });

                  //Cuando se cambia de cuenta, se deja de mostrar los archivos
                  if (this.state.aspiranteFiles !== []){
                      this.state.aspiranteFiles = [];
                  }
         });
         
    }
  
  //Inicializa Web3 para conectar con la Blockchain
  //Creamos instancia del contrato Curriculum
  async loadBlockchainData() { 
    
  //Tenemos we3
   const web3 = window.web3;

   //Obtener la cuenta
   const accounts = await web3.eth.getAccounts()
    this.setState({account: accounts[0]})
    console.log(accounts, "CUENTA")


     //Obtener la networkID
    const networkId = await web3.eth.net.getId();
    console.log(networkId)

        //Obtener la network Curriculum
        const networkData = Curriculum.networks[networkId];
        console.log(networkData, "RED CURRICULUM")

        //Obtener la network Aspirante
        const networkDataA = Aspirante.networks[networkId];
        console.log(networkDataA, "RED ASPIRANTE");
    
    //Si se obtienen
    if (networkData && networkDataA) {
      //Obtener abi Curriculum
      const abi = Curriculum.abi
      console.log(abi, "ABI CURRICULUM");

      //Obtener abi Aspirante
      const abiA = Aspirante.abi
      console.log(abiA, "ABI ASPIRANTE");
  
      //Obtener la dirección Curriculum
      const address = networkData.address
      console.log(address, "DIRECCION DEL CONTRATO CURRICULUM");

      //Obtener la dirección Aspirante
      const addressA = networkDataA.address
      console.log(addressA, "DIRECCION DEL CONTRATO ASPIRANTE");


      //Fetch Contrato Curriculum
     const contract = new web3.eth.Contract(abi, address)//Creamos una instancia del contrato

      this.setState({contract})//Guardamos en el estado, la instancia del contrato

      //Fetch Contrato Aspirante
     const aspirante = new web3.eth.Contract(abiA, addressA)//Creamos una instancia del contrato

     this.setState({aspirante})//Guardamos en el estado, la instancia del contrato

      /*Esta parte comentada es para cuando se manejaba en el contrato un único hashipfs */
          // const ipfsHash = await contract.methods.get().call()//Llamamos al método get() del contrato

          //this.setState({ipfsHash})//Guardamos lo que recuperamos del contrato en el estado

          //console.log(this.state.ipfsHash, "LOADBLOCKCHAINDATA");

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

      //Notificar carga exitosa
      this.mostrarToast("mitoast");

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
      else{
        this.setState({ipfsHash: ''}); //Hash del resultado
      }

      //Conectar con la Blockchain para llamar a set de la variable ipfsHash
      /*   this.state.contract.methods.set(ipfsHash).send({from: this.state.account}).then((r) => {
              this.setState({ ipfsHash})
          })
        console.log(this.state.ipfsHash + " IPFSHASH");
        */
    });

    /*  //Si se quiere eliminar el botón de Mostrar, se puede llamar desde aquí
        //El problema que me daba era que al añadir un nuevo archivo, no se mostraba al instante, había que recargar la página
        //Por este problema, se decidió añadir el botón mostrar
        //Landeras utiliza 'update' en vez de 'accountChanged' por eso a él le funciona que se actualiza todo
        this.getAspiranteFiles(); //Obtener los archivos que ha subido el aspirante
    */

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

     // this.getRefundableEther();
    }

 /* 
 //FormularioViejo: El formulario general para cargar y enviar archivos a la nube IPFS
 //Se usaba cuando se manejaba un solo hashIpfs
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

  //Reinicia el balance y reinicia la lista de archivos del aspirante
  this.load();
  this.getAspiranteFiles();

  //Notificar de envío exitoso
  this.mostrarToast("mitoastEnviado");

}

//Obtener los archivos de los aspirantes
async getAspiranteFiles(){
  let aspiranteFiles = await this.expedienteService.getAspiranteFiles(this.state.account);
  this.setState({
    aspiranteFiles
  });

  console.log("aspiranteFiles: ", this.state.aspiranteFiles);
}

//Ocultar los archivos de un aspirante
async ocultarFiles(){
  this.setState({
    aspiranteFiles: []
  });

  console.log(this.state.aspiranteFiles, "OCULTAR");
}

//Eliminar un archivo
async deleteFile (account, index) {

  let file = await this.expedienteService.deleteFile(account, index);
  console.log(file.name + 'Archivo Eliminado');

  //Notificar eliminado exitoso
  this.mostrarToast("mitoastEliminado");
  this.setState({eliminado : this.state.files[index].name})

  //Reinicia el balance y la lista de archivos del aspirante
  this.load();
  this.getAspiranteFiles();

}

//¿Cuántos usuarios hay registrados?
async totalUsers(){
  let totalUsers = await(this.expedienteServiceA.totalUsers());
  console.log(totalUsers, "Cantidad de Usuarios");
}

//EVENTOS
// Con esta función se muestra el Toast 
async mostrarToast(id) {
  var toast = document.getElementById(id);
  toast.className = "mostrar";
  setTimeout(function(){ toast.className = toast.className.replace("mostrar", ""); }, 5000);
}

//LOGIN
changeState() {
  const { isLogginActive } = this.state;

  if (isLogginActive) {
    this.rightSide.classList.remove("right");
    this.rightSide.classList.add("left");
  } else {
    this.rightSide.classList.remove("left");
    this.rightSide.classList.add("right");
  }
  this.setState(prevState => ({ isLogginActive: !prevState.isLogginActive }));
}

render() {
  const { isLogginActive } = this.state;
  const current = isLogginActive ? "Registrar" : "Acceder";
    const currentActive = isLogginActive ? "login" : "register";
      return (
        <div className="App">

              {/* Header de la Web*/}
              <header className="App-header" id="account-address">
                   <meta name="viewport" content="width=device-width, user-scalable=no" />
                        Cuenta: {this.state.account} 
              </header>

             {/* Cuerpo de la Web*/}
              <div className= "Container">
              
                      {/*EVENTOS*/}

                              {/*Evento para alertar de carga efectiva*/}
                               <div class="alert alert-success" role="alert" id="mitoast" aria-live="assertive" aria-atomic="true" className="toast">

                                        <div class="toast-header">
      
                                        {/*Icono / Logo de la Aplicación */}
                                           <img src={brand} width="20" height="20"  alt="Uneg"/>

                                        {/*Nombre del evento */} 
                                           <strong>&nbsp;¡Exitosamente Cargado!&nbsp;</strong>
                                        </div>  

                                </div>

                                {/*Evento para notificar de archivo eliminado*/}
                               <div class="alert alert-success" role="alert" id="mitoastEliminado" aria-live="assertive" aria-atomic="true" className="toast">
                                          <div class="toast-header">
      
                                                {/*Icono / Logo de la Aplicación */}
                                                  <img src={brand} width="20" height="20"  alt="Uneg"/>

                                                {/*Nombre del evento */} 
                                                  <strong>&nbsp;¡Archivo Eliminado!&nbsp;</strong>
                                           </div>  
                                   {/*<strong>{this.state.eliminado}</strong>*/}
                                </div>

                                {/*Evento para alertar de envío al contrato*/}
                               <div class="alert alert-success" role="alert" id="mitoastEnviado" aria-live="assertive" aria-atomic="true" className="toast">

                                      <div class="toast-header">

                                            {/*Icono / Logo de la Aplicación */}
                                            <img src={brand} width="20" height="20"  alt="Uneg"/>

                                            {/*Nombre del evento */} 
                                            <strong>&nbsp;¡Enviado a la Red!&nbsp;</strong>
                                      </div>  

                                </div>
                      
                      {/*PRINCIPAL */}

                       {/* Menu principal de la Web*/}
                        <Navbar color="light" light expand="md">

                                {/* Logo de la Web*/}
                                <NavbarBrand href="/" className="App-brand"> <img src={brand} alt="Uneg" className="img-fluid logo"/>
                                    <span className="span-brand">{' '}</span>
                                </NavbarBrand>

                                {/* Enlaces Internos de la Web*/}
                                <Nav className="ml-auto" navbar>

                                    {/*Eliminar Usuario */}
                                    {/*<NavItem>
                                        <NavLink href="#" onClick={() => this.deleteUser(this.state.account)}> Reiniciar Usuario</NavLink>
                                    </NavItem>*/}

                                    {/*Cantidad de Usuarios */}
                                    <NavItem>
                                        <NavLink href="#" onClick={() => this.totalUsers()}> Usuarios</NavLink>
                                    </NavItem>
                                  
                                </Nav>
                        </Navbar> 

                        {/*LOGIN de la página*/}
                        <div className = "App-login">
                                <div className = "login">
                                      <div className = "containerLogin" ref={ref => (this.container = ref)}>
                                          {isLogginActive && (<Login containerRef={ref => (this.current = ref)} />)}
                                          {!isLogginActive && (<Register containerRef={ref => (this.current = ref)} />)}
                                      </div>
                                      <RightSide current={current} currentActive={currentActive} containerRef={ref => 
                                      (this.rightSide = ref)} onClick={this.changeState.bind(this)}/>
                                
                                </div>
                        </div>
                            {/*LOGIN de la página*/}

                            {/* Sección Principal*/}
                            <div className="pure-g">
                                  <div className= "pure-u-1-1">
                                        <h1 className= "titulo-h1">Registro del Expediente Docente</h1>
                                        <p className= "texto-centrado">Estas credenciales se encontrarán en la red IPFS y la red de Ethereum</p>
                                        
                                        {/* Recuperar el archivo con el hash de la IPFS*/}
                                       {/*<img src={`https://ipfs.io/ipfs/${this.state.ipfsHash}`} alt=""/>*/} 

                                        <h6 className= "texto-centrado-h2"><strong>Ingrese la información solicitada a continuación:</strong></h6>
                                  </div>
                            </div>

                        <Container className="container-fluid" >

                            {/*Plantilla de cargar, ver, eliminar archivos del expediente */}
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

                                                  return <div  key = {i}> {/* El índice identifica cada <div> con Key*/} 
                                                            
                                                             
                                                             <div className= "divFiles-in">
                                                                    <span className= "texto-izq">{file.name} {/*- cost: {this.converter(file.price)} */}</span>
                                                                    <label htmlFor="inputFile" className="btn btn-light btn-outline-primary btn-sm btn-css">Cargar</label>
                                                                    <input type='file' id="inputFile" className="input-file" onChange={(event) => this.captureFile(event)} />
                                                                    <button className="btn btn-light btn-outline-secondary btn-sm btn-css" onClick={(event) => this.onSubmit(event, i)}>Enviar</button>                                   
                                                             </div>

                                                          </div>


                                                  })}
                                                  
                                      </div>
                                      
                                  </Col>
                           </Row>
 
                            <Row className= "row ">

                                       <Col sm  className= "col divFiles-in-R">
                                       
                                            {this.state.aspiranteFiles.map((file, i) => {
                                                    return <div key = {i} className= "divFiles-in divFiles-in-R-div"> 
                                                            {file.name} {/*- cost: {this.converter(file.price)} ETH - hash: */}
                                                            <img className= "img-R" src={`https://ipfs.io/ipfs/${file.hashFile}`} alt=""/>
                                                            <button className="btn btn-light btn-outline-danger btn-sm btn-Right" onClick={() => this.deleteFile(this.state.account, i)}>Eliminar</button>
                                                    </div>
                                             })}

                                        </Col>

                            </Row>

                            <Row>

                              <Col>
                              <button className="btn btn-light btn-outline-success btn-sm btn-css" onClick={(event) => this.getAspiranteFiles()}>Mostrar</button>
                              <button className="btn btn-light btn-outline-secondary btn-sm btn-css" onClick={(event) => this.ocultarFiles()}>Ocultar</button>
                              </Col>

                            </Row>

                        </Container>
              </div>

            
        </div>
        
      );
      
}

}

const RightSide = props => {
  return (
    <div
      className="right-side"
      ref={props.containerRef}
      onClick={props.onClick}
    >
      <div className="inner-container">
        <div className="text">{props.current}</div>
      </div>
    </div>
  );
};

export default App;
