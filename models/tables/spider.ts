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