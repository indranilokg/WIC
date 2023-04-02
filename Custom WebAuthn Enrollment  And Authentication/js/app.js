const express = require('express');
const app = express();
const path = require('path');
const router = express.Router();
const axios = require('axios');

app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');
app.set('views', __dirname);


router.get('/',function(req,res){
  //res.sendFile(path.join(__dirname+'/index.html'));
  res.render('index.html');
});

//add the router
app.use('/', router);
app.listen(process.env.port || 3000);

console.log('Running at Port 3000');

