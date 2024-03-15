/*
 * @Author: kenis 1836362346@qq.com
 * @Date: 2024-03-08 22:51:41
 * @LastEditors: kenis 1836362346@qq.com
 * @LastEditTime: 2024-03-15 18:52:55
 * @FilePath: \wechaty-pdd-auto\src\xlsx.ts
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import * as fs from 'fs';
import * as XLSX from 'xlsx';
import { DATA_NUM_MSG, DEBOUNCE_TIME, MERGE_COLUMNS, SHIPPING_PATH, TEMPLATE_PATH, WECHAT_HEADER_DATA } from '../../config';
import { SPIDER_XLSX_PATH, WECHATY_XLSX_PATH } from "../../config";
import { isFileExists, mergeTablesByColumn } from "../../utils";
import _ from 'lodash';
import { MessageInterface } from 'wechaty/impls';
import { AppendDataToXlsxParams } from '../../@types';
import XlsxPopulate from 'xlsx-populate';
import { log } from 'wechaty';

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

/** 根据某列的值合并两个xlsx文件 */
export const mergeTwoXlsxBasedOnColumn = (filePath1: string, filePath2: string, wechatyInstance: MessageInterface) => {
  if (!(isFileExists(filePath1) && isFileExists(filePath2))) {
    return
  }
  // 读取第一个 Excel 文件
  const data1 = readExcelToJson(filePath1);

  // 读取第二个 Excel 文件
  const data2 = readExcelToJson(filePath2);

  const mergeData = mergeTablesByColumn(data1, data2, MERGE_COLUMNS)

  log.info(JSON.stringify(mergeData));
  // 如果该数组长度<2,说明没有找到匹配的订单号
  wechatyInstance.say(DATA_NUM_MSG(mergeData.length - 1))
  if (mergeData.length < 2) {
    return
  }
  // 读取发货模板，然后将新数据插入发货模板的最后面并生成一个新的文件
  appendDataToXlsx({
    sourceFilePath: TEMPLATE_PATH,
    data: mergeData.slice(1),
    saveNewFilePathAfterAddingData: SHIPPING_PATH
  })
}

/** 读取xlsx数据转成js对象 */
export function readExcelToJson(filePath: string): string[][] {
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
  /** 给wechaty.xlsx去重 */
  log.info('给wechaty.xlsx去重');
  await deduplicateXlsx(WECHATY_XLSX_PATH)

  /** 合并spider.xlsx和wechaty.xlsx生成符合拼多多发货模板的xlsx */
  log.info('合并spider.xlsx和wachaty.xlsx生成符合拼多多发货模板的xlsx');
  mergeTwoXlsxBasedOnColumn(WECHATY_XLSX_PATH, SPIDER_XLSX_PATH, wechatyInstance)
}

/** 防抖：规定时间内如果没有接收到新的消息就启动合并文件的程序，有就重新计时 */
export const debouncedMergeXlsx = _.debounce(mergeXlsx, DEBOUNCE_TIME)

/**
 * XLSX文件数据去重函数
 * @param filePath 
 */
export async function deduplicateXlsx(filePath: string) {
  // 读取 XLSX 文件
  const workbook = XLSX.readFile(filePath);
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];

  // 将工作表转换成 JSON 格式的行数据
  const rows: any[] = XLSX.utils.sheet_to_json(worksheet);
  const columns = WECHAT_HEADER_DATA[0]
  const deduplicatedRows: any[] = [];

  rows.forEach((item) => {
    // 查找是否存在与当前行相同的前三列记录
    const duplicateIndex = deduplicatedRows.findIndex(
      (row) =>
        row[columns[0]] === item[columns[0]] &&
        row[columns[1]] === item[columns[1]] &&
        row[columns[2]] === item[columns[2]]
    );

    if (duplicateIndex === -1) {
      // 如果没有重复项，则直接添加当前记录
      deduplicatedRows.push(item);
    } else {
      // 如果存在重复项，则比较时间戳并保留较晚的记录
      const existingTimestamp = new Date(deduplicatedRows[duplicateIndex][columns[3]]);
      const currentTimestamp = new Date(item[columns[3]]);

      if (currentTimestamp > existingTimestamp) {
        deduplicatedRows[duplicateIndex] = item;
      }
    }
  });

  // 创建一个包含去重后行数据的新工作簿
  const newWorkbook: XLSX.WorkBook = {
    Sheets: { [sheetName]: XLSX.utils.json_to_sheet(deduplicatedRows) },
    SheetNames: [sheetName],
  };

  // 删除原来的文件
  try {
    fs.unlinkSync(filePath);
  } catch (err) {
    log.error('Error deleting file:', err);
  }

  // 将新工作簿保存到新文件中
  XLSX.writeFile(newWorkbook, filePath);
};