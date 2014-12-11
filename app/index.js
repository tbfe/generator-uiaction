'use strict';
var yeoman = require('yeoman-generator');
var chalk = require('chalk');
var yosay = require('yosay');
//for parsing and manipulate javascript code
//var program = require('ast-query');
module.exports = yeoman.generators.Base.extend({
  initializing: function () {
    this.argument('name', {
      required: true,
      type: String,
      desc: 'action name'
    });
    this.log(yosay(
      chalk.cyan('贴吧无线UI ACTION生成器')
    ));
    this.actionConf = {};

  },
  _getExistResult: function(actions, name) {

    var exist = {
      isExistFile: false,
      isExistFolder: false,
    };
    actions.forEach(function(i) {
      var indexName = this._.chain(i).strRightBack('/').value();
      if (indexName.indexOf(name) >= 0) {
        if (indexName.indexOf('php') >= 0) {
          exist.isExistFile = true;
        } else {
          exist.isExistFolder = true;
        }
      }
    }.bind(this));
    if (exist.isExistFolder) {
      exist.isExistFile = false;
    }
    return exist;
  },

  prompting: function () {
    var done = this.async();
    var prompts = [];
    var actions = this.expand(this.destinationPath('actions/*'));
    var exist = this._getExistResult(actions, this.name);

    this.author = process.env.USER;
    this.prepareForWrite = {
      toActionRoot: true,
      actionFolder: ''
    };

    if (! this.author) {
      prompts.push({
        type: 'input',
        name: 'author',
        message: '雁过留声，人过留名~~',
        store: true,
        validate: function(input) {
          if (!input){
            return false;
          }
          return true;
        }
      });
    }
    // 如果存在同名文件，则提示错误，重新输过名字
    if (exist.isExistFile) {
      prompts.push({
        type: 'input',
        name: 'actionName',
        message: '已经有一个同名的action文件啦，不能覆盖它哦，重新起个名字吧：',
        store: false,
        validate: function(input) {
          var existObj = this._getExistResult(actions, input);
          if (!input || existObj.isExistFile){
            return false;
          }
          return true;
        }.bind(this)
      });
    }
    // 如果存在同名目录，则往这个目录下增加文件
    if (exist.isExistFolder) {
      var actionsInFolder = this.expand(this.destinationPath('actions/' + this.name + '/*'));
      var actionsInFolderExist = this._getExistResult(actionsInFolder, this.name);
      this.prepareForWrite.toActionRoot = false;
      this.prepareForWrite.actionFolder = this.name;
      if (actionsInFolderExist.isExistFile) {
        prompts.push({
          type: 'input',
          name: 'actionName',
          message: '已经有一个同名的action文件啦，不能覆盖它哦，重新起个名字吧：',
          store: false,
          validate: function(input) {
            var existObj = this._getExistResult(actionsInFolder, input);
            if (!input || existObj.isExistFile){
              return false;
            }
            return true;
          }.bind(this)
        });
      }
    }

    this.prompt(prompts, function(anwsers) {
      this.name = anwsers.actionName || this.name;
      this.author = anwsers.author || this.author;
      done();
    }.bind(this));
  },

  writing: function() {
    var fileBase = this._.camelize(this.name);
    var date = ((new Date()).getFullYear()) + '-' + ((new Date()).getMonth() + 1) + '-' + ((new Date()).getDate());
    var defaultParams = {
      author: this.author,
      date: date,
      className: this._.camelize(this.name)
    };
    if (this.prepareForWrite.toActionRoot) {
      this.fs.copyTpl(
        this.templatePath('actionAction.php'),
        this.destinationPath('actions/' + fileBase + 'Action.php'), defaultParams
      );
    } else {
      this.fs.copyTpl(
        this.templatePath('actionAction.php'),
        this.destinationPath('actions/' + this._.camelize(this.prepareForWrite.actionFolder) + '/' + fileBase + 'Action.php'), defaultParams
      );
    }
    // TODO 向router中写入一个路由
  }
});
