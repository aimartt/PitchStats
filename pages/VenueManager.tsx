



import React, { useState } from 'react';
import { MapPin, Plus, Trash2, Search, Pencil, X, Check, ArrowUp } from 'lucide-react';
import { VenueManagerProps } from '../types';

const VenueManager: React.FC<VenueManagerProps> = ({ venues, onAddVenue, onRemoveVenue, onEditVenue }) => {
  const [newVenue, setNewVenue] = useState('');
  const [newSortOrder, setNewSortOrder] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState<string | null>(null);

  // Edit State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const [editSortOrder, setEditSortOrder] = useState<string>('');
  const [editError, setEditError] = useState<string | null>(null);

  const handleAdd = () => {
    const trimmed = newVenue.trim();
    if (!trimmed) {
      setError('请输入场地名称');
      return;
    }
    if (venues.some(v => v.name === trimmed)) {
      setError('该场地已存在');
      return;
    }
    const order = newSortOrder ? parseInt(newSortOrder) : 0;
    onAddVenue(trimmed, order);
    setNewVenue('');
    setNewSortOrder('');
    setError(null);
  };

  const startEditing = (id: string, name: string, sortOrder?: number) => {
    setEditingId(id);
    setEditValue(name);
    setEditSortOrder(sortOrder !== undefined ? sortOrder.toString() : '0');
    setEditError(null);
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditValue('');
    setEditSortOrder('');
    setEditError(null);
  };

  const saveEdit = () => {
    const trimmed = editValue.trim();
    if (!trimmed) {
      setEditError('名称不能为空');
      return;
    }
    if (venues.some(v => v.name === trimmed && v.id !== editingId)) {
      setEditError('该场地名已存在');
      return;
    }
    
    if (editingId) {
      const order = editSortOrder ? parseInt(editSortOrder) : 0;
      onEditVenue(editingId, trimmed, order);
      cancelEditing();
    }
  };

  const filteredVenues = venues.filter(v => 
    v.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in relative">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <MapPin className="w-8 h-8" style={{ color: 'var(--primary)' }} />
            场地管理
          </h2>
          <p className="text-slate-500 mt-1">管理常用的比赛场地，记录主场与客场信息</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Add Venue Section */}
        <div className="md:col-span-1">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 sticky top-4">
            <h3 className="text-lg font-bold text-slate-800 mb-4">添加新场地</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">场地名称</label>
                <input 
                  type="text" 
                  value={newVenue}
                  onChange={(e) => setNewVenue(e.target.value)}
                  placeholder="例如：奥林匹克北园"
                  className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 outline-none"
                  style={{ '--tw-ring-color': 'var(--primary)' } as React.CSSProperties}
                  onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">排序号 (越小越靠前)</label>
                <input 
                  type="number" 
                  value={newSortOrder}
                  onChange={(e) => setNewSortOrder(e.target.value)}
                  placeholder="0"
                  className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 outline-none"
                  style={{ '--tw-ring-color': 'var(--primary)' } as React.CSSProperties}
                  onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
                />
              </div>
              {error && (
                <p className="text-sm text-red-500">{error}</p>
              )}
              <button 
                onClick={handleAdd}
                className="w-full text-white font-medium py-2 rounded-lg transition-colors flex items-center justify-center hover:brightness-110"
                style={{ backgroundColor: 'var(--primary)' }}
              >
                <Plus className="w-4 h-4 mr-2" />
                添加场地
              </button>
            </div>
          </div>
        </div>

        {/* Venue List Section */}
        <div className="md:col-span-2">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden min-h-[400px]">
            <div className="p-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
              <h3 className="font-bold text-slate-800">场地列表 ({venues.length})</h3>
              <div className="flex items-center gap-4">
                 <div className="text-xs text-slate-500 flex items-center">
                    <ArrowUp className="w-3 h-3 mr-1" /> 按排序号升序
                 </div>
                 <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
                  <input 
                    type="text" 
                    placeholder="搜索场地..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9 pr-4 py-1.5 text-sm border border-slate-300 rounded-full focus:ring-1 focus:ring-slate-300 outline-none w-40 md:w-48"
                  />
                 </div>
              </div>
            </div>
            
            <div className="max-h-[600px] overflow-y-auto p-4">
              {filteredVenues.length > 0 ? (
                <div className="space-y-3">
                  {filteredVenues.map((venue) => (
                    <div key={venue.id} className="flex items-center justify-between p-4 bg-white border border-slate-200 rounded-lg hover:border-slate-300 hover:shadow-sm transition-all group">
                      <div className="flex items-center">
                         <div className="w-8 h-8 rounded bg-slate-100 flex items-center justify-center text-slate-500 mr-4 shrink-0 font-mono font-bold text-sm" title="排序号">
                            {venue.sortOrder ?? 0}
                         </div>
                        <div className="flex items-center">
                           <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 mr-4 shrink-0">
                             <MapPin className="w-5 h-5" />
                           </div>
                           <span className="font-medium text-slate-700 text-lg">{venue.name}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => startEditing(venue.id, venue.name, venue.sortOrder)}
                          className="text-slate-400 hover:text-blue-600 p-2 rounded-md hover:bg-blue-50 transition-colors"
                          title="编辑"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => onRemoveVenue(venue.id)}
                          className="text-slate-400 hover:text-red-600 p-2 rounded-md hover:bg-red-50 transition-colors"
                          title="删除场地"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-10 text-slate-400">
                  <MapPin className="w-12 h-12 mx-auto mb-2 opacity-20" />
                  <p>没有找到场地信息</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      {editingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm overflow-hidden animate-fade-in">
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
              <h3 className="font-bold text-slate-800">编辑场地</h3>
              <button onClick={cancelEditing} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
               <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">场地名称</label>
                  <input 
                    type="text" 
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 outline-none"
                    style={{ '--tw-ring-color': 'var(--primary)' } as React.CSSProperties}
                    autoFocus
                    onKeyDown={(e) => e.key === 'Enter' && saveEdit()}
                  />
               </div>
               <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">排序号</label>
                  <input 
                    type="number" 
                    value={editSortOrder}
                    onChange={(e) => setEditSortOrder(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 outline-none"
                    style={{ '--tw-ring-color': 'var(--primary)' } as React.CSSProperties}
                    onKeyDown={(e) => e.key === 'Enter' && saveEdit()}
                  />
               </div>
               {editError && <p className="text-sm text-red-500 mt-1">{editError}</p>}
               <p className="text-xs text-slate-400 mt-2">
                  注意：修改名称将同步更新历史记录。
               </p>
               <div className="flex gap-3 mt-4">
                 <button 
                   onClick={cancelEditing}
                   className="flex-1 py-2 text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg font-medium transition-colors"
                 >
                   取消
                 </button>
                 <button 
                   onClick={saveEdit}
                   className="flex-1 py-2 text-white rounded-lg font-medium transition-colors flex items-center justify-center"
                   style={{ backgroundColor: 'var(--primary)' }}
                 >
                   <Check className="w-4 h-4 mr-1" />
                   保存
                 </button>
               </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VenueManager;