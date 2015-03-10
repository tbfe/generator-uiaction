'use strict';
var yeoman = require('yeoman-generator');
var chalk = require('chalk');
var yosay = require('yosay');
var path = require('path');
var util = require('../util.js');

module.exports = yeoman.generators.Base.extend({
  initializing: function () {
    this.log(yosay(
      chalk.cyan('贴吧无线UI ACTION生成器')
    ));
    this.actionConf = {};
  },
  _getExistFileResult: function (folder, name) {
    var isExistFile = false;
    var file;
    if (name && name.length > 0) {
      if (!folder) {
        file = this.expand(this.destinationPath('actions/' + name + 'Action.php'));
      } else {
        file = this.expand(this.destinationPath('actions/' + folder + '/' + name + 'Action.php'));
      }

      if (file.length > 0) {
        isExistFile = true;
      }
    }
    return isExistFile;
  },

  prompting: function () {
    var done = this.async();
    var prompts = [];

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
      filter: function (input) {
        return input.replace('_', '').replace('-','');
      },
    }, {
      type: 'input',
      name: 'actionName',
      message: '来一发action名字吧（不要带Action后缀哦~）：',
      store: false,
      when: function (anwsers) {
        this.folderName = anwsers.folderName;
        return anwsers.folderName;
      }.bind(this),
      filter: function(input) {
        return this._.camelize(input);
      }.bind(this),
      validate: function(input) {
        var isExistFile = this._getExistFileResult(this.folderName, this._.camelize(input));
        if (!input) {
          return '不能为空哦~';
        }
        if (isExistFile){
          return '这个action已经存在了哦，换个名字吧~';
        }
        return true;
      }.bind(this)
    }, {
      type: 'input',
      name: 'desc',
      message: '这个action是用来干嘛的呢：',
      store: false,
    }, {
      type: 'confirm',
      name: 'needWriteRouter',
      message: '是否需要向Router.php文件写入路由配置',
      store: false
    });

    this.prompt(prompts, function(anwsers) {
      this.actionConf = anwsers;
      this.author = anwsers.author || this.author;
      done();
    }.bind(this));
  },

  writing: function() {
    var folder = this.actionConf.folderName;
    var action = this.actionConf.actionName;
    var needWriteRouter = this.actionConf.needWriteRouter;
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

    if (needWriteRouter) {
      // 向router中写入一个路由
      var cwd = this.env.cwd;
      var modName = this._.capitalize(this._.chain(cwd).strRightBack('/'));
      var routerConfig = {
        reg: (folder + action).toLowerCase(),
        file: 'libs/' + modName + '/Router.php',
        needle: ');',
        splicable: ["'" + (folder + '/' + action).toLowerCase() + "'\t=>\t'" + folder + "/" + action + "',\t// " + this.actionConf.desc]
      };
      setTimeout(function() {
        util.rewriteFile(routerConfig);
      }, 500);
    }

  },
  end: function() {
    var talkText = 'yo yo 文件已经生成好啦~~\n';
    if (this.actionConf.needWriteRouter) {
      talkText = 'yo yo 文件已经生成好啦，已经往Router中写入了配置~~\n';
    }
    this.log(chalk.green(talkText) + chalk.white('You are ready to go') + '\n' + chalk.green('HAPPY CODING \\(^____^)/'));
  }
});
