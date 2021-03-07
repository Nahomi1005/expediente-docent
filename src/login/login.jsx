import React from "react";
import brand from './brand.png';
import Aspirante from "/home/nahomi/Expediente/expediente/src/Aspirante.json"
import {ExpedienteService} from "/home/nahomi/Expediente/expediente/src/expedienteService.js";
import Web3 from 'web3';

export class Login extends React.Component {

  constructor(props) {
    super(props);

    //Estados para manejar el componente
    this.state = {
      web3: null, 
      account: '',
      contract: null, //Guardar la instancia del contrato
      name: 'undefined', //Input de nombre
      password: 'undefined' //Input de password

    }
  }

  async componentDidMount() {
      await this.loadWeb3();
      await this.loadBlockchainData();

    //Si hay cambio de cuenta, actualiza en estado account
    this.accountChanged();

    //Llama a los métodos del contrato
    this.expedienteService = new ExpedienteService(this.state.contract);

    //Enviar datos del aspirante
    this.handleSubmitt = this.handleSubmit.bind(this); 

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
  //Creamos instancia del contrato Aspirante
  async loadBlockchainData() { 
    
    //Tenemos we3
     const web3 = window.web3;

     //Obtener la cuenta
    const accounts = await (web3.eth.getAccounts())
    this.setState({account: accounts[0]})
    console.log(this.state.account, "CUENTA")

       //Obtener la red
      const networkId = await web3.eth.net.getId();
      console.log(networkId)
  
      const networkData = Aspirante.networks[networkId];
      console.log(networkData, "REDaspirante")
      
      if (networkData) {
        //Obtener abi
        const abi = Aspirante.abi
        console.log(abi, "ABIaspirante")
    
        //Obtener la dirección
        const address = networkData.address
        console.log(address, "DIRECCION DEL CONTRATO aspirante")
  
        //Fetch Contrato
       const contract = new web3.eth.Contract(abi, address)//Creamos una instancia del contrato
  
        this.setState({contract})//Guardamos en el estado, la instancia del contrato

        console.log(this.state.contract, "LOADBLOCKCHAINDATAlogin");
  
      } else {
          window.alert('El Smart Contract no ha sido desplegado en la red.')
      }
  
    }

    async accountChanged(){
      //Reiniciar Interfaz, si Hay cambio de cuenta en Metamask
     window.ethereum.on('accountsChanged', (accounts) => {

              //Se actualiza el valor de la cuenta
              this.setState({account: accounts[0]}, () => {
                  console.log(this.state.account, "accountChanged login");

              });

      });
}

//Eventos
    // Con esta función se muestra el Toast 
    async mostrarToast(id) {
      var toast = document.getElementById(id);
      toast.className = "mostrar";
      setTimeout(function(){ toast.className = toast.className.replace("mostrar", ""); }, 5000);
    }

    //Manejo de input name
    handleName(e) {
      this.setState({name: e.target.value.toUpperCase()}) 
    }

    //Manejo de input password
    handlePassword(e) { 
      this.setState({password: e.target.value.toUpperCase()}) 
    }

    //onSubmit Formulario
    handleSubmit(e) { 
      console.log('name: ' + this.state.name);
      console.log('password: ' + this.state.password);

      //Enviar login
      this.login(this.state.name, this.state.password, this.state.account);
      
    }

    async login(name, password, account){
      let user = await (this.expedienteService.login(account));
      if ((user[0] === name) && (user[2] === password)){
        this.mostrarToast("mitoastLoginOn");
        return true;
        
      }
      else{
        this.mostrarToast("mitoastLoginWrong");
      }
    }

    //Eliminar un usuario
    async deleteUser(account){
    await (this.expedienteService.deleteUser(account));

    //Notificar que se ha eliminado
    this.mostrarToast("mitoastUserEliminado");
  }

  render() {
    return (
      <div className="base-container" ref={this.props.containerRef}> {/*Contenedor externo*/}

        {/*EVENTOS*/}

                {/*Evento para alertar de carga efectiva*/}
                <div class="alert alert-success" role="alert" id="mitoastRegistrado" aria-live="assertive" aria-atomic="true" className="toast">

                        <div class="toast-header">

                            {/*Icono / Logo de la Aplicación */}
                            <img src={brand} width="20" height="20"  alt="Uneg"/>

                            {/*Nombre del evento */} 
                            <strong>&nbsp;¡Registrado!&nbsp;</strong>
                        </div>  
                </div>

                 {/*Evento para alertar de carga efectiva*/}
                 <div class="alert alert-success" role="alert" id="mitoastLoginOn" aria-live="assertive" aria-atomic="true" className="toast">

                          <div class="toast-header">

                                {/*Icono / Logo de la Aplicación */}
                                <img src={brand} width="20" height="20"  alt="Uneg"/>

                                {/*Nombre del evento */} 
                                <strong>&nbsp;¡Iniciando Sesión!&nbsp;</strong>
                          </div>  
                </div>

                {/*Evento para alertar de carga efectiva*/}
                <div class="alert alert-success" role="alert" id="mitoastLoginWrong" aria-live="assertive" aria-atomic="true" className="toast">

                            <div class="toast-header">

                                  {/*Icono / Logo de la Aplicación */}
                                  <img src={brand} width="20" height="20"  alt="Uneg"/>

                                  {/*Nombre del evento */} 
                                  <strong>&nbsp;¡Datos Equivocados!&nbsp;</strong>
                            </div>  
                </div>

                 {/*Evento para notificar de Usuario eliminado*/}
                 <div class="alert alert-success" role="alert" id="mitoastUserEliminado" aria-live="assertive" aria-atomic="true" className="toast">
                              <div class="toast-header">
      
                                     {/*Icono / Logo de la Aplicación */}
                                     <img src={brand} width="20" height="20"  alt="Uneg"/>

                                      {/*Nombre del evento */} 
                                      <strong>&nbsp;Perfecto ¡Registre Ahora!&nbsp;</strong>
                              </div>  
                              {/*<strong>{this.state.eliminado}</strong>*/}
                 </div>

        {/*Header del Login*/}
        <div className="header"></div>

        {/*Contenedor interno*/}
        <div className="content">

          {/*Logo*/}
          <div className="image">
            <img src={brand} alt="Uneg"/>
          </div>

          {/*Formulario*/}
          <div className="form">

              {/*Input name*/}
              <div className="form-group">
                <label htmlFor="username">Usuario</label>
                <input type="text" name="username" placeholder="usuario" onChange={(e)=>this.handleName(e)} />
              </div>

              {/*Input password*/}
              <div className="form-group">
                <label htmlFor="password">Contraseña</label>
                <input type="password" name="password" placeholder="contraseña" onChange={(e)=>this.handlePassword(e)} />
              </div>

          </div>
        </div>

        {/*Footer*/}
        <div className="footer">

          {/*Botón Submit*/}
          <button type="button" className="btnLogin" onClick={(e) => this.handleSubmit(e)}>
            Enviar
          </button>

        </div>

        <button type="button" className="btnReiniciarU" onClick={(e) => this.deleteUser(this.state.account)}>
            Reiniciar Usuario
          </button>
      </div>
    );
  }
}

