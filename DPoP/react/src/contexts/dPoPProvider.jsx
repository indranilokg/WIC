import { createContext, useContext, useState } from "react"
import { OktaAuth, toRelativeUrl } from '@okta/okta-auth-js';

import config from '../config';

// create toggle context
const DPoPContext = createContext()

// create context provider
export const DPoPProvider = ({ children }) => {
    const [authobj, setAuthobj] = useState(new OktaAuth(config.oidcdpop));
    // the value passed in here will be accessible anywhere in our application 
    // you can pass any value, in our case we pass our state and it's update method 
    return (
        <DPoPContext.Provider value={{authobj, setAuthobj}}>
            {children}
        </DPoPContext.Provider>
    )
}

// useDPoPContext will be used to use and update state accross the app
// we can access to authobj and setAuthobj using this method 
// anywhere in any component that's inside DPoPProvider

export const useDPoPContext = () => useContext(DPoPContext);