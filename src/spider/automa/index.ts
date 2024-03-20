/*
 * @Author: kenis 1836362346@qq.com
 * @Date: 2024-03-15 15:20:42
 * @LastEditors: kenis 1836362346@qq.com
 * @LastEditTime: 2024-03-20 17:56:28
 * @FilePath: \wechat-autoship-pdd\src\spider\automa\index.ts
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import { exec } from "child_process";
import { AUTOMA_JSON_PATH} from "../../../config";
import { delay, isFileExists } from "../../../utils";
import * as fs from 'fs';
import { AutomaJson } from "../../../@types";
import SQLiteDB from "../../../models";
import { orderQueryTable, orderQueryTableRow } from "../../../models/tables/orderQuery";

/**
 * 
 * @param isKMG 是否启动keymousego
 */
const startAutoma = async (isKMG: boolean = true) => {
  const db = new SQLiteDB('autoship.db');
  /** 第一步：启动keymousego去启动automa下载automa.json */
  isKMG && exec('pnpm keymousego') && await delay(1 * 60 * 1000);

  /** 第二步：解析automa.json获取需要的数据存起来xlsx/database */
  if (isFileExists(AUTOMA_JSON_PATH)) {
    // 读取文件内容
    const fileContent = fs.readFileSync(AUTOMA_JSON_PATH, 'utf-8');

    // 解析 JSON 数据
    const jsonData: AutomaJson[] = JSON.parse(fileContent);
    jsonData.filter(item => item.details.includes('订单编号'))?.forEach(({ details }) => {
      const all = details.trim().split('\n').filter(Boolean).filter(i => i !== '\t')
      const orderNum = all.filter(i => i.includes('订单编号：'))?.[0]?.slice(5)
      const productTitle = all.findIndex(i => i === '发货') !== -1 ? all[all.findIndex(i => i === '发货') + 1] : ''
      const consignee = all.findIndex(i => i === '待发货') !== -1 ? all[all.findIndex(i => i === '待发货') + 4] : ''
      const indexOfExtensionNum = all.findIndex(i => /^\[\d{4}\]$/.test(i))
      const extensionNum = indexOfExtensionNum !== -1 ? all[indexOfExtensionNum].slice(1, 5) : ''
      const transactionTime = all.filter(i => i.includes('成交时间：'))?.[0]?.slice(5, 21)
      const sku = all.findIndex(i => i === '待发货') ? all[all.findIndex(i => i === '待发货') - 1] : ''
      // TODO: 该正则还需要改进，匹配不了所有情况
      const indexOfAddress = all.findIndex(i => /^([\u4e00-\u9fa5]+[省|市])\s([\u4e00-\u9fa5]+市)\s([\u4e00-\u9fa5]+[市|区|镇])\s.*$/.test(i))
      const address = indexOfAddress !== -1 ? all[indexOfAddress] : ''

      // 存入数据库
      db.insertOne<orderQueryTableRow>(orderQueryTable, {
        orderNum,
        transactionTime,
        productTitle,
        sku,
        address,
        consignee,
        extensionNum,
      })
    })
  }

  db.close()
}

export default startAutoma