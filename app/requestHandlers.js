"use strict";

var fs=require("fs");
var formidable=require("formidable");
var im=require("imagemagick");
var qs=require("querystring");
var memecanvas=require("memecanvas");

var newPath=__dirname.substring(0,__dirname.length-3)+"/images/";
var fileName;

function showPage(response,name) {
	var page=fs.createReadStream(__dirname.substring(0,__dirname.length-3)+"/html/"+name);
	var pdata="";
	page.on("data", function(data) {
		pdata+=data;
	});	
	page.on("end", function() {
		response.writeHead(200, {"Content-Type": "text/html"});
		response.write(pdata.toString());
		response.end();
	});
}

function start(request,response) {
	fileName="";
	showPage(response,"/uploadForm.html");
}

function resizeImage(path) {
	im.identify(path, function(error,features) {
		if (error) {
			console.log(error);
		} else {
			if (features.height!=500||features.width!=500) {
				im.resize({
					srcPath: path,
					dstPath: path,
					height: 500,
					width: 500
				}, function(error,stdout,stderr) {
					if (error) {
						console.log(error);
					} else {
						console.log("resizing successful.");
					}
				});
			}
		}
	});
}

function make(request,response) {
	var form=new formidable.IncomingForm();
	form.parse(request, function(error,fields,files) {
		if (error) {
			console.log(error);
		}

		fileName=files.upload.name;
		
		resizeImage((newPath+fileName));

		fs.rename(files.upload.path, (newPath+fileName), function(error) {
			if (error) {
				fs.unlink(newPath+fileName);
				fs.rename(files.upload.path,(newPath+fileName));
			}
		});

		showPage(response,"/memeText.html");
	});
}

function show(request,response) {
	response.writeHead(200, {"Content-Type": "image/png"});
	fs.createReadStream(newPath+fileName).pipe(response);
}

function create(request,response) {
	var post="";
	request.on("data", function(data) {
		post+=data;
	});
	request.on("end", function() {
		var topt=qs.parse(post).topText.toString();
		var bottomt=qs.parse(post).bottomText.toString();
		
		memecanvas.init(newPath,"-meme");
		memecanvas.generate((newPath+fileName), topt, bottomt, function(error,meme) {
			if (error) {
				console.log(error);
			} else {
				console.log(meme);
				response.writeHead(200, {"Content-Type": "text/plain"});
				response.write("Successfully created a meme.\n");
				response.write("Location of the image: "+meme);
				response.end();
			}
		});
	});
}

exports.start=start;
exports.make=make;
exports.show=show;
exports.create=create;