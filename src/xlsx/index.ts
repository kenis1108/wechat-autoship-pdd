/*
 * @Author: kenis 1836362346@qq.com
 * @Date: 2024-03-08 22:51:41
 * @LastEditors: kenis 1836362346@qq.com
 * @LastEditTime: 2024-03-25 23:01:19
 * @FilePath: \wechaty-pdd-auto\src\xlsx.ts
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import * as XLSX from 'xlsx';
import { DATA_NUM_MSG, DEBOUNCE_TIME, MERGE_COLUMNS, ORDERQUERY_HEADER_DATA, SHIPPING_PATH, TEMPLATE_PATH, WECHAT_HEADER_DATA } from '../../config';
import { deleteFile, isFileExists, mergeTablesByColumn, mergeTablesByColumns } from "../../utils";
import _ from 'lodash';
import { MessageInterface } from 'wechaty/impls';
import { AppendDataToXlsxParams } from '../../@types';
import XlsxPopulate from 'xlsx-populate';
import { log } from 'wechaty';
import SQLiteDB from '../../models';
import { ShippingTableRow, shippingTable } from '../../models/tables/shipping';
import { WechatyTableRow, wechatyTable } from '../../models/tables/wechaty';
import { orderQueryTable, orderQueryTableRow } from '../../models/tables/orderQuery';
import shipping from '../spider/puppeteer/shipping';

/**
 * 新建xlsx文件
 * @param data 存入新建xlsx文件的数据
 * @param filePath 文件路径
 */
export async function createNewXlsx(data: string[][], filePath: string) {
  // 创建一个新的工作簿
  const workbook = XLSX.utils.book_new();
  // 创建一个新的工作表
  const worksheet = XLSX.utils.aoa_to_sheet(data);
  // 将工作表添加到工作簿
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');

  // 将工作簿写入到文件
  XLSX.writeFile(workbook, filePath);

  log.info(`已新建xlsx文件: ${filePath}`);
}

/**
 * 追加数据到XLSX文件里
 * @param sourceFilePath 被追加数据的源文件,如果不存在会新建一个
 * @param data 要追加的数据 暂时只支持array to array的格式
 * @param newFileheader 如果不存在就新建文件，这个是新文件的表头
 * @param saveNewFilePathAfterAddingData 另存为的文件路径
 */
export async function appendDataToXlsx(params: AppendDataToXlsxParams) {
  const { sourceFilePath, data, newFileheader = [], saveNewFilePathAfterAddingData = '' } = params
  if (!isFileExists(sourceFilePath)) {
    createNewXlsx([...newFileheader, ...data], sourceFilePath)
  } else {
    await XlsxPopulate.fromFileAsync(sourceFilePath)
      .then((workbook: any) => {
        // 获取第一个 sheet
        const sheet = workbook.sheet(0);

        // 读取所有数据 Get 2D array of all values in the worksheet.
        const sheetAllData = sheet.usedRange().value();

        // 将新数据写到 sheet原来数据之后的第一行及之后
        sheet.cell(`A${sheetAllData.length + 1}`).value(data);

        // 将更新后的工作表保存到 原来的/另存新的 Excel 文件
        return workbook.toFileAsync(saveNewFilePathAfterAddingData || sourceFilePath);
      })
      .then(() => {
        log.info('数据已成功追加到 Excel 文件。');
      })
      .catch((error: any) => {
        log.error('发生错误：', error);
      });
  }
}

/** 读取xlsx数据转成js对象 */
export function readExcelToJson(filePath: string): string[][] {
  if (!isFileExists(filePath)) {
    return []
  }
  // 读取 Excel 文件
  const workbook = XLSX.readFile(filePath);

  // 获取第一个工作表
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];

  // 将工作表数据转换为 JavaScript 对象
  const jsonData = XLSX.utils.sheet_to_json(sheet, { header: 1 }) as string[][];

  return jsonData;
}

/**
 * 合并两个文件生产新的符合拼多多发货模板的xlsx文件
 */
async function mergeXlsx(wechatyInstance: MessageInterface) {
  await deleteFile(SHIPPING_PATH)
  /** 根据收件人名称合并orderQuery表和wechaty表的数据生成符合拼多多发货模板的xlsx */
  log.info('根据收件人名称合并orderQuery表和wechaty表的数据生成符合拼多多发货模板的xlsx');
  const db = new SQLiteDB('autoship.db');

  const data1: string[][] = []
  // 只要一个小时内接收的信息
  db.queryByCond(wechatyTable, "createdAt >= datetime('now', '-1 hours')")?.forEach((item: WechatyTableRow) => {
    const { expressTrackingNum, consignee, extensionNum = '', createdAt } = item
    data1.push([expressTrackingNum, consignee, extensionNum, createdAt as string])
  })

  const data2: string[][] = []
  // 拿出48小时内成交的
  db.queryByCond(orderQueryTable, "transactionTime >= datetime('now', '-48 hours')")?.forEach((item: orderQueryTableRow) => {
    const { orderNum, productTitle, consignee, extensionNum = '', address, sku, transactionTime } = item
    data2.push([orderNum, productTitle, consignee, extensionNum, address, sku, transactionTime])
  })

  // TODO：
  // 1. 有收件人，有分机号 ----- 收件人相同，分机号不同
  // 2. 有收件人，没有分机号
  // const mergeData = mergeTablesByColumn([...WECHAT_HEADER_DATA, ...data1], [...ORDERQUERY_HEADER_DATA, ...data2], MERGE_COLUMNS)

  const mergeData = mergeTablesByColumns([...WECHAT_HEADER_DATA, ...data1], [...ORDERQUERY_HEADER_DATA, ...data2], ['收件人名称', '分机号'])

  log.info(JSON.stringify(mergeData));
  // 如果该数组长度<2,说明没有找到匹配的订单号
  wechatyInstance.say(DATA_NUM_MSG(mergeData.length - 1))
  if (mergeData.length < 2) {
    return
  }
  const data = mergeData.slice(1)
  // 读取发货模板，然后将新数据插入发货模板的最后面并生成一个新的文件
  await appendDataToXlsx({
    sourceFilePath: TEMPLATE_PATH,
    data,
    saveNewFilePathAfterAddingData: SHIPPING_PATH
  })

  // data.forEach(item => {
  //   db.insertOne<ShippingTableRow>(shippingTable, {
  //     orderNum: item[0],
  //     expressTrackingNum: item[2]
  //   })
  // })
  db.close()

  shipping(wechatyInstance)
}

/** 防抖：规定时间内如果没有接收到新的消息就启动合并文件的程序，有就重新计时 */
export const debouncedMergeXlsx = _.debounce(mergeXlsx, DEBOUNCE_TIME)