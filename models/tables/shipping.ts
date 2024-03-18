/*
 * @Author: kenis 1836362346@qq.com
 * @Date: 2024-03-16 11:48:04
 * @LastEditors: kenis 1836362346@qq.com
 * @LastEditTime: 2024-03-18 20:36:36
 * @FilePath: \wechat-autoship-pdd\models\tables\shipping.ts
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
/**
 * 最终订单编号和快递单号对应表名
 */
export const shippingTable = 'shipping'

/**
 * shipping建表语句
 */
export const createShippingTableSql = `
  CREATE TABLE shipping (
    id INTEGER PRIMARY KEY,
    orderNum TEXT NOT NULL,  -- 订单编号
    expressTrackingNum TEXT NOT NULL,  -- 快递单号
    createdAt TEXT DEFAULT (datetime('now', 'localtime'))
  );
`
export interface ShippingTableRow {
  /** 订单编号 */
  orderNum: string;
  /** 快递单号 */
  expressTrackingNum: string;
}

export default {
  tableName: shippingTable,
  sql: createShippingTableSql,
}