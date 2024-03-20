/*
 * @Author: kenis 1836362346@qq.com
 * @Date: 2024-03-16 11:42:47
 * @LastEditors: kenis 1836362346@qq.com
 * @LastEditTime: 2024-03-20 17:35:29
 * @FilePath: \wechat-autoship-pdd\models\tables\wechaty.ts
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
/**
 * 获取微信信息表名
 */
export const wechatyTable = 'wechaty'

/**
 * wechaty建表语句
 */
export const createWechatyTableSql = `
  CREATE TABLE wechaty (
    id INTEGER PRIMARY KEY,
    expressTrackingNum TEXT NOT NULL UNIQUE,  -- 快递单号
    consignee TEXT NOT NULL,  -- 收件人
    extensionNum TEXT ,  -- 分机号
    createdAt TEXT DEFAULT (datetime('now', 'localtime'))
  );
`

export interface WechatyTableRow {
  /** 快递单号 */
  expressTrackingNum: string;
  /** 收件人 */
  consignee: string;
  /** 分机号 */
  extensionNum: string;
  createdAt?: string;
}

export default {
  tableName: wechatyTable,
  sql: createWechatyTableSql,
}