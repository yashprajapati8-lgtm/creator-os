import { useState } from "react";
import { X } from "lucide-react";

export default function CreateProjectModal({ onClose, onCreate }) {
  const [title, setTitle] = useState("");

  function handleSubmit(e) {
    e.preventDefault();

    if (!title.trim()) return;

    onCreate(title);

    setTitle("");
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="glass ios-radius w-[440px] max-w-full p-7">
        <div className="flex justify-between items-center">
          <h2
            className="text-xl font-bold tracking-tight"
            style={{ fontFamily: "Manrope, sans-serif" }}
          >
            Create Project
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/[0.06] flex items-center justify-center hover:bg-white/10 active:scale-90 transition-all"
          >
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-8">
          <label className="text-sm font-medium text-zinc-400">Project Name</label>

          <input
  value={title}
  onChange={(e) => setTitle(e.target.value)}
  placeholder="My Documentary"
  autoFocus
  className="
      mt-2.5
      w-full
      rounded-2xl
      bg-white/[0.06]
      border
      border-white/10
      px-4
      py-3.5
      text-[15px]
      placeholder:text-zinc-500
      outline-none
      focus:border-white/25
      focus:bg-white/[0.08]
      transition-all
  "
/>

          <div className="mt-8 flex justify-end gap-4">
            <button
  type="button"
  onClick={onClose}
  className="
    px-5
    py-3
    rounded-full
    bg-white/[0.06]
    border
    border-white/10
    font-medium
    hover:bg-white/10
    active:scale-[0.97]
    transition-all
  "
>
  Cancel
</button>

<button
  type="submit"
  disabled={!title.trim()}
  className="
    px-6
    py-3
    rounded-full
    bg-white
    text-black
    font-semibold
    disabled:opacity-40
    disabled:cursor-not-allowed
    active:scale-[0.97]
    transition-all
  "
>
  Create
</button>
          </div>
        </form>
      </div>
    </div>
  );
}
