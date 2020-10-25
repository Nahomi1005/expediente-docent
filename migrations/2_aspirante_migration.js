let Aspirante = artifacts.require("./Aspirante.sol");

module.exports = function(deployer) {
    deployer.deploy(Aspirante);
}