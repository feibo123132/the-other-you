import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="w-full py-6 mt-auto bg-transparent">
      <div className="container mx-auto px-4 flex flex-col md:flex-row justify-center items-center gap-2 md:gap-6 text-sm text-gray-400">
        <a 
          href="https://beian.miit.gov.cn/" 
          target="_blank" 
          rel="noopener noreferrer"
          className="hover:text-gray-600 transition-colors"
        >
          桂ICP备2026000095号-1
        </a>
        
        <a 
          href="http://www.beian.gov.cn/portal/registerSystemInfo?recordcode=45052102000181" 
          target="_blank" 
          rel="noopener noreferrer"
          className="flex items-center gap-1 hover:text-gray-600 transition-colors"
        >
          <img 
            src="http://www.beian.gov.cn/img/ghs.png" 
            alt="公安备案图标" 
            className="w-4 h-4"
          />
          <span>桂公网安备 45052102000181号</span>
        </a>
      </div>
    </footer>
  );
};

export default Footer;
