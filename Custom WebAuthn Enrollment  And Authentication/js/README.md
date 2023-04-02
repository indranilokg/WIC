# Custom WebAuthn Enrollment And Authentication

Sample app demonstrating OIE API based  -

* WebAuthn Enrollment on demand

* Biometrics login


## Configuration

The sample uses 2 applications. One for authentication and the other for on-demand webauthn enrollment

Ensure that -

* `webauthn` autneticator is enabled for the tenant and *enrollment policy* is  set  to **optional**

* The enrollment application has the app sign-on policy configured for **possession factor**

* The authentication app sign-on policy allows either `password` or `webauthn` authenticator for sign-in


## Deploy Sample Application

Install [Node.js](https://nodejs.org/en/download/) on the system

Move to the App directory - `cd js`

Run - `npm install`

Run - `node app.js`

Access the application at - [http://localhost:3000](http://localhost:3000)