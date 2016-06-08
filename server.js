var express = require('express');
var validator = require('validator');
var mongo = require('mongodb');
var MongoClient = mongo.MongoClient;
var url = 'mongodb://localhost:27018/url_short';
var app = express();
app.set('port', (process.env.PORT || 5000));
app.use('/new/',function(req,res){
	var new_url = req.path.split('').slice(1).join('');
	if(validator.isURL(new_url))
	{
		console.log("Got a url : "+new_url);
		MongoClient.connect(url,function(err,db){
			if(err)
			{
				console.log(err);
			}
			else
			{
				var urls = db.collection('urls');
				urls.find({orginal_url:new_url},function(err,document){
					if(err)
					console.log(err);
					else if(document.length>0)
					{
						res.json(document.responce);
						console.log(new_url+" is already in database.Using it");
						db.close();
					}
					else
					{
						var new_doc = {};
						new_doc.original_url=new_url;
						new_doc.short_url=new_url;
						new_doc.responce={original_url:new_doc.original_url,short_url:new_doc.short_url};
						urls.insert(new_doc,function(err,data){
							if(err)
							{
								console.log(err);
							}
							else
							{
								console.log(JSON.stringify(data));
							}
							db.close();
						});
						res.json(new_doc.responce);
					}
					
				});
			}
		});
	}
	else
	{
		console.log("Doesn't looks like a URL : "+new_url);
	}
});
app.use('/',function(req,res){
	res.sendFile(__dirname+'/index.html');
});


app.listen(app.get('port'),function(){
	console.log('Node server running on port',app.get('port'));
});
