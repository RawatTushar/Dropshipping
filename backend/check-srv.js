const dns = require("dns");

const setupDNS = () => {
  dns.setServers(["1.1.1.1", "8.8.8.8"]); // Cloudflare + Google
};

module.exports = setupDNS;