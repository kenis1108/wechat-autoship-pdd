/**
 * 商品价格表名
 */
export const productTable = 'product'

/**
 * product建表语句
 */
export const createProductTableSql = `
  CREATE TABLE product (
    id INTEGER PRIMARY KEY,
    title TEXT NOT NULL,  -- 商品标题
    alias TEXT NOT NULL,  -- 报单的名
    sku1 TEXT NOT NULL,  -- 商品属性1
    sku2 TEXT,  -- 商品属性2
    cost TEXT NOT NULL,  -- 成本价
    createdAt TEXT DEFAULT (datetime('now', 'localtime'))
  );
`
export interface ProductTableRow {
  /** 商品标题 */
  title: string;
  /** 报单的名 */
  alias: string;
  /** 商品属性1 */
  sku1: string;
  /** 商品属性2 */
  sku2: string;
  /** 成本价 */
  cost: string;
}

export default {
  tableName: productTable,
  sql: createProductTableSql,
}