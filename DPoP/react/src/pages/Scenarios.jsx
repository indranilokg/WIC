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

import React, { useEffect } from 'react';
import { Header, Icon, Table } from 'semantic-ui-react';

const Scenarios = () => {

  return (
    <div>
      <div>
        <Header as="h1">
          <Icon name="tasks" />
          Scenarios
        </Header>
        <Header as="h3">
            API Access Management
        </Header>
        <ul>
          <li><a href="/messages">My messages</a></li>
          <li><a href="/privateMessages">My highly private messages (DPoP)</a></li>
        </ul>
      </div>
    </div>
  );
};

export default Scenarios;
