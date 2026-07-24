import { Link2 } from "lucide-react";

export default function JoinProjectCard({ onClick }) {
    return (
        <div

        onClick={() => {
    console.log("Join clicked");
    onClick();
}}


            className="
                h-[320px]
                ios-radius
                border-2
                border-dashed
                border-blue-500/30
                flex
                flex-col
                items-center
                justify-center
                cursor-pointer
                transition-all
                duration-200
                hover:border-blue-400/60
                hover:bg-blue-500/5
                active:scale-[0.98]
            "
        >
            <div
                className="
                    w-16
                    h-16
                    rounded-full
                    bg-blue-500/10
                    flex
                    items-center
                    justify-center
                "
            >
                <Link2 size={34} />
            </div>

            <p className="mt-6 text-lg font-semibold text-zinc-300">
                Join Project
            </p>
        </div>
    );
}