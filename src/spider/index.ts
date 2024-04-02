/*
 * @Author: kenis 1836362346@qq.com
 * @Date: 2024-03-15 15:31:47
 * @LastEditors: kenis 1836362346@qq.com
 * @LastEditTime: 2024-04-02 11:38:55
 * @FilePath: \wechat-autoship-pdd\src\spider\index.ts
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import moment from "moment";
import { SpiderMode } from "../../@types";
import SQLiteDB from "../../models";
import { orderQueryTable } from "../../models/tables/orderQuery";
import startAutoma from "./automa";
import startPuppeteer from "./puppeteer";
import { log } from "wechaty";

const spiderMap = {
  'automa': startAutoma,
  'puppeteer': startPuppeteer
}

export async function startSpider(mode: SpiderMode) {
  // 判断最新数据的时间
  const db = new SQLiteDB('autoship.db');
  const dateTime = db.queryByCond(orderQueryTable, { other: 'ORDER BY createdAt DESC LIMIT 1' })?.[0]?.createdAt
  db.close()
  if (dateTime) {
    let currentTime = moment();
    let inputTime = moment(dateTime);
    let timeDifference = currentTime.diff(inputTime, 'hours');

    if (Math.abs(timeDifference) >= 1) {
      log.info("时间差超过了一个小时");
      await spiderMap[mode]();
    } else {
      log.info("时间差在一个小时以内");
    }
  } else {
    await spiderMap[mode]();
  }

}
