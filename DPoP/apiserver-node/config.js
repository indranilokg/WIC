const path = require('path');
const dotenv = require('dotenv');
const fs = require('fs');

// Read environment variables from "testenv". Override environment vars if they are already set. https://www.npmjs.com/package/dotenv
const TESTENV = path.resolve(__dirname, 'testenv');
if (fs.existsSync(TESTENV)) {
  const envConfig = dotenv.parse(fs.readFileSync(TESTENV));
  Object.keys(envConfig).forEach((k) => {
    process.env[k] = envConfig[k];
  });
}

var ISSUER = process.env.ISSUER || 'https://{yourOktaDomain}.com/oauth2/default';
var CLIENT_ID = process.env.CLIENT_ID || '{clientId}';
var CLIENT_SECRET = process.env.CLIENT_SECRET || '{clientSecret}';
var SPA_CLIENT_ID = process.env.SPA_CLIENT_ID || '{spaClientId}';
var DPOP_CLIENT_ID = process.env.DPOP_CLIENT_ID || '{dPoPClientId}';
var OKTA_TESTING_DISABLEHTTPSCHECK = process.env.OKTA_TESTING_DISABLEHTTPSCHECK ? true : false;

module.exports = {
  webServer: {
    port: 8080,
    oidc: {
      clientId: CLIENT_ID,
      clientSecret: CLIENT_SECRET,
      issuer: ISSUER,
      appBaseUrl: 'http://localhost:8080',
      scope: 'openid profile email',
      testing: {
        disableHttpsCheck: OKTA_TESTING_DISABLEHTTPSCHECK
      },
    },
  },
  resourceServer: {
    port: 8000,
    oidc: {
      clientId: SPA_CLIENT_ID,
      issuer: ISSUER,
      testing: {
        disableHttpsCheck: OKTA_TESTING_DISABLEHTTPSCHECK
      },
    },
    oidcdpop: {
      clientId: DPOP_CLIENT_ID,
      issuer: ISSUER,
      pkce: true,
      testing: {
        disableHttpsCheck: OKTA_TESTING_DISABLEHTTPSCHECK
      },
    },
    assertClaims: {
      aud: 'api://default',
      cid: SPA_CLIENT_ID
    },
    assertClaimsDPOP: {
      aud: 'api://default',
      cid: DPOP_CLIENT_ID
    },
    tokenHtu: ISSUER + "/v1/token",
    resourceHtu: 'http://localhost:8000/api/highlyPrivateMessages'
  }
};
