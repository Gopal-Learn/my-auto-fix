const fs = require('fs');
const path = require('path');
const chalk = require('chalk');

function resolve(p) {
  return path.join(__dirname, '..', p);
}

const objRegex = /\{[^}\/\/]*\}/g;

function fileDisplay(filePath) {
  let file = resolve(filePath);
  let fileList = fs.readdirSync(file, 'utf8');

  function compare() {
    return function ([key1, value1],[key2, value2]) {
      key1 = Number.isNaN(Number(key1)) ? key1.toLowerCase() : key1;
      key2 = Number.isNaN(Number(key2)) ? key2.toLowerCase() : key2;
      value1 = Number.isNaN(Number(value1)) ? value1.toLowerCase() : value1;
      value2 = Number.isNaN(Number(value2)) ? value2.toLowerCase() : value2;
      if (value1 === value2) {
        return key1 < key2 ? -1 : key1 > key2 ? 1 : 0; // 升序
      } else {
        return value1 < value2 ? -1 : value1 > value2 ? 1 : 0;
      }
    }
  }

  // 读取文件
  fileList.forEach(filename => {
    let fileDir = path.join(filePath, filename);
    console.log(chalk.cyan(`Auto fix ${fileDir}`))
    let fileContents = fs.readFileSync(fileDir, 'utf8');

    function sortObj(item) {
      item = item.replace(/(\S+):/g,"\"$1\":")
      .replace(/'/g, '"');

      let arr = [];
      item = JSON.parse(item);
      arr = Object.entries(item);
      // 排序
      arr = arr.sort(compare());
      let tempObj = {};
      // 将排序好的数组拼接成对象
      tempObj = arr.reduce((_sortedObj, [key, val]) => ({
        ..._sortedObj,
        [key]: val
      }), {});
      let tempStr = JSON.stringify(tempObj, null, 2);
      // 去掉 key 值的双引号
      tempStr = tempStr.replace(/"/g, "").replace(/\: /g,"\: \'").replace(/\,/g,"\'\,").replace(/\n\}/g,"\'\n\}");
      return tempStr;
    }

    // 匹配对象并排序并替换
    fileContents = fileContents.replace(objRegex, function(match) {
      return sortObj(match)
    });

    // 输出到文件中
    fs.writeFileSync(fileDir, fileContents, 'utf8');
  });

}
try {
  fileDisplay('src/constant');
  console.log(chalk.green(`Auto fix complete`))
} catch (e) {
  console.log(e);
  console.log(chalk.red(`Auto fix Error, You can check the the problem in the auto-fix/index.js directory`))
  throw new Error(`Auto fix Error, You can check the the problem in the auto-fix/index.js directory`)
}
