const fs = require('fs');
const vscode = require('vscode');

function createCSSComponent(path, classes, name){
	fs.readFile(path, (err, data) => {
		if (err) throw err;

		let add = "." + name + "{ \n\t@apply " + classes.join(" ") + "\n }";
		
		if(data.includes("@layer components {")){
			let d = data.toString().split("@layer components {", 2);
			
			d[1] = add + " " + d[1];
			
			let contents = d[0] + "@layer components {\n" + d[1];
			
			fs.writeFile(path, contents, function(err) {
				if (err) throw 'error writing file: ' + err;
			});
		}
		else{	
			fs.appendFile(path, "@layer components {\n " + add + " \n}", function (err) {
				if (err) throw err;
			});
		}
	});
}

function createVUEComponent(path, selection){
    let start = "<template functional>\n";
    let end = "\n</template>"
    let content = start + selection + end;

    fs.writeFile(path, content, function(err) {
        if (err) throw 'error writing file: ' + err;
    });
}

module.exports = {createCSSComponent, createVUEComponent}