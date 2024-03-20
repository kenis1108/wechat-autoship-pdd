/*
 * @Author: kenis 1836362346@qq.com
 * @Date: 2024-03-16 11:48:03
 * @LastEditors: kenis 1836362346@qq.com
 * @LastEditTime: 2024-03-19 22:31:37
 * @FilePath: \wechat-autoship-pdd\models\tables\orderQuery.ts
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
/**
 * 爬取订单详情表名
 */
export const orderQueryTable = 'orderQuery'

/**
 * orderQuery建表语句
 */
export const createOrderQueryTableSql = `
  CREATE TABLE orderQuery (
    id INTEGER PRIMARY KEY,
    orderNum TEXT NOT NULL UNIQUE,  -- 订单编号
    transactionTime TEXT NOT NULL, -- 成交时间
    productTitle TEXT NOT NULL,  -- 商品标题
    sku TEXT NOT NULL,  -- 商品属性
    address TEXT NOT NULL,  -- 收货地址
    consignee TEXT NOT NULL,  -- 收件人
    extensionNum TEXT,  -- 分机号
    createdAt TEXT DEFAULT (datetime('now', 'localtime'))
  );
`
export interface orderQueryTableRow {
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
  tableName: orderQueryTable,
  sql: createOrderQueryTableSql,
}