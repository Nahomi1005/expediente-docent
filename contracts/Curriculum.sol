pragma solidity >=0.4.21 <0.6.0;


contract Curriculum {
   /* string ipfsHash;
    
    //Cambia el valor de la variable ipfshash
    function set(string memory x) public {
        ipfsHash = x;
    }

    //Retorna el valor de la variable ipfshash
    function get() public view returns (string memory) {
        return ipfsHash;
    }
*/
 
 //Recibe un índice para leer de un array el tipo de archivo que se está cargando
 //Ve que accedemos al nombre que está guardado en ese índice del array y lo retorna
 function getFilesName(uint i) external view returns (string memory)  {
       string memory nameArray = files[i].name;

       return(nameArray);
       
    }

    //Lo mismo pero retorna el costo de subir el archivo
     function getFilesPrice(uint i) external view returns (uint256)  {
       uint256 priceArray = files[i].price;

       return(priceArray);
       
    }


     //Retorna la cantidad de archivos que ha cargado el aspirante
      function getAspiranteTotalFiles() public view returns (uint) { 
        Aspirante storage aspirante = aspirantes[msg.sender];

        return aspirante.totalFiles;
    }

    address public owner; //El dueño del smart contract

    //Nuevo tipo de dato que representa al Aspirante que quiere cargar su expediente
     struct Aspirante {
        uint loyaltyPoints;
        uint totalFiles;
    }

    //Nuevo tipo de dato que representa a cada Archivo que 
    //va a cargar el Aspirante en su expediente
    struct Files {
        string name;
        uint256 price;
        string hashFile;

    }

    uint etherPerPoint = 0.5 ether; //El valor del LoyaltyPoint
    
    //Arreglo para guardar los Archivos que el Aspirante
    //va a poder cargar en su expediente
    Files[] public files; 


    //Complejo que asigna un address a un Aspirante
    //Tenemos en este tipo de datos a todos los aspirantes
     mapping(address => Aspirante) public aspirantes;

     //Complejo que asigna un address del aspirante a un Archivo que ha cargado
     //Guarda la lista de Archivos que ha cargado cada Aspirante
     mapping(address => Files[]) public aspiranteFiles;

     //Complejo que asigna un address de aspirante a la cantidad de archivos que ha cargado
     //Relaciona la dirección de un Aspirante con el nro de archivos que tiene en su expediente
     mapping (address => uint) public aspiranteTotalFiles;

    event FilePurchased(address indexed aspirante);

    constructor() public {
        owner = msg.sender; //La persona que despliega el contrato

        //Inicializamos los archivos que puede almacenar en el expediente docente
        files.push(Files('Foto Carnet', 1 ether, 'x'));
        files.push(Files('Cédula', 3 ether, 'x'));
        files.push(Files('Títulos', 2 ether, 'x'));
        files.push(Files('Certificados', 1 ether, 'x'));
        files.push(Files('Calificaciones', 1 ether, 'x'));
    }

    //Cargar el archivo en el expediente
    function UpFiles(uint filesIndex, string memory ipfsHash) public{
        Files storage file = files[filesIndex];//Guardamos el archivo que está cargando en su expediente

        file.hashFile = ipfsHash; //Le asignamos el hash de la IPFS

        Aspirante storage aspirante = aspirantes[msg.sender];//Obtenemos el aspirante que estamos modificando

        aspirante.loyaltyPoints += 1; //Aumentamos sus puntos de Lealtad
        aspirante.totalFiles += 1; //Aumentamos la variable de control de cantidad de archivos en el expediente
        aspiranteFiles[msg.sender].push(file); //Guardamos el Archivo actualizado en mapping asociado al address del Aspirante
        aspiranteTotalFiles[msg.sender]++; //Almacenamos en el arreglo de Address con Nro de Archivos por Aspirante

      emit FilePurchased(msg.sender);
    }
    
    
    //¿Cuátos archivos están desplegados para que pueda subir el aspirante?
      function totalFiles() public view returns (uint) { 
        return files.length;
    }
    
    
    //Eliminar un archivo del aspirante
    function deleteFile(address account, uint index) public returns(string memory) {

            uint lengthArray = aspiranteTotalFiles[account];
        
        if (index <= lengthArray){

                Files storage element = aspiranteFiles[account][index];
                aspiranteFiles[account][index] = aspiranteFiles[account][lengthArray-1];
                delete aspiranteFiles[account][lengthArray-1];
                aspiranteTotalFiles[account]--;
                aspiranteFiles[account].length--;
                return element.name;
        }
        else return 'Error';

       
    }


}