
import React, { useState, useRef } from 'react';
import { Team } from '../types';
import { Briefcase, Plus, Pencil, Trash2, X, Check, Camera } from 'lucide-react';

interface TeamManagerProps {
  teams: Team[];
  onAddTeam: (name: string, logo?: string) => void;
  onEditTeam: (id: string, name: string, logo?: string) => void;
}

const TeamManager: React.FC<TeamManagerProps> = ({ teams, onAddTeam, onEditTeam }) => {
  const [newTeamName, setNewTeamName] = useState('');
  const [newTeamLogo, setNewTeamLogo] = useState<string | undefined>(undefined);
  const [error, setError] = useState<string | null>(null);

  // Edit State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editLogo, setEditLogo] = useState<string | undefined>(undefined);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const editFileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, setLogo: (l: string) => void) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      alert("图片太大，请选择小于 2MB 的图片");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        // Resize to 150x150
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const MAX_SIZE = 150;
        
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_SIZE) {
            height *= MAX_SIZE / width;
            width = MAX_SIZE;
          }
        } else {
          if (height > MAX_SIZE) {
            width *= MAX_SIZE / height;
            height = MAX_SIZE;
          }
        }

        canvas.width = width;
        canvas.height = height;
        ctx?.drawImage(img, 0, 0, width, height);
        
        const base64 = canvas.toDataURL('image/jpeg', 0.8);
        setLogo(base64);
      };
    };
    reader.readAsDataURL(file);
    e.target.value = ''; // Reset
  };

  const handleAdd = () => {
    if (!newTeamName.trim()) {
      setError("球队名称不能为空");
      return;
    }
    onAddTeam(newTeamName.trim(), newTeamLogo);
    setNewTeamName('');
    setNewTeamLogo(undefined);
    setError(null);
  };

  const startEdit = (team: Team) => {
    setEditingId(team.id);
    setEditName(team.name);
    setEditLogo(team.logo);
  };

  const saveEdit = () => {
    if (editingId && editName.trim()) {
      onEditTeam(editingId, editName.trim(), editLogo);
      setEditingId(null);
      setEditName('');
      setEditLogo(undefined);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in relative">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Briefcase className="w-8 h-8" style={{ color: 'var(--primary)' }} />
            球队管理
          </h2>
          <p className="text-slate-500 mt-1">创建和管理系统中的球队实体</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
         <div className="md:col-span-1">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 sticky top-4">
              <h3 className="text-lg font-bold text-slate-800 mb-4">创建新球队</h3>
              <div className="space-y-4">
                <div className="flex justify-center mb-2">
                   <div 
                     onClick={() => fileInputRef.current?.click()}
                     className="w-20 h-20 rounded-full bg-slate-100 border-2 border-dashed border-slate-300 flex items-center justify-center cursor-pointer hover:border-blue-500 overflow-hidden relative group"
                   >
                      {newTeamLogo ? (
                        <img src={newTeamLogo} className="w-full h-full object-cover" />
                      ) : (
                        <Camera className="w-6 h-6 text-slate-400" />
                      )}
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all flex items-center justify-center">
                         <Camera className="w-6 h-6 text-white opacity-0 group-hover:opacity-100" />
                      </div>
                   </div>
                   <input 
                     type="file" 
                     ref={fileInputRef} 
                     className="hidden" 
                     accept="image/*"
                     onChange={(e) => handleImageUpload(e, setNewTeamLogo)}
                   />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">球队名称</label>
                  <input 
                    type="text" 
                    value={newTeamName}
                    onChange={(e) => setNewTeamName(e.target.value)}
                    placeholder="例如：流浪者 FC"
                    className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 outline-none"
                    style={{ '--tw-ring-color': 'var(--primary)' } as React.CSSProperties}
                  />
                </div>
                {error && <p className="text-sm text-red-500">{error}</p>}
                <button 
                  onClick={handleAdd}
                  className="w-full text-white font-medium py-2 rounded-lg transition-colors flex items-center justify-center"
                  style={{ backgroundColor: 'var(--primary)' }}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  创建球队
                </button>
              </div>
            </div>
         </div>

         <div className="md:col-span-2 space-y-4">
            {teams.map(team => (
              <div key={team.id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
                 <div className="flex items-center gap-4">
                    {editingId === team.id ? (
                      <div className="relative w-12 h-12 rounded-lg overflow-hidden group cursor-pointer" onClick={() => editFileInputRef.current?.click()}>
                         {editLogo ? <img src={editLogo} className="w-full h-full object-cover" /> : <div className="w-full h-full bg-slate-100 flex items-center justify-center"><Camera className="w-4 h-4 text-slate-400"/></div>}
                         <input type="file" ref={editFileInputRef} className="hidden" accept="image/*" onChange={(e) => handleImageUpload(e, setEditLogo)} />
                      </div>
                    ) : (
                      <div className="w-12 h-12 rounded-lg bg-slate-100 flex items-center justify-center font-bold text-slate-500 text-lg overflow-hidden">
                         {team.logo ? <img src={team.logo} className="w-full h-full object-cover" /> : team.name.charAt(0)}
                      </div>
                    )}
                    
                    <div>
                       {editingId === team.id ? (
                          <div className="flex items-center gap-2">
                             <input 
                               type="text" 
                               value={editName} 
                               onChange={(e) => setEditName(e.target.value)}
                               className="border border-slate-300 rounded px-2 py-1 text-sm outline-none focus:border-blue-500"
                             />
                             <button onClick={saveEdit} className="text-emerald-600"><Check className="w-4 h-4"/></button>
                             <button onClick={() => setEditingId(null)} className="text-red-500"><X className="w-4 h-4"/></button>
                          </div>
                       ) : (
                          <h3 className="font-bold text-slate-800 text-lg">{team.name}</h3>
                       )}
                       <p className="text-xs text-slate-400">ID: {team.id}</p>
                    </div>
                 </div>
                 
                 <div className="flex gap-2">
                    <button 
                      onClick={() => startEdit(team)}
                      className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    >
                       <Pencil className="w-4 h-4" />
                    </button>
                    {/* Delete is disabled for safety in this version */}
                    <button 
                      disabled
                      title="暂不支持删除球队"
                      className="p-2 text-slate-200 cursor-not-allowed rounded-lg"
                    >
                       <Trash2 className="w-4 h-4" />
                    </button>
                 </div>
              </div>
            ))}
         </div>
      </div>
    </div>
  );
};

export default TeamManager;
