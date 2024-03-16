import SQLiteDB from '../models';
import { WechatyTableRow, wechatyTable } from '../models/tables/wechaty';

const db = new SQLiteDB('autoship.db');
db.init()
db.close();