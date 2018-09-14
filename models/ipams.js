const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const ipamSchema = new Schema({
    network_id: String,
    gateway: String,
    subnet_mask: String,
    dns: String,
    domain: String,
    ip_pool: [{
        hostname: String,
        ipaddress: String,
        owner: String,
        cidr: String
    }]
});

module.exports = mongoose.model('ipams', ipamSchema);