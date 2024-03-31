# WECHAT-AUTOSHIP-PDD

[![standard-readme compliant](https://img.shields.io/badge/readme%20style-standard-brightgreen.svg?style=flat-square)](https://github.com/RichardLitt/standard-readme)

A bridge between wechat and pdd

## 背景

每天的发货单量不多，10个以内，没有使用pdd的打单工具，都是通过wechat发消息报单给快递小哥，然后快递小哥发消息回复快递单号，再手动将快递单号填入pdd商家后台。于是想把这个流程自动化。店铺达不到pdd开放平台接口的申请门槛，这里利用其它方式实现。

## 使用说明

1. 下载安装微信桌面版[3.9.2.23](https://github.com/tom-snow/wechat-windows-versions/releases/download/v3.9.2.23/WeChatSetup-3.9.2.23.exe)并登录
1. 开启`edge/chrome`远程调试端`msedge/chrome --remote-debugging-port=9222 --remote-debugging-address=0.0.0.0`
1. 浏览器访问`http://localhost:9222/json/version`获取`websocket`地址
![获取ws_url](/public/img/ws.png)
1. 更新`config/index.ts`里的`BROWSER_WS_ENDPOINT`字段为上图中的`ws`地址
1. `pnpm i`
1. `pnpm start`

+ 快递单号信息的格式
+ 报单信息的格式


## 作者

[@kenis](https://github.com/kenis1108)

## 参考

[atorber/puppet-xp-getting-started: 基于wechaty-puppet-xp的Windows微信机器人 (github.com)](https://github.com/atorber/puppet-xp-getting-started)

[奶奶都能轻松入门的 Puppeteer 教程 - 掘金](https://juejin.cn/post/7047462936293408776)
