const express = require('express');
const app = express();
const path = require('path');
const router = express.Router();
const request = require('request');

app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');
app.set('views', __dirname);

app.use(express.urlencoded());

app.use(express.json());


router.get('/',function(req,res){
  //res.sendFile(path.join(__dirname+'/index.html'));
  res.render('index.html');
});

router.post('/enrollWebAuthn',function(req,res){
  console.log("here");
  var options = {
    'method': 'POST',
    'url': 'https://******.oktapreview.com//api/v1/users/******/factors',
    'headers': {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'Authorization': 'SSWS ******'
    },
    body: JSON.stringify({
      "factorType": "webauthn",
      "provider": "FIDO"
    })
  };

  request(options, function (error, response) {
    if (error) throw new Error(error);
    console.log(response.body);
    res.send(response.body);
  });
});

router.post('/activateWebAuthn',function(req,res){
  console.log(req.body);
  const clientData = req.body.clientData;
  const attestation  = req.body.attestation;
  const activationLink  = req.body.activationLink;
  console.log(clientData);
  console.log(attestation);
  console.log(activationLink);
  

  var options = {
    'method': 'POST',
    'url': activationLink,
    'headers': {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'Authorization': 'SSWS ******'
    },
    body: JSON.stringify({
      "attestation": attestation,
      "clientData": clientData
    })
  };

  request(options, function (error, response) {
    if (error) throw new Error(error);
    console.log(response.body);
    res.send(response.body);
  });
  
});

//add the router
app.use('/', router);
app.listen(process.env.port || 3000);

console.log('Running at Port 3000');

