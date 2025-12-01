


import React, { useRef, useState } from 'react';
import { Settings, Download, Upload, CheckCircle, AlertTriangle, Database, Palette, Check } from 'lucide-react';
import { storageService } from '../services/storage';
import { authService } from '../services/auth';
import { SettingsPageProps, ThemeColor } from '../types';

const SettingsPage: React.FC<SettingsPageProps> = ({ currentTheme, onThemeChange }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const themes: { id: ThemeColor; name: string; color: string }[] = [
    { id: 'emerald', name: '绿茵场', color: '#059669' },
    { id: 'green', name: '经典绿', color: '#22c55e' },
    { id: 'teal', name: '青绿', color: '#14b8a6' },
    { id: 'cyan', name: '青色', color: '#0891b2' },
    { id: 'sky', name: '天蓝', color: '#0284c7' },
    { id: 'blue', name: '皇家蓝', color: '#2563eb' },
    { id: 'indigo', name: '靛蓝', color: '#4f46e5' },
    { id: 'violet', name: '深邃紫', color: '#7c3aed' },
    { id: 'purple', name: '紫色', color: '#a855f7' },
    { id: 'fuchsia', name: '紫红', color: '#d946ef' },
    { id: 'pink', name: '粉色', color: '#ec4899' },
    { id: 'rose', name: '烈焰红', color: '#e11d48' },
    { id: 'red', name: '正红', color: '#ef4444' },
    { id: 'orange', name: '活力橙', color: '#ea580c' },
    { id: 'amber', name: '琥珀色', color: '#f59e0b' },
    { id: 'lime', name: '酸橙绿', color: '#84cc16' },
    { id: 'slate', name: '极简灰', color: '#475569' },
  ];

  const handleExport = () => {
    try {
      const data = storageService.exportDatabase();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.href = url;
      a.download = `pitchstats_backup_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      setSuccessMsg("数据导出成功！文件已下载。");
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (e) {
      setErrorMsg("导出失败，请重试。");
    }
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        const result = storageService.importDatabase(json);
        
        if (result) {
          // Force logout to clear session
          authService.logout();
          setSuccessMsg("数据恢复成功！正在跳转至登录界面...");
          
          setTimeout(() => {
            // Reset URL to root (clearing hash like #/settings) and reload
            // This ensures a clean state initialization in App.tsx
            window.location.href = window.location.origin + window.location.pathname;
          }, 1000);
        } else {
          setErrorMsg("导入的数据格式无效。");
        }
      } catch (err) {
        setErrorMsg("无法解析 JSON 文件。");
      }
    };
    reader.readAsText(file);
    e.target.value = ''; // Reset input
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in relative">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Settings className="w-8 h-8" style={{ color: 'var(--primary)' }} />
            系统设置
          </h2>
          <p className="text-slate-500 mt-1">个性化设置与数据管理</p>
        </div>
      </div>

      {/* Theme Settings */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
         <div className="bg-slate-50 border-b border-slate-100 p-6">
            <h3 className="text-lg font-bold text-slate-800 flex items-center">
               <Palette className="w-5 h-5 mr-2" />
               个性化主题
            </h3>
            <p className="text-sm text-slate-500 mt-1">
               选择您喜欢的界面配色方案。
            </p>
         </div>
         <div className="p-8">
            <div className="flex flex-wrap gap-4">
               {themes.map((theme) => (
                  <button
                    key={theme.id}
                    onClick={() => onThemeChange(theme.id)}
                    className={`group relative flex items-center gap-3 p-3 rounded-xl border-2 transition-all ${currentTheme === theme.id ? 'border-slate-800 bg-slate-50' : 'border-transparent hover:bg-slate-50'}`}
                  >
                     <div 
                       className="w-10 h-10 rounded-full shadow-sm flex items-center justify-center text-white"
                       style={{ backgroundColor: theme.color }}
                     >
                        {currentTheme === theme.id && <Check className="w-5 h-5" />}
                     </div>
                     <span className={`font-medium ${currentTheme === theme.id ? 'text-slate-900' : 'text-slate-500 group-hover:text-slate-700'}`}>
                        {theme.name}
                     </span>
                  </button>
               ))}
            </div>
         </div>
      </div>

      {/* Database Settings */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
         <div className="bg-slate-50 border-b border-slate-100 p-6">
            <h3 className="text-lg font-bold text-slate-800 flex items-center">
               <Database className="w-5 h-5 mr-2" />
               数据库管理
            </h3>
            <p className="text-sm text-slate-500 mt-1">
               所有数据（包括比赛、球员、用户权限）均保存在您的浏览器本地。为了防止数据丢失，建议定期导出备份。
            </p>
         </div>
         
         <div className="p-8 grid md:grid-cols-2 gap-8">
            {/* Export Section */}
            <div className="border border-slate-200 rounded-xl p-6 hover:border-slate-400 transition-colors bg-white shadow-sm flex flex-col justify-between">
               <div>
                  <div 
                    className="w-12 h-12 rounded-full flex items-center justify-center mb-4"
                    style={{ backgroundColor: 'var(--primary-light)', color: 'var(--primary)' }}
                  >
                     <Download className="w-6 h-6" />
                  </div>
                  <h4 className="font-bold text-lg text-slate-800 mb-2">备份数据库</h4>
                  <p className="text-slate-500 text-sm mb-6">
                     将当前所有系统数据打包下载为 JSON 文件。包括：比赛记录、球队、球员、赛季、场地以及用户账号信息。
                  </p>
               </div>
               <button 
                  onClick={handleExport}
                  className="w-full py-3 text-white rounded-lg font-bold transition-colors flex items-center justify-center hover:brightness-110"
                  style={{ backgroundColor: 'var(--primary)' }}
               >
                  <Download className="w-4 h-4 mr-2" />
                  导出数据文件
               </button>
            </div>

            {/* Import Section */}
            <div className="border border-slate-200 rounded-xl p-6 hover:border-slate-400 transition-colors bg-white shadow-sm flex flex-col justify-between">
               <div>
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 mb-4">
                     <Upload className="w-6 h-6" />
                  </div>
                  <h4 className="font-bold text-lg text-slate-800 mb-2">恢复数据库</h4>
                  <p className="text-slate-500 text-sm mb-6">
                     上传之前备份的 JSON 文件以恢复数据。
                     <br/>
                     <span className="text-amber-600 font-bold flex items-center mt-2">
                        <AlertTriangle className="w-3 h-3 mr-1" />
                        警告：这将覆盖当前所有数据！
                     </span>
                  </p>
               </div>
               <input 
                  type="file" 
                  accept=".json" 
                  ref={fileInputRef} 
                  onChange={handleFileChange} 
                  className="hidden" 
               />
               <button 
                  onClick={handleImportClick}
                  className="w-full py-3 bg-white border-2 border-slate-200 hover:border-blue-500 text-slate-700 hover:text-blue-600 rounded-lg font-bold transition-colors flex items-center justify-center"
               >
                  <Upload className="w-4 h-4 mr-2" />
                  导入数据文件
               </button>
            </div>
         </div>
      </div>

      {successMsg && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-6 py-4 rounded-xl flex items-center shadow-lg animate-fade-in fixed bottom-8 right-8 z-50">
          <CheckCircle className="w-6 h-6 mr-3" />
          <span className="font-medium">{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-xl flex items-center shadow-lg animate-fade-in fixed bottom-8 right-8 z-50">
          <AlertTriangle className="w-6 h-6 mr-3" />
          <span className="font-medium">{errorMsg}</span>
        </div>
      )}
    </div>
  );
};

export default SettingsPage;