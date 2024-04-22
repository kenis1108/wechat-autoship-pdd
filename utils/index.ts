/*
 * @Author: kenis 1836362346@qq.com
 * @Date: 2024-03-08 20:21:59
 * @LastEditors: kenis 1836362346@qq.com
 * @LastEditTime: 2024-04-22 16:34:54
 * @FilePath: \wechaty-pdd-auto\src\utils.ts
 * @Description: 存放工具函数的文件
 */

import { SHIPPING_TEMPLATE_COLUMNS, SHIPPING_NAME, TWO_MSG_TIME_DIFFERENCE, DATE_FORMAT, JSON_VERSION_URL, setBROWSER_WS_ENDPOINT, getBROWSER_WS_ENDPOINT } from "../config";
import * as fs from 'fs';
import _ from "lodash";
import * as fsp from 'fs/promises';
import moment from "moment";
import { log } from "wechaty";
import axios from 'axios';
import { exec } from "child_process";

/* -------------------------------------------------------------------------- */
/*                               String start                                 */
/* -------------------------------------------------------------------------- */
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

/** 
 * 根据某些列的值来合并两个二维数组 
 * 函数会检查每个指定的列是否同时存在于两个表格中，只有在两个表格中都存在的列才会被用于比较
 */
export function mergeTablesByColumns(table1: any[][], table2: any[][], mergeColumns: string[]): any[][] {
  // 找到两个表格中都存在的指定列的索引
  const columnIndices1: number[] = [];
  const columnIndices2: number[] = [];

  mergeColumns.forEach((column) => {
    if (table1[0].includes(column) && table2[0].includes(column)) {
      columnIndices1.push(table1[0].indexOf(column));
      columnIndices2.push(table2[0].indexOf(column));
    }
  });

  // 合并列名
  const mergedColumns = [...table1[0], ...table2[0], SHIPPING_NAME.label];

  // 合并数据行
  const mergedData = [];
  for (let i = 1; i < table1.length; i++) {
    for (let j = 1; j < table2.length; j++) {
      // 初始化标志，用于判断所有指定列的值是否都相同
      let allColumnsMatch = true;
      mergeColumns.forEach((column, index) => {
        if (table1[i][columnIndices1[index]] !== table2[j][columnIndices2[index]]) {
          allColumnsMatch = false;
        }
      });

      // 如果所有指定列的值都相同，则合并行数据
      if (allColumnsMatch) {
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
 * 删除文件的函数
 * @param filePath 要删除的文件路径
 * @returns 如果删除成功，则返回 true；否则返回 false
 */
export async function deleteFile(filePath: string): Promise<boolean> {
  try {
    if (!isFileExists(filePath)) {
      return false
    }
    // 使用 fs.promises.unlink() 方法删除文件
    await fs.promises.unlink(filePath);
    console.log(`文件 ${filePath} 删除成功`);
    return true;
  } catch (error) {
    console.error(`删除文件 ${filePath} 出错:`, error);
    return false;
  }
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

/**
 * 返回这个数字除以2的商*4，如果无法整除那就用(商+1)*4
 * @param num 
 * @returns 
 */
export function calculateETPrice(num: number): number {
  const quotient = Math.floor(num / 2); // 商
  const remainder = num % 2; // 余数

  if (remainder === 0) {
    return quotient * 4;
  } else {
    return (quotient + 1) * 4;
  }
}


/** 
 * 打开浏览器后获取BROWSER_WS_ENDPOINT
 */
export async function getBrowserWSEndpoint() {
  exec('powershell scripts/start_browser.ps1')
  await delay(3000)
  await axios.get(JSON_VERSION_URL)
    .then(({ data }) => {
      if (data?.webSocketDebuggerUrl) {
        setBROWSER_WS_ENDPOINT(data?.webSocketDebuggerUrl)
        console.log("🚀 ~ .then ~ getBROWSER_WS_ENDPOINT():", getBROWSER_WS_ENDPOINT())
      }
    })
    .catch(error => {
      console.error(error);
    });
}