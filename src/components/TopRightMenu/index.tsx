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
    <div className="fixed top-4 right-4 z-50 flex flex-col items-end" ref={panelRef}>
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="inline-flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white/95 px-4 py-2 text-base font-semibold text-gray-700 shadow-sm backdrop-blur-sm transition-all hover:bg-white hover:shadow-md"
      >
        菜单
        <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {isOpen && (
        <div className="mt-3 w-[min(20rem,calc(100vw-2rem))] overflow-hidden rounded-2xl border border-gray-100 bg-white/95 shadow-lg backdrop-blur-sm">
          <div className="p-6">
            <div className="mb-2 text-base font-semibold text-gray-500">当前账号</div>
            <div className="break-all text-lg font-semibold leading-tight text-gray-800">
              {currentUser || "未登录"}
            </div>
          </div>

          <div className="h-px bg-gray-100" />

          <div className="p-4">
            {currentUser ? (
              <button
                type="button"
                onClick={() => {
                  logout();
                  setIsOpen(false);
                }}
                className="w-full px-2 py-1 text-left text-lg font-semibold text-red-500 transition-colors hover:text-red-600"
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
                className="w-full px-2 py-1 text-left text-lg font-semibold text-gray-800 transition-colors hover:text-gray-950"
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
