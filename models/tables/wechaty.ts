/**
 * 表名
 */
export const wechatyTable = 'wechaty'

/**
 * wechaty建表语句
 */
export const createWechatyTableSql = `
  CREATE TABLE wechaty (
    id INTEGER PRIMARY KEY,
    expressTrackingNum TEXT,  -- 快递单号
    consignee TEXT,  -- 收件人
    extensionNum TEXT,  -- 分机号
    createdAt TEXT DEFAULT (datetime('now', 'localtime'))
  );
`

export interface WechatyTableRow {
  /** 快递单号 */
  expressTrackingNum: string
  /** 收件人 */
  consignee: string
  /** 分机号 */
  extensionNum: string
}