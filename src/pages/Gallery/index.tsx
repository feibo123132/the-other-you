import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { transformOptions } from '../../config/options';
import { CATEGORY_ORDER, CATEGORY_LABELS } from '../../config/categories';

const GalleryImage: React.FC<{ id: string; label: string; previewImage?: string }> = ({ id, label, previewImage }) => {
  // 优先使用配置的图片，如果没有则默认为 .jpg
  const [src, setSrc] = useState(previewImage || `/gallery/${id}.jpg`);
  const [hasError, setHasError] = useState(false);

  const handleError = () => {
    // 如果当前是 jpg，尝试切换到 png
    if (src.endsWith('.jpg')) {
      setSrc(src.replace('.jpg', '.png'));
    } else {
      // 如果已经是 png 或者其他格式失败，则显示占位图
      setHasError(true);
    }
  };

  if (hasError) {
    return (
      <div className="w-full h-auto">
        <img
          src={`https://picsum.photos/seed/${encodeURIComponent(id)}/600/${400 + (id.length % 200)}`}
          alt={label}
          className="w-full h-auto block"
        />
      </div>
    );
  }

  return <img src={src} onError={handleError} alt={label} className="w-full h-auto block" />;
};

const Gallery: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-secondary-50 to-accent-50">
      <header className="px-4 pt-8 pb-6 relative text-center">
        <button
          onClick={() => navigate(-1)}
          className="absolute left-4 top-8 p-2 rounded-full bg-white/80 hover:bg-white shadow-sm transition-all"
        >
          <ArrowLeft className="w-6 h-6 text-gray-700" />
        </button>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">作品展示栏</h1>
        <p className="text-gray-600 mt-2">按大类与小类分组展示，任意比例图片自适应布局</p>
      </header>
      <main className="px-4 pb-12 space-y-8">
        {CATEGORY_ORDER.map((cat) => {
          const items = transformOptions.filter(o => o.category === cat);
          return (
            <section key={cat} className="bg-white rounded-2xl shadow-lg p-4 sm:p-6">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-800 mb-4">{CATEGORY_LABELS[cat]}</h2>
              <div className="columns-1 sm:columns-2 lg:columns-3 gap-4">
                {items.map((opt) => (
                  <div key={opt.id} className="break-inside-avoid mb-4 rounded-2xl overflow-hidden border border-gray-200">
                    <GalleryImage id={opt.id} label={opt.label} previewImage={opt.previewImage} />
                    <div className="px-3 py-2 text-sm text-gray-700 border-t bg-gray-50">{opt.label}</div>
                  </div>
                ))}
              </div>
            </section>
          );
        })}
      </main>
    </div>
  );
};

export default Gallery;
