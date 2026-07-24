import ProfileMenu from "./ProfileMenu";

export default function Navbar({ user, onLogout }) {
  return (
    <div className="glass ios-radius h-[60px] px-5 flex items-center justify-between relative z-50">
      <div className="flex items-center gap-4">
        <h1
          className="text-xl font-bold tracking-tight"
          style={{ fontFamily: "Manrope, sans-serif" }}
        >
          CreatorOS
        </h1>

        <div className="px-3.5 py-1.5 rounded-full bg-white/[0.07] border border-white/10 text-sm font-medium text-zinc-300">
          Your Projects
        </div>
      </div>

      <div className="flex items-center gap-3">
        <span className="text-sm text-zinc-400">{user?.name}</span>
        <ProfileMenu user={user} onLogout={onLogout} />
      </div>
    </div>
  );
}