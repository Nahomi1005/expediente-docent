pragma solidity >=0.4.21 <0.6.0;

contract Curriculum {
    string ipfsHash;

    function set(string memory x) public {
        ipfsHash = x;
    }

    function get() public view returns (string memory) {
        return ipfsHash;
    }


}