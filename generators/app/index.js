const Generator = require("yeoman-generator");

module.exports = class extends Generator {
  prompting() {
    return this.prompt([
      {
        type: "input",
        name: "name",
        message: "Your project name",
        default: this.appname
          .substring(0, this.appname.indexOf("service"))
          .trim()
          .replace(" ", "-") // Default to current folder name
      },
      {
        type: "input",
        name: "description",
        message: "Your project description",
        default: ""
      },
      {
        type: "input",
        name: "configPrefix",
        message: "The environment prefix for your config",
        validate: value => {
          return (
            (value.length && !!value.match(/^[a-zA-Z0-9_]*$/)) ||
            "The prefix may only contain alphanumeric or underscores."
          );
        },
        default: answers => {
          let name = answers.name.replace("-", "_").toLowerCase();
          if (name.match(/^[a-z0-9_]*$/)) return name;
          else return "";
        }
      },
      {
        type: "input",
        name: "baseName",
        message: "dns of the core for stage and production",
        default: "core"
      },
      {
        type: "confirm",
        name: "createPin",
        message: "Do you want to create a listen pin?"
      },
      {
        type: "input",
        name: "pin",
        message: "enter your pin name in jsonp syntax",
        default: answers => {
          return `service:${answers.name},command:*`;
        }
      },
      {
        type: "input",
        name: "license",
        message: "enter your wished license",
        default: "MIT"
      }
    ]).then(answers => {
      this.props = answers;
      if (this.props.pin) {
        this.props.pin = `{ pin: "${this.props.pin}", model: "consume" }`;
      } else this.props.pin = "";
    });
  }

  writing() {
    this.fs.copyTpl(
      this.templatePath() + "/**/*",
      this.destinationPath(),
      this.props
    );

    this.fs.copyTpl(
      this.templatePath() + "/**/.*",
      this.destinationPath(),
      this.props
    );

    this.fs.copyTpl(
      this.templatePath("config.js.template"),
      this.destinationPath("config.js"),
      this.props
    );
  }

  install() {
    this.installDependencies({
      bower: false,
      npm: true
    });
  }
};
