const Aspirante = artifacts.require('Aspirante'); //Una constante para la instancia del contrato

let instance;

beforeEach(async () => { //Una nueva instancia para cada test
   instance = await Aspirante.new() // Otra opción para Aspirante.deployed(), que nos da una instancia desplegada

});

contract('Aspirante', () => {
    it("has been deployed successfully", async () => {
        const aspirante = await Aspirante.deployed();
        assert(aspirante, "contract was not deployed"); 
      });


});