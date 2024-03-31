# WECHAT-AUTOSHIP-PDD

[![standard-readme compliant](https://img.shields.io/badge/readme%20style-standard-brightgreen.svg?style=flat-square)](https://github.com/RichardLitt/standard-readme)

A bridge between wechat and pdd

## 背景

每天的发货单量不多，10个以内，没有使用pdd的打单工具，都是通过wechat发消息报单给快递小哥，然后快递小哥发消息回复快递单号，再手动将快递单号填入pdd商家后台。于是想把这个流程自动化。店铺达不到pdd开放平台接口的申请门槛，这里利用其它方式实现。

## 安装

### windows系统
1. 安装微信
2. 安装`Node.js`, 版本必须大于18, 包管理使用的是`pnpm`
3. clone后`pnpm i`安装依赖

## 使用说明

1. 登录微信
2. 开启`edge/chrome`远程调试端`msedge --remote-debugging-port=9222 --remote-debugging-address=0.0.0.0`
3. 浏览器访问`http://localhost:9222/json/version`获取`ws_url`
![获取ws_url](/public/img/ws.png)
4. 更新`config/index.ts`里的`BROWSER_WS_ENDPOINT`字段
5. `pnpm start`
6. 快递单号信息的格式
7. 报单信息的格式


## 示例

## 相关仓库


## 作者

[@kenis](https://github.com/kenis1108)
