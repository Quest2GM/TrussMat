/*============================================================================*/
/*============================<<< server.js >>>===============================*/
/*============================================================================*/

const express		= require('express');
const MongoClient	= require('mongodb').MongoClient;
const bodyParser	= require('body-parser');

const app			= express();
const port			= 9000;

// Trash Maybe???????
//var reader = require('./public/routes/fileRead')


// Parse URL encoded forms ie. curl HTTP requests
app.use(bodyParser.json());								//support JSON-encoded bodies
app.use(bodyParser.urlencoded({ extended: true }));		//support URL-encoded bodies
// require('./app/routes')(app, {});	// Needs to come after body-parser!!


// Serve static assets from public folder
app.use(express.static('public'));				
app.use(express.static('public/assets'));
app.use(express.static(__dirname+'/'));

/*============================================================================*/
/*=======================<<< PORT Listen >>>==================================*/    
/*============================================================================*/
  
app.listen(port, () => {
    console.log('Listening on Port: ' + port);
});               