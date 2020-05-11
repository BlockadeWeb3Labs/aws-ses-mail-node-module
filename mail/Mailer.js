const fs = require('fs');
const log = require('loglevel');
const aws = require('aws-sdk');
const emailValidator = require("email-validator");

const Template = require('./Template.js');

class Mailer {
	constructor(env) {
		let credentials = new aws.SharedIniFileCredentials({
			filename: env.AWS_SHARED_CREDENTIALS_FILE,
			profile: env.AWS_PROFILE
		});
		aws.config.credentials = credentials;
		aws.config.update({
			region: env.AWS_REGION
		});
	}

	prepare(file, variables) {
		this.template = new Template(file);
		this.content = this.template.setTemplateVariables(variables);
	}

	validateEmail(input) {
		const found = input.match(/<(.+)>/);
		if (found) {
			return emailValidator.validate(found[1]);
		}

		return emailValidator.validate(input);
	}

	validateRecipient(recipient) {
		if (Array.isArray(recipient)) {
			for (let idx = 0; idx < recipient.length; idx++) {
				if (!this.validateEmail(recipient[idx])) {
					log.error("Invalid recipient in array: " + String(recipient[idx]));
					return false;
				}
			}
		} else if (!this.validateEmail(recipient)) {
			log.error("Invalid recipient: " + String(recipient));
			return false;
		}

		return true;
	}

	validateSender(sender) {
		if (!this.validateEmail(sender)) {
			log.error("Invalid sender: " + String(sender));
			return false;
		}

		return true;
	}

	send(recipient, sender, subject, replyTo = null) {
		// Make sure we've prepared the email
		if (!this.content) {
			log.error("No content prepared for email to send");
			return false;
		}

		// Validate parameters
		if (!this.validateRecipient(recipient) || !this.validateSender(sender)) {
			return false;
		}

		if (!Array.isArray(recipient)) {
			recipient = [recipient];
		}

		if (!replyTo) {
			replyTo = [sender];
		} else if (Array.isArray(replyTo)) {
			for (let idx = 0; idx < replyTo.length; idx++) {
				if (!emailValidator.validate(replyTo[idx])) {
					log.error("Invalid replyTo in array: " + String(replyTo[idx]));
					return false;
				}
			}
		} else if (!emailValidator.validate(replyTo)) {
			replyTo = [sender];
		}

		if (!Array.isArray(replyTo)) {
			replyTo = [replyTo];
		}

		let mail = {
			Destination: {
				ToAddresses: recipient
			},
			Source: sender,
			Message: {
				Body: {
					Html: {
						Charset: "UTF-8",
						Data: this.content
					},
					Text: {
						Charset: "UTF-8",
						Data: this.content
					}
				},
				Subject: {
					Charset: 'UTF-8',
					Data: subject
				}
			},
			ReplyToAddresses: replyTo
		};

		return this._send(mail, recipient);
	}

	_send(mail, recipient) {
		// Create the promise and SES service object
		const SES = new aws.SES({
			"apiVersion" : "2010-12-01"
		});

		let sendPromise = SES.sendEmail(mail).promise();

		// Handle promise's fulfilled/rejected states
		sendPromise.then(function(data) {
			log.info('[ses:info] Email delivered: ' + String(data.MessageId) + ' - ' + String(recipient));
		}).catch(function(err) {
			log.error('[ses:error]', err, err.stack);
		});

		return sendPromise;
	}
}

module.exports = Mailer;
