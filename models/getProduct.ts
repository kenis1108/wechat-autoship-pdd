/*
 * @Author: kenis 1836362346@qq.com
 * @Date: 2024-03-15 15:46:48
 * @LastEditors: kenis 1836362346@qq.com
 * @LastEditTime: 2024-03-17 18:35:46
 * @FilePath: \wechat-autoship-pdd\src\test.ts
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */

/** 
 * 1. 
 * 2. 获取数据存入数据库
 */
import * as fs from 'fs';
import * as path from 'path';
import { log } from 'wechaty';
import SQLiteDB from '../models';
import { ProductTableRow, productTable } from '../models/tables/product';

const dir = 'public/sku/2'
/** 
 * 遍历文件夹里的所有json文件,递归处理子文件夹
 */
export async function readJSONFiles(directoryPath: string) {
  fs.readdir(directoryPath, (err, files) => {
    if (err) {
      console.error('Error reading directory:', err);
      return;
    }

    files.forEach(file => {
      const filePath = path.join(directoryPath, file);
      fs.stat(filePath, (statErr, stats) => {
        if (statErr) {
          console.error('Error getting file stats:', statErr);
          return;
        }

        if (stats.isFile() && file.endsWith('.json')) {
          fs.readFile(filePath, 'utf8', (readErr, data) => {
            if (readErr) {
              console.error('Error reading file:', readErr);
              return;
            }

            try {
              const jsonData = JSON.parse(data);
              /* -------------------------------------------------------------------------- */
              /*                                 可以抽出写成回调函数  ↓ ↓ ↓ ↓ ↓                                */
              /* -------------------------------------------------------------------------- */
              // 只有一个属性的处理方式
              // jsonData.forEach((item:any)=>{
              //   const db = new SQLiteDB('autoship.db')
              //   db.insertOne<ProductTableRow>(productTable,{
              //     title:item['商品标题'],
              //     sku1: item['颜色'],
              //     sku2: '',
              //     cost: ''
              //   })
              // })

              // 两个属性的处理方式
              // const jsonData2 = extractAndGenerate(jsonData)
              // jsonData2.forEach((item:any)=>{
              //   const db = new SQLiteDB('autoship.db')
              //   db.insertOne<ProductTableRow>(productTable,{
              //     title:item['商品标题'],
              //     sku1: item['颜色'],
              //     sku2: item['尺码'],
              //     cost: ''
              //   })
              // })



              /* -------------------------------------------------------------------------- */
              /*                                 可以抽出写成回调函数  ↑ ↑ ↑ ↑ ↑                               */
              /* -------------------------------------------------------------------------- */

            } catch (parseError) {
              console.error('Error parsing JSON:', parseError);
            }
          });
        } else if (stats.isDirectory()) {
          readJSONFiles(filePath); // 递归处理子文件夹
        }
      });
    });
  });
}

interface Item {
  颜色: string;
  商品标题: string;
  尺码?: string;
}

function extractAndGenerate(input: Item[]): Item[] {
  // 检查有尺码的元素和有颜色的元素的数量
  let 尺码数量 = 0;
  let 颜色数量 = 0;

  input.forEach(item => {
    if (item.尺码) {
      尺码数量++;
    }
    if (item.颜色) {
      颜色数量++;
    }
  });
  console.log("🚀 ~ extractAndGenerate ~ 尺码数量:", 尺码数量)
  console.log("🚀 ~ extractAndGenerate ~ 颜色数量:", 颜色数量)

  const 数组: string[] = [];
  const bbl = 尺码数量 > 颜色数量 ? '颜色' : '尺码'
  console.log("🚀 ~ extractAndGenerate ~ bbl:", bbl)

  // 提取少的那个字段
  input.forEach(item => {
    if (item[bbl]) {
      数组.push(item[bbl] as string);
      delete item[bbl]; // 删除原始数组中的尺码/颜色字段
    }
  });
  console.log("🚀 ~ extractAndGenerate ~ 数组:", 数组)

  // 生成新的对象数组
  const 新数组: Item[] = [];
  数组.forEach(i => {
    input.forEach(item => {
      const newItem: Item = {
        颜色: 尺码数量 > 颜色数量 ? i : item.颜色,
        商品标题: item.商品标题,
        尺码: 尺码数量 > 颜色数量 ? item.尺码 : i
      };
      新数组.push(newItem);
    });
  });

  console.log(新数组.length);

  return 新数组;
}

readJSONFiles(dir);

