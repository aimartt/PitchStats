



import { FullDatabase } from '../types';

const DEFAULT_TEAM_ID = 'team-default-001';

export const defaultDb: FullDatabase = {
  teams: [
    {
      id: DEFAULT_TEAM_ID,
      name: "麒麟兄弟 FC",
      createdAt: new Date().toISOString()
    }
  ],
  users: [
    {
      id: "admin-init-001",
      username: "admin",
      password: "123456",
      name: "超级管理员",
      role: "admin",
      teamIds: [DEFAULT_TEAM_ID]
    }
  ],
  matches: [],
  opponents: [
    { id: "opp-1", name: "红龙 FC", teamId: DEFAULT_TEAM_ID },
    { id: "opp-2", name: "城市联队", teamId: DEFAULT_TEAM_ID },
    { id: "opp-3", name: "竞技熊队", teamId: DEFAULT_TEAM_ID },
    { id: "opp-4", name: "北区踢球者", teamId: DEFAULT_TEAM_ID },
    { id: "opp-5", name: "老男孩俱乐部", teamId: DEFAULT_TEAM_ID },
    { id: "opp-6", name: "科技巨人队", teamId: DEFAULT_TEAM_ID },
    { id: "opp-7", name: "猛虎 FC", teamId: DEFAULT_TEAM_ID },
    { id: "opp-8", name: "蓝鸟竞技", teamId: DEFAULT_TEAM_ID }
  ],
  seasons: [
    { id: "season-1", name: "2024 赛季", teamId: DEFAULT_TEAM_ID, sortOrder: 1 },
    { id: "season-2", name: "2023 赛季", teamId: DEFAULT_TEAM_ID, sortOrder: 2 }
  ],
  venues: [
    { id: "venue-1", name: "奥林匹克森林公园北园", teamId: DEFAULT_TEAM_ID, sortOrder: 1 },
    { id: "venue-2", name: "朝阳公园足球场", teamId: DEFAULT_TEAM_ID, sortOrder: 2 },
    { id: "venue-3", name: "十里河足球公园", teamId: DEFAULT_TEAM_ID, sortOrder: 3 },
    { id: "venue-4", name: "亦庄体育中心", teamId: DEFAULT_TEAM_ID, sortOrder: 4 },
    { id: "venue-5", name: "金风科技足球场", teamId: DEFAULT_TEAM_ID, sortOrder: 5 }
  ],
  players: [
    { name: "队长", number: "10", teamId: DEFAULT_TEAM_ID },
    { name: "前锋A", number: "9", teamId: DEFAULT_TEAM_ID },
    { name: "中场大师", number: "8", teamId: DEFAULT_TEAM_ID },
    { name: "铁卫", number: "4", teamId: DEFAULT_TEAM_ID },
    { name: "门神", number: "1", teamId: DEFAULT_TEAM_ID }
  ]
};