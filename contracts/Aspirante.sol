pragma solidity >=0.4.21 <0.6.0;

contract Aspirante {

    address public owner; //Almacena la dirección actual.

     struct FormacionUniversitaria{
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

    struct Aspirantes {
        //Datos para registrarse
        string name; //Nombre
        string surName; // Apellido
        string direction; // Direccion
        string identifier; //Cedula
        string phone; // Telefono
        string email; //Correo
        uint loyaltyPoints; // Puntos del Usuario
        FormacionUniversitaria[] studies;
        //ExperienciaDocente[] docente;
        // ExperienciaNoDocente[] noDocente;
        //Cursos[] cursos;
        // Idiomas[] idiomas;

    }

    FormacionUniversitaria[] public formacion;

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
    function join(string memory name, string memory surName, string memory direction,
                    string memory identifier,string memory phone, string memory email) public {
        require(!userJoined(msg.sender), "User Joined");
        Aspirantes storage user = users[msg.sender];

        //Se asignan los valores ingresados a las variables.
        user.name = name;
        user.surName = surName;
        user.direction = direction;
        user.identifier = identifier;
        user.phone = phone;
        user.email = email;
        joinedUsers[msg.sender] = true; //Dirección del usuario ya se ha registrado.
        total.push(msg.sender);

        //Activa el evento que alerta creación de usuario.
       emit onUserJoined(msg.sender, string(abi.encodePacked(name, " ", surName)));
    }

    //Leer del mapping un usuario y devolver sus datos.
    function getUser(address addr) public view returns (string memory, string memory,
                                                         string memory, string memory, string memory, string memory) {
        require(userJoined(msg.sender), "User Joined");
        Aspirantes memory user = users[addr];
        return (user.name, user.surName, user.direction, user.identifier, user.phone, user.email );
    }

    //Verifica si el usuario existe, antes de crearlo o mostrarlo.
    function userJoined(address addr) private view returns (bool) {
        return joinedUsers[addr];
    }

    //Mostrar el número total de usuarios registrados.
    function totalUsers() public view returns (uint) {
        return total.length;
    }


}