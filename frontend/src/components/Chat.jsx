import axios from "axios";
import { useEffect, useState } from "react";

const Chat = ({ selectedProject, socket }) => {
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");

  const fetchChats = async () => {
    if (!selectedProject) return;

    try {
      const res = await api.get(`/api/chat/${selectedProject._id}`);

      setMessages(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const sendMessage = async () => {
    if (!message.trim() || !selectedProject) return;

    try {
      const res = await api.post(`/api/chat/${selectedProject._id}`, {
        message,
      });

      setMessages((prev) => [...prev, res.data]);

      setMessage("");

      socket.emit("chat-message", {
        projectId: selectedProject._id,
        chat: res.data,
      });
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchChats();
  }, [selectedProject]);

  useEffect(() => {
    if (!socket) return;

    const receiveMessage = (chat) => {
      setMessages((prev) => [...prev, chat]);
    };

    socket.on("chat-receive", receiveMessage);

    return () => {
      socket.off("chat-receive", receiveMessage);
    };
  }, [socket]);

  return (
    <div className="glass w-[340px] rounded-3xl border border-white/10 backdrop-blur-xl flex flex-col overflow-hidden relative z-10">
      <div className="px-5 pt-5 pb-4 border-b border-white/10">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-white">Team Chat</h2>

            <p className="text-xs text-zinc-500 mt-0.5">
              Collaborate with your team
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />

            <span className="text-xs text-zinc-400">Live</span>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center text-3xl">
              💬
            </div>

            <p className="text-white mt-5 font-medium">No messages yet</p>

            <p className="text-zinc-500 text-sm mt-1">
              Start the conversation.
            </p>
          </div>
        ) : (
          messages.map((msg) => (
            <div
              key={msg._id}
              className="bg-white/5 border border-white/10 backdrop-blur-lg rounded-2xl px-4 py-3 hover:bg-white/[0.08] transition-all duration-200 shadow-sm"
            >
              <div className="flex justify-between items-center">
                <span className="font-semibold text-white text-sm">
                  {msg.sender.name}
                </span>

                <span className="text-[11px] text-zinc-500">
                  {new Date(msg.createdAt).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>

              <p className="text-zinc-300 mt-2 text-sm leading-6 break-words">
                {msg.message}
              </p>
            </div>
          ))
        )}
      </div>

      <div className="border-t border-white/10 p-4">
        <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-2xl px-2 py-2">
          <input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                sendMessage();
              }
            }}
            placeholder="Write a message..."
            className="flex-1 bg-transparent px-3 text-white placeholder:text-zinc-500 outline-none"
          />

          <button
            onClick={sendMessage}
            className="shrink-0 h-10 w-10 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:scale-105 hover:from-violet-500 hover:to-indigo-500 transition-all duration-200 flex items-center justify-center shadow-lg"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-5 h-5 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M5 12h14m-6-6 6 6-6 6"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Chat;
