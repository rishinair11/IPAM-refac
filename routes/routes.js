const express = require('express');
const router = express.Router();

const users = require('../models/users');
const ipams = require('../models/ipams');

const allocateIP = require('../utils/allocateIP');

//////////////////GET APIs////////////////////////////
router.get('/getUser', (req, res, next) => {
    users.findOne({
        owner: req.query.username
    }, (err, result) => {
        if (err) throw err;
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
        if (err) throw err;
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
        if (err) throw err;
        else if (!result)
            res.json({
                error: "Network not found"
            });
        else {
            res.json(result);
        }
    });
});


//////////////////POST APIs////////////////////////////

router.post('/register', (req, res, next) => {
    let newUser = new users({
        owner: req.body.username,
        pool: []
    });

    newUser.save((err, result) => {
        if (err) throw err;
        else {
            res.json(result);
        }
    });
});

router.post('/addNetwork', (req, res, next) => {
    let newNetwork = new ipams({
        network_id: req.body.network_id,
        gateway: req.body.gateway,
        subnet_mask: req.body.subnet_mask,
        dns: req.body.dns,
        domain: req.body.domain,
        cidr: req.body.cidr
    });

    newNetwork.save((err, result) => {
        if (err) throw err;
        else {
            res.json(result);
        }
    });
});

router.post('/allocate', (req, res, next) => {
    var currentUser;

    users.findOne({
        owner: req.body.username
    }, (err, result) => {
        if (err) throw err;
        else if (!result) {
            res.json({
                error: "User not found"
            });
        } else {

            currentUser = result;

            var currentNetwork;

            ipams.findOne({
                network_id: req.body.network_id
            }, (err, result) => {
                if (err) throw err;
                else if (!result) res.json({
                    error: "Network not found"
                });
                else {
                    currentNetwork = result;
                    var availableIPs = allocateIP(currentNetwork, req.body.cidr, req.body.count);
                    var newIP = {
                        hostname: currentNetwork.hostname,
                        ipaddress: "",
                        owner: currentUser.owner,
                        cidr: req.body.cidr
                    }
                    var newUserIP = {
                        ipaddress: "",
                        network_id: currentNetwork.network_id,
                        subnet_mask: currentNetwork.subnet_mask,
                        gateway: currentNetwork.gateway,
                        dns: currentNetwork.dns,
                        domain: currentNetwork.domain,
                        cidr: req.body.cidr
                    }

                    availableIPs.forEach(ip => {
                        newIP.ipaddress = newUserIP.ipaddress = ip;

                        ipams.updateOne({
                            network_id: currentNetwork.network_id
                        }, {
                            $push: {
                                ip_pool: newIP
                            }
                        }, (err, result) => {
                            if (err) throw err;
                            else {
                                console.log(currentUser.owner + ' ' + ip + 'ipams');
                            }
                        });

                        users.updateOne({
                            owner: currentUser.owner
                        }, {
                            $push: {
                                pool: newUserIP
                            }
                        }, (err, result) => {
                            if (err) throw err;
                            else {
                                console.log(currentUser.owner + ' ' + ip + 'users');
                            }
                        });
                    });
                }
            });
        }
    });

});

router.post('/free', (req, res, next) => {
    var currentUser;
    users.findOne({
        owner: req.body.username
    }, (err, result) => {
        if (err) throw err;
        else if (!result) res.json({
            error: "User not found"
        });
        else {
            currentUser = result;
            users.updateOne({
                owner: currentUser.owner
            }, {
                $set: {
                    pool: []
                }
            }, (err, result) => {
                if (err) throw err;
                else {
                    ipams.update({
                        network_id: req.body.network_id
                    }, {
                        $pull: {
                            ip_pool: {
                                owner: currentUser.owner
                            }
                        }
                    }, (err, result) => {
                        if (err) throw err;
                        else if (!result) res.json({
                            error: "Network not found"
                        });
                        else {
                            res.json({
                                success: "User de-allocated from network",
                                owner: currentUser.owner,
                                network: req.body.network_id
                            });
                        }
                    });
                }
            });



        }
    });
});

module.exports = router;