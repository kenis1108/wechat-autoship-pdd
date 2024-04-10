
/*
* @Author: kenis 1836362346@qq.com
* @Date: 2024-03-13 18:35:20
 * @LastEditors: kenis 1836362346@qq.com
 * @LastEditTime: 2024-04-06 21:47:44
* @FilePath: \wechat-autoship-pdd\src\test.ts
* @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
*/
import puppeteer from 'puppeteer-extra';
import pluginStealth from 'puppeteer-extra-plugin-stealth';

import fs from "fs";
import { log } from "wechaty";
import { delay, isFileExists, removeCSS } from '../../../utils';
import { BROWSER_WS_ENDPOINT, ORDER_QUERY_URL } from '../../../config';
import SQLiteDB from '../../../models';
import { orderQueryTable, orderQueryTableRow } from '../../../models/tables/orderQuery';

puppeteer.use(pluginStealth());
export const cookiesJSONPath = 'cookies.json';


/* -------------------------------------------------------------------------- */
/*                             selector start                                 */
/* -------------------------------------------------------------------------- */
/** 待发货数量 */
export const orderSumSelector = '.NewQuickTab_pdd-tab-title-current__1WJGI > span > span';
/** 查看按钮 */
export const checkSelector = '[data-testid="beast-core-box"]:nth-child(2) > div > [data-testid="beast-core-button-link"] > span';
/** 查看手机号按钮 */
export const checkPhoneSelector = '[data-testid="beast-core-table-td"] > div > [data-testid="beast-core-box"] > [data-testid="beast-core-button-link"] > span';
/** 订单详情 */
export const orderDetailSelector = 'div.TB_innerMiddle_5-110-0 > div';
/** 订单编号 */
export const _orderNumSelector = '.TB_bodyGroupCell_5-110-0:nth-child(2) div:nth-child(1) > div:nth-child(1) > span:nth-child(1)'
/** 成交时间 */
export const _transactionTimeSelector = '.TB_bodyGroupHeader_5-110-0:nth-child(1) div:nth-child(2) > span:nth-child(1)'
/** 商品标题 */
export const _productTitleSelector = '[data-testid="beast-core-table-td"]:nth-child(1) [data-testid="beast-core-ellipsis"]:nth-child(1) > .elli_outerWrapper_5-110-0:nth-child(1)'
/** sku */
export const _skuSelector = '[data-testid="beast-core-ellipsis"]:nth-child(4) > .elli_outerWrapper_5-110-0:nth-child(1)'
/** 收货地址 */
export const _addressSelector = '[data-testid="beast-core-box"]:nth-child(3) .elli_outerWrapper_5-110-0'
/** 收货人 */
export const _consigneeSelector = '[data-testid="beast-core-table-body-tr"]:nth-child(2) span:nth-child(2)'
/** 分机号 */
export const _extensionNumSelector = '[data-testid="beast-core-table-td"]:nth-child(6) [data-testid="beast-core-box"]:nth-child(1) [data-testid="beast-core-box"]:nth-child(2)'
/* -------------------------------------------------------------------------- */
/*                               selector end                                 */
/* -------------------------------------------------------------------------- */

/**
 * 启动新的浏览器实例，第一次需要手动登录，然后会保存cookie
 * @param targetUrl 
 * @returns 
 */
export const puppeteerLaunch = async (targetUrl: string) => {

  const browser = await puppeteer.launch({
    // executablePath: "C:\\Users\\kkb\\AppData\\Local\\Google\\Chrome\\Application\\chrome.exe",
    // executablePath: "C:\\Program Files (x86)\\Microsoft\\Edge Dev\\Application\\msedge.exe",
    executablePath: "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
    headless: false,
    defaultViewport: { width: 1655, height: 790 },
    slowMo: 100,
    args: [
      '--user-data-dir=C:\\Users\\kkb\\AppData\\Local\\Microsoft\\Edge\\User Data\\Default',
      '--start-maximized',
      '--no-sandbox'
    ]
  });
  const page = await browser.newPage();
  // 启用页面缓存
  await page.setCacheEnabled(true)

  if (isFileExists(cookiesJSONPath)) {
    // 读取之前保存的 Cookie 文件
    const cookiesString = fs.readFileSync(cookiesJSONPath, 'utf8');
    const cookies = JSON.parse(cookiesString);
    // 将 Cookie 设置到页面中
    await page.setCookie(...cookies);

    await page.goto(targetUrl);
    log.info(page.url())

    // await page.reload();
  } else {
    await page.goto(targetUrl);

    log.info(page.url())
    log.info('请手动登录')
    // 等待手动登录成功并获取页面上的 Cookie
    await page.waitForNavigation({
      timeout: 5 * 60000
    });
    log.info(page.url())

    const cookies = await page.cookies();
    // 将 Cookie 写入到文件中
    fs.writeFileSync(cookiesJSONPath, JSON.stringify(cookies));

    log.info('已经登录')
  }

  return { browser, page }
}

/**
 * 连接已经打开浏览器实例
 * @param browserWSEndpoint 
 * @description 
 * msedge.exe --remote-debugging-address=0.0.0.0 --remote-debugging-port=9222
 * http://127.0.0.1:9222/json/version
 * @returns 
 */
export const puppeteerConnext = async (browserWSEndpoint: string) => {
  const browser = await puppeteer.connect({
    browserWSEndpoint
  })
  const page = await browser.newPage();
  await page.setViewport({ width: 1655, height: 790 })
  // 启用页面缓存
  await page.setCacheEnabled(true)

  return { browser, page }
}

/** 爬取订单详情数据 */
const startPuppeteer = async () => {
  // const { browser, page } = await puppeteerLaunch(ORDER_QUERY_URL)
  const { browser, page } = await puppeteerConnext(BROWSER_WS_ENDPOINT)
  await page.goto(ORDER_QUERY_URL);
  log.info(page.url())
  await delay(2000)
  if (page.url() === ORDER_QUERY_URL) {
    await page.waitForSelector(orderSumSelector, {
      visible: true
    })
    // 使用 page.$() 方法执行 CSS 选择器查询
    const orderNumElementHandle = await page.$(orderSumSelector);
    if (orderNumElementHandle) {
      const elementText = await orderNumElementHandle.evaluate((element: Element) => element.textContent);
      log.info('待发货订单数：', elementText);
      if (!Number(elementText)) {
        return
      }
    } else {
      log.info('未找到匹配的元素');
    }
    // 滚动页面到右边和底部
    await page.evaluate(() => {
      window.scrollTo(document.body.scrollWidth, document.body.scrollHeight);
    });

    /** 点击所有查看按钮 */
    await clickAllBtnWithQuery(page, checkSelector, 2000)
    /** 点击所有查看手机号按钮 */
    await clickAllBtnWithQuery(page, checkPhoneSelector, 4000)

    const orderDetails = await page.$$(orderDetailSelector);

    const orderData = []
    const db = new SQLiteDB('autoship.db');
    for (const od of orderDetails) {
      if (od) {
        // 并返回元素的文本内容
        const elementText = await od.evaluate((element: Element) => element.textContent);
        if (elementText!.includes('订单编号')) {
          const orderNum = (await getTextWithJSHandle(od, _orderNumSelector)).slice(5)
          // TODO：测试有快递停用的提示的时候无法正确拿到成交时间
          const _ttT = await getTextWithJSHandle(od, _transactionTimeSelector)
          const transactionTime = _ttT.includes('成交时间') ? (_ttT).slice(-16) : ''
          const productTitle = await getTextWithJSHandle(od, _productTitleSelector)
          const sku = await getTextWithJSHandle(od, _skuSelector)
          const address = await getTextWithJSHandle(od, _addressSelector)
          const consignee = await getTextWithJSHandle(od, _consigneeSelector)
          // 分机号需要判断一下，没有分机号的订单可能会拿到那个“复制完整信息”的文本
          const _eN = await getTextWithJSHandle(od, _extensionNumSelector)
          const extensionNum = (/^\[\d{4}\]$/.test(_eN) ? _eN.slice(1, 5) : '')
          // log.info("🚀 ~ 订单编号:", orderNum)
          // log.info("🚀 ~ 成交时间:", transactionTime)
          // log.info("🚀 ~ 商品标题:", productTitle)
          // log.info("🚀 ~ sku:", sku)
          // log.info("🚀 ~ 收货地址:", address)
          // log.info("🚀 ~ 收货人:", consignee)
          // log.info("🚀 ~ 分机号:", extensionNum)
          // ['订单号', '商品标题', '收货人', '分机号', '收货地址', 'sku', '成交时间']
          orderData.push([orderNum, productTitle, consignee, extensionNum, address, sku, transactionTime])
          db.insertOne<orderQueryTableRow>(orderQueryTable, {
            orderNum,
            transactionTime,
            productTitle,
            sku,
            address,
            consignee,
            extensionNum
          })
        } else {
          continue
        }
      } else {
        log.info('未找到匹配的元素');
      }
    }
    db.close()
  }
  // await browser.close();
};

export default startPuppeteer;

/** 通过JSHandle获取元素的文本 */
export async function getTextWithJSHandle(JSHandle: any, selector: string) {
  const _handle = await JSHandle.$(selector)
  if (_handle) {
    const _text = await _handle.evaluate((element: Element) => element.textContent)
    return removeCSS(_text)
  } else {
    log.error('未找到元素')
    return ''
  }
}

/** 点击所有查询到的按钮 */
export async function clickAllBtnWithQuery(page: any, selector: string, delay_num: number) {
  // 查询所有匹配的元素
  const checks = await page.$$(selector);
  // 循环遍历所有匹配的元素，并模拟点击操作
  for (const c of checks) {
    // 移动到元素可见的区域
    await c.scrollIntoView();
    await c.click();
    await delay(1000)

  }
  log.info('完成点击所有匹配的元素')
  await delay(delay_num)
}

