/*
 * @Author: kenis 1836362346@qq.com
 * @Date: 2024-03-16 11:48:03
 * @LastEditors: kenis 1836362346@qq.com
 * @LastEditTime: 2024-03-17 17:03:54
 * @FilePath: \wechat-autoship-pdd\models\tables\spider.ts
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
/**
 * 爬取订单详情表名
 */
export const spiderTable = 'spider'

/**
 * spider建表语句
 */
export const createSpiderTableSql = `
  CREATE TABLE spider (
    id INTEGER PRIMARY KEY,
    orderNum TEXT NOT NULL,  -- 订单编号
    transactionTime TEXT, -- 成交时间
    productTitle TEXT,  -- 商品标题
    sku TEXT,  -- 商品属性
    address TEXT,  -- 收货地址
    consignee TEXT,  -- 收件人
    extensionNum TEXT NOT NULL,  -- 分机号
    createdAt TEXT DEFAULT (datetime('now', 'localtime'))
  );
`
export interface spiderTableRow {
  /** 订单编号 */
  orderNum: string;
  /** 成交时间 */
  transactionTime: string;
  /** 商品标题 */
  productTitle: string;
  /** 商品属性 */
  sku: string;
  /** 收货地址 */
  address: string;
  /** 收件人 */
  consignee: string;
  /** 分机号 */
  extensionNum: string;
}

export default {
  tableName: spiderTable,
  sql: createSpiderTableSql,
}