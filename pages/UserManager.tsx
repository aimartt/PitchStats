
import React, { useState, useEffect } from 'react';
import { authService } from '../services/auth';
import { User, UserRole, Team, STORAGE_KEYS, PlayerProfile } from '../types';
import { UserCog, Trash2, Pencil, Shield, Check, X, User as UserIcon, Lock, Plus, Shirt, Star } from 'lucide-react';

interface UserManagerProps {
  currentUser: User;
  teams?: Team[];
  players?: PlayerProfile[];
}

const UserManager: React.FC<UserManagerProps> = ({ currentUser, teams = [], players = [] }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [localTeams, setLocalTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Create / Edit State
  const [isCreating, setIsCreating] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  
  // Form Fields
  const [formUsername, setFormUsername] = useState('');
  const [formName, setFormName] = useState('');
  const [formRole, setFormRole] = useState<UserRole>('player');
  const [formTeamIds, setFormTeamIds] = useState<string[]>([]);
  const [formPassword, setFormPassword] = useState(''); 
  const [formBindings, setFormBindings] = useState<Record<string, string>>({}); // teamId -> playerName

  useEffect(() => {
    loadData();
  }, []);

  // Update local teams from props or storage
  useEffect(() => {
     if (teams.length > 0) {
        setLocalTeams(teams);
     } else {
        const teamsStr = localStorage.getItem(STORAGE_KEYS.TEAMS);
        setLocalTeams(teamsStr ? JSON.parse(teamsStr) : []);
     }
  }, [teams]);

  const loadData = () => {
    setLoading(true);
    const allUsers = authService.getUsers();
    setUsers(allUsers);
    setLoading(false);
  };

  const handleDelete = async (userId: string) => {
    if (userId === currentUser.id) {
      alert("无法删除当前登录账号");
      return;
    }
    if (window.confirm("确定要删除该用户吗？此操作无法撤销。")) {
      await authService.deleteUser(userId);
      loadData();
    }
  };

  const startCreate = () => {
     setIsCreating(true);
     setEditingUser(null);
     resetForm();
  };

  const startEdit = (user: User) => {
    setIsCreating(false);
    setEditingUser(user);
    setFormUsername(user.username);
    setFormName(user.name);
    setFormRole(user.role);
    setFormTeamIds(user.teamIds || []);
    setFormPassword('');
    setFormBindings(user.linkedPlayerNames || {});
  };

  const resetForm = () => {
    setFormUsername('');
    setFormName('');
    setFormRole('player');
    setFormTeamIds([]);
    setFormPassword('');
    setFormBindings({});
  };

  const closeModal = () => {
    setIsCreating(false);
    setEditingUser(null);
    resetForm();
  };

  const toggleTeam = (teamId: string) => {
    if (formTeamIds.includes(teamId)) {
      setFormTeamIds(formTeamIds.filter(id => id !== teamId));
      // Remove binding if team unselected
      const newBindings = {...formBindings};
      delete newBindings[teamId];
      setFormBindings(newBindings);
    } else {
      setFormTeamIds([...formTeamIds, teamId]);
    }
  };

  const handleBindingChange = (teamId: string, playerName: string) => {
     setFormBindings(prev => ({ ...prev, [teamId]: playerName }));
  };

  const saveForm = async () => {
    if (!formName.trim()) { alert("昵称不能为空"); return; }
    if (formTeamIds.length === 0) { alert("必须至少关联一个球队"); return; }
    
    if (isCreating) {
       if (!formUsername.trim()) { alert("用户名不能为空"); return; }
       if (!formPassword.trim()) { alert("密码不能为空"); return; }

       const newUser: User = {
          id: Date.now().toString(),
          username: formUsername,
          password: formPassword,
          name: formName,
          role: formRole,
          teamIds: formTeamIds,
          linkedPlayerNames: formBindings
       };
       const res = await authService.createUser(newUser);
       if (!res.success) {
          alert(res.message);
          return;
       }
    } else if (editingUser) {
        const updatedUser: User = {
          ...editingUser,
          name: formName,
          role: formRole,
          teamIds: formTeamIds,
          password: formPassword.trim() ? formPassword.trim() : editingUser.password,
          linkedPlayerNames: formBindings
        };
        await authService.updateUser(updatedUser);
    }

    closeModal();
    loadData();
  };

  const getTeamPlayers = (teamId: string) => {
     return players.filter(p => p.teamId === teamId);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-fade-in relative">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <UserCog className="w-8 h-8" style={{ color: 'var(--primary)' }} />
            用户权限管理
          </h2>
          <p className="text-slate-500 mt-1">管理用户、分配球队及设置管理员</p>
        </div>
        
        <button 
           onClick={startCreate}
           className="flex items-center gap-2 px-4 py-2 text-white rounded-lg shadow-sm font-medium hover:brightness-110 transition-all"
           style={{ backgroundColor: 'var(--primary)' }}
        >
           <Plus className="w-5 h-5" />
           添加后台用户
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-slate-500">
            <thead className="text-xs text-slate-700 uppercase bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4">用户信息</th>
                <th className="px-6 py-4">关联球队数</th>
                <th className="px-6 py-4 text-center">当前权限</th>
                <th className="px-6 py-4 text-center">绑定球员</th>
                <th className="px-6 py-4 text-center">操作</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="bg-white border-b hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mr-3 font-bold border border-slate-200">
                         {user.name.charAt(0)}
                      </div>
                      <div>
                        <div className="font-bold text-slate-900">{user.name}</div>
                        <div className="text-xs text-slate-400 font-mono">{user.username}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="bg-indigo-50 text-indigo-700 px-2 py-1 rounded text-xs font-bold border border-indigo-100">
                      {user.teamIds?.length || 0} 支球队
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    {user.role === 'admin' ? (
                      <span 
                        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium text-white"
                        style={{ backgroundColor: 'var(--primary)' }}
                      >
                        <Shield className="w-3 h-3 mr-1" />
                        管理员
                      </span>
                    ) : user.role === 'captain' ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-700">
                        <Star className="w-3 h-3 mr-1" />
                        队长
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600">
                        <UserIcon className="w-3 h-3 mr-1" />
                        球员
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-center">
                     {user.linkedPlayerNames && Object.values(user.linkedPlayerNames).length > 0 ? (
                        <div className="flex justify-center">
                           <div className="bg-emerald-50 text-emerald-700 px-2 py-1 rounded text-xs font-bold border border-emerald-100 flex items-center gap-1">
                              <Shirt className="w-3 h-3" />
                              已绑定
                           </div>
                        </div>
                     ) : (
                        <span className="text-xs text-slate-300">-</span>
                     )}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex items-center justify-center gap-2">
                       <button 
                         onClick={() => startEdit(user)}
                         className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                         title="编辑/授权"
                       >
                         <Pencil className="w-4 h-4" />
                       </button>
                       {user.id !== currentUser.id && (
                         <button 
                           onClick={() => handleDelete(user.id)}
                           className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                           title="删除用户"
                         >
                           <Trash2 className="w-4 h-4" />
                         </button>
                       )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit/Create User Modal */}
      {(editingUser || isCreating) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden animate-fade-in max-h-[90vh] overflow-y-auto">
             <div className="px-6 py-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center sticky top-0 bg-slate-50 z-10">
              <h3 className="font-bold text-slate-800 flex items-center">
                <UserCog className="w-5 h-5 mr-2" style={{ color: 'var(--primary)' }} />
                {isCreating ? '创建后台用户' : '编辑用户'}
              </h3>
              <button onClick={closeModal} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
               {isCreating && (
                 <div>
                   <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">登录用户名</label>
                   <input 
                     type="text" 
                     value={formUsername}
                     onChange={(e) => setFormUsername(e.target.value)}
                     className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 outline-none"
                     style={{ '--tw-ring-color': 'var(--primary)' } as React.CSSProperties}
                   />
                 </div>
               )}

               <div>
                 <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">昵称</label>
                 <input 
                   type="text" 
                   value={formName}
                   onChange={(e) => setFormName(e.target.value)}
                   className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 outline-none"
                   style={{ '--tw-ring-color': 'var(--primary)' } as React.CSSProperties}
                 />
               </div>

               <div>
                 <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">球队分配与身份绑定</label>
                 <div className="space-y-3 border border-slate-200 rounded-lg p-3 max-h-60 overflow-y-auto bg-slate-50">
                    {localTeams.map(team => {
                      const isSelected = formTeamIds.includes(team.id);
                      const teamPlayers = getTeamPlayers(team.id);

                      return (
                        <div key={team.id} className="bg-white p-3 rounded border border-slate-200 shadow-sm">
                           {/* Team Selection */}
                           <div className="flex items-center mb-2" onClick={() => toggleTeam(team.id)}>
                              <div className={`w-5 h-5 rounded border flex items-center justify-center mr-3 cursor-pointer ${isSelected ? 'bg-indigo-500 border-indigo-500 text-white' : 'border-slate-300 bg-white'}`}>
                                 {isSelected && <Check className="w-3 h-3" />}
                              </div>
                              <span className="text-sm font-bold text-slate-700 cursor-pointer select-none">{team.name}</span>
                           </div>

                           {/* Player Binding Dropdown (Only if team selected) */}
                           {isSelected && teamPlayers.length > 0 && (
                             <div className="pl-8 animate-fade-in">
                                <label className="text-[10px] text-slate-400 block mb-1">绑定球员身份 (可选):</label>
                                <select 
                                   className="w-full text-xs p-1.5 border border-slate-300 rounded bg-slate-50"
                                   value={formBindings[team.id] || ''}
                                   onChange={(e) => handleBindingChange(team.id, e.target.value)}
                                >
                                   <option value="">-- 不绑定 --</option>
                                   {teamPlayers.map(p => (
                                     <option key={p.name} value={p.name}>{p.name} {p.number ? `(#${p.number})` : ''}</option>
                                   ))}
                                </select>
                             </div>
                           )}
                           {isSelected && teamPlayers.length === 0 && (
                              <p className="pl-8 text-[10px] text-slate-400 italic">该球队暂无球员数据，无法绑定</p>
                           )}
                        </div>
                      );
                    })}
                 </div>
                 {formTeamIds.length === 0 && <p className="text-xs text-red-500 mt-1">至少选择一个球队</p>}
               </div>

               <div>
                 <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">系统权限</label>
                 <div className="grid grid-cols-3 gap-2">
                   <button
                     type="button"
                     onClick={() => setFormRole('player')}
                     className={`p-2 rounded-lg border text-sm font-medium transition-all flex flex-col items-center justify-center gap-1 ${formRole === 'player' ? 'bg-slate-100 border-slate-400 text-slate-800 ring-1 ring-slate-400' : 'border-slate-200 text-slate-500 hover:bg-slate-50'}`}
                   >
                     <UserIcon className="w-4 h-4" />
                     普通球员
                   </button>
                   <button
                     type="button"
                     onClick={() => setFormRole('captain')}
                     className={`p-2 rounded-lg border text-sm font-medium transition-all flex flex-col items-center justify-center gap-1 ${formRole === 'captain' ? 'bg-amber-100 border-amber-400 text-amber-800 ring-1 ring-amber-400' : 'border-slate-200 text-slate-500 hover:bg-slate-50'}`}
                   >
                     <Star className="w-4 h-4" />
                     队长
                   </button>
                   <button
                     type="button"
                     onClick={() => setFormRole('admin')}
                     className={`p-2 rounded-lg border text-sm font-medium transition-all flex flex-col items-center justify-center gap-1 ${formRole === 'admin' ? 'bg-slate-50 border-transparent text-white ring-1' : 'border-slate-200 text-slate-500 hover:bg-slate-50'}`}
                     style={formRole === 'admin' ? { backgroundColor: 'var(--primary)', borderColor: 'var(--primary)', color: 'white' } : {}}
                   >
                     <Shield className="w-4 h-4" />
                     管理员
                   </button>
                 </div>
               </div>

               <div>
                 <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                    {isCreating ? '设置密码' : '重置密码 (选填)'}
                 </label>
                 <div className="relative">
                    <input 
                      type="text" 
                      value={formPassword}
                      onChange={(e) => setFormPassword(e.target.value)}
                      placeholder={isCreating ? "设置登录密码" : "不修改请留空"}
                      className="w-full p-2 pl-9 border border-slate-300 rounded-lg focus:ring-2 outline-none"
                      style={{ '--tw-ring-color': 'var(--primary)' } as React.CSSProperties}
                    />
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                 </div>
               </div>

               <div className="flex gap-3 pt-4">
                 <button 
                   onClick={closeModal}
                   className="flex-1 py-2 text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg font-medium transition-colors"
                 >
                   取消
                 </button>
                 <button 
                   onClick={saveForm}
                   className="flex-1 py-2 text-white rounded-lg font-medium transition-colors flex items-center justify-center"
                   style={{ backgroundColor: 'var(--primary)' }}
                 >
                   <Check className="w-4 h-4 mr-1" />
                   {isCreating ? '创建用户' : '保存更改'}
                 </button>
               </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManager;
