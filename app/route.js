"use strict";

function route(pathname,handle,request,response) {
	if (typeof handle[pathname]==='function') {
		handle[pathname](request,response);
	} else {
		response.writeHead(404, {"Content-Type": "text/plain"});
		response.write("404 Not found.");
		response.end();
	}	
}

exports.route=route;