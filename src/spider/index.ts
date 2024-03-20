/*
 * @Author: kenis 1836362346@qq.com
 * @Date: 2024-03-15 15:31:47
 * @LastEditors: kenis 1836362346@qq.com
 * @LastEditTime: 2024-03-20 18:16:47
 * @FilePath: \wechat-autoship-pdd\src\spider\index.ts
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import { SpiderMode } from "../../@types";
import startAutoma from "./automa";
import startPuppeteer from "./puppeteer";

const spiderMap = {
  'automa': startAutoma,
  'puppeteer': startPuppeteer
}

export async function startSpider(mode: SpiderMode) {
  await spiderMap[mode]()
}
