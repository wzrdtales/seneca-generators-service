const Generator = require("yeoman-generator");

module.exports = class extends Generator {
  prompting() {
    return this.prompt([
      {
        type: "input",
        name: "command",
        message: "enter the name of your service endpoint",
        validate: answers => {
          return !!answers.length || "Service endpoint name may not be empty";
        }
      },
      {
        type: "input",
        name: "pin",
        message: "enter your pin name in jsonp syntax",
        default: answers => {
          const name = this.appname.replace(/\sservice$/, "");
          return `service:${name},command:${answers.command}`;
        }
      }
    ]).then(answers => {
      this.props = answers;
      if (!this.props.pin) {
        this.props.pin = "";
      }
    });
  }

  writing() {
    this.fs.copyTpl(
      this.templatePath("lib/controllers/service.js"),
      this.destinationPath(`lib/controllers/${this.props.command}.js`),
      this.props
    );
  }
};
