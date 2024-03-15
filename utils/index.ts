/*
 * @Author: kenis 1836362346@qq.com
 * @Date: 2024-03-08 20:21:59
 * @LastEditors: kenis 1836362346@qq.com
 * @LastEditTime: 2024-03-15 19:09:33
 * @FilePath: \wechaty-pdd-auto\src\utils.ts
 * @Description: 存放工具函数的文件
 */

import { SHIPPING_TEMPLATE_COLUMNS, SHIPPING_NAME, TWO_MSG_TIME_DIFFERENCE, DATE_FORMAT } from "../config";
import * as fs from 'fs';
import _ from "lodash";
import * as fsp from 'fs/promises';
import moment from "moment";
import { log } from "wechaty";

/* -------------------------------------------------------------------------- */
/*                               String start                                 */
/* -------------------------------------------------------------------------- */
/** 
 * 使用正则匹配一段文本中所有符合的文本，返回数组
 * filter(Boolean) 的效果是将数组中的空字符串移除。
 */
export function extractMatchingText(input: string,regex:RegExp): string[] {
  const lines = input.split(/\n/).filter(Boolean);

  const matchingTextArray: string[] = [];

  for (const line of lines) {
    const words = line.split(/\s+/).filter(Boolean);

    for (const word of words) {
      if (regex.test(word)) {
        matchingTextArray.push(word);
      }
    }
  }

  return matchingTextArray;
}

/** 
 * 移除字符串中类似css样式的文本
 */
export function removeCSS(text: string): string {
  const regex = /\.[-\w]+\s*{[^}]*}/g;
  return text.replace(regex, '');
}
/* -------------------------------------------------------------------------- */
/*                                String end                                  */
/* -------------------------------------------------------------------------- */
/**
 * 获取本地文件的创建时间,并和当前时间对比是否超过一个小时
 * @param filePath 
 */
export async function getFileCreateTime(filePath: string) {
  if (isFileExists(filePath)) {
    const stats = await fsp.stat(filePath);
    const createTime = stats.birthtime; // 获取文件创建时间
    const currentTime = new Date(); // 获取当前时间

    const timeDiff = currentTime.getTime() - createTime.getTime();
    const hoursDiff = timeDiff / (1000 * 60 * 60); // 转换为小时

    log.info('文件创建时间:', moment(createTime).format(DATE_FORMAT));
    log.info('当前时间:', moment(currentTime).format(DATE_FORMAT));
    log.info('时间差（小时）:', hoursDiff);

    if (hoursDiff > 1) {
      log.info('文件创建时间超过一个小时。');
    } else {
      log.info('文件创建时间不足一个小时。');
    }
    return hoursDiff > 1
  } else {
    log.info('文件不存在，开始生成新文件');
    return true
  }
}

/** 根据某列的值来合并两个二维数组 */
export function mergeTablesByColumn(table1: any[][], table2: any[][], mergeColumn: string): any[][] {
  // 找到指定列的索引
  const columnIndex1 = table1[0].indexOf(mergeColumn);
  const columnIndex2 = table2[0].indexOf(mergeColumn);

  // 如果未找到指定列，直接返回原始表格
  if (columnIndex1 === -1 || columnIndex2 === -1) {
    log.error(`Column "${mergeColumn}" not found in one of the tables.`);
    return [];
  }

  // 合并列名
  const mergedColumns = [...table1[0], ...table2[0], SHIPPING_NAME.label];

  // 合并数据行
  const mergedData = [];
  for (let i = 1; i < table1.length; i++) {
    for (let j = 1; j < table2.length; j++) {
      // 如果指定列的值相同，则合并行数据
      if (table1[i][columnIndex1] === table2[j][columnIndex2]) {
        const mergedRow = [...table1[i], ...table2[j], SHIPPING_NAME.value];
        mergedData.push(mergedRow);
      }
    }
  }

  // 构建新表格
  const mergedTable = [mergedColumns, ...mergedData];
  return extractColumns(mergedTable, SHIPPING_TEMPLATE_COLUMNS);
}

/** 从二维数组中提取想要的列构成新的二维数组 */
export function extractColumns(originalArray: any[][], columnsToExtract: string[]): any[][] {
  // 找到指定列的索引
  const columnIndices = columnsToExtract.map(column => originalArray[0].indexOf(column));

  // 创建新的二维数组，包含指定列
  const newArray = originalArray.map(row => columnIndices.map(index => row[index]));

  return newArray;
}

/** 判断文件是否存在 */
export function isFileExists(filePath: string) {
  try {
    fs.accessSync(filePath, fs.constants.F_OK);
    return true;
  } catch (err) {
    log.error(`${(err as Error).message}`)
    return false;
  }
}

/** 延时函数 */
export function delay(milliseconds: number) {
  return new Promise(resolve => {
    setTimeout(resolve, milliseconds);
  });
}

/**
 * 对比两次接收消息的时间类
 * @example
 * const messageTimeDiff = new MessageTimeDiff();
 * messageTimeDiff.receiveMessage('第一条消息');
 */
export class MessageTimeDiff {
  /** 存放消息时间的数组 */
  private messages: { message: string; time: Date }[] = [];

  // 接收消息的方法
  receiveMessage(message: string) {
    const currentTime = new Date();

    // 添加当前消息到消息数组
    this.messages.push({ message, time: currentTime });

    // 判断前后两条消息之间的时间差
    return this.checkTimeDifference();
  }

  // 判断前后两条消息之间的时间差
  private checkTimeDifference() {
    const messagesCount = this.messages.length;

    // 至少有两条消息才能比较时间差
    if (messagesCount >= 2) {
      const lastMessage = this.messages[messagesCount - 1];
      const secondLastMessage = this.messages[messagesCount - 2];

      const timeDifference = lastMessage.time.getTime() - secondLastMessage.time.getTime();

      // 设定的时间差（以毫秒为单位）
      const setTimeDifference = TWO_MSG_TIME_DIFFERENCE;

      // if (timeDifference > setTimeDifference) {
      // console.log('时间差大于设定值，处理逻辑...');
      // }
      return timeDifference > setTimeDifference
    }
  }
}