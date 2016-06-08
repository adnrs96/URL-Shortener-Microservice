var express = require('express');
var validator = require('validator');
var mongo = require('mongodb');
var MongoClient = mongo.MongoClient;
var url = 'mongodb://localhost:27017/url_short';
var app = express();
app.set('port', (process.env.PORT || 5000));
app.use('/new/',function(req,res){
	var new_url = req.path.split('').slice(1).join('');
	if(validator.isURL(new_url))
	{
		console.log("Got a url : "+new_url);
	}
	else
	{
		console.log("Doesn't looks like a URL : "+new_url);
	}
	res.end(new_url);
});
app.use('/',function(req,res){
	res.sendFile(__dirname+'/index.html');
});


app.listen(app.get('port'),function(){
	console.log('Node server running on port',app.get('port'));
});
/*
MongoClient.connect(url,function(err,db){
	if(err)
	{
		console.log(err);
	}
	else
	{
		
	}
});*/