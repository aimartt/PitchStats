
import { FullDatabase } from '../types';

export const defaultDb: FullDatabase = {
  "teams": [
    {
      "id": "team-default-001",
      "name": "麒麟兄弟",
      "createdAt": "2025-11-25T07:53:41.970Z"
    },
    {
      "id": "1764057295948",
      "name": "未知名",
      "createdAt": "2025-11-25T07:54:55.948Z"
    }
  ],
  "users": [
    {
      "id": "admin-init-001",
      "username": "tangtao",
      "password": "admin123456,.",
      "name": "唐涛",
      "role": "admin",
      "teamIds": [
        "team-default-001",
        "1764057295948"
      ],
      "linkedPlayerNames": {
        "team-default-001": "唐涛"
      }
    },
    {
      "id": "1764058771967",
      "username": "chechi",
      "password": "chechi",
      "name": "车驰",
      "role": "player",
      "teamIds": [
        "team-default-001"
      ],
      "linkedPlayerNames": {
        "team-default-001": "车驰"
      }
    },
    {
      "id": "1764646319431",
      "username": "liuke",
      "password": "liuke",
      "name": "刘柯",
      "role": "player",
      "teamIds": [
        "1764057295948"
      ],
      "linkedPlayerNames": {}
    }
  ],
  "matches": [
    {
      "id": "miea5bpul37gtyxa3l",
      "date": "2025-07-29",
      "season": "华侨城2025年夏",
      "round": 1,
      "matchType": "联赛",
      "format": "八人制",
      "venue": "华侨城足球公园",
      "opponent": "板得凶",
      "ourScore": 1,
      "opponentScore": 2,
      "location": "Home",
      "result": "Loss",
      "squad": [
        "车驰",
        "曹晓霖",
        "陈启晅",
        "陈春",
        "杜梓铭",
        "林浩",
        "何星谕",
        "胡勇",
        "李单",
        "李扬",
        "刘豪",
        "钱星宇",
        "唐涛",
        "文云波",
        "胥德伟",
        "老夏"
      ],
      "starters": [
        "钱星宇",
        "唐涛",
        "陈春",
        "胡勇",
        "胥德伟",
        "杜梓铭",
        "车驰",
        "老夏"
      ],
      "goalkeepers": [
        "唐涛"
      ],
      "goalsDetails": [
        {
          "scorer": "何星谕",
          "assist": "老夏"
        }
      ],
      "yellowCards": [],
      "redCards": [],
      "penaltiesWon": [],
      "ownGoals": [],
      "notes": "",
      "countForStats": true,
      "teamId": "team-default-001"
    },
    {
      "id": "miebozeev4n798t1noi",
      "date": "2025-08-05",
      "season": "华侨城2025年夏",
      "round": 2,
      "matchType": "联赛",
      "format": "八人制",
      "venue": "华侨城足球公园",
      "opponent": "全村的希望",
      "ourScore": 0,
      "opponentScore": 3,
      "location": "Home",
      "result": "Loss",
      "squad": [
        "车驰",
        "曹晓霖",
        "柴陆俊夫",
        "陈启晅",
        "林浩",
        "何星谕",
        "胡勇",
        "刘豪",
        "李单",
        "王海斌",
        "王薪炎",
        "文云波",
        "杨皓宇",
        "张龑瀚"
      ],
      "starters": [
        "王海斌",
        "车驰",
        "李单",
        "陈启晅",
        "胡勇",
        "文云波",
        "柴陆俊夫",
        "杨皓宇"
      ],
      "goalkeepers": [
        "王海斌"
      ],
      "goalsDetails": [],
      "yellowCards": [],
      "redCards": [],
      "penaltiesWon": [],
      "ownGoals": [],
      "notes": "",
      "countForStats": true,
      "teamId": "team-default-001"
    },
    {
      "id": "match-1764066361825",
      "date": "2025-08-15",
      "season": "华侨城2025年夏",
      "round": 3,
      "matchType": "友谊赛",
      "format": "八人制",
      "venue": "华侨城足球公园",
      "opponent": "黯然",
      "ourScore": 4,
      "opponentScore": 4,
      "location": "Home",
      "result": "Draw",
      "squad": [
        "车驰",
        "柴陆俊夫",
        "曹晓霖",
        "李单",
        "李扬",
        "刘豪",
        "钱星宇",
        "王海斌",
        "王薪炎",
        "杨皓宇",
        "杨涛",
        "外援1"
      ],
      "starters": [
        "柴陆俊夫",
        "车驰",
        "王海斌",
        "杨皓宇",
        "李扬",
        "杨涛",
        "李单",
        "刘豪"
      ],
      "goalkeepers": [
        "王海斌"
      ],
      "goalsDetails": [
        {
          "scorer": "柴陆俊夫",
          "assist": "李单"
        },
        {
          "scorer": "外援1",
          "assist": "柴陆俊夫"
        },
        {
          "scorer": "杨皓宇"
        },
        {
          "scorer": "柴陆俊夫",
          "assist": "李单"
        }
      ],
      "yellowCards": [],
      "redCards": [],
      "penaltiesWon": [],
      "ownGoals": [],
      "notes": "联赛对手弃权，3-0判胜\n外援2个",
      "countForStats": true,
      "teamId": "team-default-001"
    },
    {
      "id": "match-1764211264678",
      "date": "2025-08-20",
      "season": "华侨城2025年夏",
      "round": 4,
      "matchType": "联赛",
      "format": "八人制",
      "venue": "华侨城足球公园",
      "opponent": "雾都霍得转",
      "ourScore": 2,
      "opponentScore": 4,
      "location": "Home",
      "result": "Loss",
      "squad": [
        "柴陆俊夫",
        "车驰",
        "曹晓霖",
        "陈启晅",
        "林浩",
        "胡勇",
        "李单",
        "李扬",
        "刘豪",
        "钱星宇",
        "唐涛",
        "杨皓宇",
        "杨涛",
        "文云波"
      ],
      "starters": [
        "柴陆俊夫",
        "李单",
        "胡勇",
        "杨皓宇",
        "李扬",
        "刘豪",
        "车驰",
        "唐涛"
      ],
      "goalkeepers": [
        "唐涛"
      ],
      "goalsDetails": [
        {
          "scorer": "陈启晅"
        },
        {
          "scorer": "李单",
          "assist": "陈启晅"
        }
      ],
      "yellowCards": [
        "杨涛"
      ],
      "redCards": [],
      "penaltiesWon": [],
      "ownGoals": [],
      "notes": "",
      "countForStats": true,
      "teamId": "team-default-001"
    },
    {
      "id": "match-1764211433224",
      "date": "2025-08-26",
      "season": "华侨城2025年夏",
      "round": 5,
      "matchType": "联赛",
      "format": "八人制",
      "venue": "华侨城足球公园",
      "opponent": "实况达人",
      "ourScore": 1,
      "opponentScore": 1,
      "location": "Home",
      "result": "Draw",
      "squad": [
        "车驰",
        "柴陆俊夫",
        "曹晓霖",
        "陈启晅",
        "林浩",
        "胡勇",
        "李单",
        "刘豪",
        "钱星宇",
        "秦坤",
        "孙张力",
        "唐涛",
        "王薪炎",
        "杨皓宇",
        "杨涛",
        "张善博"
      ],
      "starters": [
        "车驰",
        "唐涛",
        "柴陆俊夫",
        "李单",
        "胡勇",
        "林浩",
        "刘豪",
        "杨皓宇"
      ],
      "goalkeepers": [
        "唐涛"
      ],
      "goalsDetails": [
        {
          "scorer": "胡勇"
        }
      ],
      "yellowCards": [],
      "redCards": [],
      "penaltiesWon": [],
      "ownGoals": [],
      "notes": "柴陆俊夫受伤",
      "countForStats": true,
      "teamId": "team-default-001"
    },
    {
      "id": "match-1764211730837",
      "date": "2025-09-01",
      "season": "华侨城2025年夏",
      "round": 6,
      "matchType": "联赛",
      "format": "八人制",
      "venue": "华侨城足球公园",
      "opponent": "礼嘉城FC",
      "ourScore": 3,
      "opponentScore": 3,
      "location": "Home",
      "result": "Draw",
      "squad": [
        "车驰",
        "曹晓霖",
        "陈启晅",
        "林浩",
        "何星谕",
        "胡勇",
        "李单",
        "李扬",
        "刘豪",
        "钱星宇",
        "唐涛",
        "杨皓宇",
        "张龑瀚",
        "张善博"
      ],
      "starters": [
        "车驰",
        "唐涛",
        "李单",
        "杨皓宇",
        "陈启晅",
        "刘豪",
        "林浩",
        "钱星宇"
      ],
      "goalkeepers": [
        "唐涛"
      ],
      "goalsDetails": [
        {
          "scorer": "林浩",
          "assist": "钱星宇"
        },
        {
          "scorer": "何星谕",
          "assist": "李扬"
        },
        {
          "scorer": "胡勇"
        }
      ],
      "yellowCards": [
        "刘豪"
      ],
      "redCards": [],
      "penaltiesWon": [],
      "ownGoals": [],
      "notes": "",
      "countForStats": true,
      "teamId": "team-default-001"
    },
    {
      "id": "match-1764211890680",
      "date": "2025-09-08",
      "season": "华侨城2025年夏",
      "round": 7,
      "matchType": "联赛",
      "format": "八人制",
      "venue": "华侨城足球公园",
      "opponent": "秦力电气",
      "ourScore": 2,
      "opponentScore": 7,
      "location": "Home",
      "result": "Loss",
      "squad": [
        "车驰",
        "曹晓霖",
        "陈春",
        "陈启晅",
        "林浩",
        "胡勇",
        "康鑫",
        "刘豪",
        "钱星宇",
        "秦坤",
        "唐涛",
        "文云波",
        "胥德伟",
        "杨皓宇",
        "张善博",
        "张龑瀚"
      ],
      "starters": [
        "唐涛",
        "陈启晅",
        "秦坤",
        "文云波",
        "林浩",
        "杨皓宇",
        "曹晓霖",
        "刘豪"
      ],
      "goalkeepers": [
        "唐涛"
      ],
      "goalsDetails": [
        {
          "scorer": "陈启晅"
        },
        {
          "scorer": "林浩",
          "assist": "陈启晅"
        }
      ],
      "yellowCards": [
        "胥德伟"
      ],
      "redCards": [],
      "penaltiesWon": [],
      "ownGoals": [],
      "notes": "",
      "countForStats": true,
      "teamId": "team-default-001"
    },
    {
      "id": "match-1764212070283",
      "date": "2025-09-16",
      "season": "华侨城2025年夏",
      "round": 8,
      "matchType": "联赛",
      "format": "八人制",
      "venue": "华侨城足球公园",
      "opponent": "龙七队",
      "ourScore": 3,
      "opponentScore": 5,
      "location": "Home",
      "result": "Loss",
      "squad": [
        "车驰",
        "曹晓霖",
        "陈春",
        "陈启晅",
        "胡勇",
        "康鑫",
        "李单",
        "刘豪",
        "钱星宇",
        "唐涛",
        "王薪炎",
        "杨皓宇",
        "张善博",
        "郭佳东"
      ],
      "starters": [
        "唐涛",
        "曹晓霖",
        "钱星宇",
        "王薪炎",
        "张善博",
        "郭佳东",
        "康鑫",
        "陈春"
      ],
      "goalkeepers": [
        "唐涛"
      ],
      "goalsDetails": [
        {
          "scorer": "陈启晅"
        },
        {
          "scorer": "钱星宇"
        },
        {
          "scorer": "曹晓霖",
          "assist": "陈启晅"
        }
      ],
      "yellowCards": [],
      "redCards": [],
      "penaltiesWon": [],
      "ownGoals": [
        "郭佳东"
      ],
      "notes": "",
      "countForStats": true,
      "teamId": "team-default-001"
    },
    {
      "id": "match-1764212343334",
      "date": "2025-09-26",
      "season": "华侨城2025年夏",
      "round": 9,
      "matchType": "联赛",
      "format": "八人制",
      "venue": "华侨城足球公园",
      "opponent": "猫头鹰",
      "ourScore": 2,
      "opponentScore": 3,
      "location": "Home",
      "result": "Loss",
      "squad": [
        "车驰",
        "曹晓霖",
        "陈启晅",
        "何星谕",
        "胡勇",
        "钱星宇",
        "秦坤",
        "唐涛",
        "杨皓宇",
        "杨涛"
      ],
      "starters": [
        "车驰",
        "唐涛",
        "钱星宇",
        "杨涛",
        "陈启晅",
        "胡勇",
        "杨皓宇",
        "秦坤"
      ],
      "goalkeepers": [
        "唐涛"
      ],
      "goalsDetails": [
        {
          "scorer": "钱星宇",
          "assist": "胡勇"
        },
        {
          "scorer": "何星谕",
          "assist": "杨涛"
        }
      ],
      "yellowCards": [],
      "redCards": [],
      "penaltiesWon": [],
      "ownGoals": [],
      "notes": "",
      "countForStats": true,
      "teamId": "team-default-001"
    },
    {
      "id": "match-1764212536434",
      "date": "2025-10-15",
      "season": "华侨城2025年夏",
      "round": 10,
      "matchType": "联赛",
      "format": "八人制",
      "venue": "华侨城足球公园",
      "opponent": "知足常乐",
      "ourScore": 2,
      "opponentScore": 6,
      "location": "Home",
      "result": "Loss",
      "squad": [
        "车驰",
        "曹晓霖",
        "陈启晅",
        "郭佳东",
        "何星谕",
        "胡勇",
        "康鑫",
        "李单",
        "刘豪",
        "唐涛",
        "杨皓宇",
        "杨涛",
        "张龑瀚"
      ],
      "starters": [
        "车驰",
        "唐涛",
        "李单",
        "陈启晅",
        "张龑瀚",
        "郭佳东",
        "何星谕",
        "杨皓宇"
      ],
      "goalkeepers": [
        "唐涛"
      ],
      "goalsDetails": [
        {
          "scorer": "何星谕",
          "assist": "陈启晅"
        },
        {
          "scorer": "何星谕",
          "assist": "杨皓宇"
        }
      ],
      "yellowCards": [
        "杨涛"
      ],
      "redCards": [],
      "penaltiesWon": [],
      "ownGoals": [],
      "notes": "对手违规，3-0判胜",
      "countForStats": true,
      "teamId": "team-default-001"
    },
    {
      "id": "match-1764212708741",
      "date": "2025-10-22",
      "season": "华侨城2025年夏",
      "round": 11,
      "matchType": "联赛",
      "format": "八人制",
      "venue": "华侨城足球公园",
      "opponent": "西域果果",
      "ourScore": 1,
      "opponentScore": 3,
      "location": "Home",
      "result": "Loss",
      "squad": [
        "曹晓霖",
        "车驰",
        "陈启晅",
        "郭佳东",
        "何星谕",
        "胡勇",
        "李单",
        "刘豪",
        "唐涛",
        "胥德伟",
        "杨皓宇",
        "张龑瀚"
      ],
      "starters": [
        "车驰",
        "唐涛",
        "胥德伟",
        "李单",
        "杨皓宇",
        "胡勇",
        "刘豪",
        "何星谕"
      ],
      "goalkeepers": [
        "唐涛"
      ],
      "goalsDetails": [
        {
          "scorer": "何星谕",
          "isPenalty": true
        }
      ],
      "yellowCards": [],
      "redCards": [],
      "penaltiesWon": [
        "刘豪"
      ],
      "ownGoals": [],
      "notes": "",
      "countForStats": true,
      "teamId": "team-default-001"
    },
    {
      "id": "match-1764212889031",
      "date": "2025-10-27",
      "season": "华侨城2025年夏",
      "matchType": "队内赛",
      "format": "八人制",
      "venue": "寸滩体育中心足球场",
      "opponent": "队内对抗",
      "ourScore": 0,
      "opponentScore": 0,
      "location": "Home",
      "result": "Draw",
      "squad": [
        "曹晓霖",
        "车驰",
        "陈春",
        "陈启晅",
        "郭佳东",
        "胡勇",
        "林浩",
        "李单",
        "钱星宇",
        "秦坤",
        "孙张力",
        "唐涛",
        "王薪炎",
        "杨皓宇",
        "杨涛",
        "张善博",
        "张龑瀚"
      ],
      "starters": [
        "张善博",
        "杨涛",
        "杨皓宇",
        "王薪炎",
        "钱星宇",
        "秦坤",
        "孙张力",
        "唐涛",
        "林浩",
        "李单",
        "郭佳东",
        "胡勇",
        "陈启晅",
        "陈春",
        "车驰",
        "曹晓霖"
      ],
      "goalkeepers": [],
      "goalsDetails": [],
      "yellowCards": [],
      "redCards": [],
      "penaltiesWon": [],
      "ownGoals": [],
      "notes": "",
      "countForStats": false,
      "teamId": "team-default-001"
    },
    {
      "id": "match-1764213774526",
      "date": "2025-10-31",
      "season": "华侨城2025年夏",
      "round": 12,
      "matchType": "联赛",
      "format": "八人制",
      "venue": "华侨城足球公园",
      "opponent": "尹氏08之星",
      "ourScore": 1,
      "opponentScore": 3,
      "location": "Home",
      "result": "Loss",
      "squad": [
        "车驰",
        "陈启晅",
        "郭佳东",
        "何星谕",
        "胡勇",
        "李单",
        "刘豪",
        "钱星宇",
        "闫志伟",
        "杨皓宇",
        "杨涛"
      ],
      "starters": [
        "车驰",
        "钱星宇",
        "杨涛",
        "闫志伟",
        "李单",
        "杨皓宇",
        "刘豪",
        "胡勇"
      ],
      "goalkeepers": [
        "闫志伟"
      ],
      "goalsDetails": [
        {
          "scorer": "李单",
          "assist": "陈启晅"
        }
      ],
      "yellowCards": [
        "刘豪"
      ],
      "redCards": [],
      "penaltiesWon": [],
      "ownGoals": [],
      "notes": "郭佳东受伤",
      "countForStats": true,
      "teamId": "team-default-001"
    },
    {
      "id": "match-1764214046617",
      "date": "2025-11-05",
      "season": "华侨城2025年夏",
      "round": 13,
      "matchType": "联赛",
      "format": "八人制",
      "venue": "华侨城足球公园",
      "opponent": "虎虎虎",
      "ourScore": 2,
      "opponentScore": 6,
      "location": "Home",
      "result": "Loss",
      "squad": [
        "车驰",
        "曹晓霖",
        "陈启晅",
        "胡勇",
        "李单",
        "刘豪",
        "李彦达",
        "秦坤",
        "唐涛",
        "杨皓宇",
        "杨涛",
        "张龑瀚"
      ],
      "starters": [
        "车驰",
        "唐涛",
        "陈启晅",
        "曹晓霖",
        "李单",
        "杨皓宇",
        "秦坤",
        "张龑瀚"
      ],
      "goalkeepers": [
        "唐涛"
      ],
      "goalsDetails": [
        {
          "scorer": "陈启晅",
          "assist": "张龑瀚"
        },
        {
          "scorer": "陈启晅",
          "assist": "张龑瀚"
        }
      ],
      "yellowCards": [
        "曹晓霖"
      ],
      "redCards": [],
      "penaltiesWon": [
        "陈启晅"
      ],
      "ownGoals": [],
      "notes": "",
      "countForStats": true,
      "teamId": "team-default-001"
    },
    {
      "id": "match-1764317721680",
      "date": "2025-11-11",
      "season": "华侨城2025年冬",
      "matchType": "友谊赛",
      "format": "十一人制",
      "venue": "保时通体育文化创意园",
      "opponent": "铁脑壳FC",
      "ourScore": 5,
      "opponentScore": 1,
      "location": "Home",
      "result": "Win",
      "squad": [
        "车驰",
        "曹晓霖",
        "陈启晅",
        "何星谕",
        "刘豪",
        "钱星宇",
        "孙张力",
        "王薪炎",
        "杨皓宇",
        "杨涛",
        "张善博",
        "张龑瀚"
      ],
      "starters": [
        "曹晓霖",
        "车驰",
        "何星谕",
        "刘豪",
        "钱星宇",
        "孙张力",
        "王薪炎",
        "杨皓宇",
        "杨涛",
        "张善博",
        "张龑瀚"
      ],
      "goalkeepers": [],
      "goalsDetails": [],
      "yellowCards": [],
      "redCards": [],
      "penaltiesWon": [],
      "ownGoals": [],
      "notes": "外援4个",
      "countForStats": false,
      "teamId": "team-default-001"
    },
    {
      "id": "match-1764317941469",
      "date": "2025-11-20",
      "season": "华侨城2025年冬",
      "matchType": "友谊赛",
      "format": "八人制",
      "venue": "大田湾体育场",
      "opponent": "铁脑壳FC",
      "ourScore": 3,
      "opponentScore": 2,
      "location": "Home",
      "result": "Win",
      "squad": [
        "曹晓霖",
        "车驰",
        "陈启晅",
        "李扬",
        "李单",
        "刘豪",
        "钱星宇",
        "孙张力",
        "唐涛",
        "王薪炎",
        "杨皓宇",
        "杨涛",
        "朱峰"
      ],
      "starters": [
        "车驰",
        "陈启晅",
        "李单",
        "李扬",
        "刘豪",
        "唐涛",
        "杨涛",
        "朱峰"
      ],
      "goalkeepers": [],
      "goalsDetails": [],
      "yellowCards": [],
      "redCards": [],
      "penaltiesWon": [],
      "ownGoals": [],
      "notes": "",
      "countForStats": false,
      "teamId": "team-default-001"
    },
    {
      "id": "match-1764318363089",
      "date": "2025-11-25",
      "season": "华侨城2025年冬",
      "round": 1,
      "matchType": "联赛",
      "format": "八人制",
      "venue": "华侨城足球公园",
      "opponent": "重庆BHC",
      "ourScore": 1,
      "opponentScore": 5,
      "location": "Home",
      "result": "Loss",
      "squad": [
        "车驰",
        "曹晓霖",
        "陈启晅",
        "陈春",
        "郭佳东",
        "何星谕",
        "胡勇",
        "刘豪",
        "钱星宇",
        "孙张力",
        "唐涛",
        "胥德伟",
        "杨皓宇",
        "杨涛",
        "张龑瀚",
        "谭光华"
      ],
      "starters": [
        "车驰",
        "何星谕",
        "胡勇",
        "刘豪",
        "唐涛",
        "胥德伟",
        "杨皓宇",
        "杨涛"
      ],
      "goalkeepers": [
        "唐涛"
      ],
      "goalsDetails": [
        {
          "scorer": "钱星宇",
          "assist": "何星谕",
          "isPenalty": false
        }
      ],
      "yellowCards": [],
      "redCards": [],
      "penaltiesWon": [],
      "ownGoals": [],
      "notes": "对手违规，3-0判胜",
      "countForStats": true,
      "teamId": "team-default-001"
    },
    {
      "id": "match-1764381640108",
      "date": "2025-11-28",
      "season": "华侨城2025年冬",
      "matchType": "友谊赛",
      "format": "八人制",
      "venue": "寸滩体育中心足球场",
      "opponent": "打通矿工",
      "ourScore": 2,
      "opponentScore": 3,
      "location": "Home",
      "result": "Loss",
      "squad": [
        "车驰",
        "何星谕",
        "胡勇",
        "钱星宇",
        "秦坤",
        "杨涛",
        "张龑瀚"
      ],
      "starters": [
        "车驰",
        "秦坤",
        "杨涛",
        "张龑瀚"
      ],
      "goalkeepers": [],
      "goalkeeperStats": [],
      "goalsDetails": [],
      "yellowCards": [],
      "redCards": [],
      "penaltiesWon": [],
      "ownGoals": [],
      "notes": "外援6个",
      "countForStats": false,
      "coach": "胡勇",
      "teamId": "team-default-001"
    },
    {
      "id": "match-1764388413855",
      "date": "2025-09-05",
      "season": "2026平顶山健康杯",
      "round": 1,
      "matchType": "联赛",
      "format": "八人制",
      "venue": "平顶山足球乐园",
      "opponent": "竹园FC",
      "ourScore": 5,
      "opponentScore": 1,
      "location": "Home",
      "result": "Win",
      "squad": [
        "唐涛",
        "守门员1"
      ],
      "starters": [
        "唐涛"
      ],
      "goalkeepers": [
        "唐涛",
        "守门员1"
      ],
      "goalkeeperStats": [
        {
          "player": "唐涛",
          "conceded": 0
        },
        {
          "player": "守门员1",
          "conceded": 1
        }
      ],
      "goalsDetails": [],
      "yellowCards": [],
      "redCards": [],
      "penaltiesWon": [],
      "ownGoals": [],
      "notes": "",
      "countForStats": true,
      "teamId": "1764057295948"
    },
    {
      "id": "match-1764388440985",
      "date": "2025-09-12",
      "season": "2026平顶山健康杯",
      "round": 2,
      "matchType": "联赛",
      "format": "八人制",
      "venue": "平顶山足球乐园",
      "opponent": "一直喝",
      "ourScore": 2,
      "opponentScore": 4,
      "location": "Home",
      "result": "Loss",
      "squad": [
        "守门员1"
      ],
      "starters": [
        "守门员1"
      ],
      "goalkeepers": [
        "守门员1"
      ],
      "goalkeeperStats": [
        {
          "player": "守门员1",
          "conceded": 4
        }
      ],
      "goalsDetails": [],
      "yellowCards": [],
      "redCards": [],
      "penaltiesWon": [],
      "ownGoals": [],
      "notes": "",
      "countForStats": true,
      "teamId": "1764057295948"
    },
    {
      "id": "match-1764388465343",
      "date": "2025-09-19",
      "season": "2026平顶山健康杯",
      "round": 3,
      "matchType": "联赛",
      "format": "八人制",
      "venue": "平顶山足球乐园",
      "opponent": "双耳鱼洞FC",
      "ourScore": 1,
      "opponentScore": 1,
      "location": "Home",
      "result": "Draw",
      "squad": [
        "唐涛"
      ],
      "starters": [
        "唐涛"
      ],
      "goalkeepers": [
        "唐涛"
      ],
      "goalkeeperStats": [
        {
          "player": "唐涛",
          "conceded": 1
        }
      ],
      "goalsDetails": [],
      "yellowCards": [],
      "redCards": [],
      "penaltiesWon": [],
      "ownGoals": [],
      "notes": "",
      "countForStats": true,
      "teamId": "1764057295948"
    },
    {
      "id": "match-1764388498959",
      "date": "2025-09-26",
      "season": "2026平顶山健康杯",
      "round": 4,
      "matchType": "联赛",
      "format": "八人制",
      "venue": "平顶山足球乐园",
      "opponent": "双龙七",
      "ourScore": 5,
      "opponentScore": 2,
      "location": "Home",
      "result": "Win",
      "squad": [
        "王檬"
      ],
      "starters": [
        "王檬"
      ],
      "goalkeepers": [
        "王檬"
      ],
      "goalkeeperStats": [
        {
          "player": "王檬",
          "conceded": 2
        }
      ],
      "goalsDetails": [],
      "yellowCards": [],
      "redCards": [],
      "penaltiesWon": [],
      "ownGoals": [],
      "notes": "",
      "countForStats": true,
      "teamId": "1764057295948"
    },
    {
      "id": "match-1764388534263",
      "date": "2025-09-30",
      "season": "2026平顶山健康杯",
      "matchType": "友谊赛",
      "format": "八人制",
      "venue": "平顶山足球乐园",
      "opponent": "渝谦FC",
      "ourScore": 4,
      "opponentScore": 5,
      "location": "Home",
      "result": "Loss",
      "squad": [
        "唐涛"
      ],
      "starters": [
        "唐涛"
      ],
      "goalkeepers": [
        "唐涛"
      ],
      "goalkeeperStats": [
        {
          "player": "唐涛",
          "conceded": 5
        }
      ],
      "goalsDetails": [],
      "yellowCards": [],
      "redCards": [],
      "penaltiesWon": [],
      "ownGoals": [],
      "notes": "",
      "countForStats": false,
      "coach": "",
      "teamId": "1764057295948"
    },
    {
      "id": "match-1764388567591",
      "date": "2025-10-10",
      "season": "2026平顶山健康杯",
      "round": 5,
      "matchType": "联赛",
      "format": "八人制",
      "venue": "平顶山足球乐园",
      "opponent": "中源协和生物细胞",
      "ourScore": 2,
      "opponentScore": 7,
      "location": "Home",
      "result": "Loss",
      "squad": [
        "唐涛"
      ],
      "starters": [
        "唐涛"
      ],
      "goalkeepers": [
        "唐涛"
      ],
      "goalkeeperStats": [
        {
          "player": "唐涛",
          "conceded": 7
        }
      ],
      "goalsDetails": [],
      "yellowCards": [],
      "redCards": [],
      "penaltiesWon": [],
      "ownGoals": [],
      "notes": "",
      "countForStats": true,
      "teamId": "1764057295948"
    },
    {
      "id": "match-1764388590497",
      "date": "2025-10-17",
      "season": "2026平顶山健康杯",
      "round": 6,
      "matchType": "联赛",
      "format": "八人制",
      "venue": "平顶山足球乐园",
      "opponent": "汽配联",
      "ourScore": 4,
      "opponentScore": 3,
      "location": "Home",
      "result": "Win",
      "squad": [
        "唐涛"
      ],
      "starters": [
        "唐涛"
      ],
      "goalkeepers": [
        "唐涛"
      ],
      "goalkeeperStats": [
        {
          "player": "唐涛",
          "conceded": 3
        }
      ],
      "goalsDetails": [],
      "yellowCards": [],
      "redCards": [],
      "penaltiesWon": [],
      "ownGoals": [],
      "notes": "",
      "countForStats": true,
      "teamId": "1764057295948"
    },
    {
      "id": "match-1764388610784",
      "date": "2025-10-24",
      "season": "2026平顶山健康杯",
      "round": 7,
      "matchType": "联赛",
      "format": "八人制",
      "venue": "平顶山足球乐园",
      "opponent": "老头乐",
      "ourScore": 2,
      "opponentScore": 6,
      "location": "Home",
      "result": "Loss",
      "squad": [
        "唐涛"
      ],
      "starters": [
        "唐涛"
      ],
      "goalkeepers": [
        "唐涛"
      ],
      "goalkeeperStats": [
        {
          "player": "唐涛",
          "conceded": 6
        }
      ],
      "goalsDetails": [],
      "yellowCards": [],
      "redCards": [],
      "penaltiesWon": [],
      "ownGoals": [],
      "notes": "",
      "countForStats": true,
      "teamId": "1764057295948"
    },
    {
      "id": "match-1764388637504",
      "date": "2025-10-31",
      "season": "2026平顶山健康杯",
      "round": 8,
      "matchType": "联赛",
      "format": "八人制",
      "venue": "平顶山足球乐园",
      "opponent": "悦想荟",
      "ourScore": 5,
      "opponentScore": 4,
      "location": "Home",
      "result": "Win",
      "squad": [
        "张衡"
      ],
      "starters": [
        "张衡"
      ],
      "goalkeepers": [
        "张衡"
      ],
      "goalkeeperStats": [
        {
          "player": "张衡",
          "conceded": 4
        }
      ],
      "goalsDetails": [],
      "yellowCards": [],
      "redCards": [],
      "penaltiesWon": [],
      "ownGoals": [],
      "notes": "",
      "countForStats": true,
      "teamId": "1764057295948"
    },
    {
      "id": "match-1764388659119",
      "date": "2025-11-07",
      "season": "2026平顶山健康杯",
      "round": 9,
      "matchType": "联赛",
      "format": "八人制",
      "venue": "平顶山足球乐园",
      "opponent": "正南齐北",
      "ourScore": 2,
      "opponentScore": 5,
      "location": "Home",
      "result": "Loss",
      "squad": [
        "唐涛"
      ],
      "starters": [
        "唐涛"
      ],
      "goalkeepers": [
        "唐涛"
      ],
      "goalkeeperStats": [
        {
          "player": "唐涛",
          "conceded": 5
        }
      ],
      "goalsDetails": [],
      "yellowCards": [],
      "redCards": [],
      "penaltiesWon": [],
      "ownGoals": [],
      "notes": "",
      "countForStats": true,
      "coach": "",
      "teamId": "1764057295948"
    },
    {
      "id": "match-1764388684896",
      "date": "2025-11-14",
      "season": "2026平顶山健康杯",
      "round": 10,
      "matchType": "联赛",
      "format": "八人制",
      "venue": "平顶山足球乐园",
      "opponent": "老司机FC",
      "ourScore": 1,
      "opponentScore": 1,
      "location": "Home",
      "result": "Draw",
      "squad": [
        "唐涛"
      ],
      "starters": [
        "唐涛"
      ],
      "goalkeepers": [
        "唐涛"
      ],
      "goalkeeperStats": [
        {
          "player": "唐涛",
          "conceded": 1
        }
      ],
      "goalsDetails": [],
      "yellowCards": [],
      "redCards": [],
      "penaltiesWon": [],
      "ownGoals": [],
      "notes": "",
      "countForStats": true,
      "teamId": "1764057295948"
    },
    {
      "id": "match-1764388706656",
      "date": "2025-11-21",
      "season": "2026平顶山健康杯",
      "round": 11,
      "matchType": "联赛",
      "format": "八人制",
      "venue": "平顶山足球乐园",
      "opponent": "聚友联",
      "ourScore": 3,
      "opponentScore": 5,
      "location": "Home",
      "result": "Loss",
      "squad": [
        "唐涛"
      ],
      "starters": [
        "唐涛"
      ],
      "goalkeepers": [
        "唐涛"
      ],
      "goalkeeperStats": [
        {
          "player": "唐涛",
          "conceded": 5
        }
      ],
      "goalsDetails": [],
      "yellowCards": [],
      "redCards": [],
      "penaltiesWon": [],
      "ownGoals": [],
      "notes": "",
      "countForStats": true,
      "teamId": "1764057295948"
    },
    {
      "id": "match-1764388726935",
      "date": "2025-11-28",
      "season": "2026平顶山健康杯",
      "round": 12,
      "matchType": "联赛",
      "format": "八人制",
      "venue": "平顶山足球乐园",
      "opponent": "竹园FC",
      "ourScore": 7,
      "opponentScore": 2,
      "location": "Home",
      "result": "Win",
      "squad": [
        "唐涛"
      ],
      "starters": [
        "唐涛"
      ],
      "goalkeepers": [
        "唐涛"
      ],
      "goalkeeperStats": [
        {
          "player": "唐涛",
          "conceded": 2
        }
      ],
      "goalsDetails": [],
      "yellowCards": [],
      "redCards": [],
      "penaltiesWon": [],
      "ownGoals": [],
      "notes": "",
      "countForStats": true,
      "teamId": "1764057295948"
    },
    {
      "id": "match-1764718883462",
      "date": "2025-12-02",
      "season": "华侨城2025年冬",
      "round": 2,
      "matchType": "联赛",
      "format": "八人制",
      "venue": "华侨城足球公园",
      "opponent": "雾中南开",
      "ourScore": 2,
      "opponentScore": 3,
      "location": "Home",
      "result": "Loss",
      "squad": [
        "曹晓霖",
        "车驰",
        "陈启晅",
        "何星谕",
        "李单",
        "林浩",
        "刘豪",
        "唐涛",
        "谭光华",
        "杨皓宇",
        "杨涛",
        "张龑瀚",
        "朱峰"
      ],
      "starters": [
        "曹晓霖",
        "车驰",
        "陈启晅",
        "何星谕",
        "李单",
        "林浩",
        "刘豪",
        "唐涛"
      ],
      "goalkeepers": [
        "唐涛"
      ],
      "goalkeeperStats": [
        {
          "player": "唐涛",
          "conceded": 3
        }
      ],
      "goalsDetails": [
        {
          "scorer": "陈启晅",
          "assist": "曹晓霖",
          "isPenalty": false
        },
        {
          "scorer": "何星谕",
          "isPenalty": false
        }
      ],
      "yellowCards": [],
      "redCards": [],
      "penaltiesWon": [],
      "ownGoals": [],
      "notes": "",
      "countForStats": true,
      "coach": "杨皓宇",
      "teamId": "team-default-001"
    },
    {
      "id": "match-1764896863602",
      "date": "2025-12-04",
      "season": "华侨城2025年冬",
      "matchType": "友谊赛",
      "format": "八人制",
      "venue": "保时通体育文化创意园",
      "opponent": "奶牛",
      "ourScore": 5,
      "opponentScore": 4,
      "location": "Home",
      "result": "Win",
      "squad": [
        "车驰",
        "胡勇",
        "钱星宇",
        "秦坤",
        "孙张力",
        "闫志伟",
        "杨皓宇",
        "杨涛",
        "申相峰"
      ],
      "starters": [
        "车驰",
        "胡勇",
        "钱星宇",
        "孙张力",
        "闫志伟",
        "杨皓宇",
        "杨涛",
        "申相峰"
      ],
      "goalkeepers": [
        "孙张力"
      ],
      "goalkeeperStats": [
        {
          "player": "孙张力",
          "conceded": 4
        }
      ],
      "goalsDetails": [],
      "yellowCards": [],
      "redCards": [],
      "penaltiesWon": [],
      "ownGoals": [],
      "notes": "",
      "countForStats": false,
      "coach": "张龑瀚",
      "teamId": "team-default-001"
    },
    {
      "id": "match-1764991580058",
      "date": "2025-12-06",
      "season": "2026平顶山健康杯",
      "round": 13,
      "matchType": "联赛",
      "format": "八人制",
      "venue": "平顶山足球乐园",
      "opponent": "一直喝",
      "ourScore": 4,
      "opponentScore": 2,
      "location": "Home",
      "result": "Win",
      "squad": [
        "唐涛"
      ],
      "starters": [
        "唐涛"
      ],
      "goalkeepers": [
        "唐涛"
      ],
      "goalkeeperStats": [
        {
          "player": "唐涛",
          "conceded": 2
        }
      ],
      "goalsDetails": [],
      "yellowCards": [],
      "redCards": [],
      "penaltiesWon": [],
      "ownGoals": [],
      "notes": "",
      "countForStats": true,
      "coach": "",
      "teamId": "1764057295948"
    },
    {
      "id": "match-1765328391030",
      "date": "2025-12-09",
      "season": "华侨城2025年冬",
      "round": 3,
      "matchType": "联赛",
      "format": "八人制",
      "venue": "华侨城足球公园",
      "opponent": "全村的希望",
      "ourScore": 2,
      "opponentScore": 1,
      "location": "Home",
      "result": "Win",
      "squad": [
        "曹晓霖",
        "车驰",
        "陈春",
        "陈启晅",
        "郭佳东",
        "何星谕",
        "胡勇",
        "李单",
        "刘豪",
        "钱星宇",
        "孙张力",
        "唐涛",
        "杨皓宇",
        "张龑瀚",
        "朱峰"
      ],
      "starters": [
        "车驰",
        "陈启晅",
        "何星谕",
        "胡勇",
        "李单",
        "刘豪",
        "钱星宇",
        "唐涛"
      ],
      "goalkeepers": [
        "唐涛"
      ],
      "goalkeeperStats": [
        {
          "player": "唐涛",
          "conceded": 1
        }
      ],
      "goalsDetails": [
        {
          "scorer": "陈启晅",
          "isPenalty": false
        },
        {
          "scorer": "何星谕",
          "isPenalty": false
        }
      ],
      "yellowCards": [],
      "redCards": [],
      "penaltiesWon": [],
      "ownGoals": [],
      "notes": "",
      "countForStats": true,
      "coach": "张龑瀚",
      "teamId": "team-default-001"
    },
    {
      "id": "match-1765519655779",
      "date": "2025-02-25",
      "season": "华侨城2025年春",
      "round": 1,
      "matchType": "联赛",
      "format": "八人制",
      "venue": "华侨城足球公园",
      "opponent": "ABS FC",
      "ourScore": 2,
      "opponentScore": 5,
      "location": "Home",
      "result": "Loss",
      "squad": [],
      "starters": [],
      "goalkeepers": [],
      "goalkeeperStats": [],
      "goalsDetails": [],
      "yellowCards": [],
      "redCards": [],
      "penaltiesWon": [],
      "ownGoals": [],
      "notes": "",
      "countForStats": true,
      "coach": "",
      "teamId": "team-default-001"
    },
    {
      "id": "match-1765520054730",
      "date": "2025-03-04",
      "season": "华侨城2025年春",
      "round": 2,
      "matchType": "联赛",
      "format": "八人制",
      "venue": "华侨城足球公园",
      "opponent": "AEG俞翔",
      "ourScore": 2,
      "opponentScore": 4,
      "location": "Home",
      "result": "Loss",
      "squad": [],
      "starters": [],
      "goalkeepers": [],
      "goalkeeperStats": [],
      "goalsDetails": [],
      "yellowCards": [],
      "redCards": [],
      "penaltiesWon": [],
      "ownGoals": [],
      "notes": "",
      "countForStats": true,
      "coach": "",
      "teamId": "team-default-001"
    },
    {
      "id": "match-1765520118475",
      "date": "2025-03-11",
      "season": "华侨城2025年春",
      "round": 3,
      "matchType": "联赛",
      "format": "八人制",
      "venue": "华侨城足球公园",
      "opponent": "龙七队",
      "ourScore": 0,
      "opponentScore": 3,
      "location": "Home",
      "result": "Loss",
      "squad": [],
      "starters": [],
      "goalkeepers": [],
      "goalkeeperStats": [],
      "goalsDetails": [],
      "yellowCards": [],
      "redCards": [],
      "penaltiesWon": [],
      "ownGoals": [],
      "notes": "",
      "countForStats": true,
      "coach": "",
      "teamId": "team-default-001"
    },
    {
      "id": "match-1765520176948",
      "date": "2025-03-19",
      "season": "华侨城2025年春",
      "round": 4,
      "matchType": "联赛",
      "format": "八人制",
      "venue": "华侨城足球公园",
      "opponent": "少数民族",
      "ourScore": 4,
      "opponentScore": 3,
      "location": "Home",
      "result": "Win",
      "squad": [],
      "starters": [],
      "goalkeepers": [],
      "goalkeeperStats": [],
      "goalsDetails": [],
      "yellowCards": [],
      "redCards": [],
      "penaltiesWon": [],
      "ownGoals": [],
      "notes": "",
      "countForStats": true,
      "coach": "",
      "teamId": "team-default-001"
    },
    {
      "id": "match-1765520377703",
      "date": "2025-03-26",
      "season": "华侨城2025年春",
      "round": 5,
      "matchType": "联赛",
      "format": "八人制",
      "venue": "华侨城足球公园",
      "opponent": "全村的希望",
      "ourScore": 0,
      "opponentScore": 4,
      "location": "Home",
      "result": "Loss",
      "squad": [],
      "starters": [],
      "goalkeepers": [],
      "goalkeeperStats": [],
      "goalsDetails": [],
      "yellowCards": [],
      "redCards": [],
      "penaltiesWon": [],
      "ownGoals": [],
      "notes": "",
      "countForStats": true,
      "coach": "",
      "teamId": "team-default-001"
    },
    {
      "id": "match-1765520458849",
      "date": "2025-04-09",
      "season": "华侨城2025年春",
      "round": 6,
      "matchType": "联赛",
      "format": "八人制",
      "venue": "华侨城足球公园",
      "opponent": "降妖伏魔",
      "ourScore": 2,
      "opponentScore": 5,
      "location": "Home",
      "result": "Loss",
      "squad": [],
      "starters": [],
      "goalkeepers": [],
      "goalkeeperStats": [],
      "goalsDetails": [],
      "yellowCards": [],
      "redCards": [],
      "penaltiesWon": [],
      "ownGoals": [],
      "notes": "",
      "countForStats": true,
      "coach": "",
      "teamId": "team-default-001"
    },
    {
      "id": "match-1765520527634",
      "date": "2025-04-17",
      "season": "华侨城2025年春",
      "round": 7,
      "matchType": "联赛",
      "format": "八人制",
      "venue": "华侨城足球公园",
      "opponent": "环球汽车中心",
      "ourScore": 2,
      "opponentScore": 4,
      "location": "Home",
      "result": "Loss",
      "squad": [],
      "starters": [],
      "goalkeepers": [],
      "goalkeeperStats": [],
      "goalsDetails": [],
      "yellowCards": [],
      "redCards": [],
      "penaltiesWon": [],
      "ownGoals": [],
      "notes": "",
      "countForStats": true,
      "coach": "",
      "teamId": "team-default-001"
    },
    {
      "id": "match-1765520590779",
      "date": "2025-04-22",
      "season": "华侨城2025年春",
      "round": 8,
      "matchType": "联赛",
      "format": "八人制",
      "venue": "华侨城足球公园",
      "opponent": "尹氏08之星",
      "ourScore": 3,
      "opponentScore": 5,
      "location": "Home",
      "result": "Loss",
      "squad": [],
      "starters": [],
      "goalkeepers": [],
      "goalkeeperStats": [],
      "goalsDetails": [],
      "yellowCards": [],
      "redCards": [],
      "penaltiesWon": [],
      "ownGoals": [],
      "notes": "",
      "countForStats": true,
      "coach": "",
      "teamId": "team-default-001"
    },
    {
      "id": "match-1765520656637",
      "date": "2025-05-07",
      "season": "华侨城2025年春",
      "round": 9,
      "matchType": "联赛",
      "format": "八人制",
      "venue": "华侨城足球公园",
      "opponent": "虎虎虎",
      "ourScore": 1,
      "opponentScore": 5,
      "location": "Home",
      "result": "Loss",
      "squad": [],
      "starters": [],
      "goalkeepers": [],
      "goalkeeperStats": [],
      "goalsDetails": [],
      "yellowCards": [],
      "redCards": [],
      "penaltiesWon": [],
      "ownGoals": [],
      "notes": "",
      "countForStats": true,
      "coach": "",
      "teamId": "team-default-001"
    },
    {
      "id": "match-1765520700013",
      "date": "2025-05-14",
      "season": "华侨城2025年春",
      "round": 10,
      "matchType": "联赛",
      "format": "八人制",
      "venue": "华侨城足球公园",
      "opponent": "实况达人",
      "ourScore": 2,
      "opponentScore": 1,
      "location": "Home",
      "result": "Win",
      "squad": [],
      "starters": [],
      "goalkeepers": [],
      "goalkeeperStats": [],
      "goalsDetails": [],
      "yellowCards": [],
      "redCards": [],
      "penaltiesWon": [],
      "ownGoals": [],
      "notes": "",
      "countForStats": true,
      "coach": "",
      "teamId": "team-default-001"
    },
    {
      "id": "match-1765520792239",
      "date": "2025-05-23",
      "season": "华侨城2025年春",
      "round": 11,
      "matchType": "联赛",
      "format": "八人制",
      "venue": "华侨城足球公园",
      "opponent": "礼嘉城FC",
      "ourScore": 1,
      "opponentScore": 6,
      "location": "Home",
      "result": "Loss",
      "squad": [],
      "starters": [],
      "goalkeepers": [],
      "goalkeeperStats": [],
      "goalsDetails": [],
      "yellowCards": [],
      "redCards": [],
      "penaltiesWon": [],
      "ownGoals": [],
      "notes": "",
      "countForStats": true,
      "coach": "",
      "teamId": "team-default-001"
    },
    {
      "id": "match-1765520840248",
      "date": "2025-05-28",
      "season": "华侨城2025年春",
      "round": 12,
      "matchType": "联赛",
      "format": "八人制",
      "venue": "华侨城足球公园",
      "opponent": "JM",
      "ourScore": 0,
      "opponentScore": 2,
      "location": "Home",
      "result": "Loss",
      "squad": [],
      "starters": [],
      "goalkeepers": [],
      "goalkeeperStats": [],
      "goalsDetails": [],
      "yellowCards": [],
      "redCards": [],
      "penaltiesWon": [],
      "ownGoals": [],
      "notes": "",
      "countForStats": true,
      "coach": "",
      "teamId": "team-default-001"
    },
    {
      "id": "match-1765520988091",
      "date": "2025-06-17",
      "season": "华侨城2025年春",
      "round": 14,
      "matchType": "联赛",
      "format": "八人制",
      "venue": "华侨城足球公园",
      "opponent": "曾大师老火锅",
      "ourScore": 1,
      "opponentScore": 6,
      "location": "Home",
      "result": "Loss",
      "squad": [],
      "starters": [],
      "goalkeepers": [],
      "goalkeeperStats": [],
      "goalsDetails": [],
      "yellowCards": [],
      "redCards": [],
      "penaltiesWon": [],
      "ownGoals": [],
      "notes": "",
      "countForStats": true,
      "coach": "",
      "teamId": "team-default-001"
    },
    {
      "id": "match-1765521289511",
      "date": "2024-12-10",
      "season": "华侨城2024年夏",
      "round": 18,
      "matchType": "联赛",
      "format": "八人制",
      "venue": "华侨城足球公园",
      "opponent": "老头乐",
      "ourScore": 3,
      "opponentScore": 6,
      "location": "Home",
      "result": "Loss",
      "squad": [],
      "starters": [],
      "goalkeepers": [],
      "goalkeeperStats": [],
      "goalsDetails": [],
      "yellowCards": [],
      "redCards": [],
      "penaltiesWon": [],
      "ownGoals": [],
      "notes": "",
      "countForStats": true,
      "coach": "",
      "teamId": "team-default-001"
    },
    {
      "id": "match-1765521333552",
      "date": "2024-12-10",
      "season": "华侨城2024年夏",
      "round": 17,
      "matchType": "联赛",
      "format": "八人制",
      "venue": "华侨城足球公园",
      "opponent": "两江一河",
      "ourScore": 1,
      "opponentScore": 4,
      "location": "Home",
      "result": "Loss",
      "squad": [],
      "starters": [],
      "goalkeepers": [],
      "goalkeeperStats": [],
      "goalsDetails": [],
      "yellowCards": [],
      "redCards": [],
      "penaltiesWon": [],
      "ownGoals": [],
      "notes": "",
      "countForStats": true,
      "coach": "",
      "teamId": "team-default-001"
    },
    {
      "id": "match-1765521372432",
      "date": "2024-12-04",
      "season": "华侨城2024年夏",
      "round": 16,
      "matchType": "联赛",
      "format": "八人制",
      "venue": "华侨城足球公园",
      "opponent": "AEG俞翔",
      "ourScore": 5,
      "opponentScore": 1,
      "location": "Home",
      "result": "Win",
      "squad": [],
      "starters": [],
      "goalkeepers": [],
      "goalkeeperStats": [],
      "goalsDetails": [],
      "yellowCards": [],
      "redCards": [],
      "penaltiesWon": [],
      "ownGoals": [],
      "notes": "",
      "countForStats": true,
      "coach": "",
      "teamId": "team-default-001"
    },
    {
      "id": "match-1765521612061",
      "date": "2024-11-25",
      "season": "华侨城2024年夏",
      "round": 15,
      "matchType": "联赛",
      "format": "八人制",
      "venue": "华侨城足球公园",
      "opponent": "曾大师老火锅",
      "ourScore": 0,
      "opponentScore": 3,
      "location": "Home",
      "result": "Loss",
      "squad": [],
      "starters": [],
      "goalkeepers": [],
      "goalkeeperStats": [],
      "goalsDetails": [],
      "yellowCards": [],
      "redCards": [],
      "penaltiesWon": [],
      "ownGoals": [],
      "notes": "",
      "countForStats": true,
      "coach": "",
      "teamId": "team-default-001"
    },
    {
      "id": "match-1765521643773",
      "date": "2024-11-18",
      "season": "华侨城2024年夏",
      "round": 14,
      "matchType": "联赛",
      "format": "八人制",
      "venue": "华侨城足球公园",
      "opponent": "降妖伏魔",
      "ourScore": 1,
      "opponentScore": 4,
      "location": "Home",
      "result": "Loss",
      "squad": [],
      "starters": [],
      "goalkeepers": [],
      "goalkeeperStats": [],
      "goalsDetails": [],
      "yellowCards": [],
      "redCards": [],
      "penaltiesWon": [],
      "ownGoals": [],
      "notes": "",
      "countForStats": true,
      "coach": "",
      "teamId": "team-default-001"
    },
    {
      "id": "match-1765521681070",
      "date": "2024-11-12",
      "season": "华侨城2024年夏",
      "round": 13,
      "matchType": "联赛",
      "format": "八人制",
      "venue": "华侨城足球公园",
      "opponent": "ABS FC",
      "ourScore": 0,
      "opponentScore": 3,
      "location": "Home",
      "result": "Loss",
      "squad": [],
      "starters": [],
      "goalkeepers": [],
      "goalkeeperStats": [],
      "goalsDetails": [],
      "yellowCards": [],
      "redCards": [],
      "penaltiesWon": [],
      "ownGoals": [],
      "notes": "",
      "countForStats": true,
      "coach": "",
      "teamId": "team-default-001"
    },
    {
      "id": "match-1765521743887",
      "date": "2024-11-08",
      "season": "华侨城2024年夏",
      "round": 12,
      "matchType": "联赛",
      "format": "八人制",
      "venue": "华侨城足球公园",
      "opponent": "玉棠竞技",
      "ourScore": 0,
      "opponentScore": 2,
      "location": "Home",
      "result": "Loss",
      "squad": [],
      "starters": [],
      "goalkeepers": [],
      "goalkeeperStats": [],
      "goalsDetails": [],
      "yellowCards": [],
      "redCards": [],
      "penaltiesWon": [],
      "ownGoals": [],
      "notes": "",
      "countForStats": true,
      "coach": "",
      "teamId": "team-default-001"
    }
  ],
  "opponents": [
    {
      "id": "legacy-miea5bpu818mycp4gdd",
      "name": "ABS FC",
      "teamId": "team-default-001"
    },
    {
      "id": "legacy-miea5bpuzx2l6o7akcb",
      "name": "重庆BHC",
      "teamId": "team-default-001"
    },
    {
      "id": "legacy-miea5bpul5zrw2rd5dd",
      "name": "两江一河",
      "teamId": "team-default-001"
    },
    {
      "id": "legacy-miea5bpuu4dof2ug5zd",
      "name": "全村的希望",
      "teamId": "team-default-001"
    },
    {
      "id": "legacy-miea5bpu3mo9vornrx5",
      "name": "实况达人",
      "teamId": "team-default-001"
    },
    {
      "id": "legacy-miea5bpuyxbb3ferom8",
      "name": "尹氏08之星",
      "teamId": "team-default-001"
    },
    {
      "id": "legacy-miea5bpunqzzmungvoe",
      "name": "板得凶",
      "teamId": "team-default-001"
    },
    {
      "id": "legacy-miea5bpuqr33ygcpwb",
      "name": "（渝G）起手叫",
      "teamId": "team-default-001"
    },
    {
      "id": "legacy-miea5bpu3tsp8dzc6w1",
      "name": "知足常乐",
      "teamId": "team-default-001"
    },
    {
      "id": "legacy-miea5bpu2z2x9els5p2",
      "name": "礼嘉城FC",
      "teamId": "team-default-001"
    },
    {
      "id": "legacy-miea5bpuxqcwfs9ctzl",
      "name": "秦力电气",
      "teamId": "team-default-001"
    },
    {
      "id": "legacy-miea5bpuj5tp0xzrzu8",
      "name": "虎虎虎",
      "teamId": "team-default-001"
    },
    {
      "id": "legacy-miea5bpuzo8qqg67dir",
      "name": "西域果果",
      "teamId": "team-default-001"
    },
    {
      "id": "legacy-miea5bpur5rc5r8emp9",
      "name": "铁脑壳FC",
      "teamId": "team-default-001"
    },
    {
      "id": "legacy-miea5bpuf2e7avcwsks",
      "name": "雾中南开",
      "teamId": "team-default-001"
    },
    {
      "id": "legacy-miea5bpu8zpo3ilk1t2",
      "name": "雾都霍得转",
      "teamId": "team-default-001"
    },
    {
      "id": "legacy-miea5bpuk7f89l57q5",
      "name": "黯然",
      "teamId": "team-default-001"
    },
    {
      "id": "legacy-miea5bpuz8toc28957j",
      "name": "龙七队",
      "teamId": "team-default-001"
    },
    {
      "id": "migufab1",
      "name": "猫头鹰",
      "teamId": "team-default-001"
    },
    {
      "id": "miil4s7b",
      "name": "打通矿工",
      "teamId": "team-default-001"
    },
    {
      "id": "miilfxn4",
      "name": "蔡碚都",
      "teamId": "team-default-001"
    },
    {
      "id": "mijo2slh",
      "name": "竹园FC",
      "teamId": "1764057295948"
    },
    {
      "id": "mijo31np",
      "name": "一直喝",
      "teamId": "1764057295948"
    },
    {
      "id": "mijo44xh",
      "name": "双耳鱼洞FC",
      "teamId": "1764057295948"
    },
    {
      "id": "mijo4b51",
      "name": "双龙七",
      "teamId": "1764057295948"
    },
    {
      "id": "mijo4g2d",
      "name": "渝谦FC",
      "teamId": "1764057295948"
    },
    {
      "id": "mijo4k71",
      "name": "中源协和生物细胞",
      "teamId": "1764057295948"
    },
    {
      "id": "mijo4ntx",
      "name": "汽配联",
      "teamId": "1764057295948"
    },
    {
      "id": "mijo4rbh",
      "name": "老头乐",
      "teamId": "1764057295948"
    },
    {
      "id": "mijo4v8l",
      "name": "悦想荟",
      "teamId": "1764057295948"
    },
    {
      "id": "mijo4yn1",
      "name": "正南齐北",
      "teamId": "1764057295948"
    },
    {
      "id": "mijo52fw",
      "name": "老司机FC",
      "teamId": "1764057295948"
    },
    {
      "id": "mijo55wl",
      "name": "聚友联",
      "teamId": "1764057295948"
    },
    {
      "id": "mis5yt14",
      "name": "奶牛",
      "teamId": "team-default-001"
    },
    {
      "id": "mj2gxumf",
      "name": "AEG俞翔",
      "teamId": "team-default-001"
    },
    {
      "id": "mj2h44v8",
      "name": "少数民族",
      "teamId": "team-default-001"
    },
    {
      "id": "mj2ha3ht",
      "name": "降妖伏魔",
      "teamId": "team-default-001"
    },
    {
      "id": "mj2hbne2",
      "name": "环球汽车中心",
      "teamId": "team-default-001"
    },
    {
      "id": "mj2hibcv",
      "name": "JM",
      "teamId": "team-default-001"
    },
    {
      "id": "mj2hle4a",
      "name": "曾大师老火锅",
      "teamId": "team-default-001"
    },
    {
      "id": "mj2hrten",
      "name": "老头乐",
      "teamId": "team-default-001"
    },
    {
      "id": "mj2i1q2e",
      "name": "玉棠竞技",
      "teamId": "team-default-001"
    }
  ],
  "seasons": [
    {
      "id": "legacy-season-mieaz0frgypbajwh42m",
      "name": "华侨城2025年冬",
      "teamId": "team-default-001",
      "sortOrder": 1
    },
    {
      "id": "legacy-season-mieaz0frf7pd4zt5vv",
      "name": "华侨城2025年夏",
      "teamId": "team-default-001",
      "sortOrder": 2
    },
    {
      "id": "sea-1764382546941",
      "name": "2026平顶山健康杯",
      "teamId": "1764057295948",
      "sortOrder": 1
    },
    {
      "id": "sea-1765519570609",
      "name": "华侨城2025年春",
      "teamId": "team-default-001",
      "sortOrder": 3
    },
    {
      "id": "sea-1765521210334",
      "name": "华侨城2024年夏",
      "teamId": "team-default-001",
      "sortOrder": 4
    }
  ],
  "venues": [
    {
      "id": "legacy-venue-mieaz0frjxp6jg3wc7e",
      "name": "华侨城足球公园",
      "teamId": "team-default-001",
      "sortOrder": 1
    },
    {
      "id": "legacy-venue-mieaz0fro2ms4qjtena",
      "name": "保时通体育文化创意园",
      "teamId": "team-default-001",
      "sortOrder": 2
    },
    {
      "id": "legacy-venue-mieaz0fro8xmp8d889",
      "name": "大田湾体育场",
      "teamId": "team-default-001",
      "sortOrder": 3
    },
    {
      "id": "legacy-venue-mieaz0fr6xykscpl33g",
      "name": "寸滩体育中心足球场",
      "teamId": "team-default-001",
      "sortOrder": 4
    },
    {
      "id": "ven-1764382407997",
      "name": "平顶山足球乐园",
      "teamId": "1764057295948",
      "sortOrder": 1
    }
  ],
  "players": [
    {
      "name": "曹晓霖",
      "number": "36",
      "birthday": "1989-06-13",
      "teamId": "team-default-001"
    },
    {
      "name": "柴陆俊夫",
      "number": "10",
      "birthday": "1992-01-06",
      "teamId": "team-default-001"
    },
    {
      "name": "车驰",
      "number": "6",
      "birthday": "1981-06-25",
      "teamId": "team-default-001"
    },
    {
      "name": "陈春",
      "number": "24",
      "birthday": "1987-02-04",
      "teamId": "team-default-001"
    },
    {
      "name": "陈启晅",
      "number": "23",
      "birthday": "2002-09-03",
      "teamId": "team-default-001"
    },
    {
      "name": "杜梓铭",
      "number": "",
      "teamId": "team-default-001"
    },
    {
      "name": "郭佳东",
      "number": "15",
      "birthday": "1993-12-26",
      "teamId": "team-default-001"
    },
    {
      "name": "何星谕",
      "number": "11",
      "birthday": "2010-06-12",
      "teamId": "team-default-001"
    },
    {
      "name": "胡勇",
      "number": "98",
      "birthday": "1987-03-08",
      "teamId": "team-default-001"
    },
    {
      "name": "康鑫",
      "number": "66",
      "birthday": "1985-12-05",
      "teamId": "team-default-001"
    },
    {
      "name": "老夏",
      "number": "",
      "teamId": "team-default-001"
    },
    {
      "name": "李单",
      "number": "16",
      "birthday": "1986-10-16",
      "teamId": "team-default-001"
    },
    {
      "name": "李彦达",
      "number": "",
      "birthday": "1981-01-27",
      "teamId": "team-default-001"
    },
    {
      "name": "李扬",
      "number": "3",
      "birthday": "1999-12-19",
      "teamId": "team-default-001"
    },
    {
      "name": "林浩",
      "number": "22",
      "birthday": "1995-02-20",
      "teamId": "team-default-001"
    },
    {
      "name": "刘豪",
      "number": "5",
      "birthday": "1990-05-29",
      "teamId": "team-default-001"
    },
    {
      "name": "钱星宇",
      "number": "8",
      "birthday": "1996-05-01",
      "teamId": "team-default-001"
    },
    {
      "name": "秦坤",
      "number": "17",
      "birthday": "1989-08-17",
      "teamId": "team-default-001"
    },
    {
      "name": "孙张力",
      "number": "1",
      "birthday": "2003-05-20",
      "teamId": "team-default-001"
    },
    {
      "name": "唐涛",
      "number": "",
      "birthday": "1984-01-10",
      "teamId": "team-default-001"
    },
    {
      "name": "王海斌",
      "number": "",
      "teamId": "team-default-001"
    },
    {
      "name": "王薪炎",
      "number": "21",
      "birthday": "1997-03-29",
      "teamId": "team-default-001"
    },
    {
      "name": "文云波",
      "number": "18",
      "birthday": "1985-09-01",
      "teamId": "team-default-001"
    },
    {
      "name": "胥德伟",
      "number": "4",
      "birthday": "1984-12-25",
      "teamId": "team-default-001"
    },
    {
      "name": "闫志伟",
      "number": "",
      "teamId": "team-default-001"
    },
    {
      "name": "杨皓宇",
      "number": "14",
      "birthday": "1991-10-24",
      "teamId": "team-default-001"
    },
    {
      "name": "杨涛",
      "number": "12",
      "avatar": "data:image/jpeg;base64,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",
      "birthday": "2000-09-29",
      "teamId": "team-default-001"
    },
    {
      "name": "张善博",
      "number": "41",
      "birthday": "1997-07-17",
      "teamId": "team-default-001"
    },
    {
      "name": "张龑瀚",
      "number": "28",
      "birthday": "1997-05-19",
      "teamId": "team-default-001"
    },
    {
      "name": "外援1",
      "number": "",
      "teamId": "team-default-001"
    },
    {
      "name": "朱峰",
      "number": "",
      "birthday": "1971-01-10",
      "teamId": "team-default-001"
    },
    {
      "name": "谭光华",
      "number": "9",
      "birthday": "1987-10-17",
      "teamId": "team-default-001"
    },
    {
      "name": "唐涛",
      "number": "1",
      "birthday": "1984-01-10",
      "teamId": "1764057295948"
    },
    {
      "name": "守门员1",
      "number": "",
      "teamId": "1764057295948"
    },
    {
      "name": "王檬",
      "number": "18",
      "teamId": "1764057295948"
    },
    {
      "name": "张衡",
      "number": "71",
      "teamId": "1764057295948"
    },
    {
      "name": "申相峰",
      "number": "",
      "birthday": "",
      "teamId": "team-default-001"
    }
  ],
  "theme": "sky"
};