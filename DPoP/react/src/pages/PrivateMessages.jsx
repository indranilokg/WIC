
import { useOktaAuth } from '@okta/okta-react';
import { OktaAuth, toRelativeUrl } from '@okta/okta-auth-js';
import React, { useState, useEffect } from 'react';
import { Header, Icon, Message, Table } from 'semantic-ui-react';

import config from '../config';
import { useDPoPContext } from "../contexts/dPoPProvider"


const PrivateMessages = () => {
  const { authState, oktaAuth } = useOktaAuth();
  const [messages, setMessages] = useState(null);
  const {authobj, setAuthobj} = useDPoPContext();
  const [messageFetchFailed, setMessageFetchFailed] = useState(false);

  var dpopAccessToken = null;
  var dpopRefreshToken = null;

  // fetch messages
  useEffect(() => {
    if (!authState) {
      return;
    }

    console.log(authobj);

    const oktaAuthDpop = authobj;

    const queryParameters = new URLSearchParams(window.location.search)
    console.log(queryParameters.get("dpop"));

    if (queryParameters.get("dpop") === "done"){
      oktaAuthDpop.tokenManager.get("dpopAccessToken")
      .then((token) => {
        dpopAccessToken = token.accessToken;
        console.log(dpopAccessToken);

        fetch(config.dpopForResourceUrl, {
          method: 'post',
          headers: {'Accept':'application/json', 'Content-Type':'application/json'}
        })
        .then((response) => response.json())
        .then((responseJson) => {
          fetch(config.resourceServer.privateMessageUrl, {
            headers: {
              Authorization: `DPoP ${dpopAccessToken}`,
              DPoP: `${responseJson.dpopheader}`,
            },
          })
            .then((response) => {
              if (!response.ok) {
                return Promise.reject();
              }
              return response.json();
            })
            .then((data) => {
              let index = 0;
              const formattedMessages = data.messages.map((message) => {
                const date = new Date(message.date);
                const day = date.toLocaleDateString();
                const time = date.toLocaleTimeString();
                index += 1;
                return {
                  date: `${day} ${time}`,
                  text: message.text,
                  id: `message-${index}`,
                };
              });
              setMessages(formattedMessages);
              setMessageFetchFailed(false);
            })
            .catch((err) => {
              setMessageFetchFailed(true);
              /* eslint-disable no-console */
              console.error(err);
            });             
        })
        .catch((error) => {
          console.error(error);
        });
      });
      oktaAuthDpop.tokenManager.get("dpopRefreshToken")
      .then((token) => {
        dpopRefreshToken = token.refreshToken;
        console.log(dpopRefreshToken);
      });
    }else{
      const originalUri = toRelativeUrl(window.location.href, window.location.origin);
      oktaAuthDpop.setOriginalUri(originalUri);
      oktaAuthDpop.signInWithRedirect();
    }
  }, [authState, oktaAuth]);

  const possibleErrors = [
    'Your DPoP header is invalid.',
    'Your resource server example is using the same Okta authorization server (issuer) that you have configured this React application to use.',
  ];

  return (
    <div>
      <Header as="h1">
        <Icon name="mail outline" />
        My Highly Private Messages
      </Header>
      {messageFetchFailed && <Message error header="Failed to fetch messages.  Please verify the following:" list={possibleErrors} />}
      {!messages && !messageFetchFailed && (
        <div>Sender Constrained Token demonstration</div>
      )}

      {messages
      && (
      <div>
        <p>
          Sender Constrained Token demonstration
        </p>
        <Table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Message</th>
            </tr>
          </thead>
          <tbody>
            {messages.map((message) => (
              <tr id={message.id} key={message.id}>
                <td>{message.date}</td>
                <td>{message.text}</td>
              </tr>
            ))}
          </tbody>
        </Table>
        <div>
          <p>Refresh  Token: {authState.refreshToken.refreshToken}</p>
        </div>
      </div>
      )}
    </div>
  );
};

export default PrivateMessages;
