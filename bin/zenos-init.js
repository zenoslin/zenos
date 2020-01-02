#!/usr/bin/env node
const chalk = require("chalk");
const ora = require("ora");
const glob = require("glob");
const path = require("path");
const fs = require("fs");
const inquirer = require("inquirer");

const download = require("../lib/download");

const urlList = [
  "github:zenoslin/my-vue-cli#master",
  "github:zenoslin/rollup-starter-ts#master"
];
const choicesList = ["Start Vue project", "Start Node project"];

const main = async () => {
  // 项目名称
  const answers = await inquirer.prompt([
    { name: "projectName", message: "Input your project name" },
    {
      name: "projectType",
      message: "选择项目类型",
      type: "list",
      choices: choicesList
    }
  ]);

  let projectName = answers.projectName;
  if (!projectName) {
    console.log(chalk.red("\nProject name should not be empty!\n"));
    return;
  }
  const list = glob.sync("*"); // 遍历当前目录
  let rootName = path.basename(process.cwd());
  if (list.length) {
    // 如果当前目录不为空
    if (
      list.filter(name => {
        const fileName = path.resolve(process.cwd(), path.join(".", name));
        const isDir = fs.statSync(fileName).isDirectory();
        return name.indexOf(projectName) !== -1 && isDir;
      }).length !== 0
    ) {
      console.log(chalk.red(`Project ${projectName} is exist!`));
      return;
    }
    rootName = projectName;
  } else if (rootName === projectName) {
    const emptyAnswers = await inquirer.prompt([
      {
        name: buildInCurrent,
        message:
          "当前目录为空，且目录名称和项目名称相同，是否直接在当前目录下创建新项目？",
        type: "confirm",
        default: true
      }
    ]);
    rootName = emptyAnswers.buildInCurrent ? "." : projectName;
  } else {
    rootName = projectName;
  }

  let templateUrl = urlList[choicesList.indexOf(answers.projectType)];

  console.log("templateUrl", templateUrl);

  // 下载模版
  console.log(chalk.white("\nStart downloading... \n"));
  const spinnerDownload = ora("Downloading...");
  spinnerDownload.start();

  let downloadMf;
  try {
    downloadMf = await download(templateUrl, rootName)
  } catch (e) {
    spinnerDownload.fail();
    console.log(chalk.red(`Downloading failed. ${err}`));
    return;
  }

  spinnerDownload.succeed();
  console.log(chalk.green("\nDownloading completed!"));

  // 构建完成
  console.log(chalk.blueBright("\nGo started!"));
  if (downloadMf !== ".") {
    console.log(`cd ${downloadMf}`);
  }
  console.log(`npm install`);
  console.log(`npm run dev`);
};

main();
