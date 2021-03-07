import React from "react";
import brand from './brand.png';
import {ExpedienteService} from "/home/nahomi/Expediente/expediente/src/expedienteService.js";
import Aspirante from "/home/nahomi/Expediente/expediente/src/Aspirante.json"

export class Register extends React.Component {
  constructor(props) {
    super(props);

    //Estados para manejar el componente
    this.state = { 
      account: '',
      contract: null, //Guardar la instancia del contrato
      name: 'undefined', //Input de nombre
      email: 'undefined', //Input de email
      password: 'undefined' //Input de password

    }
  }

  async componentDidMount() {
    await this.loadBlockchainData();

    //Si hay cambio de cuenta, actualiza en estado account
    this.accountChanged();

    //Llama a los métodos del contrato
    this.expedienteService = new ExpedienteService(this.state.contract);

    //Enviar datos del aspirante
    this.handleSubmitt = this.handleSubmit.bind(this); 

  }

  //Inicializa Web3 para conectar con la Blockchain
  //Creamos instancia del contrato Aspirante
  async loadBlockchainData() { 
    
    //Tenemos we3
     const web3 = window.web3;

     //Obtener la cuenta
    const accounts = await web3.eth.getAccounts()
    this.setState({account: accounts[0]})
    console.log(accounts, "CUENTA")
  
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

        console.log(this.state.contract, "LOADBLOCKCHAINDATAregister");
  
      } else {
          window.alert('El Smart Contract no ha sido desplegado en la red.')
      }
  
    }

   async accountChanged(){
          //Reiniciar Interfaz, si Hay cambio de cuenta en Metamask
         window.ethereum.on('accountsChanged', (accounts) => {

                  //Se actualiza el valor de la cuenta
                  this.setState({account: accounts[0]}, () => {
                      console.log(this.state.account, "accountChanged register");

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

    //Manejo de input email
    handleEmail(e) { 
      this.setState({email: e.target.value.toUpperCase()}) 
    }

    //Manejo de input password
    handlePassword(e) { 
      this.setState({password: e.target.value.toUpperCase()}) 
    }

    //onSubmit Formulario
    handleSubmit(e) { 
      console.log('name: ' + this.state.name);
      console.log('email: ' + this.state.email);
      console.log('password: ' + this.state.password);

      //Enviar formulario
      this.join();
      
    }

    //Registro del usuario por primera vez
    async join (){

        let joined = await (this.userJoined());

        //Si no está registrado
        if (!joined){

          //Lo registra
          await this.expedienteService.join(this.state.name, this.state.email, this.state.password, this.state.account);
          
          //Notifica registro exitoso
          this.mostrarToast("mitoastRegistrado")

        } else {

          //Notifica que ya ha sido registrada esa cuenta
          console.log("ERROR: JOIN ALREADY REGISTERED!");
        }
        
    }

    //Comprueba se ha registrado antes el ausuario
    async userJoined(){
     let joined = await (this.expedienteService.userJoined(this.state.account));
     return joined
    }

  render() {
    return (
      <div className="base-container" ref={this.props.containerRef}>     {/*Contenedor externo*/}

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
                                  <input type="text" name="name" placeholder="usuario" onChange={(e)=>this.handleName(e)} />
                                </div>

                                {/*Input email*/}
                                <div className="form-group">
                                  <label htmlFor="email">Email</label>
                                  <input type="text" name="email" placeholder="email" onChange={(e)=>this.handleEmail(e)}/>
                                </div>

                                {/*Input password*/}
                                <div className="form-group">
                                   <label htmlFor="password">Contraseña</label>
                                   <input type="text" name="password" placeholder="contraseña" onChange={(e)=>this.handlePassword(e)}/>
                                </div>
                          </div>
                          
                </div>

                {/*Footer*/}
                <div className="footer">

                      {/*Botón Submit*/}
                      <button type="button" className="btnLogin" onClick={(e) => this.handleSubmit(e)}>
                           Registrar
                      </button>
                </div>
      </div>
    );
  }
}