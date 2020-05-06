const log = require('loglevel');
const fs = require('fs');

class Template {
	constructor(file) {
		if (!file) {
			throw new Error('AWS SES Module Template: No file provided');
		}

		this.content = fs.readFileSync(file, 'UTF8');
		this.variables = this.collectVariables(this.content);
	}

	collectVariables(content) {
		let regex = new RegExp("{{[A-Za-z0-9\_\-]+}}", "g");
		let matches = content.match(regex) || [];

		// Unique values only
		matches = matches.filter(
			function (value, index, self) {
				return self.indexOf(value) === index;
			}
		);

		// Remove {{ and }}
		matches.forEach(
			function(el, index, self) {
				self[index] = el.slice(2,-2);
			}
		);

		return matches;
	}

	validate(kv) {
		for (let idx = 0; idx < this.variables.length; idx++) {
			let key = this.variables[idx];
			if (!kv.hasOwnProperty(key)) {
				log.error(`Template variable ${key} is missing.`);
			}
		}
	}

	setTemplateVariables(variables) {
		// Validate we have the variables provided for the file provided
		this.validate(variables);

		// Make sure we're working with a copy of the template
		let contents = this.content.substring(0);

		// For each variable, replace {{KEY}} with VALUE
		for (let key in variables) {
			if (variables.hasOwnProperty(key)) {
				let value = variables[key];
				let regex = new RegExp("{{" + key + "}}", "g");
				contents = contents.replace(regex, value);
			}
		}

		return contents;
	}
}

module.exports = Template;
