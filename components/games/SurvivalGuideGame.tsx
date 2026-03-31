"use client";

import React, { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface Choice {
  text: string;
  nextScene: string;
  stats?: {
    health?: number;
    sanity?: number;
    popularity?: number;
    career?: number;
  };
}

interface Scene {
  id: string;
  text: string;
  choices: Choice[];
}

interface GameStats {
  health: number;
  sanity: number;
  popularity: number;
  career: number;
  week: number;
}

const scenes: Record<string, Scene> = {
  start: {
    id: "start",
    text: "你是某大厂的一名普通工程师，今天是周一早上九点。你刚踏入公司大门，收到了三封邮件：\n\n📧 HR：本周五进行绩效中期回顾\n📧 导师：项目 Code Review 需要重新设计\n📧 神秘人：茶水间有新口味的咖啡\n\n你决定先...",
    choices: [
      { text: "去茶水间看看有什么咖啡", nextScene: "coffee", stats: { sanity: 5 } },
      { text: "先处理 Code Review 邮件", nextScene: "crisis", stats: { career: 5 } },
      { text: "假装没看见，回家睡回笼觉", nextScene: "truant", stats: { health: -10, popularity: -15 } },
    ],
  },
  
  coffee: {
    id: "coffee",
    text: "茶水间里，你发现传说中的新咖啡其实是速溶咖啡加植脂末。正当你失望时，CTO 走过来拍了拍你的肩膀。\n\nCTO：「小伙子，听说你上周的代码被打回重构了？」\n\n你意识到这可能是转正答辩前的关键时刻...",
    choices: [
      { text: "坦诚承认错误，展示学习态度", nextScene: "honest", stats: { sanity: 5, career: 5 } },
      { text: "甩锅给前实习生留下的祖传代码", nextScene: "blame", stats: { popularity: -10, career: 10 } },
      { text: "转移话题到公司战略层面", nextScene: "strategy", stats: { career: 15, sanity: -5 } },
    ],
  },
  
  crisis: {
    id: "crisis",
    text: "你打开邮件，发现 Code Review 的 comment 多达 47 条。最后一条写着：「建议重新设计架构，考虑到后期扩展性。」\n\n你看了一眼项目 deadline：本周五。\n\n旁边工位的同事探过头来...",
    choices: [
      { text: "虚心请教同事的正确做法", nextScene: "learn", stats: { career: 10, sanity: -5 } },
      { text: "开始和朋友吐槽这场 Code Review", nextScene: "vent", stats: { sanity: 10, popularity: 5 } },
      { text: "默默关掉邮件，去茶水间冷静一下", nextScene: "coffee", stats: { sanity: 5 } },
    ],
  },
  
  truant: {
    id: "truant",
    text: "你回到家，刚躺下就收到主管的夺命连环 call。\n\n主管：「上午的 Retro Meeting 你怎么没来？」\n\n你：「我...我在修 bug」\n\n主管：「好，那这个 P0 级的 bug 修得怎么样了？」",
    choices: [
      { text: "承认自己翘班了", nextScene: "honest_truant", stats: { popularity: 5, career: -15 } },
      { text: "说正在解决技术难题需要断网", nextScene: "lie", stats: { career: 5, sanity: -10 } },
      { text: "直接挂掉电话并关机", nextScene: "rage_quit", stats: { career: -30 } },
    ],
  },
  
  honest: {
    id: "honest",
    text: "CTO 对你的坦诚表示认可，但也提到最近 HC 收紧，需要看到更多产出。\n\nCTO：「我看你潜力不错，但转正这事还得再观察观察。」\n\n你刚松了口气，他又补了一句：「对了，下周一来我办公室聊一下你的职业规划。」",
    choices: [
      { text: "认真准备职业规划文档", nextScene: "prepare_plan", stats: { sanity: -10, career: 10 } },
      { text: "先看看能不能换个组", nextScene: "transfer", stats: { popularity: -5, career: -5 } },
      { text: "表示希望专注技术路线", nextScene: "tech_path", stats: { career: 5 } },
    ],
  },
  
  blame: {
    id: "blame",
    text: "CTO 听完后若有所思地点点头。\n\nCTO：「原来如此，那你有想过怎么改进吗？」\n\n你意识到这是展示你解决问题能力的机会...",
    choices: [
      { text: "展示详细的技术改进方案", nextScene: "solution", stats: { career: 15, sanity: -10 } },
      { text: "说需要先调研一下再汇报", nextScene: "delay", stats: { career: 5 } },
    ],
  },
  
  strategy: {
    id: "strategy",
    text: "CTO 对你的战略思维表示惊讶，但随即话锋一转...\n\nCTO：「说得不错，不过你上次说的 OKR 什么时候能落地？」\n\n你突然意识到自己挖了个坑...",
    choices: [
      { text: "当场制定详细执行计划", nextScene: "plan", stats: { career: 20, sanity: -15, health: -5 } },
      { text: "说需要先和团队对齐", nextScene: "delay", stats: { career: 5, sanity: 5 } },
    ],
  },
  
  learn: {
    id: "learn",
    text: "同事小李叹了口气：「别太当真，上次我被改了 80 多条，最后还是 merge 了。」\n\n他悄悄告诉你：「有个取巧的办法——把 critical 的问题先修了，其他的随便应付一下就行。」",
    choices: [
      { text: "听从建议，用取巧的方式快速过关", nextScene: "quick_fix", stats: { career: 5, sanity: 5 } },
      { text: "坚持高标准，哪怕加班到深夜", nextScene: "overtime", stats: { career: 15, health: -15, sanity: -10 } },
      { text: "私下找 reviewer 沟通，争取降低标准", nextScene: "negotiate", stats: { popularity: 5, career: 5 } },
    ],
  },
  
  vent: {
    id: "vent",
    text: "你在匿名小群里疯狂吐槽，收到一片附和。突然有人@你：「兄弟，你确定这是匿名群吗？」\n\n你看了一眼群名：#茶水间吹水群（工作相关）\n\n你的直属主管也在里面。",
    choices: [
      { text: "赶紧发个表情包缓解尴尬", nextScene: "emoji_damage", stats: { popularity: -20, sanity: 10 } },
      { text: "假装什么都没发，退群跑路", nextScene: "escape", stats: { popularity: -10 } },
      { text: "硬着头皮承认，私下道歉", nextScene: "apologize", stats: { popularity: 5, career: -5 } },
    ],
  },
  
  honest_truant: {
    id: "honest_truant",
    text: "主管沉默了三秒...\n\n主管：「行吧，这周绩效可能受影响。不过你既然说实话了，我也不好追究什么。」\n\n你保住了工作，但周一翘班的事被记在了小本本上。\n\n主管临走时说：「对了，周五的 Retro 你得发言补上。」",
    choices: [
      { text: "认真准备 Retro 发言", nextScene: "retro_speech", stats: { career: 10, sanity: -5 } },
      { text: "随便应付一下", nextScene: "retro_fail", stats: { career: -10, popularity: -5 } },
    ],
  },
  
  lie: {
    id: "lie",
    text: "主管：「什么技术难题需要断网？」\n\n你胡诌了一个分布式系统的名词。\n\n主管：「哦，那正好，下午的技术分享你来讲讲这个。」\n\n你把自己架在火上了...",
    choices: [
      { text: "硬着头皮准备技术分享", nextScene: "tech_talk", stats: { career: 15, health: -10, sanity: -15 } },
      { text: "找借口说需要准备转正答辩", nextScene: "delay", stats: { career: -5 } },
    ],
  },
  
  rage_quit: {
    id: "rage_quit",
    text: "你关掉手机，决定今天什么都不管。\n\n第二天，你收到了一封来自 HR 的邮件：「关于昨天的事，请下午来我办公室谈谈。」\n\n你的职场生涯来到了十字路口。",
    choices: [
      { text: "去和 HR 谈谈", nextScene: "hr_meeting", stats: { career: -10 } },
      { text: "假装生病，请假一周", nextScene: "burnout", stats: { health: 10, career: -20 } },
    ],
  },
  
  solution: {
    id: "solution",
    text: "CTO 对你的方案非常满意，当场表示可以给你一个独立项目的机会。\n\nCTO：「不过这个项目周期很紧，而且...人手不太够。」\n\n你意识到这可能是机遇也可能是陷阱。",
    choices: [
      { text: "接受挑战，展示实力", nextScene: "project_lead", stats: { career: 25, health: -20, sanity: -15 } },
      { text: "表示需要更多资源支持", nextScene: "negotiate_resources", stats: { career: 10, popularity: 5 } },
    ],
  },
  
  delay: {
    id: "delay",
    text: "你的拖延战术似乎奏效了——CTO 暂时忘记了这件事。\n\n但到了周五 Retro Meeting，你的 OKR 还是一片空白。\n\n主管在会上点名问你进展...",
    choices: [
      { text: "现场编造一些进展数据", nextScene: "fake_progress", stats: { career: -10, sanity: -10 } },
      { text: "坦诚说遇到了困难，正在解决", nextScene: "honest_difficulties", stats: { career: 5, popularity: 5 } },
    ],
  },
  
  plan: {
    id: "plan",
    text: "你当场制定了详细的执行计划，CTO 对你的效率印象深刻。\n\nCTO：「不错，就按这个来。下周一的 meeting 你来主持。」\n\n你又给自己挖了一个坑...",
    choices: [
      { text: "继续", nextScene: "ending_planner", stats: { career: 10, sanity: -10 } },
    ],
  },
  
  fake_progress: {
    id: "fake_progress",
    text: "你现场编造了一些进展数据，主管似乎没有发现异常。\n\n但你心里清楚，这只是暂时的掩盖。\n\n一个月后，问题终于爆发了...",
    choices: [
      { text: "继续", nextScene: "ending_disaster", stats: { career: -20, sanity: -15 } },
    ],
  },
  
  honest_difficulties: {
    id: "honest_difficulties",
    text: "你坦诚地说遇到了困难。\n\n主管：「没事，大家都是这么过来的。我让小李帮帮你。」\n\n你感到一丝暖意...\n\n同事小李主动来帮你分析问题。",
    choices: [
      { text: "继续", nextScene: "ending_techlead", stats: { career: 10, popularity: 10 } },
    ],
  },
  
  prepare_plan: {
    id: "prepare_plan",
    text: "你花了一整晚准备职业规划文档，列出了详细的学习路径和目标。\n\n周一，你准时到了 CTO 办公室。CTO 看完后点点头...\n\nCTO：「规划不错，但你有没有想过往管理方向发展？」",
    choices: [
      { text: "表示对技术更感兴趣", nextScene: "tech_path", stats: { career: 10, sanity: -5 } },
      { text: "说可以尝试一下管理", nextScene: "management_path", stats: { career: 15, popularity: -5, sanity: -10 } },
      { text: "问管理岗的待遇区别", nextScene: "management_benefits", stats: { career: 5, sanity: 5 } },
    ],
  },
  
  transfer: {
    id: "transfer",
    text: "你开始打听内部转组的可能性。HR 告诉你有个组的 leader 正好在招人。\n\n但当你联系那个组的 leader 时，他/她问你：「你为什么想离开现在的组？」",
    choices: [
      { text: "说实话：觉得当前组不适合发展", nextScene: "transfer_honest", stats: { popularity: -10, career: 5 } },
      { text: "说希望接触不同的业务", nextScene: "transfer_diplomatic", stats: { career: 5, popularity: 5 } },
      { text: "算了，还是不转了", nextScene: "transfer_giveup", stats: { sanity: -5 } },
    ],
  },
  
  tech_path: {
    id: "tech_path",
    text: "CTO 对你的选择表示支持。\n\nCTO：「好，那我就按技术专家的方向培养你。不过走技术路线也需要有拿得出手的项目。」\n\n正好这时，产品经理发来一个紧急需求...",
    choices: [
      { text: "接受这个有挑战的技术需求", nextScene: "challenging_demand", stats: { career: 20, health: -15, sanity: -10 } },
      { text: "说目前手上的工作已经满了", nextScene: "refuse_demand", stats: { popularity: -5, career: -10 } },
    ],
  },
  
  retro_speech: {
    id: "retro_speech",
    text: "你在 Retro Meeting 上认真发言，分析了自己的问题并提出了改进方案。\n\n主管听完后说：「不错，有自我反思的能力。」\n\n其他同事也对你的态度表示认可。\n\n会后，有个同事悄悄问你：「你愿意加入我们的开源项目吗？」",
    choices: [
      { text: "欣然接受，拓展技术圈", nextScene: "opensource_join", stats: { career: 15, popularity: 10, health: -5 } },
      { text: "婉拒，想专注当前工作", nextScene: "opensource_decline", stats: { sanity: 5, career: -5 } },
    ],
  },
  
  retro_fail: {
    id: "retro_fail",
    text: "你在 Retro 上敷衍了事，主管的脸色越来越难看。\n\n会后，主管把你留下来：「你这个态度，转正的事可能要重新评估了。」\n\n你感到一阵凉意...",
    choices: [
      { text: "赶紧道歉，表示会改正", nextScene: "apologize_retro", stats: { career: -5, popularity: 5 } },
      { text: "觉得不公平，开始抱怨", nextScene: "complain_retro", stats: { career: -20, popularity: -10 } },
    ],
  },
  
  negotiate: {
    id: "negotiate",
    text: "你私下找到 reviewer，晓之以理动之以情。\n\nreviewer 叹了口气：「行吧，我看在你是新人的份上，有些非关键的可以放你一马。但下次注意！」\n\n你松了口气，同时也在想：这样对吗？\n\nreviewer 临走时补了一句：「对了，你知道为什么你们的 deadline 这么紧吗？」",
    choices: [
      { text: "追问原因", nextScene: "deadline_truth", stats: { sanity: -5 } },
      { text: "算了，不关我的事", nextScene: "deadline_ignore", stats: { sanity: 5 } },
    ],
  },
  
  quick_fix: {
    id: "quick_fix",
    text: "你按照「建议」快速提交了代码。reviewer 勉强 approve 了，但临走时意味深长地看了你一眼。\n\n一周后，你的代码成功上线——带着三个 bug。\n\n这时你收到消息：测试团队发现了一个严重问题...",
    choices: [
      { text: "赶紧修复，掩盖错误", nextScene: "bug_coverup", stats: { career: -15, popularity: -10 } },
      { text: "坦诚承认，请求延期修复", nextScene: "bug_admit", stats: { career: 5, popularity: 5 } },
    ],
  },
  
  overtime: {
    id: "overtime",
    text: "连续三天加班到凌晨两点，你终于把所有 comment 都处理完了。\n\nPR merge 的那一刻，你感觉自己完成了某种壮举。\n\n但周五的 Retro Meeting 上，主管说：「以后大家要注意代码质量，不要总是靠加班解决问题。」\n\n你：？？？\n\n更糟的是，你发现下周还要继续加班...",
    choices: [
      { text: "继续拼命，争取转正机会", nextScene: "grind_continues", stats: { career: 15, health: -25, sanity: -20 } },
      { text: "反思工作方式，寻找平衡", nextScene: "worklife_balance", stats: { career: 5, health: 10, sanity: 10 } },
    ],
  },
  
  emoji_damage: {
    id: "emoji_damage",
    text: "你发了一个🙏表情包，试图化解尴尬。\n\n但第二天，你发现主管在群里发了一条：「最近组里有些同学精力不太集中，注意平衡工作和生活哦。」\n\n虽然没点名，但你总觉得所有人都在看你...\n\n更糟糕的是，你发现有人在匿名群发了你吐槽的截图。",
    choices: [
      { text: "找发帖的人对质", nextScene: "confront_poster", stats: { popularity: -15, career: -5 } },
      { text: "当作什么都没发生", nextScene: "ignore_rumor", stats: { sanity: -10 } },
    ],
  },
  
  escape: {
    id: "escape",
    text: "你悄悄退群，以为自己做得天衣无缝。\n\n周一早上，主管找你单独聊：「那个群是我建的，什么消息我都能看到。」\n\n你感到一阵寒意...\n\n主管继续说：「不过我看你平时表现还行，这次就不追究了。但我希望你能专注在工作上。」",
    choices: [
      { text: "诚恳道歉，保证以后注意", nextScene: "apology_accepted", stats: { popularity: 5, career: 5 } },
      { text: "辩解说是别人的截图", nextScene: "blame_rumor", stats: { popularity: -15, career: -10 } },
    ],
  },
  
  apologize: {
    id: "apologize",
    text: "你鼓起勇气私信主管道歉。\n\n主管：「没事，大家压力大的时候都会吐槽。理解。」\n\n你松了一口气，同时对主管多了几分敬意。\n\n主管又发来一条：「对了，下周有个客户演示，你跟我一起去。」",
    choices: [
      { text: "欣然接受，学习演示技巧", nextScene: "client_demo", stats: { career: 15, popularity: 10, sanity: -10 } },
      { text: "找借口推脱", nextScene: "refuse_demo", stats: { popularity: -10, career: -5 } },
    ],
  },
  
  tech_talk: {
    id: "tech_talk",
    text: "你花了整个周末准备一个半小时的技术分享。\n\n结果会上只有五个人来，其中三个还是 HR。\n\nCTO 点评：「内容不错，但下次注意控制时间。」\n\n你：这就结束了？？\n\n更意外的是，会后有个其他部门的同事找你：「我们组正好需要这方面的人才，有兴趣吗？」",
    choices: [
      { text: "交换联系方式，了解详情", nextScene: "recruiter_contact", stats: { career: 10, popularity: 5 } },
      { text: "礼貌婉拒，专心当前工作", nextScene: "recruiter_decline", stats: { sanity: 5 } },
    ],
  },
  
  hr_meeting: {
    id: "hr_meeting",
    text: "HR 姐姐态度很好，给你倒了杯茶。\n\nHR：「我们理解你可能有压力，但这种行为会影响团队士气。考虑到你是初犯，这次就不记入档案了。」\n\n你感激涕零，发誓要好好工作。\n\n然后她递过来一张加班申请单：「既然精神这么好，下周的加班名单加一下你。」",
    choices: [
      { text: "默默接受", nextScene: "accept_overtime", stats: { health: -15, career: 5 } },
      { text: "委婉拒绝，说有其他安排", nextScene: "refuse_overtime", stats: { popularity: -5, career: -10 } },
    ],
  },
  
  burnout: {
    id: "burnout",
    text: "你请了一周假，在家躺尸。\n\n假期结束回来，你发现工位上堆了三箱待处理的需求。\n\n旁边的同事说：「都是你的，别人的都处理完了，就等你了。」\n\n你感觉更累了...\n\n这时你收到一封猎头的邮件：「某创业公司正在招聘技术骨干...」",
    choices: [
      { text: "认真考虑跳槽机会", nextScene: "startup_offer", stats: { career: 10, sanity: 10 } },
      { text: "忽略邮件，继续埋头苦干", nextScene: "ignore_startup", stats: { career: -5, health: -15 } },
    ],
  },
  
  project_lead: {
    id: "project_lead",
    text: "独立项目的机会来了！你兴奋地开始规划...\n\n但现实是残酷的——你发现组里的「人手不够」是真的。整个项目就你一个人。\n\n你：说好的人呢？？？\n\n产品经理还不断催你：「这个功能竞品已经上线了，我们得加快！」",
    choices: [
      { text: "拼命一个人扛下项目", nextScene: "solo_project", stats: { career: 25, health: -30, sanity: -25 } },
      { text: "和 PM 谈判，争取延期", nextScene: "negotiate_deadline", stats: { career: 10, popularity: 10 } },
      { text: "向 CTO 反映真实情况", nextScene: "escalate_cto", stats: { career: 5, popularity: -5 } },
    ],
  },
  
  negotiate_resources: {
    id: "negotiate_resources",
    text: "你提出了资源需求，CTO 思考了一下...\n\nCTO：「这样吧，我给你调一个实习生过来。」\n\n你看着这个连 Git 都不太会用的大三实习生，陷入了沉思...\n\n他说：「哥，我是来学习的，您多关照。」",
    choices: [
      { text: "花时间带实习生", nextScene: "mentor_intern", stats: { career: 10, sanity: -10, popularity: 15 } },
      { text: "让他打杂，自己干核心部分", nextScene: "exploit_intern", stats: { career: 5, popularity: -15 } },
    ],
  },
  
  management_path: {
    id: "management_path",
    text: "你开始参与一些管理相关的会议，慢慢了解团队运作。\n\n三个月后，主管离职了，空出了一个 TL 的位置。\n\n但同时，技术委员会也在选拔技术专家...",
    choices: [
      { text: "申请 TL 职位", nextScene: "tl_position", stats: { career: 20, health: -15, popularity: -5 } },
      { text: "申请技术专家", nextScene: "principal_position", stats: { career: 15, sanity: -10 } },
      { text: "两个都申请", nextScene: "dual_application", stats: { career: 10, sanity: -15, popularity: 5 } },
    ],
  },
  
  management_benefits: {
    id: "management_benefits",
    text: "CTO 笑了笑，给你介绍了管理岗和发展路线。\n\nCTO：「管理岗工资高一些，但也更累。你得对整个团队的产出负责。」\n\n你陷入了沉思...\n\n这时 HR 发来消息：「你的转正审批通过了！」",
    choices: [
      { text: "专心庆祝转正", nextScene: "probation_passed", stats: { sanity: 25, career: 10 } },
      { text: "冷静思考职业规划", nextScene: "career_planning", stats: { career: 5, sanity: 10 } },
    ],
  },
  
  career_planning: {
    id: "career_planning",
    text: "你冷静下来，开始认真规划自己的职业道路。\n\n你写了一份详细的三年计划，涵盖技术提升、管理能力、业务理解等方面。\n\n五年后，你回顾这份计划，发现大部分都实现了。\n\n你成了公司最年轻的技术总监之一。",
    choices: [
      { text: "继续", nextScene: "ending_planner", stats: { career: 20, sanity: 15 } },
    ],
  },
  
  challenging_demand: {
    id: "challenging_demand",
    text: "你接下了这个有挑战的需求，开始没日没夜地开发。\n\n两周后，你成功上线了这个功能。\n\nCTO 在群里表扬了你：「这就是技术人的榜样！」\n\n但你也因此错过了女朋友的生日...",
    choices: [
      { text: "继续专注工作", nextScene: "workaholic_continue", stats: { career: 20, health: -20, sanity: -15, popularity: -10 } },
      { text: "反思工作生活平衡", nextScene: "balance_reflection", stats: { career: 10, health: 5, sanity: 10 } },
    ],
  },
  
  refuse_demand: {
    id: "refuse_demand",
    text: "PM 脸上闪过一丝不悦，但还是表示理解。\n\n几天后，你发现那个需求被外包团队接了。\n\n而你原本的 deadline 变成了更紧的新 deadline...\n\n有同事悄悄告诉你：「得罪 PM 不会有好果子吃的。」",
    choices: [
      { text: "找 PM 和解", nextScene: "pm_reconcile", stats: { popularity: 10, career: -5 } },
      { text: "继续做好自己的事", nextScene: "stay_focus", stats: { career: 5, popularity: -10 } },
    ],
  },
  
  opensource_join: {
    id: "opensource_join",
    text: "你加入了这个开源项目，贡献了几个高质量的 PR。\n\n半年后，你的 GitHub 多了几千个 star。\n\n有猎头发来消息：「有个公司想挖你去做开源运营，年薪还不错。」",
    choices: [
      { text: "考虑这个 offer", nextScene: "opensource_career", stats: { career: 15, sanity: 10 } },
      { text: "继续在大厂工作", nextScene: "stay_bigcorp", stats: { career: 5, popularity: 5 } },
    ],
  },
  
  opensource_decline: {
    id: "opensource_decline",
    text: "你婉拒了邀请，专注在当前的工作上。\n\n一年后，那个加入开源项目的同事出去创业了，拿到了融资。\n\n而你还在原地...\n\n但你的技术越来越扎实，晋升成了 Senior。",
    choices: [
      { text: "继续在大厂深耕", nextScene: "ending_senior", stats: { career: 20, sanity: 5 } },
    ],
  },
  
  ending_senior: {
    id: "ending_senior",
    text: "【正道·深耕篇】\n\n你继续在大厂深耕，一步一个脚印。\n\n七年后，你终于晋升到了 P8。\n\n回首往事，你庆幸自己的选择——稳定、有钱、有影响力。\n\n这就是你想要的幸福吧。\n\n=== GAME OVER ===\n\n你的结局：资深专家",
    choices: [
      { text: "重新开始", nextScene: "start" },
    ],
  },
  
  client_demo: {
    id: "client_demo",
    text: "你跟着主管去见了客户。客户是某传统行业的老板，对技术一窍不通。\n\n他问：「这个东西能不能帮我们省钱？」\n\n主管看向你...",
    choices: [
      { text: "用通俗语言解释商业价值", nextScene: "demo_success", stats: { career: 20, popularity: 15 } },
      { text: "用技术术语解释", nextScene: "demo_tech", stats: { career: 5, popularity: -10 } },
    ],
  },
  
  negotiator_contact: {
    id: "recruiter_contact",
    text: "你和那个猎头聊了聊，发现对方开出的条件很诱人——薪资涨 50%，还能带团队。\n\n但你也听说这家创业公司加班很严重...\n\n你开始纠结。",
    choices: [
      { text: "接受 offer，出去闯闯", nextScene: "startup_leap", stats: { career: 15, health: -15 } },
      { text: "继续在大厂发展", nextScene: "bigcorp_stay", stats: { career: 10, sanity: 10 } },
    ],
  },
  
  pm_reconcile: {
    id: "pm_reconcile",
    text: "你主动找 PM 喝了杯咖啡，解释了当时的情况。\n\nPM：「其实我也不是针对你，上面的压力也很大。」\n\n你们冰释前嫌，甚至成了朋友。\n\n后来 PM 晋升去了别的公司，还推荐你加入了他的新团队。",
    choices: [
      { text: "接受推荐", nextScene: "pm_recommendation", stats: { career: 20, popularity: 15 } },
      { text: "留在现团队", nextScene: "stay_current_team", stats: { career: 5, popularity: 10 } },
    ],
  },
  
  solo_project: {
    id: "solo_project",
    text: "你一个人扛下了整个项目，连续两个月每天加班到凌晨。\n\n项目终于上线了！CTO 在全员会上点名表扬了你。\n\n但你体检发现了三高的迹象...\n\n医生说：「再这样下去，你可能会猝死。」",
    choices: [
      { text: "继续拼命", nextScene: "ending_martyr", stats: { career: 25, health: -40, sanity: -30 } },
      { text: "开始养生", nextScene: "ending_health", stats: { career: 10, health: 10, sanity: 15 } },
    ],
  },
  
  negotiate_deadline: {
    id: "negotiate_deadline",
    text: "你和 PM 进行了艰难的谈判。\n\n最终你们达成了一致：砍掉一些非核心功能，延期一周。\n\nPM：「行吧，但我得跟老板汇报说是你能力不行。」",
    choices: [
      { text: "接受这个说法", nextScene: "blame_accept", stats: { popularity: -10, career: 5 } },
      { text: "反驳，要求公正评价", nextScene: "fair_evaluation", stats: { popularity: 5, career: -10 } },
    ],
  },
  
  mentor_intern: {
    id: "mentor_intern",
    text: "你花了大量时间带这个实习生，虽然有时候会很累。\n\n但看着 ta 从连 Git 都不会，到能独立完成需求，你感到很欣慰。\n\n一年后，实习生也成了 Senior。而你，顺理成章地晋升为主管。",
    choices: [
      { text: "继续", nextScene: "ending_manager", stats: { career: 25, popularity: 15, sanity: -5 } },
    ],
  },
  
  exploit_intern: {
    id: "exploit_intern",
    text: "你让实习生做些杂活，自己专注核心开发。\n\n但实习生受不了了，跑去向 HR 投诉：「我的导师什么都不教我。」\n\nHR 找你谈话...",
    choices: [
      { text: "承认错误，改正态度", nextScene: "intern_apologize", stats: { career: -5, popularity: 5 } },
      { text: "辩解说是为了实习生好", nextScene: "intern_blame", stats: { career: -15, popularity: -10 } },
    ],
  },
  
  tl_position: {
    id: "tl_position",
    text: "你成功晋升为 Team Lead，开始带五个人。\n\n但管理工作比你想象的复杂——有人要离职，有人效率低，有人互相吵架...\n\n你开始怀念以前单纯写代码的日子。",
    choices: [
      { text: "继续坚持管理路线", nextScene: "ending_manager", stats: { career: 20, health: -10, sanity: -15 } },
      { text: "申请转回技术岗", nextScene: "return_tech", stats: { career: -10, sanity: 15 } },
    ],
  },
  
  principal_position: {
    id: "principal_position",
    text: "你成功晋升为 Principal Engineer，开始参与技术决策。\n\n但你也发现，高处不胜寒——技术越往上走，越需要政治斗争的能力。\n\nCTO 问你：「愿不愿意转去做技术战略？」",
    choices: [
      { text: "接受，转向战略方向", nextScene: "ending_strategist", stats: { career: 25, sanity: -10 } },
      { text: "拒绝，继续深耕技术", nextScene: "ending_technician", stats: { career: 15, sanity: 10 } },
    ],
  },
  
  dual_application: {
    id: "dual_application",
    text: "你两个职位都申请了，但结果只拿到了一个——而且是在另一家公司。\n\nCTO：「我们很遗憾你要离开，但祝你好运。」\n\n你开始新的旅程...",
    choices: [
      { text: "继续", nextScene: "ending_newjourney", stats: { career: 15, sanity: 10 } },
    ],
  },
  
  probation_passed: {
    id: "probation_passed",
    text: "你正式成为公司的一员！HR 发来转正祝贺邮件。\n\n但转正后的第一个任务就是处理一个线上故障。\n\n这个故障是上一个实习生留下的...技术债终于爆发了。",
    choices: [
      { text: "快速修复", nextScene: "quick_fix_bug", stats: { career: 10, sanity: -5 } },
      { text: "重构代码，彻底解决", nextScene: "refactor_debt", stats: { career: 15, health: -10, sanity: -10 } },
    ],
  },
  
  demo_success: {
    id: "demo_success",
    text: "你的通俗解释让客户赞不绝口。\n\n客户：「就这个了！我们签合同！」\n\n主管对你竖起大拇指：「干得漂亮，这个项目分你奖金。」",
    choices: [
      { text: "继续", nextScene: "ending_bonus", stats: { career: 20, popularity: 15, sanity: 10 } },
    ],
  },
  
  startup_leap: {
    id: "startup_leap",
    text: "你加入了新公司，发现一切都很新奇——扁平管理、快速迭代、没有繁文缛节。\n\n但也有代价：工资少一点，加班多一点。\n\n两年后，公司 B 轮融资失败，倒闭了。\n\n你又一次站在了十字路口。",
    choices: [
      { text: "继续", nextScene: "ending_startup_fail", stats: { career: -10, sanity: 5 } },
    ],
  },
  
  workaholic_continue: {
    id: "workaholic_continue",
    text: "你继续拼命工作，绩效越来越好。\n\n三年后，你晋升成了部门最年轻的高级工程师。\n\n但你的头发越来越少，女朋友也分手了...\n\n某天半夜，你突然在工位上晕倒。",
    choices: [
      { text: "继续", nextScene: "ending_collapse", stats: { career: 20, health: -35, sanity: -25 } },
    ],
  },
  
  balance_reflection: {
    id: "balance_reflection",
    text: "你开始反思，决定改变工作方式。\n\n你学会了说不，学会了拒绝无效加班。\n\n一开始主管很不爽，但后来发现你的效率反而更高了。\n\n你找到了工作和生活的平衡点。",
    choices: [
      { text: "继续", nextScene: "ending_balance", stats: { career: 15, sanity: 15, health: 10 } },
    ],
  },
  
  grind_continues: {
    id: "grind_continues",
    text: "你继续拼命，终于换来了转正机会。\n\n但转正后，你发现一切才刚刚开始——更高的山峰等着你去攀登。\n\n主管：「继续保持，年底绩效争取拿 A。」\n\n你突然想起，自己已经很久没有在零点前睡过觉了。",
    choices: [
      { text: "继续", nextScene: "ending_grinder", stats: { career: 20, health: -30, sanity: -25 } },
    ],
  },
  
  worklife_balance: {
    id: "worklife_balance",
    text: "你开始有意识地控制工作时间，效率反而提升了。\n\n主管注意到了你的变化：「哎，这样不行啊，OKR 完不成。」\n\n你：「但我完成的代码质量更高了。」\n\n主管无言以对...",
    choices: [
      { text: "继续坚持自己的方式", nextScene: "ending_rebel", stats: { career: 10, sanity: 20, popularity: 5 } },
      { text: "妥协，重新拼命", nextScene: "ending_grinder", stats: { career: 15, health: -20, sanity: -15 } },
    ],
  },
  
  bug_admit: {
    id: "bug_admit",
    text: "你坦诚地向团队承认了问题，并申请延期修复。\n\n主管：「勇气可嘉。但下次注意，测试要充分再上线。」\n\n你修复了 bug，还写了一篇复盘文档，分享给了全组。\n\n从此你多了一个外号：「Bug 终结者」。",
    choices: [
      { text: "继续", nextScene: "ending_bugslayer", stats: { career: 15, popularity: 15, sanity: 10 } },
    ],
  },
  
  startup_offer: {
    id: "startup_offer",
    text: "你和猎头深入聊了聊，发现这家创业公司的创始团队来自 BAT，技术实力很强。\n\n他们开的条件是：薪资不变，但给期权。\n\n你陷入了纠结...",
    choices: [
      { text: "接受 offer", nextScene: "startup_leap", stats: { career: 10, sanity: 5 } },
      { text: "留在大厂", nextScene: "bigcorp_stay", stats: { career: 5, sanity: 5 } },
    ],
  },
  
  bigcorp_stay: {
    id: "bigcorp_stay",
    text: "你决定留在大厂，继续深耕。\n\n五年后，你成了某个领域的专家，虽然工资不是最高的，但胜在稳定。\n\n你开始思考：这就是我想要的生活吗？\n\n也许某个时刻，你会再次选择出发...\n\n但现在，你决定珍惜当下。",
    choices: [
      { text: "继续", nextScene: "ending_stability", stats: { career: 15, sanity: 10, health: 5 } },
    ],
  },
  
  deadline_truth: {
    id: "deadline_truth",
    text: "reviewer 压低声音说：「因为 PM 答应了客户不可能的 deadline，导致我们一直在赶工。」\n\n「这不是你的问题，是整个流程的问题。」\n\n你想了想，决定...",
    choices: [
      { text: "向 CTO 反映流程问题", nextScene: "process_feedback", stats: { career: 10, popularity: -5 } },
      { text: "明哲保身，不多管闲事", nextScene: "stay_silent", stats: { sanity: 5 } },
    ],
  },
  
  deadline_ignore: {
    id: "deadline_ignore",
    text: "你选择不追问原因，继续埋头工作。\n\n一个月后，团队又经历了一次紧急 deadline 赶工。\n\n你开始意识到，这种循环可能永远不会结束...\n\n但你没有选择，只能继续。",
    choices: [
      { text: "继续", nextScene: "ending_neutral", stats: { career: 5, sanity: -5 } },
    ],
  },
  
  transfer_honest: {
    id: "transfer_honest",
    text: "那个 leader 听完后沉默了一会儿...\n\nleader：「谢谢你的坦诚。但我需要的是能和我们一起成长的人，而不是遇到困难就想逃跑的人。」\n\n你被拒绝了。",
    choices: [
      { text: "继续留在原组", nextScene: "stay_original", stats: { career: -5, sanity: -10 } },
    ],
  },
  
  transfer_diplomatic: {
    id: "transfer_diplomatic",
    text: "那个 leader 对你的回答很满意。\n\nleader：「正好我们在做一个新项目，需要不同背景的人。你有兴趣吗？」\n\n两周后，你成功转组了。",
    choices: [
      { text: "继续", nextScene: "ending_transfer", stats: { career: 15, popularity: 10, sanity: 10 } },
    ],
  },
  
  pm_recommendation: {
    id: "pm_recommendation",
    text: "你加入了 PM 的新团队，发现一切都很好——没有 996，没有宫斗，只有纯粹的技术讨论。\n\n但好景不长，PM 又晋升去了更大的公司...\n\n你开始思考自己的下一步。",
    choices: [
      { text: "继续", nextScene: "ending_newpath", stats: { career: 15, sanity: 10 } },
    ],
  },
  
  escalate_cto: {
    id: "escalate_cto",
    text: "你鼓起勇气去找 CTO，反映了真实情况。\n\nCTO 听完后沉默了很久...\n\nCTO：「谢谢你敢于说真话。我会处理的。」\n\n一周后，你发现项目分配了更多人手。\n\n但你也因此被贴上了「刺头」的标签。",
    choices: [
      { text: "继续", nextScene: "ending_whistleblower", stats: { career: 5, popularity: -15, sanity: 10 } },
    ],
  },
  
  apology_accepted: {
    id: "apology_accepted",
    text: "主管接受了你的道歉，还拍了拍你的肩膀。\n\n主管：「年轻人都会犯错，改了就好。以后有什么事可以直接跟我说。」\n\n你感到一股暖流。\n\n从那以后，你和主管的关系反而更近了。",
    choices: [
      { text: "继续", nextScene: "ending_loyalist", stats: { career: 10, popularity: 15, sanity: 10 } },
    ],
  },
  
  accept_overtime: {
    id: "accept_overtime",
    text: "你默默接受了加班安排。\n\n连续一个月每天到十点，你感觉自己已经变成了行尸走肉。\n\n但你的工资卡上多了一笔加班费...\n\n某天，你突然流了鼻血。",
    choices: [
      { text: "继续", nextScene: "ending_blood", stats: { health: -25, career: 10 } },
    ],
  },
  
  refuse_overtime: {
    id: "refuse_overtime",
    text: "HR 脸色变得有些难看。\n\nHR：「加班是集体的需要，你怎么只顾自己呢？」\n\n你被记入了「不配合团队」的小本本。\n\n但你也保住了自己的时间。",
    choices: [
      { text: "继续", nextScene: "ending_independent", stats: { popularity: -10, sanity: 15 } },
    ],
  },
  
  blame_accept: {
    id: "blame_accept",
    text: "你接受了这个评价，默默承受了委屈。\n\nPM 把锅顺利甩了出去，很高兴，对你的态度也变好了。\n\n你学到了职场第一课：有时候，委屈求全是一种生存智慧。",
    choices: [
      { text: "继续", nextScene: "ending_survivor_v2", stats: { career: 10, sanity: -5, popularity: 5 } },
    ],
  },
  
  fair_evaluation: {
    id: "fair_evaluation",
    text: "你和 PM 发生了争执，最后惊动了主管。\n\n主管调查后发现真相，给你道了歉。\n\nPM 被批评了一顿，但你们之间的关系也彻底破裂了。",
    choices: [
      { text: "继续", nextScene: "ending_warrior", stats: { career: 5, popularity: -10, sanity: 10 } },
    ],
  },
  
  intern_apologize: {
    id: "intern_apologize",
    text: "你承认了错误，开始认真带实习生。\n\n后来这个实习生成了你的左臂右膀，你们一起完成了很多项目。\n\n你学到了：带人不是消耗，是投资。",
    choices: [
      { text: "继续", nextScene: "ending_mentor_v2", stats: { career: 15, popularity: 15, sanity: 10 } },
    ],
  },
  
  return_tech: {
    id: "return_tech",
    text: "你申请转回技术岗，主管有些失望但同意了。\n\n回到技术岗位后，你如鱼得水，代码写得飞快。\n\n三年后，你成了公司最厉害的技术专家之一。\n\n有时候，退一步反而海阔天空。",
    choices: [
      { text: "继续", nextScene: "ending_techmaster", stats: { career: 20, sanity: 15 } },
    ],
  },
  
  quick_fix_bug: {
    id: "quick_fix_bug",
    text: "你快速修好了 bug，上线了。\n\n但这个 bug 其实是更大问题的冰山一角...\n\n一个月后，系统在双十一活动中彻底崩溃了。\n\nCTO 在复盘会上大发雷霆...",
    choices: [
      { text: "继续", nextScene: "ending_disaster", stats: { career: -30, popularity: -20 } },
    ],
  },
  
  refactor_debt: {
    id: "refactor_debt",
    text: "你花了两个月重构了整个模块，解决了历史遗留问题。\n\n虽然短期内看不到产出，但后续的开发效率大幅提升了。\n\n主管：「这就是技术眼光。」\n\n你被评为年度最佳员工。",
    choices: [
      { text: "继续", nextScene: "ending_reformer", stats: { career: 25, popularity: 10, sanity: 5 } },
    ],
  },
  
  confront_poster: {
    id: "confront_poster",
    text: "你找到了那个匿名发帖的人，结果发现是一个刚入职的应届生。\n\n他很害怕：「我不是故意的，只是想吐槽一下...」\n\n你看着他想起了当年的自己。",
    choices: [
      { text: "原谅他", nextScene: "forgive_leave", stats: { popularity: 10, sanity: 15 } },
      { text: "向 HR 投诉", nextScene: "hr_complaint", stats: { popularity: -15, career: -5 } },
    ],
  },
  
  forgive_leave: {
    id: "forgive_leave",
    text: "你拍拍他的肩膀：「没事，以后注意点就行了。」\n\n应届生感激涕零，后来成了你的得力下属。\n\n你学到了：有时候宽容比惩罚更有力量。",
    choices: [
      { text: "继续", nextScene: "ending_forgiver", stats: { popularity: 15, career: 10, sanity: 10 } },
    ],
  },
  
  hr_complaint: {
    id: "hr_complaint",
    text: "你向 HR 反映了这件事。\n\nHR 调查后发现，那个应届生确实违反了公司规定。\n\n但同时，也有人觉得你小题大做，不懂得包容新人。\n\n你在公司里的名声变得两极化...",
    choices: [
      { text: "继续", nextScene: "ending_divisive", stats: { popularity: -10, career: 5 } },
    ],
  },
  
  ending_divisive: {
    id: "ending_divisive",
    text: "【分歧·两极篇】\n\n你因为这次事件在公司里变得闻名。\n\n有人欣赏你的原则性，认为你敢于维权。\n\n也有人觉得你不够宽容，不懂得给新人机会。\n\n你在公司的处境变得微妙...\n\n=== GAME OVER ===\n\n你的结局：争议人物",
    choices: [
      { text: "重新开始", nextScene: "start" },
    ],
  },
  
  stay_silent: {
    id: "stay_silent",
    text: "你选择了沉默，明哲保身。\n\n半年后，那个流程问题导致了严重的线上事故。\n\n多个同事被追责，包括 reviewer。\n\n你庆幸自己没有卷入，但也有些愧疚...",
    choices: [
      { text: "继续", nextScene: "ending_neutral", stats: { career: 5, sanity: -5 } },
    ],
  },
  
  process_feedback: {
    id: "process_feedback",
    text: "CTO 认真听了你的反馈，开始推动流程改进。\n\n但这也触动了一些人的利益...\n\n有人在背后说你爱出风头，打小报告。\n\n你成了派系斗争的牺牲品。",
    choices: [
      { text: "继续", nextScene: "ending_scapegoat", stats: { career: -20, popularity: -20, sanity: -10 } },
    ],
  },
  
  stay_original: {
    id: "stay_original",
    text: "你决定继续留在原组。\n\n但那次的拒绝像一根刺，让你开始重新审视自己的职业规划。\n\n也许，是时候做出一些改变了。",
    choices: [
      { text: "继续", nextScene: "ending_selfreflection", stats: { career: 5, sanity: 10 } },
    ],
  },
  
  opensource_career: {
    id: "opensource_career",
    text: "你转型做了开源运营，发现这是一个全新的世界。\n\n你认识了世界各地的开发者，参与了顶级开源项目。\n\n虽然工资没有大厂高，但你的技术影响力反而更大了。",
    choices: [
      { text: "继续", nextScene: "ending_opensource", stats: { career: 15, sanity: 20, popularity: 10 } },
    ],
  },
  
  stay_bigcorp: {
    id: "stay_bigcorp",
    text: "你继续在大厂工作，一步一个脚印。\n\n七年后，你终于晋升到了 P8。\n\n回首往事，你庆幸自己的选择——稳定、有钱、有影响力。\n\n这就是你想要的幸福吧。",
    choices: [
      { text: "继续", nextScene: "ending_p8", stats: { career: 25, sanity: 10, health: 5 } },
    ],
  },
  
  complain_retro: {
    id: "complain_retro",
    text: "你在 Retro 上抱怨加班多、流程乱、主管偏心...\n\n主管的脸色越来越难看，会后直接发了全员邮件说要加强纪律。\n\n你一下子成了的名人。",
    choices: [
      { text: "继续", nextScene: "ending_famous", stats: { career: -25, popularity: -30 } },
    ],
  },
  
  apologize_retro: {
    id: "apologize_retro",
    text: "你诚恳道歉，主管接受了。\n\n但你心里清楚，这次事件已经被记在了主管的小本本上。\n\n职场如战场，一步都不能错。",
    choices: [
      { text: "继续", nextScene: "ending_watcher", stats: { career: -5, sanity: -10 } },
    ],
  },
  
  ignore_rumor: {
    id: "ignore_rumor",
    text: "你决定当作什么都没发生。\n\n一个月后，大家也渐渐忘记了这件事。\n\n但你心里始终有一根刺...\n\n某天，你决定做出改变。",
    choices: [
      { text: "继续", nextScene: "ending_selfchange", stats: { sanity: 10 } },
    ],
  },
  
  blame_rumor: {
    id: "blame_rumor",
    text: "你和主管大吵了一架，说要去找 CEO 告状。\n\n结果 HR 介入调查，发现截图确实不是你发的。\n\n但你也彻底得罪了主管...\n\n三个月后，你被「优化」了。",
    choices: [
      { text: "继续", nextScene: "ending_fired_v2", stats: { career: -35, popularity: -15 } },
    ],
  },
  
  refuse_demo: {
    id: "refuse_demo",
    text: "主管脸上闪过一丝不悦，但还是另找了人。\n\n后来你听说，那个演示成功拿下了那个客户。\n\n而你错过了表现的机会。",
    choices: [
      { text: "继续", nextScene: "ending_missed", stats: { career: -15, popularity: -5 } },
    ],
  },
  
  recruiter_decline: {
    id: "recruiter_decline",
    text: "你婉拒了邀请，专心工作。\n\n一年后，你成了团队的技术骨干。\n\n有时候，不选择也是最好的选择。",
    choices: [
      { text: "继续", nextScene: "ending_techlead", stats: { career: 15, sanity: 10 } },
    ],
  },
  
  ignore_startup: {
    id: "ignore_startup",
    text: "你继续埋头苦干。\n\n两年后，那个创业公司上市了。\n\n你看到新闻时，心里有一丝波动...\n\n但随即又投入了工作。",
    choices: [
      { text: "继续", nextScene: "ending_regret", stats: { career: 10, sanity: -10 } },
    ],
  },
  
  accept_over_time: {
    id: "accept_overtime",
    text: "你默默接受了加班安排。\n\n连续一个月每天到十点，你感觉自己已经变成了行尸走肉。\n\n但你的工资卡上多了一笔加班费...\n\n某天，你突然流了鼻血。",
    choices: [
      { text: "继续", nextScene: "ending_blood", stats: { health: -25, career: 10 } },
    ],
  },
  
  refuse_over_time: {
    id: "refuse_overtime",
    text: "HR 脸色变得有些难看。\n\nHR：「加班是集体的需要，你怎么只顾自己呢？」\n\n你被记入了「不配合团队」的小本本。\n\n但你也保住了自己的时间。",
    choices: [
      { text: "继续", nextScene: "ending_independent", stats: { popularity: -10, sanity: 15 } },
    ],
  },
  
  transfer_giveup: {
    id: "transfer_giveup",
    text: "你决定不转了，继续在原组待着。\n\n有时候，安定也是一种幸福。\n\n三年后，你成了组里的资深工程师，生活稳定而平淡。",
    choices: [
      { text: "继续", nextScene: "ending_stable", stats: { career: 10, sanity: 10 } },
    ],
  },
  
  stay_focus: {
    id: "stay_focus",
    text: "你继续做好自己的工作，不理会 PM。\n\n但 PM 慢慢开始排挤你，把好项目都给了别人。\n\n你感到郁都，但又不想主动离职。",
    choices: [
      { text: "继续", nextScene: "ending_sidelined", stats: { career: -15, sanity: -15 } },
    ],
  },
  

  
  bug_coverup: {
    id: "bug_coverup",
    text: "你试图掩盖错误，但纸包不住火。\n\n一个月后，这个问题被用户发现了，直接上了热搜。\n\n公司损失了大量口碑，你也因此被开除。",
    choices: [
      { text: "继续", nextScene: "ending_scandal", stats: { career: -40, popularity: -30 } },
    ],
  },
  
  congrats_milestone: {
    id: "congrats_milestone",
    text: "主管当众表扬了你，还发了一个大红包。\n\n但你也注意到，有同事在背后嫉妒你。\n\n职场就是这样——高处的风景很美，但风也很大。",
    choices: [
      { text: "继续", nextScene: "ending_recognized", stats: { career: 15, popularity: -5 } },
    ],
  },
  
  ending_martyr: {
    id: "ending_martyr",
    text: "【悲剧·拼命三郎篇】\n\n你为了项目拼尽了全力，最后倒在了工位上。\n\n全公司为你捐款，但你再也没有醒来。\n\n同事们在送你的时候说：「他是我见过最敬业的人。」\n\n但如果能重来，你会选择不同的路吗？\n\n=== GAME OVER ===\n\n你的结局：过劳死",
    choices: [
      { text: "重新开始", nextScene: "start" },
    ],
  },
  
  ending_health: {
    id: "ending_health",
    text: "【觉醒·健康第一篇】\n\n你突然意识到，健康才是最大的财富。\n\n你开始每天跑步、定期体检、拒绝无效加班。\n\n工作依然出色，但你知道什么时候该停下来。\n\n这才是人生最大的智慧。\n\n=== GAME OVER ===\n\n你的结局：健康觉醒者",
    choices: [
      { text: "重新开始", nextScene: "start" },
    ],
  },
  
  ending_manager: {
    id: "ending_manager",
    text: "【晋升·管理者篇】\n\n你成了一名管理者，发现管理比写代码难多了。\n\n但你慢慢学会了如何激发团队的潜力。\n\n三年后，你的团队成了公司最优秀的团队之一。\n\n你终于明白：一个人的力量有限，但团队可以改变世界。\n\n=== GAME OVER ===\n\n你的结局：卓越管理者",
    choices: [
      { text: "重新开始", nextScene: "start" },
    ],
  },
  
  ending_technician: {
    id: "ending_technician",
    text: "【正道·技术专家篇】\n\n你拒绝了管理岗位，继续深耕技术。\n\n你成了公司最顶尖的技术专家之一，解决了一个又一个难题。\n\n虽然有时候会羡慕那些当管理的人，但你从不后悔。\n\n因为你知道，这就是你想要的道路。\n\n=== GAME OVER ===\n\n你的结局：技术大师",
    choices: [
      { text: "重新开始", nextScene: "start" },
    ],
  },
  
  ending_strategist: {
    id: "ending_strategist",
    text: "【转型·战略家篇】\n\n你转去做技术战略，发现了一个全新的世界。\n\n你开始参与公司顶层设计，影响着整个行业的技术方向。\n\n这不再是写代码，而是用代码改变世界的方式之一。\n\n=== GAME OVER ===\n\n你的结局：战略家",
    choices: [
      { text: "重新开始", nextScene: "start" },
    ],
  },
  
  ending_newjourney: {
    id: "ending_newjourney",
    text: "【新篇·重新出发】\n\n你加入了新公司，发现一切都需要重新适应。\n\n但你并不害怕，因为你已经在大厂学到了足够多的东西。\n\n某天，你在新公司的走廊里遇到了 CTO。\n\nCTO：「欢迎加入！」\n\n=== GAME OVER ===\n\n你的结局：再出发",
    choices: [
      { text: "重新开始", nextScene: "start" },
    ],
  },
  
  ending_bonus: {
    id: "ending_bonus",
    text: "【幸运·奖金篇】\n\n你分到了一笔丰厚的奖金！\n\n用这笔钱，你付了房子的首付。\n\n有时候，运气也是实力的一部分。\n\n=== GAME OVER ===\n\n你的结局：人生赢家",
    choices: [
      { text: "重新开始", nextScene: "start" },
    ],
  },
  
  ending_startup_fail: {
    id: "ending_startup_fail",
    text: "【教训·创业失败篇】\n\n公司倒闭后，你重新找工作。\n\n但市场已经变化，你发现自己的技能有些落伍了。\n\n不过，这段经历让你学到了很多。\n\n你决定下次创业前，要先做好更充分的准备。\n\n=== GAME OVER ===\n\n你的结局：创业失败者",
    choices: [
      { text: "重新开始", nextScene: "start" },
    ],
  },
  
  ending_collapse: {
    id: "ending_collapse",
    text: "【悲剧·猝死篇】\n\n你在工位上晕倒后，被紧急送往医院。\n\n医生说：「再晚一点就来不及了。」\n\n你躺在病床上，看着天花板，突然明白了什么。\n\n工作不是全部，健康和家人才是。\n\n=== GAME OVER ===\n\n你的结局：过劳死（缓刑）",
    choices: [
      { text: "重新开始", nextScene: "start" },
    ],
  },
  
  ending_balance: {
    id: "ending_balance",
    text: "【正道·平衡大师篇】\n\n你找到了工作和生活平衡的秘诀。\n\n你没有那么拼命，但效率很高。\n\n你没有那么富有，但很快乐。\n\n这才是人生真正的智慧。\n\n=== GAME OVER ===\n\n你的结局：平衡大师",
    choices: [
      { text: "重新开始", nextScene: "start" },
    ],
  },
  
  ending_grinder: {
    id: "ending_grinder",
    text: "【循环·永动机篇】\n\n你一直告诉自己：「再坚持一下就好了。」\n\n但这个「再坚持一下」永远没有尽头。\n\n你已经忘了生活是什么样子。\n\n也许，这就是打工人的命运吧。\n\n=== GAME OVER ===\n\n你的结局：永动机",
    choices: [
      { text: "重新开始", nextScene: "start" },
    ],
  },
  
  ending_rebel: {
    id: "ending_rebel",
    text: "【叛逆·说不得篇】\n\n你坚持自己的原则，拒绝无效加班。\n\n主管一开始很不爽，但后来发现你的效率反而更高了。\n\n你成了团队的异类，但也成了榜样。\n\n也许，改变职场文化就需要这样的勇气。\n\n=== GAME OVER ===\n\n你的结局：职场叛逆者",
    choices: [
      { text: "重新开始", nextScene: "start" },
    ],
  },
  
  ending_bugslayer: {
    id: "ending_bugslayer",
    text: "【崛起·Bug终结者篇】\n\n你的坦诚赢得了大家的尊重。\n\n你成了团队的质量担当，专门解决那些疑难杂症。\n\n别人解决不了的问题，在你手里都能迎刃而解。\n\n这就是专业精神的力量。\n\n=== GAME OVER ===\n\n你的结局：Bug终结者",
    choices: [
      { text: "重新开始", nextScene: "start" },
    ],
  },
  
  ending_stability: {
    id: "ending_stability",
    text: "【安稳·岁月静好篇】\n\n你选择了一条稳定但普通的道路。\n\n不是最出色的，但也不是最差的。\n\n有房有车，有老婆有孩子。\n\n偶尔加班，偶尔旅行。\n\n这就是平凡人的幸福。\n\n=== GAME OVER ===\n\n你的结局：岁月静好",
    choices: [
      { text: "重新开始", nextScene: "start" },
    ],
  },
  
  ending_transfer: {
    id: "ending_transfer",
    text: "【幸运·转组成功篇】\n\n你成功转到了新组，发现一切都很顺利。\n\n新的领导欣赏你，新的业务有挑战。\n\n有时候，选择比努力更重要。\n\n=== GAME OVER ===\n\n你的结局：转组成功",
    choices: [
      { text: "重新开始", nextScene: "start" },
    ],
  },
  
  ending_newpath: {
    id: "ending_newpath",
    text: "【新篇·再次出发】\n\n你跟着 PM 到了新公司，发现一切都是新的。\n\n但你并不孤单，因为有熟悉的战友。\n\n在某天加班到十点的时候，你突然想起了在大厂的日子。\n\n虽然现在也累，但感觉不一样。\n\n因为这次，是你们自己选择了一起累。\n\n=== GAME OVER ===\n\n你的结局：再出发",
    choices: [
      { text: "重新开始", nextScene: "start" },
    ],
  },
  
  ending_whistleblower: {
    id: "ending_whistleblower",
    text: "【悲剧·吹哨人篇】\n\n你因为说了真话而被边缘化了。\n\n虽然问题被解决了，但你的处境并没有变好。\n\n不过，你从不后悔。\n\n因为你知道，有些事情总要有人去做。\n\n=== GAME OVER ===\n\n你的结局：吹哨人",
    choices: [
      { text: "重新开始", nextScene: "start" },
    ],
  },
  
  ending_loyalist: {
    id: "ending_loyalist",
    text: "【正道·忠臣篇】\n\n你和主管建立了良好的关系。\n\n虽然后来主管离职了，但你们一直保持着联系。\n\n职场中，能遇到一个互相理解的领导，本身就是一种幸运。\n\n=== GAME OVER ===\n\n你的结局：忠臣",
    choices: [
      { text: "重新开始", nextScene: "start" },
    ],
  },
  
  ending_blood: {
    id: "ending_blood",
    text: "【教训·身体是本钱篇】\n\n流鼻血让你开始重视健康。\n\n你开始定期体检、调整作息。\n\n虽然工作依然重要，但你知道没有健康一切都是零。\n\n=== GAME OVER ===\n\n你的结局：亡羊补牢",
    choices: [
      { text: "重新开始", nextScene: "start" },
    ],
  },
  
  ending_independent: {
    id: "ending_independent",
    text: "【个性·独立自主篇】\n\n你坚持自己的原则，不为外界的压力所动。\n\n虽然有时候会被认为不合群，但你活出了自己。\n\n这需要勇气，但你做到了。\n\n=== GAME OVER ===\n\n你的结局：独立自主",
    choices: [
      { text: "重新开始", nextScene: "start" },
    ],
  },
  
  ending_survivor_v2: {
    id: "ending_survivor_v2",
    text: "【生存·委屈求全篇】\n\n你学会了委屈求全，在夹缝中求生存。\n\n这不是懦弱，而是智慧。\n\n职场中，有时候活下来比什么都重要。\n\n=== GAME OVER ===\n\n你的结局：生存大师",
    choices: [
      { text: "重新开始", nextScene: "start" },
    ],
  },
  
  ending_warrior: {
    id: "ending_warrior",
    text: "【战斗·正义使者篇】\n\n你选择了战斗，虽然赢得了尊重，但也付出了代价。\n\n职场中的正义，有时候需要更大的勇气。\n\n你是少数敢于说真话的人。\n\n=== GAME OVER ===\n\n你的结局：正义使者",
    choices: [
      { text: "重新开始", nextScene: "start" },
    ],
  },
  
  ending_mentor_v2: {
    id: "ending_mentor_v2",
    text: "【传承·桃李满天下篇】\n\n你培养了很多优秀的工程师，他们散布在各大公司。\n\n每次聚会，你都会骄傲地介绍：「这是我的学生。」\n\n这比任何 title 都有意义。\n\n=== GAME OVER ===\n\n你的结局：桃李满天下",
    choices: [
      { text: "重新开始", nextScene: "start" },
    ],
  },
  
  ending_techmaster: {
    id: "ending_techmaster",
    text: "【登峰·技术巅峰篇】\n\n你成了公司最顶尖的技术专家。\n\n别人解决不了的问题，在你手里都能迎刃而解。\n\n虽然不走管理路线，但你一样受人尊敬。\n\n这就是技术人的荣耀。\n\n=== GAME OVER ===\n\n你的结局：技术大师",
    choices: [
      { text: "重新开始", nextScene: "start" },
    ],
  },
  
  ending_disaster: {
    id: "ending_disaster",
    text: "【悲剧·背锅侠篇】\n\n你在复盘会上被追责，虽然不是你的全部责任。\n\n但领导需要有人背锅，而你正好在那里。\n\n你被降级了，但你也学到了重要的一课：不仅要写代码，还要看政治。\n\n=== GAME OVER ===\n\n你的结局：背锅侠",
    choices: [
      { text: "重新开始", nextScene: "start" },
    ],
  },
  
  ending_reformer: {
    id: "ending_reformer",
    text: "【改革·技术传道篇】\n\n你的重构不仅解决了问题，还提升了整个团队的技术水平。\n\n大家开始理解技术债务的危害。\n\n你不仅解决了问题，还改变了文化。\n\n这就是真正的影响力。\n\n=== GAME OVER ===\n\n你的结局：技术改革者",
    choices: [
      { text: "重新开始", nextScene: "start" },
    ],
  },
  
  ending_forgiver: {
    id: "ending_forgiver",
    text: "【宽容·放下篇】\n\n你选择了宽容，不仅放过了别人，也放过了自己。\n\n后来那个应届生成为了你的左臂右膀。\n\n你明白了：宽容比惩罚更有力量。\n\n=== GAME OVER ===\n\n你的结局：宽恕者",
    choices: [
      { text: "重新开始", nextScene: "start" },
    ],
  },
  
  ending_neutral: {
    id: "ending_neutral",
    text: "【中立·明哲保身篇】\n\n你选择了中立，没有卷入斗争。\n\n虽然有时候会想如果当初做了不同的选择会怎样...\n\n但你保住了自己。\n\n职场中，有时候不选择就是最好的选择。\n\n=== GAME OVER ===\n\n你的结局：旁观者",
    choices: [
      { text: "重新开始", nextScene: "start" },
    ],
  },
  
  ending_scapegoat: {
    id: "ending_scapegoat",
    text: "【悲剧·牺牲品篇】\n\n你因为说了真话而被牺牲了。\n\n虽然问题被解决了，但你的处境却变差了。\n\n这就是职场政治的残酷。\n\n但你从不后悔，因为你做了正确的事。\n\n=== GAME OVER ===\n\n你的结局：牺牲品",
    choices: [
      { text: "重新开始", nextScene: "start" },
    ],
  },
  
  ending_selfreflection: {
    id: "ending_selfreflection",
    text: "【觉醒·自我反思篇】\n\n你开始重新审视自己的职业规划。\n\n也许，是时候做出一些改变了。\n\n但这次，你是主动选择的。\n\n=== GAME OVER ===\n\n你的结局：觉醒者",
    choices: [
      { text: "重新开始", nextScene: "start" },
    ],
  },
  
  ending_opensource: {
    id: "ending_opensource",
    text: "【转型·开源领袖篇】\n\n你转型做了开源运营，发现这是一个全新的世界。\n\n你认识了世界各地的开发者，参与了顶级开源项目。\n\n虽然工资没有大厂高，但你的技术影响力反而更大了。\n\n这就是另一种成功。\n\n=== GAME OVER ===\n\n你的结局：开源领袖",
    choices: [
      { text: "重新开始", nextScene: "start" },
    ],
  },
  
  ending_p8: {
    id: "ending_p8",
    text: "【登峰·P8篇】\n\n你终于晋升到了 P8！\n\n回首往事，你庆幸自己的选择。\n\n虽然过程很艰辛，但结果很美好。\n\n这就是坚持的力量。\n\n=== GAME OVER ===\n\n你的结局：P8 大佬",
    choices: [
      { text: "重新开始", nextScene: "start" },
    ],
  },
  
  ending_famous: {
    id: "ending_famous",
    text: "【悲剧·出名篇】\n\n你因为那次 Retro 上的言论一下子火遍了全公司。\n\n有人支持你，有人嘲笑你。\n\n一个月后，你选择了主动离职。\n\n有时候，沉默是金。\n\n=== GAME OVER ===\n\n你的结局：社死",
    choices: [
      { text: "重新开始", nextScene: "start" },
    ],
  },
  
  ending_watcher: {
    id: "ending_watcher",
    text: "【谨慎·步步为营篇】\n\n你小心翼翼地在职场中生存。\n\n每一步都深思熟虑，每一个选择都如履薄冰。\n\n虽然活得很累，但你一直都在。\n\n这就是普通打工人的日常。\n\n=== GAME OVER ===\n\n你的结局：步步为营",
    choices: [
      { text: "重新开始", nextScene: "start" },
    ],
  },
  
  ending_selfchange: {
    id: "ending_selfchange",
    text: "【改变·重新出发篇】\n\n你决定做出改变，不再随波逐流。\n\n你开始主动学习新技能，拓展人脉。\n\n一年后，你成功内部转岗到了心仪的团队。\n\n只要愿意改变，任何时候都不晚。\n\n=== GAME OVER ===\n\n你的结局：改变者",
    choices: [
      { text: "重新开始", nextScene: "start" },
    ],
  },
  
  ending_fired_v2: {
    id: "ending_fired_v2",
    text: "【悲剧·优化篇】\n\n你被优化了。\n\n虽然心里很委屈，但你知道自己还年轻，还有机会。\n\n三个月后，你入职了一家创业公司，薪资还涨了 20%。\n\n塞翁失马，焉知非福。\n\n=== GAME OVER ===\n\n你的结局：被优化者",
    choices: [
      { text: "重新开始", nextScene: "start" },
    ],
  },
  
  ending_missed: {
    id: "ending_missed",
    text: "【遗憾·错过篇】\n\n你错过了那次演示的机会。\n\n但你保住了自己的原则。\n\n也许这就是人生——有得必有失。\n\n=== GAME OVER ===\n\n你的结局：错过者",
    choices: [
      { text: "重新开始", nextScene: "start" },
    ],
  },
  
  ending_techlead: {
    id: "ending_techlead",
    text: "【正道·技术组长篇】\n\n你婉拒了外部的诱惑，安心在大厂发展。\n\n三年后，你成了团队的技术组长。\n\n虽然没有那么传奇，但胜在稳定。\n\n=== GAME OVER ===\n\n你的结局：技术组长",
    choices: [
      { text: "重新开始", nextScene: "start" },
    ],
  },
  
  ending_regret: {
    id: "ending_regret",
    text: "【遗憾·错过风口篇】\n\n你错过了那家创业公司。\n\n虽然事后看来那是一个正确的选择，但人生没有后悔药。\n\n你决定以后要更勇敢一些。\n\n=== GAME OVER ===\n\n你的结局：错过者",
    choices: [
      { text: "重新开始", nextScene: "start" },
    ],
  },
  
  ending_stable: {
    id: "ending_stable",
    text: "【安稳·岁月静好篇】\n\n你选择留在原组，稳定发展。\n\n虽然没有什么传奇故事，但生活平静而幸福。\n\n有时候，平凡也是一种伟大。\n\n=== GAME OVER ===\n\n你的结局：平凡之路",
    choices: [
      { text: "重新开始", nextScene: "start" },
    ],
  },
  
  ending_sidelined: {
    id: "ending_sidelined",
    text: "【边缘·被冷落篇】\n\n你被 PM 边缘化了。\n\n虽然心里很委屈，但你不知道该怎么办。\n\n也许，是时候考虑新的机会了。\n\n=== GAME OVER ===\n\n你的结局：边缘人",
    choices: [
      { text: "重新开始", nextScene: "start" },
    ],
  },
  
  ending_nerd: {
    id: "ending_nerd",
    text: "【悲剧·不懂表达篇】\n\n你技术很好，但不会表达。\n\n你学到了：技术之外，还需要沟通能力。\n\n从此你开始刻意练习表达。\n\n=== GAME OVER ===\n\n你的结局：技术宅",
    choices: [
      { text: "重新开始", nextScene: "start" },
    ],
  },
  
  ending_forgotten: {
    id: "ending_forgotten",
    text: "【遗忘·被忘记篇】\n\n那件事很快就被大家忘记了。\n\n你继续正常工作生活，仿佛什么都没发生过。\n\n有时候，最好的回应就是不回应。\n\n=== GAME OVER ===\n\n你的结局：被遗忘者",
    choices: [
      { text: "重新开始", nextScene: "start" },
    ],
  },
  
  ending_saboteur: {
    id: "ending_saboteur",
    text: "【教训·剥削者篇】\n\n你因为不善待实习生而被处罚了。\n\n你学到了：带人是责任，不是剥削。\n\n=== GAME OVER ===\n\n你的结局：教训者",
    choices: [
      { text: "重新开始", nextScene: "start" },
    ],
  },
  
  ending_balancer: {
    id: "ending_balancer",
    text: "【平衡·工作生活篇】\n\n你找到了工作和生活平衡的秘诀。\n\n你没有那么拼命，但效率很高。\n\n你没有那么富有，但很快乐。\n\n这才是人生真正的智慧。\n\n=== GAME OVER ===\n\n你的结局：平衡大师",
    choices: [
      { text: "重新开始", nextScene: "start" },
    ],
  },
  
  ending_collapsed: {
    id: "ending_collapsed",
    text: "【悲剧·过劳倒篇】\n\n你在工位上晕倒了。\n\n虽然抢救回来了，但你的身体已经严重透支。\n\n你开始反思：工作真的比健康重要吗？\n\n=== GAME OVER ===\n\n你的结局：过劳者",
    choices: [
      { text: "重新开始", nextScene: "start" },
    ],
  },
  
  ending_scandal: {
    id: "ending_scandal",
    text: "【悲剧·信任危机篇】\n\n你掩盖错误的行为最终被发现了。\n\n你被开除，还被列入了行业黑名单。\n\n你学到了：诚实比掩盖更重要。\n\n=== GAME OVER ===\n\n你的结局：信任破产",
    choices: [
      { text: "重新开始", nextScene: "start" },
    ],
  },
  
  ending_recognized: {
    id: "ending_recognized",
    text: "【成就·被认可篇】\n\n你被公开表扬了！\n\n虽然有同事嫉妒，但你知道自己值得。\n\n这就是努力工作的回报。\n\n=== GAME OVER ===\n\n你的结局：被认可者",
    choices: [
      { text: "重新开始", nextScene: "start" },
    ],
  },
  
  ending_present: {
    id: "ending_present",
    text: "【当下·活在当下篇】\n\n你决定珍惜当下，不再纠结过去的选择。\n\n工作依然继续，生活依然进行。\n\n但你学会了欣赏眼前的风景。\n\n=== GAME OVER ===\n\n你的结局：活在当下",
    choices: [
      { text: "重新开始", nextScene: "start" },
    ],
  },
  
  ending_planner: {
    id: "ending_planner",
    text: "【规划·未来可期篇】\n\n你制定了详细的职业规划，并且一一实现了。\n\n你明白了：方向比努力更重要。\n\n=== GAME OVER ===\n\n你的结局：规划师",
    choices: [
      { text: "重新开始", nextScene: "start" },
    ],
  },
  
  ending_comrades: {
    id: "ending_comrades",
    text: "【战友·一起出发篇】\n\n你和同事们一起跳槽到了新公司。\n\n虽然未来不确定，但有战友在身边，你并不害怕。\n\n=== GAME OVER ===\n\n你的结局：战友同行",
    choices: [
      { text: "重新开始", nextScene: "start" },
    ],
  },
  
  ending_technician_v2: {
    id: "ending_technician_v2",
    text: "【回归·技术本位篇】\n\n你从管理岗转回了技术岗。\n\n回到技术岗位后，你如鱼得水。\n\n有时候，退一步反而海阔天空。\n\n=== GAME OVER ===\n\n你的结局：技术回归",
    choices: [
      { text: "重新开始", nextScene: "start" },
    ],
  },
};

const initialStats: GameStats = {
  health: 100,
  sanity: 100,
  popularity: 100,
  career: 100,
  week: 1,
};

function StatBar({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-muted-foreground w-16">{label}</span>
      <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
        <div
          className="h-full transition-all duration-500"
          style={{ width: `${Math.max(0, Math.min(100, value))}%`, backgroundColor: color }}
        />
      </div>
      <span className="text-xs font-medium w-8 text-right">{value}</span>
    </div>
  );
}

export function SurvivalGuideGame() {
  const [currentScene, setCurrentScene] = useState("start");
  const [stats, setStats] = useState<GameStats>(initialStats);
  const [gameOver, setGameOver] = useState(false);

  const scene = scenes[currentScene];

  const handleChoice = useCallback((choice: Choice) => {
    if (choice.stats) {
      setStats((prev) => ({
        health: Math.max(0, Math.min(100, prev.health + (choice.stats?.health || 0))),
        sanity: Math.max(0, Math.min(100, prev.sanity + (choice.stats?.sanity || 0))),
        popularity: Math.max(0, Math.min(100, prev.popularity + (choice.stats?.popularity || 0))),
        career: Math.max(0, Math.min(100, prev.career + (choice.stats?.career || 0))),
        week: prev.week,
      }));
    }
    
    const nextSceneId = choice.nextScene;
    if (nextSceneId === "start") {
      setStats(initialStats);
    }
    setCurrentScene(nextSceneId);
    
    if (nextSceneId.startsWith("ending_")) {
      setGameOver(true);
    }
  }, []);

  const handleRestart = useCallback(() => {
    setStats(initialStats);
    setCurrentScene("start");
    setGameOver(false);
  }, []);

  const isLowStat = (value: number) => value <= 30;

  return (
    <div className="flex flex-col h-full w-full p-4 gap-4">
      <div className="flex items-center justify-between">
        <Badge variant="secondary" className="text-xs">
          大厂员工生存指南
        </Badge>
        {gameOver && (
          <Button size="sm" variant="outline" onClick={handleRestart}>
            重新开始
          </Button>
        )}
      </div>

      <div className="grid grid-cols-4 gap-2">
        <StatBar label="健康" value={stats.health} color={isLowStat(stats.health) ? "#ef4444" : "#22c55e"} />
        <StatBar label="精神" value={stats.sanity} color={isLowStat(stats.sanity) ? "#ef4444" : "#8b5cf6"} />
        <StatBar label="人缘" value={stats.popularity} color={isLowStat(stats.popularity) ? "#ef4444" : "#3b82f6"} />
        <StatBar label="职级" value={stats.career} color={isLowStat(stats.career) ? "#ef4444" : "#f59e0b"} />
      </div>

      <div className="flex-1 min-h-0">
        <div className="h-full flex flex-col">
          <div className="flex-1 bg-card rounded-lg border border-input p-4 overflow-auto mb-4">
            <div className="text-sm leading-relaxed whitespace-pre-line">
              {scene.text.split("\n").map((line, i) => {
                if (line.startsWith("📧")) {
                  return (
                    <p key={i} className="text-muted-foreground my-1">
                      {line}
                    </p>
                  );
                }
                if (line.startsWith("CTO：") || line.startsWith("HR：") || line.startsWith("主管：") || line.startsWith("同事：") || line.startsWith("reviewer：") || line.startsWith("PM：")) {
                  return (
                    <p key={i} className="text-primary font-medium my-2">
                      {line}
                    </p>
                  );
                }
                if (line.startsWith("===")) {
                  return (
                    <div key={i} className="my-4 border-t border-dashed border-border pt-4">
                      <p className="text-primary font-bold text-center">{line}</p>
                    </div>
                  );
                }
                return (
                  <p key={i} className="my-1">
                    {line}
                  </p>
                );
              })}
            </div>
          </div>

          <div className="flex flex-col gap-2">
            {scene.choices.map((choice, index) => (
              <Button
                key={index}
                variant="outline"
                className="justify-start text-left h-auto py-3 px-4"
                onClick={() => handleChoice(choice)}
              >
                <span className="text-primary mr-2">{String.fromCharCode(65 + index)}.</span>
                {choice.text}
              </Button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
