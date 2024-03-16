/*
 * @Author: kenis 1836362346@qq.com
 * @Date: 2024-03-16 13:42:18
 * @LastEditors: kenis 1836362346@qq.com
 * @LastEditTime: 2024-03-16 14:12:42
 * @FilePath: \wechat-autoship-pdd\models\tables\price.ts
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%
 */
/**
 * 商品价格表名
 */
export const priceTable = 'price'

/**
 * price建表语句
 */
export const createPriceTableSql = `
  CREATE TABLE price (
    id INTEGER PRIMARY KEY,
    productName TEXT NOT NULL,  -- 产品名
    unit TEXT,  -- 单位
    size TEXT,  -- 规格
    sizePrice TEXT NOT NULL,  -- 不同规格的对应价钱
    remarks TEXT,  -- 备注
    createdAt TEXT DEFAULT (datetime('now', 'localtime'))
  );
`
export interface priceTableRow {
  /** 产品名 */
  productName: string;
  /** 单位 */
  unit: string;
  /** 规格 */
  size: string;
  /** 不同规格对应的价钱 */
  sizePrice: string;
  /** 备注 */
  remarks: string;
}