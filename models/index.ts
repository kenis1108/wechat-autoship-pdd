/*
 * @Author: kenis 1836362346@qq.com
 * @Date: 2024-03-16 10:08:46
 * @LastEditors: kenis 1836362346@qq.com
 * @LastEditTime: 2024-03-16 13:09:37
 * @FilePath: \wechat-autoship-pdd\models\index.ts
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import BetterSqlite3 from 'better-sqlite3';
import { log } from 'wechaty';
import { createWechatyTableSql, wechatyTable } from './tables/wechaty';
import { createSpiderTableSql, spiderTable } from './tables/spider';
import { createShippingTableSql, shippingTable } from './tables/shipping';

interface Row {
  [key: string]: any;
}

class SQLiteDB {
  private db: BetterSqlite3.Database;

  /**
   *  SQLite操作类
   * @param filePath 
   */
  constructor(filePath: string) {
    this.db = new BetterSqlite3(filePath, { verbose: (...data: any[]) => log.info(`${data}`) });
  }

  /** 
   * 创建新表
   */
  private createTableIfNotExists(tableName: string, sql: string) {
    // 检查表是否存在 
    // @ts-ignore 
    const tableExists = this.db.prepare(`SELECT count(*) as count FROM sqlite_master WHERE type='table' AND name=?`).get(tableName).count > 0;
    // 如果表存在，则删除表
    if (tableExists) {
      this.db.prepare(`DROP TABLE ${tableName}`).run();
    }
    // 创建新表
    this.db.prepare(sql).run();
  }

  /** 
   * 初始化所有表格
   * @todo 可以遍历tables下的文件来创建每一张表
   */
  public init(): void {
    this.createTableIfNotExists(wechatyTable, createWechatyTableSql)
    this.createTableIfNotExists(spiderTable, createSpiderTableSql)
    this.createTableIfNotExists(shippingTable, createShippingTableSql)
  }

  /**
   * insert单条数据
   * @param tableName 
   * @param data 
   */
  public insertOne<T extends Row>(tableName: string, data: T) {
    // 构建 INSERT 语句
    const columns = Object.keys(data).join(', ');
    const placeholders = Object.keys(data).map(() => '?').join(', ');
    const sql = `INSERT INTO ${tableName} (${columns}) VALUES (${placeholders})`;
    // 准备 INSERT 语句
    const stmt = this.db.prepare(sql);
    // 执行 INSERT 语句
    stmt.run(Object.values(data));
  }

  /** 关闭数据库连接 */
  public close(): void {
    this.db.close();
  }

}

export default SQLiteDB