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