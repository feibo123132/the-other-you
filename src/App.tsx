import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "@/pages/Home/index";
import Result from "@/pages/Result/index";
import Gallery from "@/pages/Gallery/index";
import PromptLibrary from "@/pages/PromptLibrary/index";
import StyleUniverse from "@/pages/StyleUniverse/index";

export default function App() {
  return (
    <Router basename={import.meta.env.BASE_URL}>
      {/* 外层容器：确保最小高度为屏幕高度，使用 flex 布局 */}
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        
        {/* 中间主体内容：flex: 1 让它自动撑开，把页脚挤到底部 */}
        <div style={{ flex: 1 }}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/result" element={<Result />} />
            <Route path="/gallery" element={<Gallery />} />
            <Route path="/prompts" element={<PromptLibrary />} />
            <Route path="/style-universe" element={<StyleUniverse />} />
          </Routes>
        </div>

        {/* 👇 底部备案号区域 */}
        <div style={{ 
            width: '100%', 
            textAlign: 'center', 
            padding: '20px 0', 
            fontSize: '12px', 
            color: '#999',
            backgroundColor: 'transparent' 
        }}>
            <a 
              href="https://beian.miit.gov.cn/" 
              target="_blank" 
              rel="noopener noreferrer"
              style={{ color: 'inherit', textDecoration: 'none' }}
            >
              {/* ⚠️请务必把下面这行文字换成你在控制台看到的真实备案号 */}
              桂ICP备2026000095号 
            </a>
        </div>

      </div>
    </Router>
  );
}