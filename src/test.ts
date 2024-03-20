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
bot.start()

// 测试读取xlsx文件的订单号和快递单号自动填写到订单查询页面里
// shipping()

