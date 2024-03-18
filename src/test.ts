import startAutoma from "./spider/automa";
import bot from "./wechaty";
import shipping from './spider/puppeteer/shipping';

// 测试keymousego+automa爬取订单查询的数据并将数据写入xlsx和database
startAutoma()

// 测试微信机器人读取微信群信息，提取需要的文本数据存入xlsx和database
// bot.start()

// 测试读取xlsx文件的订单号和快递单号自动填写到订单查询页面里
// shipping()