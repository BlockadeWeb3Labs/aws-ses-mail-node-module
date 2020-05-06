# AWS SES mail module for Node.JS projects

## Usage

Include in your repo

```
npm install https://github.com/BlockadeLabs/aws-ses-mail-node-module.git
```

And wherever in the code you need to use it:

```
const AwsSesMailer = require('aws-ses-mail-node-module');

let mailer = new AwsSesMailer({
  // Optional
  AWS_SHARED_CREDENTIALS_FILE : '', // default: ~/.aws/credentials
  AWS_PROFILE : '', // default: default
  AWS_REGION : ''  // default: whatever is in credentials
});

let template_file = __dirname + '/email-templates/my_template.html';
let template_variables = {
  "USER"    : "Username",
  "VAR_1"   : "Red fish, blue fish",
  "VAR_2"   : "One fish, two fish"
};

let recipient = "recipient@test.com";
let sender    = "sender@test.com";
let subject   = "Template Test";

mailer.prepare(template_file, template_variables);
mailer.send(recipient, sender, subject);
```


## Setup

### Set up your shared AWS credentials

Make sure you have a credentials file that matches the [format according to AWS's standard](https://docs.aws.amazon.com/sdk-for-javascript/v2/developer-guide/loading-node-credentials-shared.html).

## Testing

### Test config

Before you can run the tests, you need to set up a `.env.test` to designate where the AWS credentials live, and the recipient and sender of the test mail. The required values are all in `.env.test.sample`, and the only values that must be filled in are `TEST_RECIPIENT` and `TEST_SENDER`. Both must be whitelisted for your set of AWS SES credentials, or the credentials must otherwise have authority to send to / from both emails.

```
cp .env.test.sample .env.test
```

### Run tests

```
npm test
```

## Templates

To use a custom template, first create an html template file.

## Example

When creating a template, any variable that you wish to change on a per-email basis should be placed as {{VARIABLE_NAME}}.

```
<p>
  Hello {{USER}}, welcome to our mailing list.
</p>
```

## Contributors

- Adam Gibbons
- Ben Heidorn
- Troy Salem
