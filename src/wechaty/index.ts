/*
 * @Author: kenis 1836362346@qq.com
 * @Date: 2024-03-15 15:12:37
 * @LastEditors: kenis 1836362346@qq.com
 * @LastEditTime: 2024-03-22 11:28:37
 * @FilePath: \wechat-autoship-pdd\src\wechaty\index.ts
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import { ScanStatus, WechatyBuilder, log } from "wechaty";
import qrcodeTerminal from 'qrcode-terminal';
import { MessageInterface } from "wechaty/impls";
import moment from "moment";
import { DATE_FORMAT, NOT_IN_FORMAT_MSG, QUANTITY_UNIT_OF_ORDER, SPIDER_MODE, SYMBOLS_FORFFERENT_PRODUCTS, WECHAT_HEADER_DATA } from "../../config";
import { MessageTimeDiff, calculateETPrice, delay } from "../../utils";
import { exec } from "child_process";
import { startSpider } from "../spider";
import { appendDataToXlsx, debouncedMergeXlsx } from "../xlsx";
import SQLiteDB from "../../models";
import { WechatyTableRow, wechatyTable } from "../../models/tables/wechaty";
import { productTable } from "../../models/tables/product";
import { zhToNumber } from "zh-to-number";

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

/** 
 * 从文本里拆分出单号 收货人 分机号
 * 将他们按顺序组合起来成两种格式
 * 1. 单号+收货人
 * 2. 单号+收货人+分机号
 * 然后存入数组中
 * filter(Boolean) 的效果是将数组中的空字符串移除。
 */
function matchETNText(input: string): string[] {
  /**
   * TODO: 测试下面是否能通过
   * 1. 78779856323821   77[7105]
   * 2. 78779855409756楊蕙慈
   * 3. 78779856323821   77[7105]\s\s\s78779855409756楊蕙慈
   * 4. 78779856323821   77[7105]\n78779855409756楊蕙慈
   * 5. 78779855409756   楊蕙慈   78779855108257丫丫[3199]
   * 6. 78779856323821   77 [7105]     78779855409756    楊蕙慈
   */
  /** 匹配 单号+收货人 单号+收货人+分机号 */
  const regex1 = /^\d{14}.+(\[\d{4}\])?/
  /** 匹配单号 */
  const regex2 = /\d{14}/
  const regex3 = /\]$/
  const matchingTextArray: string[] = [];
  const lines = input.split(/\n/).filter(Boolean);
  for (const line of lines) {
    if (/\s+/.test(line)) {
      const words = line.split(/\s+/).filter(Boolean);
      // 需要跳过的索引数组
      const isContinueArr: number[] = []
      for (let i = 0; i < words?.length; i++) {
        const word = words[i]
        if (isContinueArr.length > 0 && isContinueArr.includes(i)) {
          continue
        }
        if (regex1.test(word)) {
          matchingTextArray.push(word);
        } else {
          // 78779855108257  66 [3199]
          // 如果只有单号，那么加上它后面一个或两个元素
          if (regex2.test(word)) {
            const word1 = words[i + 1]
            const word2 = words[i + 2]
            if (word1) {
              if (regex3.test(word1)) {
                // 以】结尾拼接
                isContinueArr.push(i + 1)
                matchingTextArray.push(`${word} ${word1}`);
              } else {
                if (word2) {
                  if (regex3.test(word2)) {
                    // 后面的第二个里面不能有单号,是单号就只加后面的一个
                    if (regex2.test(word2)) {
                      isContinueArr.push(i + 1)
                      matchingTextArray.push(`${word} ${word1}`);
                    } else {
                      isContinueArr.push(i + 1)
                      isContinueArr.push(i + 2)
                      matchingTextArray.push(`${word} ${word1}${word2}`);
                    }
                  }
                } else {
                  isContinueArr.push(i + 1)
                  matchingTextArray.push(`${word} ${word1}`);
                }
              }
            }
          }
        }
      }
    } else {
      if (regex1.test(line)) {
        matchingTextArray.push(line);
      }
    }

  }
  return matchingTextArray;
}

/**
 * 从文本里拆分出sku+数量
 */
class MatchOrdText {
  private regex = /.+(\[\d{4}\])?\n1[0-9]{10}\n([\u4e00-\u9fa5]+[省|市])\s([\u4e00-\u9fa5]+市)\s([\u4e00-\u9fa5]+[市|区|镇])\s.*/
  public input;
  public curSku: string;
  /** 报单的款式单位 */
  public aliasUnitOfOrder: string[]
  /** 
   * 匹配 
   * 收货人+(分机号)?\n
   * 手机号码\n
   * 收货地址+。+sku
   * 
   * 1. 
   * 淘派电商（94934446）[5018]
   * 17283440517
   * 广东省 东莞市 虎门镇 南栅五区民昌路3巷13号D区厂房淘派电商339969[5018]。    A款银白色链天蓝色皮30cm带扣
   * 2. 
   * 77[7105]
   * 17281947767
   * 上海市 上海市 宝山区 市台路408号1214室[7105]。     鎏金色大号一套
   * 3. 
   * 77[7105]
   * 17281947767
   * 上海市 上海市 宝山区 市台路408号1214室[7105]。     鎏金色大号两套
   * 4.
   * 张寿梅[3922]
   * 17281944786
   * 山东省 济南市 历下区 山东省济南市历山路70号[3922]。        鎏金色小号两套➕银白色小号三套➕鎏金色底座单买
   * 
   * 提取出alias  X款 Xcm X号 底座单买 “SELECT DISTINCT alias  FROM product p;”
   */
  constructor(input: string) {
    this.input = input
    this.curSku = ''
    this.aliasUnitOfOrder = this.getAliasUnitOfOrder()
  }

  private getAliasUnitOfOrder() {
    const db = new SQLiteDB('autoship.db');
    const result = db.queryDistinctColumnByCond(productTable, 'alias')?.map(i => i.alias)?.filter(Boolean)?.map(i => i.includes('，') ? i.split('，') : i).flat()
    db.close()
    return result?.length ? [...new Set(result)]: []
  }

  /** 提取单个商品 */
  private matchOne(sq: string) {
    let quantity = ''
    let alias: string[] = []
    let sku = ''
    for (let i = 0; i < QUANTITY_UNIT_OF_ORDER.length; i++) {
      const unit = QUANTITY_UNIT_OF_ORDER[i]
      const unitIndex = sq.indexOf(unit)
      if (unitIndex !== -1) {
        // zhToNumber不会识别 ‘两‘
        quantity = sq.slice(unitIndex - 1, -1)?.replace(/两/g, '二')
        sku = sq.slice(0, unitIndex - 1)
        break
      } else {
        quantity = '一'
        sku = sq
      }
    }
    // 找到款式单位的位置
    let cycles = 0
    for (let index = 0; index < this.aliasUnitOfOrder.length; index++) {
      // 最多两个款式
      if (cycles === 2) {
        break
      }
      const element = this.aliasUnitOfOrder[index];
      if (sku.includes(element)) {
        alias.push(element)
        cycles++
      }
    }
    return {
      quantity: zhToNumber(quantity), alias, sku
    }
  }

  /** 返回提取的结果 */
  public match() {
    if (this.regex.test(this.input)) {
      const skuAndQuantity = this.input.split('\n')?.[2]?.split('。')?.[1]?.trim()
      this.curSku = skuAndQuantity
      if (skuAndQuantity.includes(SYMBOLS_FORFFERENT_PRODUCTS)) {
        return skuAndQuantity.split(SYMBOLS_FORFFERENT_PRODUCTS).map(item => {
          return this.matchOne(item)
        })
      } else {
        return [this.matchOne(skuAndQuantity)]
      }
    }
  }
}

/** message事件的回调 */
async function onMessage(msg: MessageInterface) {
  const db = new SQLiteDB('autoship.db');

  const talker = msg.talker().name() // 发消息人
  const listener = msg.listener() // 接收消息人
  const room = msg.room() // 是否是群消息
  const text = msg.text() // 消息内容
  const type = msg.type() // 消息类型
  const self = msg.self() // 是否自己发给自己的消息
  const dateTime = moment(msg.date()).format(DATE_FORMAT)

  // log.info('onMessage', JSON.stringify(msg))
  // log.info('type', type)
  // log.info('talker', talker)
  // log.info('listener', listener || 'undefined')
  // log.info('room', room || 'undefined')
  // log.info('text', text)
  // log.info('self', self ? 'true' : 'false')

  // 只对特定群里的特定信息做处理
  if (talker !== 'Ài' && room?.payload?.topic === 'wechaty-pdd-auto' && type === 7) {
    // // 判断两条消息之间的时间差如果大于规定时间就获取订单数据
    // const isDelGenerated = messageTimeDiff.receiveMessage(text)
    // log.info(`isDelGenerated: ${isDelGenerated}`)
    // isDelGenerated && await startSpider(SPIDER_MODE);

    /** 
     * 匹配报单信息
     * 1. 单种商品
     * 收货人+(分机号)?\n
     * 手机号码\n
     * 收货地址+。+sku
     * 
     * 2. 多种商品
     * 收货人+(分机号)?\n
     * 手机号码\n
     * 收货地址+。+sku1➕sku2 
     */
    const mOrdText = new MatchOrdText(text.trim())
    const ordMsgs = mOrdText.match()
    const total = {
      sku: mOrdText.curSku,
      /** 一个快递的所有商品数量 */
      quantity: 0,
      /** 一个快递的所有商品的总成本 */
      cost: 0,
      /** 快递费 运费公式：quantity/2 的 商*4，如果有余数就（商+1）* 4 */
      etPrice: 4
    }
    ordMsgs?.forEach(ordMsg => {
      if (ordMsg?.alias && ordMsg?.alias?.length) {
        let condition = ''
        ordMsg.alias.forEach(item => {
          condition += `alias LIKE '%${item}%' AND `
        })
        const dataInDB = db.queryByCond(productTable, condition.slice(0, -5))
        if (dataInDB?.[0]?.cost) {
          total.cost += Number(dataInDB?.[0]?.cost) * Number(ordMsg.quantity)
          total.quantity += Number(ordMsg.quantity)
        } else {
          msg.say(`${ordMsg.sku}不包括运费要多少钱？`)
        }
      } else {
        msg.say(`${ordMsg?.sku}不包括运费要多少钱？`)
      }
    })
    total.etPrice = calculateETPrice(total.quantity)
    ordMsgs?.[0]?.alias && msg.say(`${total.sku} 共${total.quantity}件 运费共${total.etPrice}元 总计${total?.cost + total.etPrice}元`)
  }

  /**
   * 匹配快递单号信息
   * 1. 有分机号
   * 单号+收货人+分机号
   * 
   * 2. 无分机号
   * 单号+收货人
   */
  const eTNMsgArr = matchETNText(text.trim())
  if (eTNMsgArr.length) {
    // 解析数据并存储
    const regex = /\[\d{4}\]/
    eTNMsgArr.forEach((item) => {
      let expressTrackingNum = item.slice(0, 14);
      let consignee = ''
      let extensionNum = ''
      // 有分机号的情况
      if (regex.test(item)) {
        consignee = item.slice(14, -6).trim();
        extensionNum = item.slice(-6).slice(1, 5);
      } else {
        consignee = item.slice(14).trim();
      }
      db.insertOne<WechatyTableRow>(wechatyTable, {
        expressTrackingNum,
        consignee,
        extensionNum
      })
    })

    // 防抖：规定时间内如果没有接收到新的消息就启动合并文件的程序，有就重新计时
    debouncedMergeXlsx(msg)
  }

  db.close()
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