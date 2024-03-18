/*
 * @Author: kenis 1836362346@qq.com
 * @Date: 2024-03-15 15:12:37
 * @LastEditors: kenis 1836362346@qq.com
 * @LastEditTime: 2024-03-18 12:44:06
 * @FilePath: \wechat-autoship-pdd\src\wechaty\index.ts
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import { ScanStatus, WechatyBuilder, log } from "wechaty";
import qrcodeTerminal from 'qrcode-terminal';
import { MessageInterface } from "wechaty/impls";
import moment from "moment";
import { DATE_FORMAT, NOT_IN_FORMAT_MSG, SPIDER_MODE, WECHATY_XLSX_PATH, WECHAT_HEADER_DATA } from "../../config";
import { MessageTimeDiff, delay, extractMatchingText } from "../../utils";
import { exec } from "child_process";
import { startSpider } from "../spider";
import { appendDataToXlsx, debouncedMergeXlsx } from "../xlsx";
import SQLiteDB from "../../models";
import { WechatyTableRow, wechatyTable } from "../../models/tables/wechaty";

// const messageTimeDiff = new MessageTimeDiff()

/** scan事件的回调 */
async function onScan(qrcode: string, status: ScanStatus) {
  if (status === ScanStatus.Waiting || status === ScanStatus.Timeout) {
    const qrcodeImageUrl = `https://wechaty.js.org/qrcode/${encodeURIComponent(qrcode)}`
    log.info(`Scan QR Code to login: ${status}(${qrcodeImageUrl}) - ${ScanStatus[status]}`)
    // 将二维码输出到终端
    qrcodeTerminal.generate(qrcode, { small: true })
  } else {
    log.info('onScan: %s(%s)', ScanStatus[status], status)
  }
};

/** message事件的回调 */
async function onMessage(msg: MessageInterface) {

  const talker = msg.talker().name() // 发消息人
  const listener = msg.listener() // 接收消息人
  const room = msg.room() // 是否是群消息
  const text = msg.text() // 消息内容
  const type = msg.type() // 消息类型
  const self = msg.self() // 是否自己发给自己的消息
  const dateTime = moment(msg.date()).format(DATE_FORMAT)

  log.info('onMessage', JSON.stringify(msg))
  // log.info('talker', talker)
  // log.info('listener', listener || 'undefined')
  // log.info('room', room || 'undefined')
  // log.info('text', text)
  log.info('type', type)
  // log.info('self', self ? 'true' : 'false')

  // 只对特定群里的特定信息做处理
  if (talker !== 'Ài' && room?.payload?.topic === 'wechaty-pdd-auto' && type === 7) {
    // // 判断两条消息之间的时间差如果大于规定时间就获取订单数据
    // const isDelGenerated = messageTimeDiff.receiveMessage(text)
    // log.info(`isDelGenerated: ${isDelGenerated}`)
    // isDelGenerated && await startSpider(SPIDER_MODE);

    const _msg = text.trim()
    const resArr: string[][] = []
    const msgArr = extractMatchingText(_msg, /^\d{14}.+\[\d{4}\]$/)

    if (!msgArr.length) {
      log.error(NOT_IN_FORMAT_MSG);
      msg.say(NOT_IN_FORMAT_MSG)
      return
    }

    const db = new SQLiteDB('autoship.db');
    msgArr.forEach((item) => {
      const expressTrackingNumber = item.slice(0, 14);
      const recipientName = item.slice(14, -6);
      const extensionNumber = item.slice(-6).slice(1, 5);
      const result = [expressTrackingNumber, recipientName, extensionNumber, dateTime]
      resArr.push(result)
      db.insertOne<WechatyTableRow>(wechatyTable, {
        expressTrackingNum: result[0],
        consignee: result[1],
        extensionNum: result[2]
      })
    })
    db.close()

    await appendDataToXlsx({ sourceFilePath: WECHATY_XLSX_PATH, data: resArr, newFileheader: WECHAT_HEADER_DATA })

    // 防抖：规定时间内如果没有接收到新的消息就启动合并文件的程序，有就重新计时
    debouncedMergeXlsx(msg)
  }
};

/** 
 * 获取实例对象
 * @description name参数可以将登录信息保存到.memory-card.json里，代码热更新后不用再次扫码登录
 */
const bot = WechatyBuilder.build({
  name: 'default',
  puppet: 'wechaty-puppet-xp', // 桌面端协议
  puppetOptions: {
    version: '3.9.2.23',
  },
})
  .on('scan', onScan)
  .on('login', user => log.info(`User ${user} logged in`))
  .on('message', onMessage);

export default bot