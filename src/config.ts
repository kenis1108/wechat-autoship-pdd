/*
 * @Author: kenis 1836362346@qq.com
 * @Date: 2024-03-09 11:39:45
 * @LastEditors: kenis 1836362346@qq.com
 * @LastEditTime: 2024-03-14 15:20:23
 * @FilePath: \wechaty-pdd-auto\src\config.ts
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import os from 'os';
const homedir = os.homedir()
/* -------------------------------------------------------------------------- */
/*                                  file path                                 */
/* -------------------------------------------------------------------------- */
/** 发货模板文件路径 */
export const TEMPLATE_PATH = '发货模板.xlsx'
/** 将微信信息处理后导出的文件路径 */
export const WECHATY_XLSX_PATH = 'assets/wechaty.xlsx';
/** automa数据转成xlsx文件路径 */
export const AUTOMA_XLSX_PATH = 'assets/automa.xlsx';
/** 最终生成的发货文件路径 */
export const SHIPPING_PATH = 'assets/shipping.xlsx';
/** automa导出的json文件路径 */
export const AUTOMA_JSON_PATH = `${homedir}\\Downloads\\automa.json`;

/* -------------------------------------------------------------------------- */
/*                                table columns                               */
/* -------------------------------------------------------------------------- */
/** 将微信信息处理后导出的文件表头配置 */
export const WECHAT_HEADER_DATA = [
  ['快递单号', '收件人名称', '分机号', '接收时间']
]
/** automa数据转成xlsx文件表头配置 */
export const AUTOMA_HEADER_DATA = [
  ['订单号', '商品标题', '收货人', '分机号', '收货地址']
]
/** 最终的发货文件的列配置 */
export const SHIPPING_TEMPLATE_COLUMNS = ['订单号', '快递公司', '快递单号']
/** 根据特定列的值来合并两个表 */
export const MERGE_COLUMNS = '分机号'

/* -------------------------------------------------------------------------- */
/*                                   prompt                                   */
/* -------------------------------------------------------------------------- */
export const NOT_IN_FORMAT_MSG = '提示：格式不符合要求\n\n格式要求：\n78771934918934郭海莉[9964]\n\n（多个单号可以使用空格和换行隔开）'
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







