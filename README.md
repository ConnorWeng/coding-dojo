# CodingDojo #

## Overview ##

CodingDojo是一个用于浏览和回顾TDD代码的小工具。可以通过翻页的形式浏览发布到Gitlab上的代码。每一次翻页，即是往前走一个commit。左右分屏方便同时阅读测试文件和代码文件。

## Prerequisites ##

需要自行安装：

- [pygments](http://pygments.org)

- [redis](http://redis.io)

## Usage ##

### 安装依赖包 ###

CodingDojo依赖很多node.js的package，例如express，redis, bower等。如果你没有全局安装过bower，建议先运行（安装过就可以跳过）：

```
npm install bower -g
```

然后再运行：

```
npm install
```

### 运行 ###

- 根据服务器信息修改authentication.example.json中的配置，然后另存为authentication.json
- 运行`npm start`
- 访问`http://localhost:3000`

### 测试 ###

- 后端单元测试：`npm test`
- 前端单元测试：`npm run testfront`
- 端到端测试：`npm run protractor`
