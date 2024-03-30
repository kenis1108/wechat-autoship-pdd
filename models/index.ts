/*
 * @Author: kenis 1836362346@qq.com
 * @Date: 2024-03-16 10:08:46
 * @LastEditors: kenis 1836362346@qq.com
 * @LastEditTime: 2024-03-22 10:56:52
 * @FilePath: \wechat-autoship-pdd\models\index.ts
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import BetterSqlite3 from 'better-sqlite3';
import { log } from 'wechaty';
import tables from './tables'

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
  public createTableIfNotExists(tableName: string, sql: string) {
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

  /** 删除库中所有的表 */
  private delAllTable() {
    // 查询所有的表名
    const tables = this.db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all();
    // 删除每个表
    tables.forEach((table) => {
      this.db.prepare(`DROP TABLE IF EXISTS ${(table as { name: string }).name}`).run();
    });
  }

  /** 
   * 初始化所有表格
   * @todo 可以遍历tables下的文件来创建每一张表
   */
  public init(): void {
    this.delAllTable()
    tables.forEach(item => {
      this.createTableIfNotExists(item.tableName, item.sql)
    })
  }

  /**
   * insert单条数据
   * @param tableName 
   * @param data 
   * @param isReplace 是否在存在唯一值冲突的时候替换所有值
   */
  public insertOne<T extends Row>(tableName: string, data: T, isReplace?: boolean) {
    try {
      // 构建 INSERT 语句
      const columns = Object.keys(data).join(', ');
      const placeholders = Object.keys(data).map(() => '?').join(', ');
      const sql = `INSERT ${isReplace ? 'OR REPLACE' : ''} INTO ${tableName} (${columns}) VALUES (${placeholders})`;
      // 准备 INSERT 语句
      const stmt = this.db.prepare(sql);
      // 执行 INSERT 语句
      stmt.run(Object.values(data));
    } catch (err) {
      log.error(err as any)
    }
  }

  /**
   * 查询表中所有符合条件的数据
   * @param tableName 要查询的表名
   * @param condition 查询条件
   * @returns 查询结果数组
   */
  public queryByCond(tableName: string, condition?: string): any[] {
    try {
      // 构建 SQL 查询语句
      const sql = condition ? `SELECT * FROM ${tableName} WHERE ${condition}` : `SELECT * FROM ${tableName}`;
      // 准备查询语句
      const stmt = this.db.prepare(sql);
      // 执行查询并返回结果数组
      return stmt.all();
    } catch (err) {
      log.error(err as any)
      return [];
    }
  }

  /**
   * 查询表中所有符合条件并去重的一列数据
   * @param tableName 要查询的表名
   * @param dColumn 去重的列名
   * @param condition 查询条件
   * @returns 查询结果数组
   */
  public queryDistinctColumnByCond(tableName: string, dColumn: string, condition?: string): any[] {
    try {
      // 构建 SQL 查询语句
      const sql = condition ? `SELECT DISTINCT ${dColumn} FROM ${tableName} WHERE ${condition}` : `SELECT DISTINCT ${dColumn} FROM ${tableName}`;
      // 准备查询语句
      const stmt = this.db.prepare(sql);
      // 执行查询并返回结果数组
      return stmt.all();
    } catch (err) {
      log.error(err as any)
      return [];
    }
  }


  /** 关闭数据库连接 */
  public close(): void {
    this.db.close();
  }

}

export default SQLiteDB