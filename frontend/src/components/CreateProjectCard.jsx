import { Plus } from "lucide-react";

export default function CreateProjectCard({ onClick }) {
  return (
    <div
       onClick={() => {
    console.log("Clicked");
    onClick();
  }}
      className="
  h-[320px]
  ios-radius
  border-2
  border-dashed
  border-white/10
  flex
  flex-col
  items-center
  justify-center
  cursor-pointer
  transition-all
  duration-200
  hover:border-white/25
  hover:bg-white/[0.04]
  active:scale-[0.98]
"
    >
      <div
        className="
  w-16
  h-16
  rounded-full
  bg-white/[0.06]
  flex
  items-center
  justify-center
"
      >
        <Plus size={36} />
      </div>

      <p className="mt-6 text-lg font-semibold text-zinc-300">
        New Project
      </p>
      
    </div>
  );
}