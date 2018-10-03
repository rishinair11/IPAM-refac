const Netmask = require('netmask').Netmask;

function allocateIP(currentNetwork, ipRange) {
    const block = new Netmask(currentNetwork.network_id + '/' + currentNetwork.cidr);
    let lowerBound = parseInt(ipRange[0].split('.')[3]); //take the last part of IP and convert to integer
    let upperBound = parseInt(ipRange[1].split('.')[3]); //take the last part of IP and convert to integer
   
    var ipsToAllocate = [];
    var invalidRange = false;
    
    for (var i = lowerBound; i < upperBound; i++){
        var checkIP = (ipRange[0].split('.')[0] + '.' + ipRange[0].split('.')[1] + '.' + ipRange[0].split('.')[2] + '.' + i.toString());
        if (block.contains(checkIP)) { 
            currentNetwork.ip_pool.forEach(address => {
                if (address.ipaddress === checkIP) {
                    invalidRange = true;
                }
            });
            if (!invalidRange)
                ipsToAllocate.push(checkIP);
        }
    }
        
    console.log(invalidRange);
    
    if (invalidRange)
        return null;
    else
        return ipsToAllocate

    

}

module.exports = allocateIP;

function allocateIP(currentNetwork, ipRange) {
    let lowerBound = parseInt(ipRange[0].split('.')[3]); //take the last part of IP and convert to integer
    let upperBound = parseInt(ipRange[1].split('.')[3]); //take the last part of IP and convert to integer

    var allocatedIPs = [];

    for (var i = lowerBound; i < upperBound; i++) {
        var ipFound = false;
        var checkIP = (ipRange[0].split('.')[0] + '.' + ipRange[0].split('.')[1] + '.' + ipRange[0].split('.')[2] + '.' + i.toString());
        currentNetwork.ip_pool.forEach(ip => {
            if (ip.ipaddress === checkIP) {
                ipFound = true;
            }
        });

        if (!ipFound) {
            allocatedIPs.push(checkIP);
        }
    }
    return allocatedIPs;
}

module.exports = allocateIP;