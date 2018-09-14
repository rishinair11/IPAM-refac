const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const userSchema = new Schema({
    owner: String,
    pool: [{
        ipaddress: String,
        network_id: String,
        subnet_mask: String,
        gateway: String,
        dns: String,
        domain: String,
        cidr: String
    }]
});

module.exports = mongoose.model('users', userSchema);