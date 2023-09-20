const CLIENT_ID = process.env.CLIENT_ID || '{clientId}';
const ISSUER = process.env.ISSUER || 'https://{yourOktaDomain}/oauth2/default';
const OKTA_TESTING_DISABLEHTTPSCHECK = process.env.OKTA_TESTING_DISABLEHTTPSCHECK || false;
const DPOP_CLEINT_ID = process.env.DPOP_CLEINT_ID || '{dPoPClientId}';
const REDIRECT_URI = `${window.location.origin}/login/callback`;
const REDIRECT_URI_DPOP = `${window.location.origin}/login/dpop`;


// eslint-disable-next-line
export default {
  oidc: {
    clientId: CLIENT_ID,
    issuer: ISSUER,
    redirectUri: REDIRECT_URI,
    scopes: ['openid', 'profile', 'email'],
    pkce: true,
    disableHttpsCheck: OKTA_TESTING_DISABLEHTTPSCHECK,
  },
  oidcdpop: {
    clientId: DPOP_CLEINT_ID, 
    issuer: ISSUER,
    redirectUri: REDIRECT_URI_DPOP,
    scopes: ['openid', 'profile', 'email', 'offline_access'],
    pkce: true,
    disableHttpsCheck: OKTA_TESTING_DISABLEHTTPSCHECK
  },
  resourceServer: {
    messagesUrl: 'http://localhost:8000/api/messages',
    privateMessageUrl: 'http://localhost:8000/api/highlyPrivateMessages'
  },
  dpopGeneratorUrl: 'http://localhost:8000/getDPOPHeader',
  dpopWithNonceGeneratorUrl: 'http://localhost:8000/getDPOPHeaderWithNonce',
  dpopForResourceUrl: 'http://localhost:8000/getDPOPHeaderForResource',
};
