/*
 * @Author: kenis 1836362346@qq.com
 * @Date: 2024-03-09 11:39:45
 * @LastEditors: kenis 1836362346@qq.com
 * @LastEditTime: 2024-03-21 14:27:27
 * @FilePath: \wechaty-pdd-auto\src\config.ts
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import os from 'os';
import { SpiderMode } from '../@types';
/* -------------------------------------------------------------------------- */
/*                                  file path                                 */
/* -------------------------------------------------------------------------- */
const homedir = os.homedir()
/** 发货模板文件路径 */
export const TEMPLATE_PATH = '发货模板.xlsx'
/** 最终生成的发货文件路径 */
export const SHIPPING_PATH = 'public/shipping.xlsx';
/** automa导出的json文件路径 */
export const AUTOMA_JSON_PATH = `${homedir}\\Downloads\\automa.json`;
/* -------------------------------------------------------------------------- */
/*                                table columns                               */
/* -------------------------------------------------------------------------- */
/** 将微信信息处理后导出的文件表头配置 */
export const WECHAT_HEADER_DATA = [
  ['快递单号', '收件人名称', '分机号', '接收时间']
]
/** 爬虫获取的订单数据转成xlsx文件表头配置 */
export const ORDERQUERY_HEADER_DATA = [
  ['订单号', '商品标题', '收件人名称', '分机号', '收货地址', 'sku', '成交时间']
]
/** 最终的发货文件的列配置 */
export const SHIPPING_TEMPLATE_COLUMNS = ['订单号', '快递公司', '快递单号']
/** 根据特定列的值来合并两个表 */
export const MERGE_COLUMNS = '收件人名称'

/* -------------------------------------------------------------------------- */
/*                                   prompt                                   */
/* -------------------------------------------------------------------------- */
export const NOT_IN_FORMAT_MSG = '提示：输入的信息没有找到快递单号'
/** 提示找到多少条匹配的订单 */
export const DATA_NUM_MSG = (num: number) => num ? `提示：找到${num}条匹配的订单，开始上传发货信息` : `提示：没有找到单号匹配的订单`

/* -------------------------------------------------------------------------- */
/*                                    other                                   */
/* -------------------------------------------------------------------------- */
/** 固定的列名和列值 */
export const SHIPPING_NAME = { label: '快递公司', value: '中通快递' }
export const DATE_FORMAT = "YYYY-MM-DD HH:mm:ss"
/** 配置接收信息后的启动合并文件的防抖时间 */
export const DEBOUNCE_TIME = 30 * 1000
/** 两次消息之间的时间差不能大于这个值 */
export const TWO_MSG_TIME_DIFFERENCE = 60 * 1000
/** 多久执行一次获取automa.json */
export const GET_AUTOMAJSONTIME = 30 * 60 * 1000

/**
 * 爬虫模式
 * 1. automa
 * 2. puppeteer
 */
export const SPIDER_MODE: SpiderMode = 'automa'

/** 拼多多后台订单查询地址 */
export const ORDER_QUERY_URL = 'https://mms.pinduoduo.com/orders/list';

/** 报单的数量单位 */
export const QUANTITY_UNIT_OF_ORDER = ['条', '套', '对']
/** 报单的款式单位 */
export const ALIAS_UNIT_OF_ORDER = ['A款', 'C款', '大号', '小号', '100cm', '110cm', '120cm', '130cm', '140cm', '150cm', '底座单买']

/** 浏览器websock实例 */
export const BROWSER_WS_ENDPOINT = 'ws://localhost:9222/devtools/browser/7e68d982-4f4b-48d1-b928-b4db6c1abc3b'