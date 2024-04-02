/*
 * @Author: kenis 1836362346@qq.com
 * @Date: 2024-03-08 15:33:01
 * @LastEditors: kenis 1836362346@qq.com
 * @LastEditTime: 2024-04-01 20:21:19
 * @FilePath: \wechaty-pdd-auto\src\index.ts
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import bot from './wechaty';
import { startSpider } from './spider';
import { SPIDER_MODE } from '../config';


(async () => {
  // 启动爬虫
  await startSpider(SPIDER_MODE);
  // 启动wechaty
  await bot.start()
})()
