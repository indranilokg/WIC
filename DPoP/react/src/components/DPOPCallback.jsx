
import { useOktaAuth } from '@okta/okta-react';
import { OktaAuth, toRelativeUrl } from '@okta/okta-auth-js';
import React, { useState, useEffect } from 'react';

import config from '../config';

import { useDPoPContext } from "../contexts/dPoPProvider"

const DPOPCallback = () => {
  const { authState, oktaAuth } = useOktaAuth();
  const [messages, setMessages] = useState(null);
  const {authobj, setAuthobj} = useDPoPContext();
  const oktaAuthDpop = authobj;

  // fetch messages
  useEffect(() => {
    if (!authState) {
      return;
    }

    
    var dpopheader = null;
    var dpopheaderWithNonce = null;

    const accessToken = oktaAuth.getAccessToken();

    const res = fetch(config.dpopGeneratorUrl, {
      method: 'post',
      headers: { 'Authorization': `Bearer ${accessToken}` },
      body: {
        id: 0,
      },
    })
    .then((response) => response.json())
    .then((responseJson) => {
      dpopheader = responseJson.dpopheader;
      console.log(dpopheader);
      oktaAuthDpop.setHeaders({
        DPoP: dpopheader
      });
      const queryParameters = new URLSearchParams(window.location.search)
      console.log(queryParameters.get("code"));
      const currentParams = oktaAuthDpop.transactionManager.load();
      console.log(currentParams);
      const newParams={codeVerifier: currentParams.codeVerifier, authorizationCode: queryParameters.get("code")};
      console.log(newParams);
      fetch(currentParams.urls.tokenUrl, {
        method: 'post',
          headers: {'Accept':'application/json', 'Content-Type':'application/x-www-form-urlencoded',  'DPoP':dpopheader},
          body: new URLSearchParams({
            client_id: currentParams.clientId,
            redirect_uri: currentParams.redirectUri,
            grant_type: 'authorization_code',
            code_verifier:currentParams.codeVerifier,
            code: queryParameters.get("code")
          })
        })
        .then(res => {
            console.log("Got res");
            console.log(res.headers);
            const nonce = res.headers.get("dpop-nonce");
            console.log(nonce);
            fetch(config.dpopWithNonceGeneratorUrl, {
              method: 'post',
              headers: {'Accept':'application/json', 'Content-Type':'application/json'},
              body: JSON.stringify({
                nonce: nonce,
              }),
            })
            .then((response) => response.json())
            .then((responseJson) => {
               console.log(responseJson);
               dpopheaderWithNonce = responseJson.dpopheader;
               oktaAuthDpop.setHeaders({
                DPoP: dpopheaderWithNonce
              });
               oktaAuthDpop.token.parseFromUrl()
               .then(res => {
                   console.log("Got res");
                   const dpopAccessToken = res.tokens.accessToken.accessToken;
                   const dpopRefreshToken = res.tokens.refreshToken.refreshToken;
                   oktaAuthDpop.tokenManager.add('dpopAccessToken', res.tokens.accessToken);
                   oktaAuthDpop.tokenManager.add('dpopRefreshToken', res.tokens.refreshToken);
                   console.log(dpopAccessToken);
                   console.log(dpopRefreshToken);
                   console.log(oktaAuthDpop);
                   window.location.href = oktaAuthDpop.getOriginalUri() + "?dpop=done";
               }).catch(e => {
                   console.log("ErrOr");
                   console.log(e);
               });
            })
            .catch((error) => {
              console.error(error);
            });
        }).catch(e => {
            console.log("ErrOr");
            console.log(e);
        });
    })
    .catch((error) => {
      console.error(error);
    });
  }, [authState, oktaAuth]);
};

export default DPOPCallback;
