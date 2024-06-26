/*
 * @Author: kenis 1836362346@qq.com
 * @Date: 2024-03-15 15:46:48
 * @LastEditors: kenis 1836362346@qq.com
 * @LastEditTime: 2024-04-22 16:52:06
 * @FilePath: \wechat-autoship-pdd\src\spider\puppeteer\shipping.ts
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import { log } from "wechaty";
import { ORDER_QUERY_URL, getBROWSER_WS_ENDPOINT } from "../../../config";
import { _orderNumSelector, getTextWithJSHandle, puppeteerConnext, orderDetailSelector } from "."
import { delay } from "../../../utils";
import puppeteer from 'puppeteer-extra';
import pluginStealth from 'puppeteer-extra-plugin-stealth';
import { MessageInterface } from "wechaty/impls";
import SQLiteDB from "../../../models";
import { ShippingTableRow, shippingTable } from "../../../models/tables/shipping";
puppeteer.use(pluginStealth());

/** 新消息弹窗，有时候出现，出现了会影响第一个发货弹窗的出现和捕获 */
const newMsgModalSelector = 'div#umd-msgbox-handler'
/** 新消息弹窗的关闭按钮 */
const newMsgModalCloseSelector = 'i.ImportantList_close__d0eKb'

/** 发货按钮 TODO: 如果有催发货就找不到发货按钮 */
export const shippingBtnSelector = '[data-testid="beast-core-button"]:nth-child(1)';
/** 发货弹窗 */
const shippingModalSelector = '.PP_popoverContent_5-110-0 > div > [data-testid="beast-core-box"]:nth-child(2)';
/** 二维数组中，通过匹配第一个元素返回第二个元素 */
export function findSecondElement(arr: any[][], target: string): string | null {
  for (const subArr of arr) {
    if (subArr[0] === target) {
      return subArr[1];
    }
  }
  return null; // 如果找不到匹配的值，返回 null
}

/** 自动发货 */
export default async function startPuppeteer(wechatyInstance?: MessageInterface) {
  const db = new SQLiteDB('autoship.db');
  const shippingData: string[][] = []
  // 只要24小时内并且未发货的数据
  db.queryByCond(shippingTable, { condition: "createdAt >= datetime('now', '-24 hours') AND isShipped = 0" })?.forEach((item: ShippingTableRow) => {
    const { orderNum, expressTrackingNum } = item
    shippingData.push([orderNum, expressTrackingNum])
  })
  console.log("🚀 ~ db.queryByCond ~ shippingData:", shippingData)
  if (!shippingData?.length) {
    return
  }
  try {
    const { browser, page } = await puppeteerConnext(getBROWSER_WS_ENDPOINT())
    await page.goto(ORDER_QUERY_URL);
    log.info(page.url())
    // 如果新消息弹窗要关闭它
    const newMsgModalHandle = await page.$(newMsgModalSelector)
    if (newMsgModalHandle) {
      const closeBtn = await newMsgModalHandle.$(newMsgModalCloseSelector)
      if (closeBtn) {
        await closeBtn.click()
      }
    }
    await delay(2000)
    // 滚动页面到右边和底部
    await page.evaluate(() => {
      window.scrollTo(document.body.scrollWidth, document.body.scrollHeight);
    });
    await delay(2000)
    const orderDetails = await page.$$(orderDetailSelector);
    for (const [index, od] of orderDetails.entries()) {
      if (od) {
        // 并返回元素的文本内容
        const elementText = await od.evaluate((element: Element) => element.textContent);
        if (elementText!.includes('订单编号')) {
          // 移动到元素可见的区域
          await od.scrollIntoView();
          await delay(2000)
          // 执行 JavaScript 代码来向上滚动 10px
          await page.evaluate(() => {
            window.scrollBy(0, -70);
          });
          // 第一步：先找到订单编号
          const orderNum = (await getTextWithJSHandle(od, _orderNumSelector)).slice(5)
          // 第二步：找到该订单编号匹配的快递单号
          const expressTrackingNum = findSecondElement(shippingData, orderNum)
          if (expressTrackingNum) {
            log.info(`🚀 ~ 订单编号和匹配的快递单号: ${orderNum} ${expressTrackingNum}`)
            // 第三步：找到发货按钮
            const sBtnHandle = await od.$(shippingBtnSelector)
            await page.waitForSelector(shippingBtnSelector)
            await sBtnHandle!.click();
            await delay(2000)
            // 第四步：找到发货弹窗
            const modalHandle = await page.$(shippingModalSelector)
            await page.waitForSelector(shippingModalSelector)
            const modalInputsHandle = await modalHandle!.$$('input')
            const modalConfirmBtnHandle = await modalHandle!.$('[data-tracking-click-viewid="ele_confirm_shipment_shared"]')
            for (const [index, mi] of modalInputsHandle.entries()) {
              if (index === 0) {
                // 第五步：找到第一个输入框 输入快递单号
                await mi.type(expressTrackingNum)
                await delay(2000)
                // 获取下拉框第一个选项
                const dropdownFirstItemHandle = await page.$('[data-testid="beast-core-input-autoComplete-dropdown"] ul > li:nth-child(1)')
                const dropdownFirstItemText = await dropdownFirstItemHandle!.evaluate((element: Element) =>
                  element.textContent
                )
                log.info(`下拉框第一个选项：${dropdownFirstItemText}`)
                // 第六步：点击第一个选项
                await dropdownFirstItemHandle!.click()
                await delay(2000)
                // 第七步：点击确认发货按钮
                await modalConfirmBtnHandle!.click()
                await delay(2000)
                // 第八步：找到并点击继续发货按钮
                const continueShippingBtnHandle = await page.$('[data-tracking-click-viewid="makesure"][data-tracking-impr-viewid="makesure"]')
                // const continueShippingBtnText = await continueShippingBtnHandle.evaluate((element: Element) =>
                //   element.textContent
                // )
                // console.log("🚀 ~ continueShippingBtnText:", continueShippingBtnText)
                await continueShippingBtnHandle!.click()
                await delay(10000)
              }
            }
            // await page.screenshot({ path: `example${index}.png` });
            wechatyInstance && wechatyInstance.say(`${expressTrackingNum}-发货成功`)
            // 更新数据库里的是否发货字段
            db.updateRecord<{ isShipped: 0 | 1 }>(shippingTable, { isShipped: 1 }, `orderNum = '${orderNum}'`)
          }
        } else {
          continue
        }
      } else {
        log.info('未找到匹配的元素');
      }
    }
    // await browser.close()
    // 获取当前浏览器打开的所有标签页
    const pages = await browser.pages();
    // 如果标签页数量大于 1，则关闭当前页面
    if (pages.length > 1) {
      await page.close(); // 关闭当前页面
    }
  } catch (err) {
    console.log("🚀 ~ err:", err)
    db.close()
    startPuppeteer(wechatyInstance || undefined)
  }
  db.close()
}