"use strict";

const seneca = require("seneca")();
const Promise = require("bluebird");
const config = require("./config.js");
const dns = require("dns");
const os = require("os");
const instanaNodeJSSensor = require("instana-nodejs-sensor");

if (process.env.NODE_ENV === "production") {
  instanaNodeJSSensor();
}

function dnsSeed(seneca, options, bases, next) {
  dns.lookup(
    config.baseName,
    {
      all: 4
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
require("./lib/index.js")(seneca, config);

const initialSenecaConfig = {
  auto: true,
  listen: [
    <%- pin %>
  ],
  discover: {
    custom: {
      active: true,
      find: dnsSeed
    }
  }
};

const senecaConfig = process.env.rancher
  ? {
    ...config.seneca,
    ...initialSenecaConfig,
    host: os.networkInterfaces().eth0[0].address
  }
  : {
    ...config.seneca,
    ...initialSenecaConfig
  };

seneca.use("mesh", senecaConfig);
