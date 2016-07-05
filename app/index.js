"use strict";

var server=require("./server");
var router=require("./route");
var requestHandler=require("./requestHandlers");

var handle={};
handle["/"]=requestHandler.start;
handle["/make"]=requestHandler.make;
handle["/show"]=requestHandler.show;
handle["/create"]=requestHandler.create;

server.start(router.route,handle);