const SSIRegistry = artifacts.require("SSIRegistry");
const GrievanceSystem = artifacts.require("GrievanceSystem");

module.exports = function (deployer) {
  deployer.deploy(SSIRegistry);
  deployer.deploy(GrievanceSystem);
};