var TextFile = require("./TextFile");

class Handler
{
	constructor()
	{
		this.people_file = new TextFile("people.json");
		this.tasks_file = new TextFile("tasks.json");
		this.sabotages_file = new TextFile("sabotages.json");
		this.gamestate_file = new TextFile("gamestate.json");
		
		this.people = JSON.parse(this.people_file.getContents());
		this.tasks = JSON.parse(this.tasks_file.getContents());
		this.sabotages = JSON.parse(this.sabotages_file.getContents());
		this.gamestate = JSON.parse(this.gamestate_file.getContents());
	}

	print()
	{
		console.log("Handler object");
	}
	
	handle(req, res)
	{
		this.req = req;
		this.res = res;
		
		var json = this.req.body;
		var type = json.type;
			
		switch(type)
		{
			case "addPerson":
				this.addPerson(json);
				break;
			case "getPerson":
				this.getPerson(json);
				break;
			case "getAllPeople":
				this.getAllPeople(json);
				break;
			case "getAllAlivePeople":
				this.getAllAlivePeople(json);
				break;
			case "clearPeople":
				this.clearPeople(json);
				break;
			case "clearAndRandomAssignTasks":
				this.clearAndRandomAssignTasks(json);
				break;
				
				
			
			case "makePersonImposter":
				this.makePersonImposter(json);
				break;
				
			
				
				
			case "makePersonDead":
				this.makePersonDead(json);
				break;
			case "reportBody":
				this.reportBody(json);
				break;
			case "makeAllPeopleAlive":
				this.makeAllPeopleAlive(json);
				break;
				
				
			case "doTaskForPerson":
				this.doTaskForPerson(json);
				break;
			case "getTasksForPerson":
				this.getTasksForPerson(json);
				break;
			case "getTaskForPerson":
				this.getTaskForPerson(json);
				break;
				
				
			case "emergencyMeeting":
				this.emergencyMeeting(json);
				break;
			case "getGameState":
				this.getGameState(json);
				break;
			case "resetGameState":
				this.resetGameState(json);
				break;
				
				
			case "callSabotage":
				this.callSabotage(json);
				break;
			case "getSabotage":
				this.getSabotage(json);
				break;
			case "getAllSabotages":
				this.getAllSabotages(json);
				break;
			case "endSabotage":
				this.endSabotage(json);
				break;
			case "endAllSabotages":
				this.endAllSabotages(json);
				break;
				
			default:
				this.error("Invalid request for API: " + type);
		}
	}
	
	writeChanges()
	{
		this.people = JSON.stringify(this.people);
		this.tasks = JSON.stringify(this.tasks);
		this.sabotages = JSON.stringify(this.sabotages);
		this.gamestate = JSON.stringify(this.gamestate);
		
		this.people_file.writeContents(this.people);
		this.tasks_file.writeContents(this.tasks);
		this.sabotages_file.writeContents(this.sabotages);
		this.gamestate_file.writeContents(this.gamestate);
	}

	respond(data)
	{
		this.checkWin();
		this.writeChanges();
		this.res.json({"status" : 1, "data" : data});
	}

	error(message)
	{
		this.res.json({"status" : 0, "data" : message});
	}
	
	checkWin()
	{
		//CHECK SABOTAGES
		var cur_time = Date.now();
		for(var i = 0; i < this.sabotages["sabotages"].length; i++)
		{
			if(this.sabotages["sabotages"][i]["happening"])
			{
				var diff = cur_time - this.sabotages["sabotages"][i]["time"];
				diff = diff / 1000;
				diff = this.sabotages["sabotages"][i]["total_time"] - diff;
				if(diff <= 0)
				{
					this.gamestate["crewmates_win"] = false;
					this.gamestate["imposters_win"] = true;
					return;
				}
				else
				{
					this.gamestate["crewmates_win"] = false;
					this.gamestate["imposters_win"] = false;
				}
			}
			else
			{
				this.gamestate["crewmates_win"] = false;
				this.gamestate["imposters_win"] = false;
			}
		}
		
		//CHECK TASKS DONE
		
		//get alive people
		var people = [];
		for(var i = 0; i < this.people["people"].length; i++)
		{
			if(! this.people["people"][i]["dead"])
			{
				people.push(this.people["people"][i]);
			}
		}
		
		//check if their tasks are done
		var all_tasks_done = true;
		for(var i = 0; i < people.length; i++)
		{
			for(var key in people[i]["tasks"])
			{
				all_tasks_done = all_tasks_done && people[i]["tasks"][key];
			}
		}
		if(all_tasks_done)
		{
			this.gamestate["crewmates_win"] = true;
			this.gamestate["imposters_win"] = false;
			return;
		}
		else
		{
			this.gamestate["crewmates_win"] = false;
			this.gamestate["imposters_win"] = false;
		}
		
		//CHECK NUM CREWMATES V NUM IMPOSTORS
		var crew = 0;
		var imp = 0;
		for(var i = 0; i < people.length; i++)
		{
			if(people[i]["imposter"])
			{
				imp += 1;
			}
			else
			{
				crew += 1;
			}
		}
		if(imp == 0)
		{
			this.gamestate["crewmates_win"] = true;
			this.gamestate["imposters_win"] = false;
			return;
		}
		else if(crew <= imp)
		{
			this.gamestate["crewmates_win"] = false;
			this.gamestate["imposters_win"] = true;
			return;
		}
		else
		{
			this.gamestate["crewmates_win"] = false;
			this.gamestate["imposters_win"] = false;
		}
		
	}
	
	
	
	
	addPerson(json)
	{
		var id = json.id;
		var name = json.name;
		var colour = json.colour;
		this.people["people"].push({"id": id, "name": name, "colour": colour, "dead": false, "imposter": false, "tasks": []});
		this.respond("Person added with id " + id + ".");
	}
	
	getPerson(json)
	{
		var id = json.id;
		if(id < 0 || id >= this.people["people"].length)
		{
			this.error("Invalid person id");
		}
		else
		{
			this.respond(JSON.stringify(this.people["people"][id]));
		}
	}
	
	getAllPeople(json)
	{
		this.respond(this.people["people"]);
	}
	
	getAllAlivePeople(json)
	{
		var people = [];
		for(var i = 0; i < this.people["people"].length; i++)
		{
			if(! this.people["people"][i]["dead"])
			{
				people.push(this.people["people"][i]);
			}
		}
		this.respond(people);
	}
	
	clearPeople(json)
	{
		this.people["people"] = [];
		this.respond("All people cleared");
	}
	
	clearAndRandomAssignTasks(json)
	{
		var num_tasks = json.num_tasks;
		if(num_tasks > this.tasks["tasks"].length)
		{
			this.error("Too many tasks asked to be assigned.");
		}
		else
		{
			for(var i = 0; i < this.people["people"].length; i++)
			{
				var avail_tasks = [];
				for(var j = 0; j < this.tasks["tasks"].length; j++)
				{
					avail_tasks.push(j);
				}
				
				var my_tasks = {};
				for(var j = 0; j < num_tasks; j++)
				{
					var rand_pos = Math.floor(Math.random() * avail_tasks.length);
					var to_add = "task_" + avail_tasks.splice(rand_pos, 1);
					my_tasks[to_add] = false;
				}
				
				this.people["people"][i]["tasks"] = my_tasks;
			}
			this.respond("All people cleared of tasks and randomly assigned new ones.");
		}
	}
	
	
	
	
	makePersonImposter(json)
	{
		var id = json.id;
		var imposter = json.imposter;
		if(id < 0 || id >= this.people["people"].length)
		{
			this.error("Invalid person id");
		}
		else
		{
			this.people["people"][id]["imposter"] = imposter;
			this.respond("Person " + id + " (" + this.people["people"][id]["name"] + ", " + this.people["people"][id]["colour"] + ") is imposter: " + imposter);
		}
	}
	
	
	
	
	
	makePersonDead(json)
	{
		var id = json.id;
		var dead = json.dead;
		if(id < 0 || id >= this.people["people"].length)
		{
			this.error("Invalid person id");
		}
		else
		{
			this.people["people"][id]["dead"] = dead;
			this.respond("Person " + id + " (" + this.people["people"][id]["name"] + ", " + this.people["people"][id]["colour"] + ") is dead: " + dead);
		}
	}
	
	reportBody(json)
	{
		/*var id = json.id;
		if(id < 0 || id >= this.people["people"].length)
		{
			this.error("Invalid person id");
		}
		else
		{
			this.people["people"][id]["dead"] = true;
			
			for(var i = 0; i < this.sabotages["sabotages"].length; i++)
			{
				this.sabotages["sabotages"][i]["happening"] = false;
			}
			
			this.respond("Person " + id + " (" + this.people["people"][id]["name"] + ", " + this.people["people"][id]["colour"] + ") dead and sabotages cleared.")
		}*/
		for(var i = 0; i < this.sabotages["sabotages"].length; i++)
		{
			this.sabotages["sabotages"][i]["happening"] = false;
			this.sabotages["sabotages"][i]["time"] = -1;
		}
			
		var start_true_end_false = json.start_true_end_false;
		this.gamestate["reported_body"] = start_true_end_false;
		this.respond("Body reported meeting in progress: " + start_true_end_false + " and sabotages stopped");
	}
	
	makeAllPeopleAlive(json)
	{
		for(var i = 0; i < this.people["people"].length; i++)
		{
			this.people["people"][i]["dead"] = false;
		}
		this.respond("All people now alive.");
	}
	
	
	
	
	doTaskForPerson(json)
	{
		var id = json.id;
		var person_id = json.person_id;
		if(id < 0 || id >= this.tasks["tasks"].length)
		{
			this.error("Invalid task id.");
		}
		else if(person_id < 0 || person_id >= this.people["people"].length)
		{
			this.error("Invalid person id.");
		}
		else
		{
			var person = this.people["people"][person_id];
			if(person["tasks"]["task_" + id])
			{
				this.respond("That task is already done.");
			}
			else
			{
				person["tasks"]["task_" + id] = true;
				this.respond("Task " + id + " (" + this.tasks["tasks"][id]["name"] + ", " + this.tasks["tasks"][id]["location"] + ") is done for person " + person_id + " (" + this.people["people"][person_id]["name"] + ", " + this.people["people"][person_id]["colour"] + ").")
			}
		}
	}
	
	getTasksForPerson(json)
	{
		var person_id = json.person_id;
		
		if(person_id < 0 || person_id >= this.people["people"].length)
		{
			this.error("Invalid person id.");
		}
		else
		{
			this.respond(this.people["people"][person_id]["tasks"]);
		}
	}
	
	getTaskForPerson(json)
	{
		var id = json.id;
		var person_id = json.person_id;
		
		if(id < 0 || id >= this.tasks["tasks"].length)
		{
			this.error("Invalid task id.");
		}
		else if(person_id < 0 || person_id >= this.people["people"].length)
		{
			this.error("Invalid person id.");
		}
		else
		{
			var build = {};
			build["task"] = this.tasks["tasks"][id];
			build["done"] = this.people["people"][person_id]["tasks"]["task_" + id];
			build["id"] = id;
			this.respond(build);
		}
	}
	
	
	
	
	emergencyMeeting(json)
	{
		var start_true_end_false = json.start_true_end_false;
		if(start_true_end_false)
		{
			var emergencies = false;
			for(var i = 0; i < this.sabotages["sabotages"].length; i++)
			{
				emergencies = emergencies || this.sabotages["sabotages"][i]["happening"];
			}
			if(!emergencies)
			{
				this.gamestate["emergency_meeting"] = true;
				this.respond("Emergency meeting called");
			}
			else
			{
				this.respond("Cannot call emergency meeting in crisis!");
			}
		}
		else
		{
			this.gamestate["emergency_meeting"] = false;
			this.respond("Emergency meeting ended");
		}
		
	}
	
	getGameState(json)
	{
		var id = json.id;
		if(id == -1)
		{
			this.respond(this.gamestate);
		}
		else
		{
			if(id < 0 || id >= this.people["people"].length)
			{
				this.error("Invalid person id.");
			}
			else
			{
				var build = {};
				build["gamestate"] = this.gamestate;
				build["person"] = this.people["people"][id];
				build["sabotages"] = this.sabotages["sabotages"];
				this.respond(build);
			}
		}
		
	}
	
	resetGameState(json)
	{
		this.gamestate["emergency_meeting"] = false;
		this.gamestate["reported_body"] = false;
		this.gamestate["crewmates_win"] = false;
		this.gamestate["imposters_win"] = false;
		
		this.respond("Game state reset.");
	}
	
	
	
	
	callSabotage(json)
	{
		var emergencies = false;
		for(var i = 0; i < this.sabotages["sabotages"].length; i++)
		{
			emergencies = emergencies || this.sabotages["sabotages"][i]["happening"];
		}
		
		if(!emergencies)
		{
			var id = json.id;
			var time = json.time;
			if(id < 0 || id >= this.sabotages["sabotages"].length)
			{
				this.error("Invalid sabotage id.");
			}
			else
			{
				if(this.sabotages["sabotages"][id]["happening"])
				{
					this.respond("That sabotage is already happening.");
				}
				else
				{
					this.sabotages["sabotages"][id]["happening"] = true;
					this.sabotages["sabotages"][id]["time"] = time;
					this.respond("Sabotage " + id + " (" + this.sabotages["sabotages"][id]["name"] + ", " + this.sabotages["sabotages"][id]["location"] + ") started.");
				}
			}
		}
		else
		{
			this.respond("There is already a sabotage happening!");
		}
	}
	
	getSabotage(json)
	{
		var id = json.id;
		if(id < 0 || id >= this.sabotages["sabotages"].length)
		{
			this.error("Invalid sabotage id.");
		}
		else
		{
			this.respond(JSON.stringify(this.sabotages["sabotages"][id]));
		}
	}
	
	getAllSabotages(json)
	{
		this.respond(this.sabotages["sabotages"]);
	}

	
	endSabotage(json)
	{
		var emergencies = false;
		for(var i = 0; i < this.sabotages["sabotages"].length; i++)
		{
			emergencies = emergencies || this.sabotages["sabotages"][i]["happening"];
		}
		
		if(!emergencies)
		{
			this.respond("There is no sabotage to end!");
		}
		else
		{
			var id = json.id;
			if(id < 0 || id >= this.sabotages["sabotages"].length)
			{
				this.error("Invalid sabotage id.");
			}
			else
			{
				if(this.sabotages["sabotages"][id]["happening"])
				{
					this.sabotages["sabotages"][id]["happening"] = false;
					this.sabotages["sabotages"][id]["time"] = -1;
					this.respond("Sabotage " + id + " (" + this.sabotages["sabotages"][id]["name"] + ", " + this.sabotages["sabotages"][id]["location"] + ") ended.");
				}
				else
				{
					this.respond("That sabotage is not currently happening.");
				}
			}
		}
	}

	
	endAllSabotages(json)
	{
		for(var i = 0; i < this.sabotages["sabotages"].length; i++)
		{
			this.sabotages["sabotages"][i]["happening"] = false;
			this.sabotages["sabotages"][i]["time"] = -1;
		}
		this.respond("All sabotages ended.");
	}
	
}

module.exports = Handler;
