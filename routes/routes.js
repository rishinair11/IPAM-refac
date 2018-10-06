const express = require('express');
const router = express.Router();

const users = require('../models/users');
const ipams = require('../models/ipams');

const allocateIP = require('../utils/allocateIP');
const assignIP = require('../utils/assignIP');

const MAX_IPS = 10;

// GET APIs
router.get('/getUser', (req, res, next) => {
    users.findOne({
        owner: req.query.username
    }, (err, result) => {
        if (err) res.json({
            error: err
        });
        else if (!result) res.json({
            error: "User not found"
        });
        else {
            res.json(result);
        }
    });
});

router.get('/getNetworks', (req, res, next) => {
    ipams.find({}, (err, result) => {
        if (err) res.json({
            error: err
        });
        else if (!result)
            res.json({
                error: "No networks available"
            });
        else {
            res.json(result);
        }
    });
});

router.get('/getNetwork', (req, res, next) => {
    ipams.find({
        network_id: req.query.network_id
    }, (err, result) => {
        if (err) res.json({
            error: err
        });
        else if (!result)
            res.json({
                error: "Network not found"
            });
        else {
            res.json(result);
        }
    });
});


//POST APIs

//adding new user
router.post('/register', (req, res, next) => {
    let newUser = new users({
        owner: req.body.username,
        admin: true,
        networks: []
    });

    newUser.save((err, result) => {
        if (err) res.json({
            error: err
        });
        else {
            res.json(result);
        }
    });
});

//adding new network
router.post('/addNetwork', (req, res, next) => {
    let newNetwork = new ipams({
        network_id: req.body.network_id,
        subnet_mask: req.body.subnet_mask,
        cidr: req.body.cidr,
        ip_pool: []
    });

    newNetwork.save((err, result) => {
        if (err) res.json({
            error: err
        });
        else {
            res.json(result);
        }
    });

});



router.post('/allocate', (req, res, next) => {
    var currentUser;

    users.findOne({
        owner: req.body.username,
    }, (err, result) => {
        if (err) res.json({
            error: err
        });
        else {
            //if user exists, store his data
            currentUser = result;

            if (!result) {
                var pushNetwork = {
                    network_id: req.body.network_id,
                    subnet_mask: req.body.subnet_mask,
                    cidr: req.body.cidr,
                    ip_pool: []
                }
                // null check for user, create new user if new user. also add new network details while you're at it
                let newUser = new users({
                    owner: req.body.username,
                    admin: true,
                    networks: [pushNetwork]
                });

                newUser.save((err, result) => {
                    if (err) res.json({
                        error: err
                    });
                    else {
                        console.log(result);
                    }
                });
                console.log('No user found , creating new user');
                currentUser = newUser;
            }



            //if network is not present in users schema, then create new network with empty ip_pool
            var networkExists = false;
            for (network of currentUser.networks) {
                if (network.network_id == req.body.network_id) {
                    networkExists = true;
                    break;
                }
            }
            //this is for existing user but new network
            if (!networkExists) {
                var pushNetwork = {
                    network_id: req.body.network_id,
                    subnet_mask: req.body.subnet_mask,
                    ip_pool: []
                }
                users.updateOne({
                    owner: currentUser.owner
                }, {
                    $push: {
                        networks: pushNetwork
                    }
                }, (err, result) => {
                    console.log('New network created as network not found in users');
                });
            }

            var currentNetwork;

            ipams.findOne({
                network_id: req.body.network_id
            }, (err, result) => {
                currentNetwork = result;

                var IpsToAllocate = allocateIP(currentNetwork, req.body.ipRange);

                var ipamIpObj = {
                    ipaddress: "",
                    owner: currentUser.owner,
                    gateway: "",
                    in_use: false,
                    pingable: true,
                    hostname: "rochester"
                }

                var userIpObj = {
                    ipaddress: "",
                    gateway: "",
                    cidr: req.body.cidr,
                    in_use: false,
                    hostname: "rochester",
                    pingable: true
                }

                IpsToAllocate.forEach(IpToAllocate => {
                    ipamIpObj.ipaddress = userIpObj.ipaddress = IpToAllocate;

                    ipams.updateOne({
                        network_id: currentNetwork.network_id
                    }, {
                        $push: {
                            ip_pool: ipamIpObj
                        }
                    }, (err, result) => {
                        if (err) {
                            res.json({
                                error: "Network not found"
                            });
                        } else {

                        }
                    });

                    users.updateOne({
                        owner: currentUser.owner,
                        'networks.network_id': currentNetwork.network_id
                    }, {
                        $push: {
                            'networks.$.ip_pool': userIpObj
                        }
                    }, (err, result) => {
                        if (err) {
                            res.json({
                                error: "User not found"
                            });
                        } else {
                            console.log(result);
                            console.log(IpToAllocate + '=>' + currentUser.owner);
                        }
                    });
                });
                if (IpsToAllocate) {
                    res.json({
                        success: IpsToAllocate
                    });
                }
                else {
                    res.json({
                        error: IpsToAllocate
                    });
                }
                
            });
        }
    });

});

router.post('/assign', (req, res, next) => {
    users.findOne({
        owner: req.body.username
    }, (err, result) => {
        var currentUser = result;
        var currentUserNetwork = undefined;
        var assignIps = [];
        var insufficientIP = '';
        var emptyPool = '';
        //will get the network to be worked on currently
        for (network of currentUser.networks) {
            if (network.network_id === req.body.network_id)
                currentUserNetwork = network;
        }
        var IpToAssign = [];
        IpToAssign = assignIP(currentUserNetwork, req.body.count);
        if (IpToAssign) {
            if (IpToAssign.length > 0) {
                //will populate the assignIps array and edit the Network object of user
                for (requestedIp of IpToAssign) {
                    for (pool of currentUserNetwork.ip_pool) {
                        if (requestedIp === pool.ipaddress) {
                            assignIps.push(requestedIp);
                            pool.in_use = true;
                        }
                    }
                }
                ipams.findOne({
                    network_id: req.body.network_id
                }, (err, result) => {
                    assignIps.forEach(ip => {
                        //update the IPAMS collection
                        ipams.updateOne({
                            'ip_pool.ipaddress': ip
                        }, {
                            $set: {
                                'ip_pool.$.in_use': true
                            }
                        }, (err, result) => {
                            if (err) res.json({
                                error: err
                            });
                            else if (!result) res.json({
                                error: 'No such IP found'
                            });
                            else {
                                console.log('ipams collection updated -> ' + result);
                            }
                        });
                    });
                });
                //pull old network
                users.updateOne({
                    owner: currentUser.owner
                }, {
                    $pull: {
                        networks: {
                            network_id: currentUserNetwork.network_id
                        }
                    }
                }, (err, result) => {
                    if (err) res.json({
                        error: err
                    });
                    else if (!result) res.json({
                        error: 'No such user found'
                    });
                    else {
                        //push new network
                        users.updateOne({
                            owner: currentUser.owner
                        }, {
                            $push: {
                                networks: currentUserNetwork
                            }
                        }, (err, result) => {
                            if (err) res.json({
                                error: err
                            });
                            else if (!result) res.json({
                                error: 'No such user found'
                            });
                            else {
                                console.log('users collection updated')
                            }
                        });
                    }
                });
            } else {
                insufficientIP = 'Requested no of IPs are more than existing free ips in pool'
                //console.log('Requested no of IPS are more than existing free ips in pool');
            }
        } else {
            emptyPool = 'No free ips in your pool'
            //console.log('There are no free ips in  your current pool');
        }
        if (IpToAssign) {
            if (IpToAssign.length > 0) {
                res.json({
                    success: IpToAssign
                });
            } else {
                res.json({
                    error: insufficientIP
                })
            }
        } else {
            res.json({
                error: emptyPool
            });
        }
    });
});
//write the logic of checking whether already ips are deassigned or not.
router.post('/deassign', (req, res, next) => {
    users.findOne({
        owner: req.body.username
    }, (err, result) => {
        var currentUser = result;
        var currentNetwork = undefined;
        var deassignIps = [];
        var noIPrange = '';
        var emptyIPrange = '';

        //will get the network to be worked on currently
        for (network of currentUser.networks) {
            if (network.network_id === req.body.network_id)
                currentNetwork = network;
        }
        var IpToDeassign = req.body.deassignIp;
        var invalidIP = undefined;
        if (IpToDeassign) {
            if (IpToDeassign.length > 0) {
                //will populate the deassignIps array and edit the new Network object of User
                for (requestedIp of IpToDeassign) {
                    for (pool of currentNetwork.ip_pool) {
                        if (requestedIp === pool.ipaddress) {
                            deassignIps.push(requestedIp);
                            pool.in_use = false;
                        }
                    }
                }

                if (deassignIps.length > 0 && deassignIps.length === IpToDeassign.length) {
                    invalidIP = false
                } else {
                    invalidIP = "IP range provided does not belong to users pool"
                }
                if (!invalidIP) {
                    ipams.findOne({
                        network_id: req.body.network_id
                    }, (err, result) => {
                        deassignIps.forEach(ip => {
                            //update the IPAMS collection
                            ipams.updateOne({
                                'ip_pool.ipaddress': ip
                            }, {
                                $set: {
                                    'ip_pool.$.in_use': false
                                }
                            }, (err, result) => {
                                console.log("ipam" + result)
                                if (err) res.json({
                                    error: err
                                });
                                else if (!result) res.json({
                                    error: 'No such IP found'
                                });
                                else {
                                    console.log('ipams collection updated -> ' + result);
                                }
                            });

                        });
                    });

                    //pull old network
                    users.updateOne({
                        owner: currentUser.owner
                    }, {
                        $pull: {
                            networks: {
                                network_id: currentNetwork.network_id
                            }
                        }
                    }, (err, result) => {
                        if (err) res.json({
                            error: err
                        });
                        else if (!result) res.json({
                            error: 'No such user found'
                        });
                        else {
                            //push new network
                            users.updateOne({
                                owner: currentUser.owner
                            }, {
                                $push: {
                                    networks: currentNetwork
                                }
                            }, (err, result) => {
                                if (err) res.json({
                                    error: err
                                });
                                else if (!result) res.json({
                                    error: 'No such user found'
                                });
                                else {
                                    console.log('Users collection updated successfully');
                                }
                            });
                        }
                    });
                }
            } else {
                emptyIPrange = 'IP range cannot be empty for deassignment';
                //console.log('IP range cannot be empty.');
            }
        } else {
            noIPrange = 'Please provide IP range for deassignment'
            //console.log('Please provide IP range for deassignment');
        }

        if (!invalidIP) {
            if (IpToDeassign) {
                if(IpToDeassign.length > 0){
                res.json({
                    success: 'IPs are successfully deassigned' +IpToDeassign
                });
                }
                else{
                    res.json({
                        error: emptyIPrange
                    });
                }
            } else {
                res.json({
                    error: noIPrange
                });
            }
        } else {
            res.json({
                error: invalidIP
            });
        }

    });
});


//TODO handle server crash when user deallocates IPs not in his pool
router.post('/deallocate', (req, res, next) => {
    req.body.arrayIP.forEach(ip => {
        users.findOne({
            owner: req.body.username
        }, async (err, result) => {
            if (err) res.json({
                error: err
            });
            else if (!result) res.json({
                error: "Invalid User"
            });
            else {
                var currentUser = result;
                await ipams.updateOne({
                    network_id: req.body.network_id
                }, {
                    $pull: {
                        ip_pool: {
                            ipaddress: ip,
                            owner: currentUser.owner
                        }
                    }
                }, (err, result) => {
                    console.log('ipams' + result.nModified);
                });

                await users.updateOne({
                    owner: currentUser.owner
                }, {
                    $pull: {
                        'networks.$[].ip_pool': {
                            ipaddress: ip
                        }
                    }
                }, (err, result) => {
                    console.log('users' + result.nModified);
                });
            }
        });
    });

});

module.exports = router;

//TODO ping
//TODO ns-lookup