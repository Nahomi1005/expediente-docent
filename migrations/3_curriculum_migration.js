let Curriculum = artifacts.require("./Curriculum.sol");

module.exports = function(deployer) {
    deployer.deploy(Curriculum);
}