/*
 * @Author: kenis 1836362346@qq.com
 * @Date: 2024-03-18 10:08:26
 * @LastEditors: kenis 1836362346@qq.com
 * @LastEditTime: 2024-04-29 11:05:30
 * @FilePath: \wechat-autoship-pdd\src\test.ts
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import startAutoma from "./spider/automa";
import bot, { matchETNTextWithReg } from "./wechaty";
import shipping from './spider/puppeteer/shipping';
import { readJSONFiles } from "../models/getProduct";
import startPuppeteer from "./spider/puppeteer";
import SQLiteDB from "../models";
import { shippingTable } from "../models/tables/shipping";

// 测试将sku的json转存入数据库
// readJSONFiles('public/sku/1');
// readJSONFiles('public/sku/2');

// 测试keymousego+automa爬取订单查询的数据并将数据写入database
// startAutoma()

// 测试puppeteer爬取订单查询的数据并将数据写入database
// startPuppeteer()

// 测试微信机器人读取微信群信息，计算成本价，生成发货模板
// bot.start()

// 测试读取xlsx文件的订单号和快递单号自动填写到订单查询页面里
// shipping()

/**
 * TODO: 测试下面是否能通过
 * 1. 78779856323821   77[7105]
 * 2. 78779855409756楊蕙慈
 * 3. 78779856323821   77[7105]\s\s\s78779855409756楊蕙慈
 * 4. 78779856323821   77[7105]\n78779855409756楊蕙慈
 * 5. 78779855409756   楊蕙慈   78779855108257丫丫[3199]
 * 6. 78779856323821   77 [7105]     78779855409756    楊蕙慈
 * TODO: 7. 78790354608806 LENA GOH[5029] # 名字里带了空格的也需要做处理，妈了个巴子
 */
const input = `78790354608806 LENA GOH[5029] 78779856323821   77 [7105]`
const eTNMsgArr = matchETNTextWithReg(input)
if (eTNMsgArr.length) {
  // 解析数据并存储
  const regex = /\[\d{4}\]/
  eTNMsgArr.forEach((item) => {
    let expressTrackingNum = item.slice(0, 14);
    let consignee = ''
    let extensionNum = ''
    // 有分机号的情况
    if (regex.test(item)) {
      consignee = item.slice(14, -6).trim();
      extensionNum = item.slice(-6).slice(1, 5);
    } else {
      consignee = item.slice(14).trim();
    }
    console.log(expressTrackingNum);
    console.log(consignee);
    console.log(extensionNum);
  })
}