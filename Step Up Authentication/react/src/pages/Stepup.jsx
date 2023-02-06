/*
 * Copyright (c) 2021-Present, Okta, Inc. and/or its affiliates. All rights reserved.
 * The Okta software accompanied by this notice is provided pursuant to the Apache License, Version 2.0 (the "License.")
 *
 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0.
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *
 * See the License for the specific language governing permissions and limitations under the License.
 */

import React, { useState, useEffect } from 'react';
import { useOktaAuth } from '@okta/okta-react';
import { Header, Icon, Table } from 'semantic-ui-react';

const Stepup = () => {
  const { authState, oktaAuth } = useOktaAuth();
  const [userInfo, setUserInfo] = useState(null);
  const [idToken, setIdToken] = useState(null);
  const [accessToken, setAccessToken] = useState(null);

  useEffect(() => {
  
    if (!authState || !authState.isAuthenticated) {
      // When user isn't authenticated, forget any user info
      setUserInfo(null);
      setIdToken(null);
      setAccessToken(null);
    } else {
      setUserInfo(authState.idToken.claims);
      setIdToken(authState.idToken.idToken);
      setAccessToken(authState.accessToken.accessToken);
    }
  }, [authState, oktaAuth]); // Update if authState changes
    

  if (!userInfo) {
    return (
      <div>
        <p>Fetching user profile...</p>
      </div>
    );
  }
  
  return (
    <div>
      <div>
        <Header as="h1">
          <Icon name="drivers license" />
          {' '}
          My User Profile after step-up
          {' '}
        </Header>
        <p>
          <b>This page is sensitive and protected by elevated authentication.</b>
        </p>
        <p>
          Below is the information from your ID token claims.
        </p>
        <Table>
          <thead>
            <tr>
              <th>Claim</th>
              <th>Value</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(userInfo).map((claimEntry) => {
              const claimName = claimEntry[0];
              const claimValue = claimEntry[1];
              const claimId = `claim-${claimName}`;
              return (
                <tr key={claimName}>
                  <td>{claimName}</td>
                  <td id={claimId}>{claimValue.toString()}</td>
                </tr>
              );
            })}
          </tbody>
        </Table>
      </div>
    </div>
  );
};

export default Stepup;
