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

    async getOneFile(account, i){

      let file = await this.contract.methods.aspiranteFiles(account, i).call();

        console.log (file.hashFile, "GETONEFILE");

        return file.ipfsHash;

    }



}