import * as core from '@actions/core'
// import GoogleTranslate from '@tomsun28/google-translate-api'
import BingTrans  from 'bing-translate-api'


const text = "<div align=\"center\">\n" +
  "  <h1>Layotto (L8): To be the next layer of OSI layer 7</h1>\n" +
  "  <img src=\"https://gw.alipayobjects.com/zos/bmw-prod/65518bfc-8ba5-4234-a5c5-2bc065e3a5f0.svg\" height=\"120px\">\n" +
  "\n" +
  "[![Layotto Env Pipeline 🌊](https://github.com/mosn/layotto/actions/workflows/quickstart-checker.yml/badge.svg)](https://github.com/mosn/layotto/actions/workflows/quickstart-checker.yml)\n" +
  "[![Layotto Dev Pipeline 🌊](https://github.com/mosn/layotto/actions/workflows/layotto-ci.yml/badge.svg)](https://github.com/mosn/layotto/actions/workflows/layotto-ci.yml)\n" +
  "\n" +
  "[![GoDoc](https://godoc.org/mosn.io/layotto?status.svg)](https://godoc.org/mosn.io/layotto)\n" +
  "[![Go Report Card](https://goreportcard.com/badge/github.com/mosn/layotto)](https://goreportcard.com/report/mosn.io/layotto)\n" +
  "[![codecov](https://codecov.io/gh/mosn/layotto/branch/main/graph/badge.svg?token=10RxwSV6Sz)](https://codecov.io/gh/mosn/layotto)\n" +
  "[![Average time to resolve an issue](http://isitmaintained.com/badge/resolution/mosn/layotto.svg)](http://isitmaintained.com/project/mosn/layotto \"Average time to resolve an issue\")\n" +
  "\n" +
  "</div>\n" +
  "\n" +
  "Layotto(/leɪˈɒtəʊ/) 是一款使用 Golang 开发的应用运行时, 旨在帮助开发人员快速构建云原生应用，帮助应用和基础设施解耦。它为应用提供了各种分布式能力，比如状态管理，配置管理，事件发布订阅等能力，以简化应用的开发。\n" +
  "\n" +
  "Layotto 以开源的 [MOSN](https://github.com/mosn/mosn) 为底座，在提供分布式能力以外，提供了 Service Mesh 对于流量的管控能力。\n" +
  "\n" +
  "## 诞生背景\n" +
  "\n" +
  "Layotto 希望可以把 [Multi-Runtime](https://www.infoq.com/articles/multi-runtime-microservice-architecture/) 跟 Service\n" +
  "Mesh 两者的能力结合起来，无论你是使用 MOSN 还是 Envoy 或者其他产品作为 Service Mesh 的数据面，都可以在不增加新的 sidecar 的前提下，使用 Layotto 为这些数据面追加 Runtime 的能力。\n" +
  "\n" +
  "例如，通过为 MOSN 添加 Runtime 能力，一个 Layotto 进程可以[既作为 istio 的数据面](zh/start/istio/) 又提供各种 Runtime API（例如 Configuration API,Pub/Sub API 等）\n" +
  "\n" +
  "此外，随着探索实践，我们发现 sidecar 能做的事情远不止于此。 通过引入[WebAssembly](https://en.wikipedia.org/wiki/WebAssembly) ,我们正在尝试将 Layotto 做成 FaaS (Function as a service) 的运行时容器 。\n" +
  "\n" +
  "如果您对诞生背景感兴趣，可以看下[这篇演讲](https://mosn.io/layotto/#/zh/blog/mosn-subproject-layotto-opening-a-new-chapter-in-service-grid-application-runtime/index)\n" +
  "。\n" +
  "\n" +
  "## 功能\n" +
  "\n" +
  "- 服务通信\n" +
  "- 服务治理，例如流量的劫持和观测，服务限流等\n" +
  "- [作为 istio 的数据面](zh/start/istio/)\n" +
  "- 配置管理\n" +
  "- 状态管理\n" +
  "- 事件发布订阅\n" +
  "- 健康检查、查询运行时元数据\n" +
  "- 基于 WASM 的多语言编程\n" +
  "\n" +
  "## 工程架构\n" +
  "\n" +
  "如下图架构图所示，Layotto 以开源 MOSN 作为底座，在提供了网络层管理能力的同时提供了分布式能力，业务可以通过轻量级的 SDK 直接与 Layotto 进行交互，而无需关注后端的具体的基础设施。\n" +
  "\n" +
  "Layotto 提供了多种语言版本的 SDK，SDK 通过 gRPC 与 Layotto 进行交互。\n" +
  "\n" +
  "如果您想把应用部署到不同的云平台（例如将阿里云上的应用部署到 AWS），您只需要在 Layotto 提供的 [配置文件](https://github.com/mosn/layotto/blob/main/configs/runtime_config.json)\n" +
  "里修改配置、指定自己想用的基础设施类型，不需要修改应用的代码就能让应用拥有\"跨云部署\"能力，大大提高了程序的可移植性。\n" +
  "\n" +
  "<img src=\"https://gw.alipayobjects.com/mdn/rms_5891a1/afts/img/A*oRkFR63JB7cAAAAAAAAAAAAAARQnAQ\" />\n" +
  "\n" +
  "## 快速开始\n" +
  "\n" +
  "### Get started with Layotto\n" +
  "\n" +
  "您可以尝试以下 Quickstart demo，体验 Layotto 的功能；或者体验[线上实验室](zh/start/lab.md)\n" +
  "\n" +
  "### API\n" +
  "\n" +
  "| API            | status |                              quick start                              |                               desc                             |\n" +
  "| -------------- | :----: | :-------------------------------------------------------------------: | -------------------------------- |\n" +
  "| State          |   ✅    |        [demo](https://mosn.io/layotto/#/zh/start/state/start)         |     提供读写 KV 模型存储的数据的能力 |\n" +
  "| Pub/Sub        |   ✅    |        [demo](https://mosn.io/layotto/#/zh/start/pubsub/start)        |     提供消息的发布/订阅能力          |\n" +
  "| Service Invoke |   ✅    |       [demo](https://mosn.io/layotto/#/zh/start/rpc/helloworld)       |      通过 MOSN 进行服务调用           |\n" +
  "| Config         |   ✅    | [demo](https://mosn.io/layotto/#/zh/start/configuration/start-apollo) |   提供配置增删改查及订阅的能力     |\n" +
  "| Lock           |   ✅    |         [demo](https://mosn.io/layotto/#/zh/start/lock/start)         |    提供 lock/unlock 分布式锁的实现  |\n" +
  "| Sequencer      |   ✅    |      [demo](https://mosn.io/layotto/#/zh/start/sequencer/start)       |  提供获取分布式自增 ID 的能力     |\n" +
  "| File           |   ✅    |         [demo](https://mosn.io/layotto/#/zh/start/file/start)         |   提供访问文件的能力               |\n" +
  "| Binding        |   ✅    |                                 TODO                                  |  提供透传数据的能力               |\n" +
  "\n" +
  "### Service Mesh\n" +
  "\n" +
  "| feature | status |                      quick start                       | desc                          |\n" +
  "| ------- | :----: | :----------------------------------------------------: | ----------------------------- |\n" +
  "| Istio   |   ✅    | [demo](https://mosn.io/layotto/#/zh/start/istio/) | 跟 Istio 集成，作为 Istio 的数据面 |\n" +
  "\n" +
  "### 可扩展性\n" +
  "\n" +
  "| feature  | status |                           quick start                            | desc                        |\n" +
  "| -------- | :----: | :--------------------------------------------------------------: | --------------------------- |\n" +
  "| API 插件 |   ✅    | [demo](https://mosn.io/layotto/#/zh/start/api_plugin/helloworld) | 为 Layotto 添加您自己的 API |\n" +
  "\n" +
  "### 可观测性\n" +
  "\n" +
  "\n" +
  "| feature    | status |                         quick start                         | desc                    |\n" +
  "| ---------- | :----: | :---------------------------------------------------------: | ----------------------- |\n" +
  "| Skywalking |   ✅    | [demo](https://mosn.io/layotto/#/zh/start/trace/skywalking) | Layotto 接入 Skywalking |\n" +
  "\n" +
  "\n" +
  "### Actuator\n" +
  "\n" +
  "| feature        | status |                        quick start                        | desc                                  |\n" +
  "| -------------- | :----: | :-------------------------------------------------------: | ------------------------------------- |\n" +
  "| Health Check   |   ✅    | [demo](https://mosn.io/layotto/#/zh/start/actuator/start) | 查询 Layotto 依赖的各种组件的健康状态 |\n" +
  "| Metadata Query |   ✅    | [demo](https://mosn.io/layotto/#/zh/start/actuator/start) | 查询 Layotto 或应用对外暴露的元信息   |\n" +
  "\n" +
  "### 流量控制\n" +
  "\n" +
  "| feature      | status |                              quick start                              | desc                                       |\n" +
  "| ------------ | :----: | :-------------------------------------------------------------------: | ------------------------------------------ |\n" +
  "| TCP Copy     |   ✅    |   [demo](https://mosn.io/layotto/#/zh/start/network_filter/tcpcopy)   | 把 Layotto 收到的 TCP 数据 dump 到本地文件 |\n" +
  "| Flow Control |   ✅    | [demo](https://mosn.io/layotto/#/zh/start/stream_filter/flow_control) | 限制访问 Layotto 对外提供的 API            |\n" +
  "\n" +
  "### 在 Sidecar 中用 WebAssembly (WASM) 写业务逻辑\n" +
  "\n" +
  "| feature        | status |                      quick start                      | desc                                                             |\n" +
  "| -------------- | :----: | :---------------------------------------------------: | ---------------------------------------------------------------- |\n" +
  "| Go (TinyGo)    |   ✅   | [demo](https://mosn.io/layotto/#/zh/start/wasm/start) | 把用 TinyGo 开发的代码编译成 \\*.wasm 文件跑在 Layotto 上         |\n" +
  "| Rust           |   ✅   | [demo](https://mosn.io/layotto/#/zh/start/wasm/start) | 把用 Rust 开发的代码编译成 \\*.wasm 文件跑在 Layotto 上           |\n" +
  "| AssemblyScript |   ✅   | [demo](https://mosn.io/layotto/#/zh/start/wasm/start) | 把用  AssemblyScript 开发的代码编译成 \\*.wasm 文件跑在 Layotto 上 |\n" +
  "\n" +
  "### 作为 Serverless 的运行时，通过 WebAssembly (WASM) 写 FaaS\n" +
  "\n" +
  "| feature        | status |                      quick start                      | desc                                                                                      |\n" +
  "| -------------- | :----: | :---------------------------------------------------: | ----------------------------------------------------------------------------------------- |\n" +
  "| Go (TinyGo)    |   ✅   | [demo](https://mosn.io/layotto/#/zh/start/faas/start) | 把用 TinyGo 开发的代码编译成 \\*.wasm 文件跑在 Layotto 上，并且使用 k8s 进行调度。         |\n" +
  "| Rust           |   ✅   | [demo](https://mosn.io/layotto/#/zh/start/faas/start) | 把用 Rust 开发的代码编译成 \\*.wasm 文件跑在 Layotto 上，并且使用 k8s 进行调度。           |\n" +
  "| AssemblyScript |   ✅   | [demo](https://mosn.io/layotto/#/zh/start/faas/start) | 把用 AssemblyScript 开发的代码编译成 \\*.wasm 文件跑在 Layotto 上，并且使用 k8s 进行调度。 |\n" +
  "\n" +
  "## Landscapes\n" +
  "\n" +
  "<p align=\"center\">\n" +
  "<img src=\"https://landscape.cncf.io/images/left-logo.svg\" width=\"150\"/>&nbsp;&nbsp;<img src=\"https://landscape.cncf.io/images/right-logo.svg\" width=\"200\"/>\n" +
  "<br/><br/>\n" +
  "Layotto enriches the <a href=\"https://landscape.cncf.io/serverless\">CNCF CLOUD NATIVE Landscape.</a>\n" +
  "</p>\n" +
  "\n" +
  "## 社区\n" +
  "\n" +
  "| 平台                                               | 联系方式                                                                                                                                                     |\n" +
  "| :------------------------------------------------- | :----------------------------------------------------------------------------------------------------------------------------------------------------------- |\n" +
  "| 💬 [钉钉](https://www.dingtalk.com/zh) (用户群)     | 群号: 31912621 或者扫描下方二维码 <br> <img src=\"https://gw.alipayobjects.com/mdn/rms_5891a1/afts/img/A*--KAT7yyxXoAAAAAAAAAAAAAARQnAQ\" height=\"200px\"> <br> |\n" +
  "| 💬 [钉钉](https://www.dingtalk.com/zh) (社区会议群) | 群号：41585216 <br> [Layotto 在每周五晚 8 点进行社区会议，欢迎所有人](zh/community/meeting.md)                                                               |\n" +
  "\n" +
  "[comment]: <> (| 💬 [微信]&#40;https://www.wechat.com/&#41; | 扫描下方二维码添加好友，她会邀请您加入微信群 <br> <img src=\"../img/wechat-group.jpg\" height=\"200px\">)\n" +
  "\n" +
  "## 如何贡献\n" +
  "\n" +
  "[新手攻略：从零开始成为 Layotto 贡献者](zh/development/start-from-zero.md)\n" +
  "\n" +
  "[从哪下手？看看\"新手任务\"列表](https://github.com/mosn/layotto/issues/108#issuecomment-872779356)\n" +
  "\n" +
  "作为技术同学，你是否有过“想参与某个开源项目的开发、但是不知道从何下手”的感觉？\n" +
  "为了帮助大家更好的参与开源项目，社区会定期发布适合新手的新手开发任务，帮助大家 learning by doing!\n" +
  "\n" +
  "[文档贡献指南](zh/development/contributing-doc.md)\n" +
  "\n" +
  "[组件开发指南](zh/development/developing-component.md)\n" +
  "\n" +
  "[Layotto Github Workflow 指南](zh/development/github-workflows.md)\n" +
  "\n" +
  "[Layotto 命令行指南](zh/development/commands.md)\n" +
  "\n" +
  "[Layotto 贡献者指南](zh/development/CONTRIBUTING.md)\n" +
  "\n" +
  "## 贡献者\n" +
  "\n" +
  "感谢所有的贡献者！\n" +
  "\n" +
  "<a href=\"https://github.com/mosn/layotto/graphs/contributors\">\n" +
  "  <img src=\"https://contrib.rocks/image?repo=mosn/layotto\" />\n" +
  "</a>\n" +
  "\n" +
  "## 设计文档\n" +
  "\n" +
  "[Actuator 设计文档](zh/design/actuator/actuator-design-doc.md)\n" +
  "\n" +
  "[Pubsub API 与 Dapr Component 的兼容性](zh/design/pubsub/pubsub-api-and-compability-with-dapr-component.md)\n" +
  "\n" +
  "[Configuration API with Apollo](zh/design/configuration/configuration-api-with-apollo.md)\n" +
  "\n" +
  "[RPC 设计文档](zh/design/rpc/rpc设计文档.md)\n" +
  "\n" +
  "[分布式锁 API 设计文档](zh/design/lock/lock-api-design.md)\n" +
  "\n" +
  "[FaaS 设计文档](zh/design/faas/faas-poc-design.md)\n" +
  "\n" +
  "## FAQ\n" +
  "\n" +
  "### 跟 dapr 有什么差异？\n" +
  "\n" +
  "dapr 是一款优秀的 Runtime 产品，但它本身缺失了 Service Mesh 的能力，而这部分能力对于实际在生产环境落地是至关重要的，因此我们希望把 Runtime 跟 Service Mesh 两种能力结合在一起，满足更复杂的生产落地需求。\n" +
  "\n";
 translate(text).then(r => console.log("完成！！！"))

export async function translate(text: string): Promise<string | undefined> {
  try {
    const chunks = splitText(text, 1000);
    core.info("分为几个部分翻译：" +chunks.length);
    const translatedChunks: (string | undefined)[] = [];
    for (const chunk of chunks) {
      // const resp = await  GoogleTranslate(text, {to: 'en'});
      // core.info("翻译块："+resp.text)
      // translatedChunks.push(resp.text);
      await BingTrans.translate(chunk, "zh-Hans", "en").then(res => {
        const result = res?.translation;
        core.info("翻译成功：" + result);
        translatedChunks.push(result);

      }).catch(err => {
        core.error(err);
      });


    }
      return translatedChunks.join('')
  } catch (err: any) {
    core.error(err)
    core.setFailed(err.message)
  }
}

function splitText(text: string, chunkSize: number) {
  const chunks = [];
  let currentChunk = '';
  for (const char of text) {
    currentChunk += char;
    if (currentChunk.length >= chunkSize) {
      chunks.push(currentChunk);
      currentChunk = '';
    }
  }
  if (currentChunk) {
    chunks.push(currentChunk);
  }
  return chunks;
}

const MAGIC_JOIN_STRING = '@@===='
export const translateText = {
  parse(text?: string) {
    if (!text) {
      return [ undefined, undefined ]
    }

    const translateBody: string[] = text.split(MAGIC_JOIN_STRING)
    return [ translateBody?.[0]?.trim(), translateBody[1].trim() ]
  },
  stringify(body?: string, title?: string) {
    // let needCommitComment = body && body !== 'null' && !isEnglish(body)
    // let needCommitTitle = title && title !== 'null' && !isEnglish(title)
    //
    // let translateOrigin = null
    //
    // if (!needCommitComment) {
    //   core.info('Detect the issue comment body is english already, ignore.')
    // }
    // if (!needCommitTitle) {
    //   core.info('Detect the issue title body is english already, ignore.')
    // }
    // if (!needCommitTitle && !needCommitComment) {
    //   core.info('Detect the issue do not need translated, return.')
    //   return translateOrigin
    // }

    return [ body || 'null', title ].join(MAGIC_JOIN_STRING)
  }
}