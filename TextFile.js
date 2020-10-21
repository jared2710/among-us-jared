var fs = require("fs");

class TextFile
{
	constructor(filename)
	{
		this.filename = filename;
	}

	print()
	{
		console.log("TextFile object: " + this.filename);
	}
	
	getContents()
	{
		return fs.readFileSync(this.filename);
	}
	
	writeContents(toWrite)
	{
		fs.writeFileSync(this.filename, toWrite);
	}
}

module.exports = TextFile;
