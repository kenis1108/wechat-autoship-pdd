/*
 * @Author: kenis 1836362346@qq.com
 * @Date: 2024-03-08 15:33:01
 * @LastEditors: kenis 1836362346@qq.com
 * @LastEditTime: 2024-03-13 18:10:17
 * @FilePath: \wechaty-pdd-auto\src\index.ts
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import { ScanStatus, WechatyBuilder, log } from 'wechaty';
import { MessageInterface } from 'wechaty/impls';
import { MessageTimeDiff, dataProcessing, delay, getFileCreateTime } from './utils';
import moment from 'moment';
import { AUTOMA_JSON_PATH, DATE_FORMAT, GET_AUTOMAJSONTIME } from './config';
import { exec } from 'child_process'
import qrcodeTerminal from 'qrcode-terminal';

const messageTimeDiff = new MessageTimeDiff()

/** 
 *  判断automa.json是否已经获取有1h这么久了, 超过1h或者不存在就启动keymouse
 */
const getAutomaJson = async ()=>{
  const isOneHour = await getFileCreateTime(AUTOMA_JSON_PATH)
  isOneHour && exec('pnpm keymousego') &&  await delay(3 * 60 * 1000);
}


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

  getAutomaJson()
};

/** message事件的回调 */
async function onMessage(msg: MessageInterface) {
  // console.log(`Message: ${msg}`);
  const talker = msg.talker().name()
  const text = msg.text()
  const dateTime = moment(msg.date()).format(DATE_FORMAT)

  if (talker !== 'Ài') {
    console.log(`获取消息的发送人: ${talker}`);
    console.log(`获取消息的文本内容: ${text}\n${dateTime}`);

    // 判断两条消息之间的时间差如果大于规定时间就删除所有已生成的文件,并重新获取automa.json
    const isDelGenerated = messageTimeDiff.receiveMessage(text)
    console.log("🚀 ~ onMessage ~ isDelGenerated:", isDelGenerated)
    isDelGenerated && exec('pnpm prestart') &&  await delay(60 * 1000);

    getAutomaJson()

    await dataProcessing(text, dateTime, msg)
  }
};

async function main() {
  exec('pnpm prestart');
  /** 
   * 获取实例对象
   * @description name参数可以将登录信息保存到.memory-card.json里，代码热更新后不用再次扫码登录
   */
  const wechaty = WechatyBuilder.build({ name: 'default' });
  /** 
   * 监听各种事件
   */
  wechaty
    .on('scan', onScan)
    .on('login', user => console.log(`User ${user} logged in`))
    .on('message', onMessage);

  /**
    * 启动服务
    */
  await wechaty.start()
}

main()

/** 每隔一段时间就判断automa.json是否生成超过一个小时了，超过了就要更新 */
// setInterval(async () => {
//   const isOneHour = await getFileCreateTime(AUTOMA_JSON_PATH)
//   isOneHour && exec('pnpm keymouse')
// }, GET_AUTOMAJSONTIME);