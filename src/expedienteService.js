export class ExpedienteService {

    constructor(contract) {
        this.contract = contract;
    }

    async getFiles() {
        let total = await this.getTotalFiles();
        let files = [];
        for(var i = 0; i < total; i++) {
          let file = await (this.contract.methods.files(i)).call();
            files.push(file);
        }
        return this.mapFiles(files);
    }

    //Leemos desde el contrato el array que guarda los tipos de archivos que puede cargar el aspirante
    async getTotalFiles() {
        return (await this.contract.methods.totalFiles().call());
    }

    mapFiles(files) {
        return files.map(file => {
           return{  name: file[0],
                    price: file[1],
                    hashFile: file[2]

           }
        })
    }

    //Cargar el archivo desde el contrato
    async UpFiles(fileIndex, account, ipfsHash) {

        //La llamada al método del contrato para cargar el archivo
        return this.contract.methods.UpFiles(fileIndex, ipfsHash).send({from: account}).then((r) => {
        console.log( "ENVIADOOO");
        console.log("UPFILES SERVICIO", ipfsHash);
        })

    }

    //Obtener los archivos de los aspirantes
    async getAspiranteFiles(account){

        //Llamamos al mapping del contrato
        //Almacenamos su valor en la variable
        //Nos devuelve un valor numérico
        let aspiranteTotalFiles = await this.contract.methods.aspiranteTotalFiles(account).call();

        let files = [];

        //Utilizamos el valor numérico como variable de control del ciclo
        for(var i = 0; i < aspiranteTotalFiles; i++) {

            //Llamamos a otro mapping del contrato
            //Nos devuelve un array
            //Almacenamos los valores en el array files para acceder a los datos
            let file = await (this.contract.methods.aspiranteFiles(account, i)).call();
              files.push(file);
          }

          return this.mapFiles(files);
    }

    //Eliminar un archivo del expediente del aspirante
   async deleteFile (account, index){

    console.log("CONTRATOOO EXPEDIENTE", this.contract);
    return await (this.contract.methods.deleteFile(account,index).send({from: account}));
   }

   //LOGIN

        //REGISTRO de usuario

            //Registro del usuario por primera vez
            async join (name, email, password, account){
                    return await (this.contract.methods.join(name, email, password).send({from: account}).then((r) => {
                        console.log( "JOINEEED");
                        }));
            }

            //Comprueba que el usuario se ha unido antes
            async userJoined(address){
                    let joined = await (this.contract.methods.userJoined(address)).call();
                    console.log(joined, "Joined expedienteService");
                    return joined;
            }

            //Elimina un usuario del historial (Sin eliminar sus archivos)
            async deleteUser(account) {

                    let userDeleted = await (this.contract.methods.deleteUser(account).send({from: account}).then((r) => {
                        console.log("Usuario Eliminado");
                    }));

                    return userDeleted;

            }

            //Retorna la cantidad de usuarios registrados
            async totalUsers(){
                let totalUsers = await(this.contract.methods.totalUsers()).call();
                return totalUsers;
            }

        //INICIO DE SESIÓN
        async login(account){

            let user = await(this.contract.methods.getUser(account)).call();
            return user;

        }

}