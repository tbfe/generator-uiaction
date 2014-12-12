'use strict';
var yeoman = require('yeoman-generator');
var chalk = require('chalk');
var yosay = require('yosay');
//for parsing and manipulate javascript code
//var program = require('ast-query');
module.exports = yeoman.generators.Base.extend({
  initializing: function () {
    this.log(yosay(
      chalk.cyan('贴吧无线UI ACTION生成器')
    ));
    this.actionConf = {};

  },
  _getExistResult: function(actions, name) {
    var exist = {
      isExistFile: false,
    };

    if (actions.length > 0) {
      actions.forEach(function(i) {
        var indexName = this._.chain(i).strRightBack('/').value();
        if (indexName.indexOf('php') >= 0) {
          if (indexName.indexOf(name) >= 0) {
            exist.isExistFile = true;
          }
        } else {
          var subActions = this.expand(this.destinationPath('actions/' + name + '/*'));

          exist = this._getExistResult(subActions, name);
        }
      }.bind(this));
    }
    return exist;
  },

  prompting: function () {
    var done = this.async();
    var prompts = [];
    var actions = this.expand(this.destinationPath('actions/*'));

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
    prompts.push({
      type: 'input',
      name: 'folderName',
      message: '将要放入到哪个目录下（为空的话将直接放到根目录下，慎重~）：',
      store: true,
    }, {
      type: 'input',
      name: 'actionName',
      message: '来一发action名字吧（不要带Action后缀哦~）：',
      store: false,
      validate: function(input) {
        var existObj = this._getExistResult(actions, input);
        if (!input || existObj.isExistFile){
          return '这个action已经存在了哦，换个名字吧~';
        }
        return true;
      }.bind(this)
    });

    this.prompt(prompts, function(anwsers) {
      this.actionConf = anwsers;
      this.author = anwsers.author || this.author;
      done();
    }.bind(this));
  },

  writing: function() {
    var folder = this.actionConf.folderName;
    var action = this._.camelize(this.actionConf.actionName);
    var date = ((new Date()).getFullYear()) + '-' + ((new Date()).getMonth() + 1) + '-' + ((new Date()).getDate());
    var defaultParams = {
      author: this.author,
      date: date,
      actionName: action,
      tplName: this._.underscored(this.actionConf.actionName)
    };
    if (!folder || folder.length === 0) {
      this.fs.copyTpl(
        this.templatePath('actionAction.php'),
        this.destinationPath('actions/' + action + 'Action.php'), defaultParams
      );
    } else {
      this.fs.copyTpl(
        this.templatePath('actionAction.php'),
        this.destinationPath('actions/' + folder + '/' + action + 'Action.php'), defaultParams
      );
    }
    // TODO 向router中写入一个路由
  }
});
