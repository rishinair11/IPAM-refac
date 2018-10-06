function assignIP(userNetwork, count){
    var freeIPs = [];
    var IpsToAssign = [];
    userNetwork.ip_pool.forEach(address => {
        if(address.in_use === false){
            freeIPs.push(address.ipaddress);
        }
    });

   if(freeIPs.length > 0){
    if(count <= freeIPs.length && count != 0){
        for(var i = 0 ; i < count; i++){
            IpsToAssign.push(freeIPs[i]);
        }
        return IpsToAssign;
    }
    else {
        return IpsToAssign;
    }
   }
   else  
     return null;
    
}

module.exports = assignIP;  