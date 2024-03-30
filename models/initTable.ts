/*
 * @Author: kenis 1836362346@qq.com
 * @Date: 2024-03-17 16:57:49
 * @LastEditors: kenis 1836362346@qq.com
 * @LastEditTime: 2024-03-30 22:09:30
 * @FilePath: \wechat-autoship-pdd\models\initTable.ts
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
// 该文件用于初始化数据库中的表
import SQLiteDB from ".";
import { SHIPPING_PATH } from "../config";
import { deleteFile } from "../utils";
import { shippingTable, createShippingTableSql } from "./tables/shipping";

deleteFile(SHIPPING_PATH)

const db = new SQLiteDB('autoship.db');
// 初始化所有表格
// db.init()

// 单独初始化shipping表
db.createTableIfNotExists(shippingTable, createShippingTableSql)

db.close()