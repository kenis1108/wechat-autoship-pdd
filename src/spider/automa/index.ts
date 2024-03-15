/*
 * @Author: kenis 1836362346@qq.com
 * @Date: 2024-03-15 15:20:42
 * @LastEditors: kenis 1836362346@qq.com
 * @LastEditTime: 2024-03-15 18:22:43
 * @FilePath: \wechat-autoship-pdd\src\spider\automa\index.ts
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import { exec } from "child_process";
import { AUTOMA_JSON_PATH, ORDER_HEADER_DATA, SPIDER_XLSX_PATH } from "../../../config";
import { delay, isFileExists } from "../../../utils";
import { log } from "wechaty";
import { createNewXlsx } from "../../xlsx";
import * as fs from 'fs';
import { AutomaJson } from "../../../@types";

/** 读取automa.json文件并处理数据后输出到xlsx */
export async function readJsonFile(filePath: string) {
  if (isFileExists(filePath)) {
    // 读取文件内容
    const fileContent = fs.readFileSync(filePath, 'utf-8');

    // 解析 JSON 数据
    // 订单编号：240309-402233834970071
    const jsonData: AutomaJson[] = JSON.parse(fileContent);
    const result = jsonData.filter(item => item.details.includes('订单编号')).map(({ details }) => {
      const all = details.trim().split('\n').filter(Boolean).filter(i => i !== '\t')
      log.info(`all.length: ${all.length}`);
      // const orderRegex = /^订单编号：\d{6}-\d{15}$/
      const order_sn = all.filter(i => i.includes('订单编号：'))[0].slice(5)
      const commodity = all[all.findIndex(i => i === '发货') + 1]
      const buyer = all[all.findIndex(i => /^\[\d{4}\]$/.test(i)) - 1]
      const fjNum = all[all.findIndex(i => /^\[\d{4}\]$/.test(i))].slice(1, 5)
      const address = all[all.findIndex(i => /^([\u4e00-\u9fa5]+省)\s([\u4e00-\u9fa5]+市)\s([\u4e00-\u9fa5]+区)\s.*\[(\d{4})\]$/.test(i))]
      return [
        order_sn, commodity, buyer, fjNum, address
      ]
    })

    log.info(JSON.stringify(result));
    // 返回解析后的 JSON 数据
    return result;
  } else {
    return null;
  }
}

const startAutoma = async () => {
  exec('pnpm keymousego') && await delay(3 * 60 * 1000);

  /** 将automa.json转成xlsx */
  const automaData = await readJsonFile(AUTOMA_JSON_PATH)
  if (automaData && automaData?.length > 0) {
    if (isFileExists(SPIDER_XLSX_PATH)) {
      fs.unlink(SPIDER_XLSX_PATH, (err) => {
        if (err) {
          log.error('Error deleting file:', err);
        } else {
          log.info(`删除${SPIDER_XLSX_PATH}成功`);
        }
      })
    }
    await createNewXlsx([...ORDER_HEADER_DATA, ...automaData], SPIDER_XLSX_PATH)
  }
}

export default startAutoma