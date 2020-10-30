var express = require("express");
var app = express();
app.use(express.json());
var port = process.env.PORT || 4000;


var Handler = require('./Handler');




app.get("/player.html", (req, res) =>
{	
	res.sendFile(__dirname + '/player.html');
});
app.get("/gamemaster.html", (req, res) =>
{	
	res.sendFile(__dirname + '/gamemaster.html');
});
app.get("/task.html", (req, res) =>
{	
	res.sendFile(__dirname + '/task.html');
});
app.get("/sabotage.html", (req, res) =>
{	
	res.sendFile(__dirname + '/sabotage.html');
});


app.post("/", (req, res) =>
{
	handler = new Handler();
	handler.handle(req, res);
});


app.listen(port, () =>
{
	console.log("Server running on port " + port);
});
