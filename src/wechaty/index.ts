import { ScanStatus, WechatyBuilder, log } from "wechaty";
import qrcodeTerminal from 'qrcode-terminal';
import { MessageInterface } from "wechaty/impls";
import moment from "moment";
import { DATE_FORMAT, NOT_IN_FORMAT_MSG, SPIDER_MODE, WECHATY_XLSX_PATH, WECHAT_HEADER_DATA } from "../../config";
import { MessageTimeDiff, delay, extractMatchingText } from "../../utils";
import { exec } from "child_process";
import { startSpider } from "../spider";
import { appendDataToXlsx, debouncedMergeXlsx } from "../xlsx";

const messageTimeDiff = new MessageTimeDiff()

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

/* -------------------------------------------------------------------------- */
/*                              message start                                 */
/* -------------------------------------------------------------------------- */
/** 
 * 处理快递单号+收件人名称+分机号的格式入参
 * @description 
 * 入参格式：78771934918934郭海莉[9964]\n78771934918934郭海莉[9964]
 * 必须用\n分隔开
 */
export async function dataProcessing(msg: string, msgDateTime: string, wechatyInstance: MessageInterface) {
  const _msg = msg.trim()
  const resArr: string[][] = []
  const msgArr = extractMatchingText(_msg, /^\d{14}.+\[\d{4}\]$/)

  if (!msgArr.length) {
    log.error(NOT_IN_FORMAT_MSG);
    wechatyInstance.say(NOT_IN_FORMAT_MSG)
    return
  } else {
    msgArr.forEach((item) => {
      resArr.push(storeTNumRNameENum(item, msgDateTime))
    })
  }

  await appendDataToXlsx({ sourceFilePath: WECHATY_XLSX_PATH, data: resArr, newFileheader: WECHAT_HEADER_DATA })

  // 防抖：规定时间内如果没有接收到新的消息就启动合并文件的程序，有就重新计时
  debouncedMergeXlsx(wechatyInstance)
};

/**
 * 将快递单号、收件人名称、分机号分开存放到键值对里并添加时间
 * @example
 * // return 
 * ['78771934918934','郭海莉','9964','1000-12-12 12:00:00']
 * storeTNumRNameENum('78771934918934郭海莉[9964]')
 */
export const storeTNumRNameENum = (str: string, msgDateTime: string): string[] => {
  const expressTrackingNumber = str.slice(0, 14);
  const recipientName = str.slice(14, -6);
  const extensionNumber = str.slice(-6).slice(1, 5);
  return [expressTrackingNumber, recipientName, extensionNumber, msgDateTime]
}

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
  log.info('talker', talker)
  log.info('listener', listener || 'undefined')
  log.info('room', room || 'undefined')
  log.info('text', text)
  log.info('type', type)
  log.info('self', self ? 'true' : 'false')

  // 只对特定群里的信息做处理
  if (talker !== 'Ài' && room?.payload?.topic === 'wechaty-pdd-auto') {
    // 判断两条消息之间的时间差如果大于规定时间就删除所有已生成的文件,并重新获取订单数据
    const isDelGenerated = messageTimeDiff.receiveMessage(text)
    log.info(`isDelGenerated: ${isDelGenerated}`)
    isDelGenerated && exec('pnpm prestart') && await delay(20 * 1000) && await startSpider(SPIDER_MODE);

    await dataProcessing(text, dateTime, msg)
  }
};
/* -------------------------------------------------------------------------- */
/*                               message end                                  */
/* -------------------------------------------------------------------------- */

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