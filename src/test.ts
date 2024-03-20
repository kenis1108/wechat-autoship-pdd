/*
 * @Author: kenis 1836362346@qq.com
 * @Date: 2024-03-18 10:08:26
 * @LastEditors: kenis 1836362346@qq.com
 * @LastEditTime: 2024-03-20 21:51:21
 * @FilePath: \wechat-autoship-pdd\src\test.ts
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import startAutoma from "./spider/automa";
import bot from "./wechaty";
import shipping from './spider/puppeteer/shipping';
import { readJSONFiles } from "../models/getProduct";

// 测试将sku的json转存入数据库
// readJSONFiles('public/sku/1');
// readJSONFiles('public/sku/2');

// 测试keymousego+automa爬取订单查询的数据并将数据写入database
// startAutoma()

// 测试微信机器人读取微信群信息，计算成本价，生成发货模板
// bot.start()

// 测试读取xlsx文件的订单号和快递单号自动填写到订单查询页面里
// shipping()

