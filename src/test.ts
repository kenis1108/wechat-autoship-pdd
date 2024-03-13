import XlsxPopulate from 'xlsx-populate'
import { AUTOMA_JSON_PATH, TEMPLATE_PATH } from './config';
import { getFileCreateTime } from './utils';
import { exec } from 'child_process';

// 获取命令行参数
const args = process.argv;

// 打印所有命令行参数
console.log('命令行参数:', args);

// 从第三个元素开始获取实际命令行参数
const realArgs = args.slice(2);
console.log('实际命令行参数:', realArgs);


// XlsxPopulate.fromFileAsync(TEMPLATE_PATH)
//   .then((workbook: any) => {
//     // 获取第一个 sheet
//     const sheet = workbook.sheet(0);

//     // 读取所有数据 Get 2D array of all values in the worksheet.
//     const _data = sheet.usedRange().value();
//     const data = [
//       ['20150830-952367645', 2, 3, 4, 5],
//       ['20150830-952367646', 4, 3, 2, 1]
//     ]
//     // 对数据进行处理，假设对数据进行了一些修改

//     // 将数据写回到 sheet
//     sheet.cell(`A${_data.length + 1}`).value(data);

//     // 将修改后的 workbook 写回到文件
//     return workbook.toFileAsync('new.xlsx');
//   })
//   .then(() => {
//     console.log('文件写入成功！');
//   })
//   .catch((error: any) => {
//     console.error('发生错误：', error);
//   });
