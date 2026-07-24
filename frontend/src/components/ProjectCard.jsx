import { useState } from "react";
import { MoreVertical, Clapperboard } from "lucide-react";

export default function ProjectCard({
  id,
  title,
  updatedAt,
  inviteCode,
  onClick,
  onDelete,
  onRename,
  onShare,
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState(title);
  const [showMenu, setShowMenu] = useState(false);

  const handleRename = async () => {
    try {
      console.log("editedTitle before save:", editedTitle);

      if (editedTitle.trim() === "") {
        setEditedTitle(title);
        setIsEditing(false);
        return;
      }

      await onRename(id, editedTitle);

      setIsEditing(false);
    } catch (error) {
      console.error(error);
    }
  };
  return (
    <div
      onClick={onClick}
      className="
relative
  glass
  ios-radius
  p-5
  cursor-pointer
  transition-all
  duration-200
  hover:-translate-y-0.5
  active:scale-[0.98]
  hover:border-white/20
"
    >
      <div className="absolute top-4 right-4">
        <button
          onClick={(e) => {
            e.stopPropagation();
            setShowMenu(!showMenu);
          }}
          className="p-2 rounded-full hover:bg-white/10 active:scale-90 transition-all"
        >
          <MoreVertical size={20} />
        </button>

        {showMenu && (
          <div
            className="
        absolute
        right-0
        top-full
        mt-2
        w-40
        glass
        rounded-2xl
        overflow-hidden
        border
        border-white/10
        shadow-2xl
        z-50
      "
          >
            <button
              className="w-full px-4 py-3 text-left hover:bg-white/5 transition"
              onClick={(e) => {
                e.stopPropagation();
                setIsEditing(true);
                setShowMenu(false);
              }}
            >
              ✏ Rename
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onShare({
                  id,
                  title,
                  inviteCode,
                });
                setShowMenu(false);
              }}
              className="w-full px-4 py-3 text-left hover:bg-white/5 transition"
            >
              🔗 Share
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
              className="w-full text-left px-4 py-3 text-red-400 hover:bg-red-500/10 transition"
            >
              🗑 Delete
            </button>
          </div>
        )}
      </div>

      <div
        className="
    h-44
    rounded-2xl
    bg-gradient-to-br
    from-zinc-770
    to-black
    border
    border-white/20
    flex items-center justify-center
  "
      >
        <Clapperboard size={50} className="text-zinc-700" />
      </div>

      {isEditing ? (
        <input
          autoFocus
          value={editedTitle}
          onChange={(e) => setEditedTitle(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              handleRename();
            }
          }}
          onBlur={handleRename}
          className="
            mt-3
            w-full
            bg-transparent
            text-lg
            font-semibold
            tracking-tight
            text-white
            border-b
            border-white/20
            focus:border-white/50
            outline-none
            pb-1
            transition-colors
        "
        />
      ) : (
        <h3
          className="
        mt-3
        text-lg
        font-semibold
        tracking-tight
        text-white
        truncate
    "
        >
          {title}
        </h3>
      )}

      <p className="mt-2 text-zinc-400">{updatedAt}</p>
    </div>
  );
}
