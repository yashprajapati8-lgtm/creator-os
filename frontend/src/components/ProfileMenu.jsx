import { useState } from "react";
import { createPortal } from "react-dom";

export default function ProfileMenu({ user, onLogout }) {
  const [showMenu, setShowMenu] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setShowMenu(!showMenu)}
        className="w-10 h-10 rounded-full bg-blue-600 text-white font-semibold flex items-center justify-center"
      >
        {user?.name?.charAt(0).toUpperCase()}
      </button>

      {showMenu && createPortal(
        <div className="fixed top-16 right-4 z-[9999] w-60 rounded-xl bg-zinc-900 border border-white/10 shadow-xl overflow-hidden">
          <div className="p-4 border-b border-white/10">
            <p className="font-semibold">{user?.name}</p>
            <p className="text-xs text-zinc-400 break-all">{user?.email}</p>
          </div>

          <button
            onClick={onLogout}
            className="w-full text-left px-4 py-3 hover:bg-white/5 transition"
          >
            Logout
          </button>
        </div>,
        document.body
      )}
    </div>
  );
}