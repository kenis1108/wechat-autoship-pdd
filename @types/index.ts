/*
 * @Author: kenis 1836362346@qq.com
 * @Date: 2024-03-08 20:37:48
 * @LastEditors: kenis 1836362346@qq.com
 * @LastEditTime: 2024-03-15 15:40:31
 * @FilePath: \wechaty-pdd-auto\src\types.ts
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
export interface AutomaJson {
  details: string;
}

export interface AppendDataToXlsxParams {
  /** 被追加数据的源文件,如果不存在会新建一个 */
  sourceFilePath: string;
  /** 要追加的数据 暂时只支持array to array的格式 */
  data: string[][];
  /** 如果不存在就新建文件，这个是新文件的表头 */
  newFileheader?: string[][];
  /** 另存为的文件路径 */
  saveNewFilePathAfterAddingData?: string;
}

/** 爬虫模式 */
export type SpiderMode = 'automa' | 'puppeteer'
