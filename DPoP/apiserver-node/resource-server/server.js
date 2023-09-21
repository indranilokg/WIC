/*
 * Copyright (c) 2018, Okta, Inc. and/or its affiliates. All rights reserved.
 * The Okta software accompanied by this notice is provided pursuant to the Apache License, Version 2.0 (the "License.")
 *
 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0.
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *
 * See the License for the specific language governing permissions and limitations under the License.
 */

const express = require('express');
const OktaJwtVerifier = require('@okta/jwt-verifier');
const crypto = require('crypto');
var cors = require('cors');
const jwtDecode = require("jwt-decode");

//dpop libraries
var jose = require('node-jose');
var jwt = require('jsonwebtoken');

var dpopJWK  = null;
var dpopJWKWithNonce  = null;
var dpopKeystore = null;
var publicKey = null;
var privateKeyPEM = null;
var publicKeyPEM = null;


const sampleConfig = require('../config.js');

const oktaJwtVerifier = new OktaJwtVerifier({
  clientId: sampleConfig.resourceServer.oidc.clientId,
  issuer: sampleConfig.resourceServer.oidc.issuer,
  assertClaims: sampleConfig.resourceServer.assertClaims,
  testing: sampleConfig.resourceServer.oidc.testing
});

const oktaJwtVerifierDPOP = new OktaJwtVerifier({
  clientId: sampleConfig.resourceServer.oidcdpop.clientId,
  issuer: sampleConfig.resourceServer.oidcdpop.issuer,
  assertClaims: sampleConfig.resourceServer.assertClaimsDPOP,
  testing: sampleConfig.resourceServer.oidcdpop.testing
});

/**
 * A simple middleware that asserts valid access tokens and sends 401 responses
 * if the token is not present or fails validation.  If the token is valid its
 * contents are attached to req.jwt
 */
function authenticationRequired(req, res, next) {
  const authHeader = req.headers.authorization || '';
  const match = authHeader.match(/Bearer (.+)/);

  if (!match) {
    res.status(401);
    return next('Unauthorized');
  }

  const accessToken = match[1];
  const audience = sampleConfig.resourceServer.assertClaims.aud;
  return oktaJwtVerifier.verifyAccessToken(accessToken, audience)
    .then((jwt) => {
      req.jwt = jwt;
      next();
    })
    .catch((err) => {
      res.status(401).send(err.message);
    });
}

const dpopAuthenticationRequired = async (req, res, next) => {
  const audience = "api://default";
  const dPoPHeaderValue = req.headers.dpop;
  if (!dPoPHeaderValue) {
    return res.status(401).send("Missing DPoP header");
  }
  const jwtHeader = jwtDecode(dPoPHeaderValue, { header: true });
  let jktFromDPoPHeader;
  try {
    // 2. Get the `jwk` (public key) from the header portion of the DPoP JWT.
    const publicKey = await jose.JWK.asKey(
      JSON.stringify(jwtHeader.jwk),
      "json"
    );
    // 3. Verify the signature of the DPoP JWT using the public key and algorithm in the JWT header.
    const verifiedJwt = await jose.JWS.createVerify(publicKey, {
      algorithms: [jwtHeader.alg],
    }).verify(dPoPHeaderValue);
    // 4. Verify the payload.
    const payload = JSON.parse(verifiedJwt.payload.toString());
    if (payload.htm !== req.method) {
      return res.status(400).send("Invalid `htm` claim in DPoP JWT");
    }
    if (payload.htu !== `${req.protocol}://${req.get("host")}${req.url}`) {
      return res.status(400).send("Invalid `htu` claim in DPoP JWT");
    }
    // ADD MORE VALIDATIONS. Check DPoP spec for more details.

    // 5. Calculate the `jkt` (SHA-256 thumbprint of the public key).
    jktFromDPoPHeader = jose.util.base64url.encode(
      await publicKey.thumbprint("SHA-256")
    );
  } catch (err) {
    console.log(err);
    return res.status(401).send(err);
  }

  const authHeader = req.headers.authorization || "";
  const match = authHeader.match(/DPoP (.+)/);
  if (!match) {
    return res.status(401).send("Invalid DPoP authorization");
  }

  try {
    const accessToken = match[1];
    if (!accessToken) {
      return res.status(401, "Not authorized").send();
    }
    // 7. Verify the access token with Okta and extract the claims. (Note: You can also use the /introspect` endpoint call.)
    const accessTokenResponse = await oktaJwtVerifierDPOP.verifyAccessToken(
      accessToken,
      audience
    );
    // 8. Validate the token binding by comparing the `jkt` from the access token with the `jkt` from the DPoP JWT header calculated in step 5.
    if (jktFromDPoPHeader === accessTokenResponse.claims.cnf.jkt) {
      next();
    } else {
      return res.status(401).send("Invalid DPoP key binding");
    }
  } catch (err) {
    console.log(err.message);
    return res.status(401).send(err.message);
  }

}

const app = express();

/**
 * For local testing only!  Enables CORS for all domains
 */
app.use(cors());
app.use(require('body-parser').json());

app.get('/', (req, res) => {
  res.json({
    message: 'Hello!  There\'s not much to see here :) Please grab one of our front-end samples for use with this sample resource server'
  });
});

/**
 * An example route that requires a valid access token for authentication, it
 * will echo the contents of the access token if the middleware successfully
 * validated the token.
 */
app.get('/secure', authenticationRequired, (req, res) => {
  res.json(req.jwt);
});

/**
 * Another example route that requires a valid access token for authentication, and
 * print some messages for the user if they are authenticated
 */
app.get('/api/messages', authenticationRequired, (req, res) => {
  //console.log(req.jwt)
  res.json({
    messages: [
      {
        date:  new Date(),
        text: req.jwt.claims.greetings
      },
      {
        date:  new Date(),
        text: 'I am a robot.'
      },
      {
        date:  new Date(new Date().getTime() - 1000 * 60 * 60),
        text: 'Hello, world!'
      }
    ]
  });
});

app.get('/api/highlyPrivateMessages', dpopAuthenticationRequired, (req, res) => {
  //console.log(req.jwt)
  res.json({
    messages: [
      {
        date:  new Date(),
        text: 'This message is highly private.'
      },
      {
        date:  new Date(new Date().getTime() - 1000 * 60 * 60),
        text: 'Tokens get leaked. DPoP is there to protect!'
      }
    ]
  });
});

//app.post('/getDPOPHeader', authenticationRequired, (req, res) => {
app.post('/getDPOPHeader', (req, res) => {
  dpopKeystore = jose.JWK.createKeyStore();
  dpopKeystore.generate('RSA', 2048, {alg: 'RS256', use: 'sig' })
  .then(result => {
    console.log("---DPoP Key Store---");
    console.log(dpopKeystore.toJSON(true));
    publicKey  = result.toJSON();
    privateKeyPEM  = result.toPEM(true);
    publicKeyPEM  = result.toPEM(false);
    console.log("---DPoP Private Key---");
    console.log(privateKeyPEM);
    console.log("---DPoP Public Key---");
    console.log(publicKeyPEM);

    var claims = {
      htm: "POST",
  	  htu: sampleConfig.resourceServer.tokenHtu,
    }

     dpopJWK= jwt.sign(claims,privateKeyPEM,
                { 
                  algorithm: 'RS256',
                  header:
                    {
                      typ: 'dpop+jwt',
                      jwk: publicKey
                    }
                }
              );
     console.log("---DPoP Proof - No Nonce ---");
     console.log(dpopJWK);
     res.json({
      dpopheader: dpopJWK
    });
  })
});

app.post('/getDPOPHeaderWithNonce', (req, res) => {
    var claims = {
      htm: "POST",
  	  htu: sampleConfig.resourceServer.tokenHtu,
      nonce: req.body.nonce,
      jti: crypto.randomBytes(20).toString('hex')
    }
    console.log("--- Nonce ----");
     console.log(req.body.nonce);
     dpopJWKWithNonce= jwt.sign(claims,privateKeyPEM,
                { 
                  algorithm: 'RS256',
                  header:
                    {
                      typ: 'dpop+jwt',
                      jwk: publicKey
                    }
                }
              );
     console.log("---DPoP Proof - With Nonce ---");
     console.log(dpopJWKWithNonce);
     res.json({
      dpopheader: dpopJWKWithNonce
    });
});

app.post('/getDPOPHeaderForResource', (req, res) => {
  var claims = {
    htm: "GET",
    htu: sampleConfig.resourceServer.resourceHtu
  }
   dpopJWKForResource= jwt.sign(claims,privateKeyPEM,
              { 
                algorithm: 'RS256',
                header:
                  {
                    typ: 'dpop+jwt',
                    jwk: publicKey
                  }
              }
            );
   console.log("---DPoP Proof - for Resource ---");
   console.log(dpopJWKForResource);
   res.json({
    dpopheader: dpopJWKForResource
  });
});

app.listen(sampleConfig.resourceServer.port, () => {
  console.log(`Resource Server Ready on port ${sampleConfig.resourceServer.port}`);
});
