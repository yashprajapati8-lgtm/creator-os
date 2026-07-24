import api from "./api";
import { useEffect, useRef, useState } from "react";
import { Folder, X, Sparkles, Download } from "lucide-react";
import Login from "./pages/login";
import ProfileMenu from "./components/ProfileMenu";
import Dashboard from "./pages/Dashboard";
import CreateProjectModal from "./components/CreateProjectModal";
import socket from "./socket/socket";
import Chat from "./components/Chat";
import { createPortal } from "react-dom";

axios.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

function createObjectId() {
  return Array.from(crypto.getRandomValues(new Uint8Array(12)), (byte) =>
    byte.toString(16).padStart(2, "0"),
  ).join("");
}

export default function App() {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem("user");
    return saved ? JSON.parse(saved) : null;
  });

  const [scenes, setScenes] = useState([]);
  const [editingScene, setEditingScene] = useState(null);
  const [editedTitle, setEditedTitle] = useState("");
  const [selectedSceneId, setSelectedSceneId] = useState(null);
  const [isAssetsOpen, setIsAssetsOpen] = useState(false);
  const [newsUrl, setNewsUrl] = useState("");
  const [suggestion, setSuggestion] = useState("");
  const [activeBlockId, setActiveBlockId] = useState(null);
  const [isThinking, setIsThinking] = useState(false);
  const [view, setView] = useState("dashboard");
  const [projects, setProjects] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [shareProject, setShareProject] = useState(null);
  const [joinModalOpen, setJoinModalOpen] = useState(false);
  const [onlineCount, setOnlineCount] = useState(0);
  const [inviteCode, setInviteCode] = useState("");
  console.log(showCreateModal);

  async function handleJoinProject() {
  try {
    await api.post("/api/projects/join", {
      inviteCode,
    });

    setInviteCode("");
    setJoinModalOpen(false);

    fetchProjects();
  } catch (err) {
    console.log(err);
  }
}
  function handleLogout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    setUser(null);

    setProjects([]);

    setScenes([]);

    setSelectedProject(null);

    setSelectedSceneId(null);

    setView("login");
  }

const handleRenameProject = async (projectId, newTitle) => {
  try {
    console.log("projectId:", projectId, "newTitle:", newTitle);

    await api.put(`/api/projects/${projectId}`, {
      title: newTitle,
    });

    await fetchProjects();
  } catch (err) {
    console.error(err);
  }
};

const handleCreateProject = async (title) => {
  try {
    await api.post("/api/projects", {
      title,
    });

    await fetchProjects();

    setShowCreateModal(false);
  } catch (err) {
    console.error(err);
  }
};
  const handleDeleteProject = async (projectId) => {
    try {
      await axios.delete(`/api/projects/${projectId}`);

      await fetchProjects();
    } catch (err) {
      console.error(err);
    }
  };

 const handleOpenProject = async (project) => {
  setSelectedProject(project);
  setSelectedSceneId(null);
  setScenes([]);

  await fetchScenes(project._id);

  setView("editor");
};

const fetchProjects = async () => {
  try {
    const res = await api.get("/api/projects");
    setProjects(res.data);
    console.log(res.data);
  } catch (err) {
    console.error(err);
  }
};

  useEffect(() => {
    if (user) {
      fetchProjects();
    }
  }, [user]);

  useEffect(() => {
    socket.on("asset-receive", (updatedScene) => {
      setScenes((prevScenes) =>
        prevScenes.map((scene) =>
          scene._id === updatedScene._id ? updatedScene : scene,
        ),
      );
    });

    return () => socket.off("asset-receive");
  }, []);

  useEffect(() => {
    socket.on("connect", () => {
      console.log("Connected:", socket.id);
    });

    return () => {
      socket.off("connect");
    };
  }, []);

  const [copilotEnabled, setCopilotEnabled] = useState(() => {
    const saved = localStorage.getItem("copilotEnabled");

    return saved ? JSON.parse(saved) : true;
  });

  const fileInputRef = useRef(null);
  const newBlockIdRef = useRef(null);
  const debounceRef = useRef(null);

  const isRemoteUpdate = useRef(false);
  useEffect(() => {
    localStorage.setItem("copilotEnabled", JSON.stringify(copilotEnabled));
  }, [copilotEnabled]);

  function toggleCopilot() {
    setCopilotEnabled((prev) => {
      if (prev) {
        setSuggestion("");
      }

      return !prev;
    });
  }

  async function fetchScenes(projectId) {
    try {
      const response = await api.get(
        `/api/scenes?projectId=${projectId}`,
      );

      setScenes(response.data);

      if (response.data.length > 0) {
        setSelectedSceneId(response.data[0]._id);
      } else {
        setSelectedSceneId(null);
      }
    } catch (err) {
      console.log(err);
    }
  }

  useEffect(() => {
    if (user) {
      fetchProjects();
    }
  }, [user]);

  const selectedScene = scenes.find((scene) => scene._id === selectedSceneId);

  useEffect(() => {
    if (!selectedScene) return;

    if (isRemoteUpdate.current) {
      isRemoteUpdate.current = false;
      return;
    }

    socket.emit("script-update", {
      sceneId: selectedScene._id,
      blocks: selectedScene.blocks,
    });

    const timer = setTimeout(async () => {
      try {
        await api.put(
          `/api/scenes/${selectedSceneId}/script`,
          { blocks: selectedScene?.blocks },
        );
        console.log("Script saved successfully");
      } catch (err) {
        console.error("Autosave failed:", err.response?.data || err.message);
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [selectedSceneId, selectedScene?.blocks]);

  useEffect(() => {
    if (!selectedScene) return;

    const timer = setTimeout(async () => {
      try {
        await api.put(
          `/api/scenes/${selectedSceneId}/research`,
          { researchNote: selectedScene?.researchNote || "" },
        );
        socket.emit("research-update", {
          sceneId: selectedSceneId,
          researchNote: selectedScene?.researchNote || "",
        });
      } catch (err) {
        console.log(err);
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [selectedSceneId, selectedScene?.researchNote]);

  useEffect(() => {
    if (!selectedScene) return;

    socket.emit("join-scene", selectedScene._id);

    return () => {
      socket.emit("leave-scene", selectedScene._id);
    };
  }, [selectedScene]);

  useEffect(() => {
    socket.on("script-receive", (blocks) => {
      console.log("Received blocks:", blocks);

      isRemoteUpdate.current = true;

      setScenes((prevScenes) =>
        prevScenes.map((scene) =>
          scene._id === selectedSceneId ? { ...scene, blocks } : scene,
        ),
      );
    });

    return () => {
      socket.off("script-receive");
    };
  }, [selectedSceneId]);

  useEffect(() => {
    if (!selectedProject) return;

    socket.emit("join-project", selectedProject._id);

    return () => {
      socket.emit("leave-project", selectedProject._id);
    };
  }, [selectedProject]);

  useEffect(() => {
    socket.on("scene-created", (scene) => {
      setScenes((prev) => [...prev, scene]);
    });

    return () => socket.off("scene-created");
  }, []);

  useEffect(() => {
    socket.on("research-receive", (researchNote) => {
      setScenes((prev) =>
        prev.map((scene) =>
          scene._id === selectedSceneId ? { ...scene, researchNote } : scene,
        ),
      );
    });

    return () => socket.off("research-receive");
  }, [selectedSceneId]);

  useEffect(() => {
    socket.on("scene-renamed", ({ sceneId, title }) => {
      setScenes((prev) =>
        prev.map((scene) =>
          scene._id === sceneId ? { ...scene, title } : scene,
        ),
      );
    });

    return () => socket.off("scene-renamed");
  }, []);

  useEffect(() => {
    socket.on("scene-deleted", (sceneId) => {
      setScenes((prev) => prev.filter((scene) => scene._id !== sceneId));
    });

    return () => socket.off("scene-deleted");
  }, []);

  useEffect(() => {
    socket.on("online-count", (count) => {
      setOnlineCount(count);
    });

    return () => socket.off("online-count");
  }, []);

  async function createScene() {
    if (!selectedProject?._id) {
      console.log("No project selected");
      return;
    }

    try {
      const response = await api.post("/api/scenes", {
        title: `Scene ${scenes.length + 1}`,
        projectId: selectedProject._id,
        project: selectedProject._id,
        blocks: [
          {
            _id: createObjectId(),
            type: "paragraph",
            content: "",
          },
        ],
        assets: [],
      });

      setScenes((prevScenes) => [...prevScenes, response.data]);
      setSelectedSceneId(response.data._id);
      socket.emit("scene-created", {
        projectId: selectedProject._id,
        scene: response.data,
      });
    } catch (err) {
      console.log(err.response?.data || err.message);
    }
  }

  async function deleteScene(sceneId) {
    try {
      await api.delete(`/api/scenes/${sceneId}`);

      const remainingScenes = scenes.filter((scene) => scene._id !== sceneId);

      setScenes(remainingScenes);

      if (selectedSceneId === sceneId) {
        setSelectedSceneId(remainingScenes[0]?._id || null);
      }

      socket.emit("scene-deleted", {
        projectId: selectedProject._id,
        sceneId,
      });
    } catch (err) {
      console.log(err);
    }
  }

  async function saveSceneTitle(sceneId) {
    const title = editedTitle.trim();

    if (!title) {
      setEditingScene(null);
      return;
    }

    try {
      const response = await api.put(`/api/scenes/${sceneId}`, { title });

      socket.emit("scene-renamed", {
        projectId: selectedProject._id,
        sceneId,
        title: editedTitle,
      });

      setScenes((prevScenes) =>
        prevScenes.map((scene) =>
          scene._id === sceneId ? response.data : scene,
        ),
      );

      setEditingScene(null);
    } catch (err) {
      console.log(err);
    }
  }

  async function handleFileUpload(e) {
    const file = e.target.files[0];

    if (!file) return;

    try {
      const formData = new FormData();
      formData.append("asset", file);

      const response = await api.post(
        `/api/scenes/${selectedSceneId}/assets`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        },
      );

      setScenes((prevScenes) =>
        prevScenes.map((scene) =>
          scene._id === selectedSceneId ? response.data : scene,
        ),
      );

      socket.emit("asset-update", {
        sceneId: selectedSceneId,
        scene: response.data,
      });

      e.target.value = "";
    } catch (err) {
      console.log(err);
    }
  }

  function handleBlockChange(blockId, value) {
    setSuggestion("");
    setScenes((prevScenes) =>
      prevScenes.map((scene) =>
        scene._id === selectedSceneId
          ? {
              ...scene,
              blocks: scene.blocks.map((block) =>
                block._id === blockId ? { ...block, content: value } : block,
              ),
            }
          : scene,
      ),
    );

    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    if (copilotEnabled) {
      debounceRef.current = setTimeout(() => {
        fetchSuggestion(selectedSceneId, blockId, value);
      }, 2000);
    }
  }

  async function fetchSuggestion(sceneId, blockId, text) {
    if (!text.trim()) {
      setSuggestion("");
      return;
    }

    try {
      setIsThinking(true);

      const response = await api.post("/api/ai/suggest", {
        sceneId,
        blockId,

          text,
        },
      );

      setSuggestion(response.data.suggestion);
    } catch (err) {
      console.log(err);
    } finally {
      setIsThinking(false);
    }
  }

  async function deleteAttachment(attachmentId) {
    try {
      const response = await api.delete(
        `/api/scenes/${selectedSceneId}/assets/${attachmentId}`,
      );

      setScenes((prevScenes) =>
        prevScenes.map((scene) =>
          scene._id === selectedSceneId ? response.data : scene,
        ),
      );
    } catch (err) {
      console.log(err);
    }
  }

  if (!user) {
    return <Login onLoginSuccess={setUser} />;
  }

  if (view === "dashboard") {
    return (
      <>
        <Dashboard
          user={user}
          projects={projects}
          onOpenProject={handleOpenProject}
          onCreateProject={() => setShowCreateModal(true)}
          onDeleteProject={handleDeleteProject}
          onLogout={handleLogout}
          onRenameProject={handleRenameProject}
          onShareProject={(project) => setShareProject(project)}
          onJoinProject={() => {
            console.log("Opening modal");
            setJoinModalOpen(true);
          }}
        />

        {showCreateModal && (
          <CreateProjectModal
            onClose={() => setShowCreateModal(false)}
            onCreate={handleCreateProject}
          />
        )}

        {shareProject && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
            <div
              className="
        w-[420px] p-7
        rounded-3xl
        bg-white/6
        backdrop-blur-2xl backdrop-saturate-150
        border border-white/10
        shadow-[0_8px_32px_rgba(0,0,0,0.35)]
      "
            >
              <h2 className="text-2xl font-semibold mb-6 tracking-tight">
                Share Project
              </h2>

              <p className="text-zinc-400 text-sm mb-2">Invite Code</p>

              <div
                className="
          flex items-center justify-between
          rounded-2xl
          bg-white/5
          border border-white/10
          backdrop-blur-xl
          px-4 py-3
          mb-6
        "
              >
                <span className="font-mono text-lg tracking-widest text-white">
                  {shareProject.inviteCode}
                </span>

                <button
                  onClick={() =>
                    navigator.clipboard.writeText(shareProject.inviteCode)
                  }
                  className="
            px-4 py-2 rounded-xl
            bg-white/10
            border border-white/15
            backdrop-blur-xl
            hover:bg-white/20
            hover:border-white/25
            hover:scale-105
            active:scale-95
            transition-all duration-200
            text-sm font-medium
          "
                >
                  Copy
                </button>
              </div>

              <button
                onClick={() => setShareProject(null)}
                className="
          w-full py-3 rounded-xl
          bg-white/5
          border border-white/10
          backdrop-blur-xl
          hover:bg-white/15
          hover:border-white/25
          hover:shadow-[0_0_20px_rgba(255,255,255,0.08)]
          hover:scale-[1.02]
          active:scale-95
          transition-all duration-200
          text-sm font-medium
        "
              >
                Close
              </button>
            </div>
          </div>
        )}

        {joinModalOpen && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
            <div
              className="
        w-[400px] p-7
        rounded-3xl
        bg-white/5
        backdrop-blur-2xl backdrop-saturate-150
        border border-white/10
        shadow-[0_8px_32px_rgba(0,0,0,0.35)]
      "
            >
              <h2 className="text-2xl font-semibold mb-6 tracking-tight">
                Join Project
              </h2>

              <input
                className="
          w-full p-3 rounded-2xl
          bg-white/5
          border border-white/10
          backdrop-blur-xl
          outline-none
          placeholder:text-zinc-500
          focus:border-white/25
          focus:bg-white/[0.07]
          transition-all duration-200
        "
                placeholder="Invite code"
                value={inviteCode}
                onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
              />

              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => setJoinModalOpen(false)}
                  className="
            px-5 py-2.5 rounded-xl
            bg-white/5
            border border-white/10
            backdrop-blur-xl
            hover:bg-white/15
            hover:border-white/25
            hover:scale-105
            active:scale-95
            transition-all duration-200
            text-sm font-medium
          "
                >
                  Cancel
                </button>

                <button
                  onClick={handleJoinProject}
                  className="
            px-5 py-2.5 rounded-xl
            bg-white
            text-black
            border border-white/25
            shadow-[0_0_20px_rgba(255,255,255,0.08)]
            hover:scale-105
            active:scale-95
            transition-all duration-200
            text-sm font-medium
          "
                >
                  Join
                </button>
              </div>
            </div>
          </div>
        )}
      </>
    );
  }

  return (
    <div className="h-screen text-white p-4">
      <div className="glass h-14 rounded-2xl px-6 flex items-center justify-between z-50">
        <div className="flex items-center gap-4">
          <h1 className="font-bold text-xl">CreatorOS</h1>

          <div className="px-3 py-1 rounded-xl bg-white/5 border border-white/10 text-sm text-zinc-300">
            {selectedProject?.title}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 backdrop-blur-xl">
            <span className="w-2 h-2 rounded-full bg-green-500"></span>
            <span className="text-sm text-zinc-300">{onlineCount} Online</span>
          </div>

          <button className="
  w-9 h-9 rounded-xl
  flex items-center justify-center
  bg-white/5
  border border-white/10
  backdrop-blur-xl
  hover:bg-white/15
  hover:border-white/25
  hover:shadow-[0_0_20px_rgba(255,255,255,0.08)]
  hover:scale-105
  active:scale-95
  transition-all duration-200
">
  <Download size={20} />
</button>
          <ProfileMenu user={user} onLogout={handleLogout} />
        </div>
      </div>

      <div className="flex gap-4 mt-4 h-[calc(100vh-88px)]">
        <div className="glass w-72 rounded-3xl p-5 flex flex-col">
          <h2 className="text-zinc-400 mb-4">Scenes</h2>

          <div className="space-y-2">
            {scenes.map((scene, index) => (
              <div
                key={scene._id}
                onClick={() => setSelectedSceneId(scene._id)}
                onDoubleClick={() => {
                  setEditingScene(scene._id);
                  setEditedTitle(scene.title);
                }}
                className="group flex justify-between items-center p-3 rounded-xl bg-white/5 hover:bg-white/10 transition cursor-pointer select-none"
              >
                {editingScene === scene._id ? (
                  <input
                    autoFocus
                    value={editedTitle}
                    onChange={(e) => setEditedTitle(e.target.value)}
                    onBlur={() => saveSceneTitle(scene._id)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        saveSceneTitle(scene._id);
                      }

                      if (e.key === "Escape") {
                        setEditingScene(null);
                      }
                    }}
                    className="bg-transparent outline-none w-full font-semibold"
                  />
                ) : (
                  <span className="font-semibold">
                    {index + 1}. {scene.title}
                  </span>
                )}

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteScene(scene._id);
                  }}
                  className="opacity-0 group-hover:opacity-100 transition text-zinc-500 hover:text-red-400"
                >
                  <X size={16} />
                </button>
              </div>
            ))}
          </div>

          <button
            onClick={createScene}
            className="mt-auto w-full p-3 rounded-xl bg-white/5 hover:bg-white/10 transition"
          >
            + Add Scene
          </button>
        </div>

        <div className="flex-1 rounded-3xl bg-gradient-to-b from-black to-zinc-950 border border-white/5 p-12 overflow-auto">
          <div className="max-w-4xl mx-auto">
            <div className="flex justify-end items-center gap-3 mb-10">
              <button
                onClick={() => setIsAssetsOpen(true)}
                className="
                  relative w-10 h-10 rounded-xl
                  flex items-center justify-center
                  bg-white/5
                  border border-white/10
                  backdrop-blur-xl
                  hover:bg-white/15
                  hover:border-white/25
                  hover:shadow-[0_0_20px_rgba(255,255,255,0.08)]
                  hover:scale-105
                  active:scale-95
                  transition-all duration-200
                "
              >
                <Folder size={18} />

                {(selectedScene?.assets || []).length > 0 && (
                  <span className="absolute -top-2 -right-2 bg-blue-500 text-white rounded-full text-[10px] w-5 h-5 flex items-center justify-center">
                    {(selectedScene?.assets || []).length}
                  </span>
                )}
              </button>

              <button
                onClick={toggleCopilot}
                className={`
        relative px-4 py-2 rounded-xl
        border backdrop-blur-xl
        transition-all duration-200
        hover:scale-105 active:scale-95
        ${
          copilotEnabled
            ? "bg-white text-black border-white/25 shadow-[0_0_20px_rgba(255,255,255,0.08)]"
            : "bg-white/5 text-zinc-400 border-white/10 hover:bg-white/15 hover:border-white/25 hover:shadow-[0_0_20px_rgba(255,255,255,0.08)]"
        }
    `}
              >
                Copilot
              </button>
            </div>

            <p className="text-zinc-500 mb-3">{selectedScene?.title}</p>

            {!selectedScene && (
              <div className="text-zinc-500">
                No scene selected. Click + Add Scene first.
              </div>
            )}

            <div className="space-y-2">
              {(selectedScene?.blocks || []).map((block) => {
                const isHeading1 = block.type === "heading1";
                const isHeading2 = block.type === "heading2";

                return (
                  <div key={block._id}>
                    <textarea
                      value={block.content}
                      onChange={(e) =>
                        handleBlockChange(block._id, e.target.value)
                      }
                      onFocus={() => setActiveBlockId(block._id)}
                      onInput={(e) => {
                        e.currentTarget.style.height = "auto";
                        e.currentTarget.style.height = `${e.currentTarget.scrollHeight}px`;
                      }}
                      onKeyDown={(e) => {
                        if (
                          e.key === "Tab" &&
                          suggestion &&
                          activeBlockId === block._id
                        ) {
                          console.log("TAB PRESSED");

                          e.preventDefault();
                          const separator = block.content.endsWith(" ")
                            ? ""
                            : " ";

                          handleBlockChange(
                            block._id,
                            block.content + separator + suggestion,
                          );

                          setSuggestion("");

                          return;
                        }

                        if (
                          e.key === "Escape" &&
                          suggestion &&
                          activeBlockId === block._id
                        ) {
                          e.preventDefault();

                          setSuggestion("");

                          return;
                        }
                        if (e.key === " ") {
                          if (block.content === "#") {
                            e.preventDefault();

                            setScenes((prevScenes) =>
                              prevScenes.map((scene) =>
                                scene._id === selectedSceneId
                                  ? {
                                      ...scene,
                                      blocks: scene.blocks.map((b) =>
                                        b._id === block._id
                                          ? {
                                              ...b,
                                              type: "heading1",
                                              content: "",
                                            }
                                          : b,
                                      ),
                                    }
                                  : scene,
                              ),
                            );

                            return;
                          }

                          if (block.content === "##") {
                            e.preventDefault();

                            setScenes((prevScenes) =>
                              prevScenes.map((scene) =>
                                scene._id === selectedSceneId
                                  ? {
                                      ...scene,
                                      blocks: scene.blocks.map((b) =>
                                        b._id === block._id
                                          ? {
                                              ...b,
                                              type: "heading2",
                                              content: "",
                                            }
                                          : b,
                                      ),
                                    }
                                  : scene,
                              ),
                            );

                            return;
                          }
                        }

                        if (e.key === "Enter") {
                          if (e.shiftKey) return;

                          e.preventDefault();

                          const newId = createObjectId();

                          newBlockIdRef.current = newId;

                          const newBlock = {
                            _id: newId,
                            type: "paragraph",
                            content: "",
                          };

                          setScenes((prevScenes) =>
                            prevScenes.map((scene) =>
                              scene._id === selectedSceneId
                                ? {
                                    ...scene,
                                    blocks: [...scene.blocks, newBlock],
                                  }
                                : scene,
                            ),
                          );
                        }
                      }}
                      rows={1}
                      className={`
                        w-full bg-transparent outline-none resize-none overflow-hidden
                        ${
                          isHeading1
                            ? "text-4xl font-bold leading-tight min-h-[48px]"
                            : ""
                        }
                        ${
                          isHeading2
                            ? "text-2xl font-semibold leading-snug min-h-[36px]"
                            : ""
                        }
                        ${
                          !isHeading1 && !isHeading2
                            ? "text-lg leading-relaxed min-h-[28px]"
                            : ""
                        }
                      `}
                      ref={(el) => {
                        if (!el) return;

                        el.style.height = "auto";
                        el.style.height = `${el.scrollHeight}px`;

                        if (block._id === newBlockIdRef.current) {
                          el.focus();
                          newBlockIdRef.current = null;
                        }
                      }}
                    />
                    {activeBlockId === block._id && (
                      <>
                        {isThinking && !suggestion && (
                          <div className="flex items-center gap-2 mt-3 ml-1 opacity-70">
                            <Sparkles className="w-4 h-4 text-zinc-500 animate-pulse" />

                            <p className="italic text-zinc-500">Thinking...</p>
                          </div>
                        )}

                        {suggestion && (
                          <div className="flex items-start gap-2 mt-3 ml-1 opacity-80">
                            <Sparkles className="w-4 h-4 text-white" />

                            <p className="italic font-medium text-zinc-400 leading-relaxed">
                              {suggestion}
                            </p>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <Chat selectedProject={selectedProject} socket={socket} />
      </div>

      <input
        ref={fileInputRef}
        type="file"
        hidden
        onChange={handleFileUpload}
      />

      {isAssetsOpen &&
        createPortal(
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[9999]">
            <div className="glass w-[700px] max-h-[85vh] rounded-3xl p-8 overflow-y-auto">
              <div className="flex justify-between items-center border-b border-white/10 pb-5">
                <div>
                  <h2 className="text-2xl font-bold">Scene Assets</h2>

                  <p className="text-zinc-400 text-sm mt-1">
                    Manage all research and files for this scene.
                  </p>
                </div>

                <button
                  onClick={() => setIsAssetsOpen(false)}
                  className="
            w-10 h-10
            rounded-xl
            bg-white/5
            border border-white/10
            backdrop-blur-xl
            hover:bg-white/15
            hover:border-white/25
            hover:shadow-[0_0_20px_rgba(255,255,255,0.08)]
            hover:scale-105
            active:scale-95
            transition-all duration-200
            flex items-center justify-center
          "
                >
                  <X size={18} />
                </button>
              </div>

              <div className="mt-6 flex justify-between items-center">
                <button
                  onClick={() => fileInputRef.current.click()}
                  className="
            px-5 py-3 rounded-xl
            bg-white/5
            border border-white/10
            backdrop-blur-xl
            hover:bg-white/15
            hover:border-white/25
            hover:shadow-[0_0_20px_rgba(255,255,255,0.08)]
            hover:scale-105
            active:scale-95
            transition-all duration-200
            text-sm font-medium
          "
                >
                  + Upload File
                </button>

                <span className="text-zinc-400 text-sm">
                  {(selectedScene?.assets || []).length} Assets
                </span>
              </div>

              <div className="mt-6 flex flex-wrap gap-4">
                {(selectedScene?.assets || []).length === 0 ? (
                  <p className="text-zinc-500">No assets uploaded yet.</p>
                ) : (
                  selectedScene?.assets.map((attachment) => (
                    <div
                      key={attachment._id}
                      className="group relative glass w-32 rounded-2xl p-3"
                    >
                      <button
                        onClick={() => deleteAttachment(attachment._id)}
                        className="absolute top-2 right-2 w-6 h-6 rounded-full bg-zinc-800/90 flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
                      >
                        <X size={12} />
                      </button>

                      <img
                        src={attachment.url || ""}
                        className="w-full h-20 object-cover rounded-xl"
                      />

                      <p className="text-xs mt-2 truncate">
                        {attachment.name || "file"}
                      </p>
                    </div>
                  ))
                )}
              </div>

              <hr className="my-8 border-white/10" />

              <div className="mt-8">
                <h3 className="font-semibold text-lg">Research Note</h3>

                <textarea
                  value={selectedScene?.researchNote || ""}
                  onChange={(e) => {
                    setScenes((prevScenes) =>
                      prevScenes.map((scene) =>
                        scene._id === selectedSceneId
                          ? { ...scene, researchNote: e.target.value }
                          : scene,
                      ),
                    );
                  }}
                  placeholder="Paste ChatGPT, Claude, Gemini or your own research..."
                  className="w-full mt-3 h-32 glass rounded-2xl p-4 outline-none resize-none"
                />

                <div className="flex items-center gap-3 mt-4">
                  <span className="text-zinc-500 text-sm">Auto-saved</span>
                </div>
              </div>

              <hr className="my-8 border-white/10" />

              <h3 className="font-semibold text-lg">News Article</h3>

              <input
                value={newsUrl}
                onChange={(e) => setNewsUrl(e.target.value)}
                placeholder="Paste article URL..."
                className="w-full mt-3 glass rounded-xl p-4 outline-none"
              />

              <button className="glass mt-4 px-5 py-3 rounded-xl">
                Add Article
              </button>
            </div>
          </div>,
          document.body,
        )}
    </div>
  );
}
