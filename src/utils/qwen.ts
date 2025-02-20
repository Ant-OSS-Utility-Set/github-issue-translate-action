import OpenAI from 'openai'

const apiKey = "sk-10fb0c4032ed4ab4ab25e9e357910d4b";
const endpoint = "https://dashscope.aliyuncs.com/compatible-mode/v1";

const openai = new OpenAI(
  {
    // 若没有配置环境变量，请用百炼API Key将下行替换为：apiKey: "sk-xxx",
    apiKey: apiKey,
    baseURL:endpoint
  }
);

export async function qWentranslat(text: string) {
  const completion = await openai.chat.completions.create({
    model: "qwen-plus",
    messages: [
      { role: "system", content: "You are a helpful translate assistant,just translate chinese to english and don't add any other words." },
      { role: "user", content: text }
    ],
  });
  const result = JSON.stringify(completion)
  console.log("qwen result: "+result)
  return completion.choices[0].message.content
}
//
// const text = "有zongbu和beijing两个scql engine节点，其中zongbu表为10亿+数据，beijing表为3千万+数据\n" +
//   "\n" +
//   "任务sql：\n" +
//   "\n" +
//   "``` select  a.user_id_a,a.month_id, a.day_id,a.prov_id   from zbsjfwvfxe_dwd_d_prd_cb_relation_uu a join provbjfpjq_dwd_d_prd_cb_relation_uu b on a.user_id_a=b.user_id_a\n" +
//   "{\"xxlJobId\":126,\"resultMsg\":\"Error: code=320, msg=\"RunExecutionPlan run jobs(ef3ffa1d-e5f5-11ef-a4f5-0242ac160002) failed, catch std::exception=[external/yacl/yacl/link/transport/channel.cc:427] Get data timeout, key=ef3ffa1d-e5f5-11ef-a4f5-0242ac160002-0:821:ALLGATHER\"\"}\n" +
//   "当时针对该问题修改了engine的配置参数link_recv_timeout_ms为半个小时\n" +
//   "\n" +
//   "--link_recv_timeout_ms=1800000 ``` \n" +
//   "执行下面sql时候：\n" +
//   "\n" +
//   "``` select  a.user_id_a,a.month_id, a.day_id,a.prov_id   from zbsjfwvfxe_dwd_d_prd_cb_relation_uu a join provbjfpjq_dwd_d_prd_cb_relation_uu b on a.user_id_a=b.user_id_a  group by a.user_id_a,a.month_id,a.day_id,a.prov_id\n" +
//   "报错内存溢出：{\"xxlJobId\":138,\"resultMsg\":\"Error: code=320, msg=\"RunExecutionPlan run jobs(91e4b1b6-e689-11ef-a4f5-0242ac160002) failed, catch std::exception=[./engine/core/primitive_builder.h:74] Out of memory: malloc of size 274877906944 failed ```\"\"}\n" +
//   "但是内存溢出后任务失败后\n" +
//   "两个参与节点内存一直不回收（持续一天多，也没下来，并且这两个计算节点没有其他正在计算的任务）\n" +
//   "beijing节点\n" +
//   "Image\n" +
//   "zongbu节点\n" +
//   "Image\n" +
//   "\n"


//
// let startTime = new Date().getTime();
//
// await GoogleTrans(text, {to: 'en'}).then((res: { text: string | undefined; }) => {
//   let result = res.text
//   core.info("google翻译成功：" + result);
// }).catch((err: any) => {
//   console.error(err);
// });
// let endtime = new Date().getTime();
// console.log("google耗时："+(endtime-startTime)+"ms")
// startTime = new Date().getTime();
// await BingTrans.translate(text, "zh-Hans", "en").then(res => {
//   let result = res?.translation;
//   core.info("bing翻译成功：" + result);
// }).catch(err => {
//   core.error(err);
// });
// endtime = new Date().getTime();
// console.log("bing耗时："+(endtime-startTime)+"ms")
//
// startTime = new Date().getTime();
// let res = await qWentranslat(text)
// console.log("返回"+res)
// endtime = new Date().getTime();
// console.log("qwen耗时："+(endtime-startTime)+"ms")
