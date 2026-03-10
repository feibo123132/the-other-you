import { useEffect, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuthStore } from "@/store/useAuthStore";

const TopRightMenu = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const panelRef = useRef<HTMLDivElement | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const currentUser = useAuthStore((state) => state.currentUser);
  const logout = useAuthStore((state) => state.logout);

  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen]);

  if (location.pathname === "/login") {
    return null;
  }

  return (
    <div className="fixed top-4 right-4 z-50" ref={panelRef}>
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="inline-flex items-center gap-1 px-5 py-2 rounded-2xl border-2 border-slate-900 bg-[#f6eed9] text-[#4b3b2f] text-lg sm:text-xl font-bold shadow-sm hover:shadow-md transition-shadow"
      >
        菜单
        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {isOpen && (
        <div className="mt-3 w-[min(20rem,calc(100vw-2rem))] rounded-3xl bg-[#f3f3f3] shadow-xl border border-slate-200/90 overflow-hidden">
          <div className="p-6">
            <div className="text-base text-slate-500 mb-2 font-medium">当前账号</div>
            <div className="text-3xl text-slate-800 font-semibold break-all leading-tight">
              {currentUser || "未登录"}
            </div>
          </div>

          <div className="h-px bg-slate-200" />

          <div className="p-4">
            {currentUser ? (
              <button
                type="button"
                onClick={() => {
                  logout();
                  setIsOpen(false);
                }}
                className="w-full text-left text-2xl font-semibold text-red-500 hover:text-red-600 transition-colors px-2 py-1"
              >
                退出登录
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  navigate("/login");
                }}
                className="w-full text-left text-2xl font-semibold text-slate-800 hover:text-slate-950 transition-colors px-2 py-1"
              >
                登录
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default TopRightMenu;
