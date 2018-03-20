"use strict";

const instanaNodeJSSensor = require("instana-nodejs-sensor");
if (process.env.instana) {
  instanaNodeJSSensor();
}
const seneca = require("seneca")();
const Promise = require("bluebird");
const config = require("./config.js");
const dns = require("dns");
const os = require("os");
const Services = require('seneca-service-loader')


function dnsSeed(seneca, options, bases, next) {
  dns.lookup(
    config.baseName,
    {
      all: true,
      family: 4
    },
    (err, addresses) => {
      let bases = [];

      if (err) {
        throw new Error("dns lookup for base node failed");
      }

      if (Array.isArray(addresses)) {
        bases = addresses.map(address => {
          return address.address;
        });
      } else {
        bases.push(addresses);
      }

      next(bases);
    }
  );
}

Promise.promisifyAll(seneca);
const services = new Services(seneca); 
services.load();

const initialSenecaConfig = {
  auto: true,
  listen: [
    <%- pin %>
  ],
  discover: {
    rediscover: true,
    custom: {
      active: true,
      find: dnsSeed
    }
  }
};

const senecaConfig = {
  ...config.seneca,
  ...initialSenecaConfig
};

if (process.env.rancher) {
  senecaConfig.host = os.networkInterfaces().eth0[0].address;
}

if (senecaConfig.bases && senecaConfig.bases.indexOf(',')) {
  senecaConfig.bases = senecaConfig.bases.split(',');
}

seneca.use("mesh-ng", senecaConfig);
