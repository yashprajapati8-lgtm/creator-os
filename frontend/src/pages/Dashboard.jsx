import Navbar from "../components/Navbar";
import CreateProjectCard from "../components/CreateProjectCard";
import ProjectCard from "../components/ProjectCard";
import JoinProjectCard from "../components/JoinProjectCard";

export default function Dashboard({
  user,
  projects,
  onCreateProject,
  onJoinProject,
  onDeleteProject,
  onOpenProject,
  onLogout,
  onRenameProject,
  onShareProject,
}) {
  return (
    <div className="min-h-screen  text-white px-8 py-6">
      <Navbar user={user} onLogout={onLogout} />

      <div
        className="grid
    grid-cols-1
    sm:grid-cols-2
    lg:grid-cols-3
    xl:grid-cols-4
    gap-8
    mt-8"
      >
        <CreateProjectCard onClick={onCreateProject} />

        <JoinProjectCard onClick={onJoinProject} />

        {projects.map((project) => (
          <ProjectCard
            key={project._id}
            id={project._id}
            title={project.title}
            inviteCode={project.inviteCode}
            updatedAt={new Date(project.updatedAt).toLocaleDateString()}
            onDelete={() => onDeleteProject(project._id)}
            onClick={() => onOpenProject(project)}
            onRename={(id, newTitle) => onRenameProject(id, newTitle)}
            onShare={onShareProject}
          />
        ))}
      </div>
    </div>
  );
}
