pragma solidity >=0.4.21 <0.6.0;

contract Aspirante {

    address public owner; //Almacena la dirección actual.

   /*  struct FormacionUniversitaria{
        string place;
        string date;
    }

    struct ExperienciaDocente{
        string description;
        string place;
        string date;
    }

    struct ExperienciaNoDocente{
        string description;
        string place;
        string date;
    }

    struct Cursos{
        string place;
        string finished;
    }

    struct Idiomas{
        string language;
        string level;
    }
*/
    struct Aspirantes {
        //Datos para registrarse
        string name; //Nombre
        string email; //Correo
        string password; //Password
        //string surName; // Apellido
        //string direction; // Direccion
       // string phone; // Telefono
        //uint loyaltyPoints; // Puntos del Usuario
        //FormacionUniversitaria[] studies;
        //ExperienciaDocente[] docente;
        // ExperienciaNoDocente[] noDocente;
        //Cursos[] cursos;
        // Idiomas[] idiomas;

    }

    //FormacionUniversitaria[] public formacion;

    constructor() public{
        owner = msg.sender;
    }

 /* Getión de Usuario */
    mapping(address => Aspirantes) private users; //Para cada dirección de Aspirante, se crea un usuario.
    mapping(address => bool) private joinedUsers; //Usuarios registrados.
    address[] total;

    //Evento que alerta la creación de un nuevo usuario.
    event onUserJoined(address,string);

    //Ejecuta para ingresar un nuevo aspirante.
    function join(string memory name, string memory email, string memory password) public {
        require(!userJoined(msg.sender), "User Joined");
        Aspirantes storage user = users[msg.sender];

        //Se asignan los valores ingresados a las variables.
        user.name = name;
        user.password = password;
        user.email = email;
        joinedUsers[msg.sender] = true; //Dirección del usuario ya se ha registrado.
        total.push(msg.sender);

        //Activa el evento que alerta creación de usuario.
       emit onUserJoined(msg.sender, string(abi.encodePacked(name, " ", email)));
    }

    //Leer del mapping un usuario y devolver sus datos.
    function getUser(address addr) public view returns (string memory, string memory, string memory) {
        require(userJoined(msg.sender), "User Joined");
        Aspirantes memory user = users[addr];
        return (user.name, user.email, user.password);
    }

    //Verifica si el usuario existe, antes de crearlo o mostrarlo.
    function userJoined(address addr) public view returns (bool) {
        return joinedUsers[addr];
    }

    //Mostrar el número total de usuarios registrados.
    function totalUsers() public view returns (uint) {
        return total.length;
    }

    function deleteUser(address addr) public {
        delete users[addr];
        joinedUsers[addr] = false;

        for(uint i = 0; i < total.length; i++){

            if (total[i] == addr){
                    total[i] = total[total.length-1];
                    delete total[total.length-1];
                    total.length--;
            }
        }

    }

}