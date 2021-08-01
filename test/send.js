const assert = require('assert');
const path   = require('path');
const dotenv = require('dotenv');
const aws    = require('aws-sdk');

const AwsSesMailer = require('../index.js');

dotenv.config({
	"path" : path.join(__dirname, "../.env.test")
});

describe("Send Test Mail", function() {

	describe("Verify config is set up", function() {
		it(".env.test has recipient and sender set up", function(done) {
			assert(process.env);
			assert(process.env.hasOwnProperty('TEST_RECIPIENT'));
			assert(process.env.hasOwnProperty('TEST_SENDER'));
			done();
		});

		it("AWS can find the required profile", function(done) {
			let credentials = new aws.SharedIniFileCredentials({
				"AWS_SHARED_CREDENTIALS_FILE" : process.env.TEST_AWS_SHARED_CREDENTIALS_FILE,
				"AWS_PROFILE"                 : process.env.TEST_AWS_PROFILE,
				"AWS_REGION"                  : process.env.TEST_AWS_REGION
			});
			assert(typeof(credentials.accessKeyId) !== "undefined");
			done();
		});

	});

	describe("Validation", function() {
		let mailer = new AwsSesMailer({
			"AWS_SHARED_CREDENTIALS_FILE" : process.env.TEST_AWS_SHARED_CREDENTIALS_FILE,
			"AWS_PROFILE"                 : process.env.TEST_AWS_PROFILE,
			"AWS_REGION"                  : process.env.TEST_AWS_REGION
		});

		it("Validate recipient from test environment", function(done) {
			assert(mailer.validateRecipient(process.env.TEST_RECIPIENT) === true);
			done();
		});

		it("Validate sender from test environment", function(done) {
			assert(mailer.validateSender(process.env.TEST_SENDER) === true);
			done();
		});

		it("Validate recipient without alias", function(done) {
			assert(mailer.validateRecipient(process.env.TEST_RECIPIENT) === true);
			done();
		});

		it("Validate sender without alias", function(done) {
			assert(mailer.validateSender(process.env.TEST_SENDER) === true);
			done();
		});

		const TEST_ALIAS_SENDER = "An Alias<fakeemail@google.com>";

		it("Validate sender with alias", function(done) {
			assert(mailer.validateSender(TEST_ALIAS_SENDER) === true);
			done();
		});

		const TEST_RECIPIENT_ARRAY = [
			process.env.TEST_RECIPIENT,
			process.env.TEST_SENDER,
			TEST_ALIAS_SENDER
		];

		it("Validate recipient array", function(done) {
			assert(mailer.validateRecipient(TEST_RECIPIENT_ARRAY) === true);
			done();
		});

	});

	describe("Send a test email", function() {
		it("Creates aws session and sends email", function(done) {
			let mailer = new AwsSesMailer({
				"AWS_SHARED_CREDENTIALS_FILE" : process.env.TEST_AWS_SHARED_CREDENTIALS_FILE,
				"AWS_PROFILE"                 : process.env.TEST_AWS_PROFILE,
				"AWS_REGION"                  : process.env.TEST_AWS_REGION
			});

			let template_file = __dirname + "/templates/test.html";
			let template_variables = {
				"EMAIL_TITLE" : "Email Title",
				"EMAIL_CONTENT" : "Email content here",
				"SITE_URL" : "https://blockade.games"
			};

			let recipient = process.env.TEST_RECIPIENT;
			let sender    = process.env.TEST_SENDER;
			let subject   = "Template Test";

			mailer.prepare(template_file, template_variables);
			let sent = mailer.send(recipient, sender, subject);

			sent.then((res) => {
				assert(res);
				done();
			}).catch((res) => {
				done(new Error(res));
			});
		});
	});

	describe("Send a test text message", function() {
		it("Creates aws session and sends email", function(done) {
			let mailer = new AwsSesMailer({
				"AWS_SHARED_CREDENTIALS_FILE" : process.env.TEST_AWS_SHARED_CREDENTIALS_FILE,
				"AWS_PROFILE"                 : process.env.TEST_AWS_PROFILE,
				"AWS_REGION"                  : process.env.TEST_AWS_REGION
			});

			let recipient = process.env.TEST_TEXT_RECIPIENT;
			let sender    = process.env.TEST_SENDER;
			let message   = "Test Text Message";

			let sent = mailer.sendText(recipient, sender, message);

			sent.then((res) => {
				assert(res);
				done();
			}).catch((res) => {
				done(new Error(res));
			});
		});
	});
});
