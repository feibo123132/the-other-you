import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Copy, Check, BookOpen } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { promptLibrary, PromptCategory } from '../../data/promptLibrary';

const STORAGE_PROMPT_KEY = 'THE_OTHER_YOU_DRAFT_PROMPT';

const CATEGORIES: { id: PromptCategory; label: string }[] = [
  { id: 'gameplay', label: '热门玩法' },
  { id: 'portrait', label: '人物写真' },
  { id: 'group', label: '明星合照' },
  { id: 'travel', label: '旅游打卡' },
  { id: 'time-travel', label: '穿梭时空' },
  { id: 'dreamer', label: '大梦想家' },
  { id: 'fashion', label: '潮流发型' },
];

const PromptLibrary: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<PromptCategory>('gameplay');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleUsePrompt = (content: string) => {
    // Save to localStorage and navigate back
    localStorage.setItem(STORAGE_PROMPT_KEY, content);
    navigate('/');
  };

  const handleCopy = (content: string, id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(content);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filteredPrompts = promptLibrary.filter(p => p.category === activeTab);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 顶部导航栏 */}
      <div className="sticky top-0 bg-white border-b border-gray-100 z-10 px-4 py-3 flex items-center">
        <button
          onClick={() => navigate('/')}
          className="p-2 -ml-2 mr-2 text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-primary-500" />
          Prompt 库
        </h1>
      </div>

      {/* 内容区域 */}
      <div className="max-w-2xl mx-auto p-4">
        {/* 标签页切换 - 可横向滚动 */}
        <div className="flex p-1 bg-white rounded-xl shadow-sm border border-gray-100 mb-6 overflow-x-auto no-scrollbar">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveTab(cat.id)}
              className={`flex-none px-4 py-2.5 text-sm font-medium rounded-lg transition-all whitespace-nowrap ${
                activeTab === cat.id 
                  ? 'bg-gradient-to-r from-primary-500 to-secondary-500 text-white shadow-md' 
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* 列表内容 */}
        <div className="space-y-4">
          {filteredPrompts.map((item) => (
            <motion.div
              key={item.id}
              layoutId={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-all cursor-pointer group"
              onClick={() => handleUsePrompt(item.content)}
            >
              <div className="flex justify-between items-start mb-3">
                <h4 className="font-semibold text-gray-800 text-lg">{item.title}</h4>
                <div className="flex gap-2">
                  <button
                    onClick={(e) => handleCopy(item.content, item.id, e)}
                    className="p-2 rounded-lg bg-gray-50 text-gray-500 hover:bg-gray-100 transition-colors"
                    title="复制"
                  >
                    {copiedId === item.id ? (
                      <Check className="w-4 h-4 text-green-500" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                  <button
                    className="px-3 py-1.5 rounded-lg bg-primary-50 text-primary-600 text-sm font-medium hover:bg-primary-100 transition-colors"
                  >
                    使用
                  </button>
                </div>
              </div>
              <p className="text-gray-600 leading-relaxed bg-gray-50 p-4 rounded-xl border border-gray-100 text-sm">
                {item.content}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PromptLibrary;
