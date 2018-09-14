const Netmask = require('netmask').Netmask;

function allocateIP(currentNetwork, cidr, count) { 
    const block = new Netmask(currentNetwork.network_id + '/' + cidr);
    var netmaskArray = [];
    var currentNetworkPool = [];

    var allocatedIPs = [];

    //existing ips in current network
    currentNetwork.ip_pool.forEach(obj => {
        currentNetworkPool.push(obj.ipaddress);
    });
    //all ips in the range 
    block.forEach(ip => {
        netmaskArray.push(ip);
    });

    for (ip of netmaskArray) {
        if (!currentNetworkPool.includes(ip)) {
            if (allocatedIPs.length < count)
                allocatedIPs.push(ip);
            else
                break;
        }
    }
    
    return allocatedIPs;   
}

module.exports = allocateIP;