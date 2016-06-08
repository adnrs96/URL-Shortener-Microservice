var express = require('express');
var validator = require('validator');
var mongo = require('mongodb');
var MongoClient = mongo.MongoClient;
var url = process.env.MONGOLAB_URI;
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
				var su = db.collection('su');
				urls.find({original_url:new_url}).toArray(function(err,document){
					//console.log(document);
					if(err)
					console.log(err);
					else if(document.length>0)
					{
						res.json(document[0].responce);
						console.log(new_url+" is already in database.Using it");
						db.close();
					}
					else
					{
						var new_doc = {};
						new_doc.original_url=new_url;
						su.find({}).toArray(function(err,document){
							if(err)
							console.log(err);
							else
							{
								console.log(document[0]);
								if(document[0]==undefined)
								{
									su.insert({count:1},function(err,data){
										if(err)
										console.log(err);
										else
										{
											console.log(JSON.stringify(data));
											shortner(new_doc,su,res,db,urls,1);
										}
									});
								}
								else
								{
									shortner(new_doc,su,res,db,urls,document[0].count);
								}
							}
						});
					}
					
				});
			}
		});
	}
	else
	{
		console.log("Doesn't looks like a URL : "+new_url);
		var new_doc = {};
		new_doc.error="Invalid URL. Please check the URL format";
		res.json(new_doc);
	}
});
app.use('/:data',function(req,res){
	var data = req.params.data;
	MongoClient.connect(url,function(err,db){
			if(err)
			{
				console.log(err);
			}
			else
			{
				var urls = db.collection('urls');
				urls.find({short_url:parseInt(data)}).toArray(function(err,document){
					console.log("Found This for request of data "+data);
					console.log(document);
					if(document[0]==undefined){
						res.json({Error:"Seems like there is no URL for this Shortner"});
					}
					else
					{
						var oriurl = document[0].original_url;
						res.writeHead(301,{Location:oriurl});
						res.end();
					}
					db.close();
				});
			}
	});
});
app.use('/',function(req,res){
	res.sendFile(__dirname+'/index.html');
});


app.listen(app.get('port'),function(){
	console.log('Node server running on port',app.get('port'));
});

function shortner(new_doc,su,res,db,urls,count){
											
											new_doc.short_url=count;
											su.update({count:new_doc.short_url},{$set:{count:new_doc.short_url+1}});			
											new_doc.responce={original_url:new_doc.original_url,short_url:"http://urlshortener-ms.herokuapp.com/"+new_doc.short_url};
											//urls.ensureIndex( { short_url: "hashed" } );
											urls.insert(new_doc,function(err,data){
												if(err)
												{
													console.log(err);
												}
												else
												{
													console.log("New Record Inserted");
													console.log(JSON.stringify(data));
												}
												db.close();
											});
									res.json(new_doc.responce);
}