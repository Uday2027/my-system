'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  deauthenticateAdmin,
  createProject,
  updateProject,
  deleteProject,
  createSkill,
  updateSkill,
  deleteSkill,
  createAchievement,
  updateAchievement,
  deleteAchievement,
} from '@/app/actions';

// Shadcn Components
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

// Icons
import {
  Plus,
  Pencil,
  Trash2,
  ExternalLink,
  Github,
  LogOut,
  FolderKanban,
  Wrench,
  Trophy,
  ArrowLeft,
  Loader2,
} from 'lucide-react';
import { toast } from 'sonner';

interface DashboardClientProps {
  initialProjects: any[];
  initialSkills: any[];
  initialAchievements: any[];
}

export default function DashboardClient({
  initialProjects,
  initialSkills,
  initialAchievements,
}: DashboardClientProps) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);

  // Active Dialog state
  const [activeTab, setActiveTab] = useState('projects');
  
  // Modals Open state
  const [projectDialogOpen, setProjectDialogOpen] = useState(false);
  const [skillDialogOpen, setSkillDialogOpen] = useState(false);
  const [achievementDialogOpen, setAchievementDialogOpen] = useState(false);

  // Edit target state (if null, we are adding a new item)
  const [editingProject, setEditingProject] = useState<any>(null);
  const [editingSkill, setEditingSkill] = useState<any>(null);
  const [editingAchievement, setEditingAchievement] = useState<any>(null);

  // Form states
  const [projectForm, setProjectForm] = useState({
    title: '',
    description: '',
    longDescription: '',
    image: '',
    githubUrl: '',
    liveUrl: '',
    tags: '',
    order: '0',
    featured: false,
  });

  const [skillForm, setSkillForm] = useState({
    name: '',
    category: 'Frontend',
    level: '80',
    order: '0',
  });

  const [achievementForm, setAchievementForm] = useState({
    title: '',
    description: '',
    date: '',
    link: '',
    order: '0',
  });

  // Logout handler
  const handleLogout = async () => {
    try {
      await deauthenticateAdmin();
      toast.success('Logged out successfully');
      router.push('/admin');
    } catch {
      toast.error('Logout failed');
    }
  };

  // Reset Form Functions
  const resetProjectForm = () => {
    setProjectForm({
      title: '',
      description: '',
      longDescription: '',
      image: '',
      githubUrl: '',
      liveUrl: '',
      tags: '',
      order: '0',
      featured: false,
    });
    setEditingProject(null);
  };

  const resetSkillForm = () => {
    setSkillForm({
      name: '',
      category: 'Frontend',
      level: '80',
      order: '0',
    });
    setEditingSkill(null);
  };

  const resetAchievementForm = () => {
    setAchievementForm({
      title: '',
      description: '',
      date: '',
      link: '',
      order: '0',
    });
    setEditingAchievement(null);
  };

  // Open Edit Modals
  const openEditProject = (project: any) => {
    setEditingProject(project);
    setProjectForm({
      title: project.title,
      description: project.description,
      longDescription: project.longDescription || '',
      image: project.image || '',
      githubUrl: project.githubUrl || '',
      liveUrl: project.liveUrl || '',
      tags: project.tags,
      order: String(project.order),
      featured: project.featured,
    });
    setProjectDialogOpen(true);
  };

  const openEditSkill = (skill: any) => {
    setEditingSkill(skill);
    setSkillForm({
      name: skill.name,
      category: skill.category,
      level: String(skill.level),
      order: String(skill.order),
    });
    setSkillDialogOpen(true);
  };

  const openEditAchievement = (achievement: any) => {
    setEditingAchievement(achievement);
    setAchievementForm({
      title: achievement.title,
      description: achievement.description || '',
      date: achievement.date,
      link: achievement.link || '',
      order: String(achievement.order),
    });
    setAchievementDialogOpen(true);
  };

  // Submit handlers
  const handleProjectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectForm.title || !projectForm.description || !projectForm.tags) {
      toast.error('Please fill in title, description, and tags');
      return;
    }

    setLoading('project');
    try {
      const payload = {
        ...projectForm,
        order: Number(projectForm.order) || 0,
      };

      if (editingProject) {
        await updateProject(editingProject.id, payload);
        toast.success('Project updated successfully');
      } else {
        await createProject(payload);
        toast.success('Project created successfully');
      }
      setProjectDialogOpen(false);
      resetProjectForm();
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || 'Action failed');
    } finally {
      setLoading(null);
    }
  };

  const handleSkillSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!skillForm.name || !skillForm.category) {
      toast.error('Please fill in skill name and category');
      return;
    }

    setLoading('skill');
    try {
      const payload = {
        name: skillForm.name,
        category: skillForm.category,
        level: Number(skillForm.level) || 80,
        order: Number(skillForm.order) || 0,
      };

      if (editingSkill) {
        await updateSkill(editingSkill.id, payload);
        toast.success('Skill updated successfully');
      } else {
        await createSkill(payload);
        toast.success('Skill created successfully');
      }
      setSkillDialogOpen(false);
      resetSkillForm();
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || 'Action failed');
    } finally {
      setLoading(null);
    }
  };

  const handleAchievementSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!achievementForm.title || !achievementForm.date) {
      toast.error('Please fill in title and date');
      return;
    }

    setLoading('achievement');
    try {
      const payload = {
        title: achievementForm.title,
        description: achievementForm.description || null,
        date: achievementForm.date,
        link: achievementForm.link || null,
        order: Number(achievementForm.order) || 0,
      };

      if (editingAchievement) {
        await updateAchievement(editingAchievement.id, payload);
        toast.success('Achievement updated successfully');
      } else {
        await createAchievement(payload);
        toast.success('Achievement created successfully');
      }
      setAchievementDialogOpen(false);
      resetAchievementForm();
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || 'Action failed');
    } finally {
      setLoading(null);
    }
  };

  // Delete handlers
  const handleProjectDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this project?')) return;
    try {
      await deleteProject(id);
      toast.success('Project deleted');
      router.refresh();
    } catch {
      toast.error('Delete failed');
    }
  };

  const handleSkillDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this skill?')) return;
    try {
      await deleteSkill(id);
      toast.success('Skill deleted');
      router.refresh();
    } catch {
      toast.error('Delete failed');
    }
  };

  const handleAchievementDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this achievement?')) return;
    try {
      await deleteAchievement(id);
      toast.success('Achievement deleted');
      router.refresh();
    } catch {
      toast.error('Delete failed');
    }
  };

  return (
    <div className="min-h-screen bg-black text-neutral-100 font-sans pb-16">
      {/* Header */}
      <div className="border-b border-white/5 bg-neutral-900/40 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              size="sm"
              variant="ghost"
              className="text-neutral-400 hover:text-neutral-200"
              onClick={() => router.push('/')}
            >
              <ArrowLeft className="w-4 h-4 mr-1" /> View Site
            </Button>
            <span className="h-4 w-px bg-white/10" />
            <h1 className="font-semibold text-lg tracking-wider text-white">
              ADMIN CONTROL PANEL
            </h1>
          </div>
          <Button
            size="sm"
            variant="outline"
            className="border-neutral-600 text-neutral-400 hover:bg-neutral-800 rounded-full"
            onClick={handleLogout}
          >
            <LogOut className="w-3.5 h-3.5 mr-1" /> Sign Out
          </Button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 mt-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-white/5 pb-4">
            <TabsList className="bg-neutral-900/80 border border-white/5 rounded-full p-1 h-auto">
              <TabsTrigger
                value="projects"
                className="rounded-full px-5 py-2 text-xs uppercase tracking-wider data-[state=active]:bg-white data-[state=active]:text-black"
              >
                <FolderKanban className="w-3.5 h-3.5 mr-1.5" /> Projects
              </TabsTrigger>
              <TabsTrigger
                value="skills"
                className="rounded-full px-5 py-2 text-xs uppercase tracking-wider data-[state=active]:bg-white data-[state=active]:text-black"
              >
                <Wrench className="w-3.5 h-3.5 mr-1.5" /> Skills
              </TabsTrigger>
              <TabsTrigger
                value="achievements"
                className="rounded-full px-5 py-2 text-xs uppercase tracking-wider data-[state=active]:bg-white data-[state=active]:text-black"
              >
                <Trophy className="w-3.5 h-3.5 mr-1.5" /> Timeline
              </TabsTrigger>
            </TabsList>

            {/* Create buttons based on active tab */}
            {activeTab === 'projects' && (
              <Dialog open={projectDialogOpen} onOpenChange={(open) => {
                setProjectDialogOpen(open);
                if (!open) resetProjectForm();
              }}>
                <DialogTrigger render={
                  <Button className="bg-white text-black hover:bg-neutral-200 rounded-full">
                    <Plus className="w-4 h-4 mr-1.5" /> Add Project
                  </Button>
                } />
                <DialogContent className="max-w-4xl bg-neutral-900 border-white/5 text-neutral-100 rounded-2xl">
                  <DialogHeader>
                    <DialogTitle>{editingProject ? 'Edit Project' : 'Add New Project'}</DialogTitle>
                    <DialogDescription className="text-neutral-400">
                      Fill out the project details. Markdown links and unsplash image URLs are recommended.
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleProjectSubmit} className="space-y-4 pt-2">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-xs text-neutral-400">Title *</label>
                        <Input
                          placeholder="Project Title"
                          value={projectForm.title}
                          onChange={(e) => setProjectForm({ ...projectForm, title: e.target.value })}
                          className="bg-neutral-950 border-white/5"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs text-neutral-400">Display Order</label>
                        <Input
                          type="number"
                          placeholder="0"
                          value={projectForm.order}
                          onChange={(e) => setProjectForm({ ...projectForm, order: e.target.value })}
                          className="bg-neutral-950 border-white/5"
                        />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs text-neutral-400">Short Description *</label>
                      <Input
                        placeholder="Brief summary shown on cards"
                        value={projectForm.description}
                        onChange={(e) => setProjectForm({ ...projectForm, description: e.target.value })}
                        className="bg-neutral-950 border-white/5"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs text-neutral-400">Long Description (Optional)</label>
                      <Textarea
                        placeholder="Detailed information / case study"
                        value={projectForm.longDescription}
                        onChange={(e) => setProjectForm({ ...projectForm, longDescription: e.target.value })}
                        className="bg-neutral-950 border-white/5 min-h-[80px]"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-xs text-neutral-400">GitHub Code Link</label>
                        <Input
                          placeholder="https://github.com/..."
                          value={projectForm.githubUrl}
                          onChange={(e) => setProjectForm({ ...projectForm, githubUrl: e.target.value })}
                          className="bg-neutral-950 border-white/5"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs text-neutral-400">Live Demo Link</label>
                        <Input
                          placeholder="https://..."
                          value={projectForm.liveUrl}
                          onChange={(e) => setProjectForm({ ...projectForm, liveUrl: e.target.value })}
                          className="bg-neutral-950 border-white/5"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-xs text-neutral-400">Image URL</label>
                        <Input
                          placeholder="https://images.unsplash.com/..."
                          value={projectForm.image}
                          onChange={(e) => setProjectForm({ ...projectForm, image: e.target.value })}
                          className="bg-neutral-950 border-white/5"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs text-neutral-400">Tags (comma separated) *</label>
                        <Input
                          placeholder="Next.js, TypeScript, Tailwind"
                          value={projectForm.tags}
                          onChange={(e) => setProjectForm({ ...projectForm, tags: e.target.value })}
                          className="bg-neutral-950 border-white/5"
                        />
                      </div>
                    </div>
                    <div className="flex items-center gap-2 pt-2">
                      <input
                        type="checkbox"
                        id="featured"
                        checked={projectForm.featured}
                        onChange={(e) => setProjectForm({ ...projectForm, featured: e.target.checked })}
                        className="rounded border-white/10 bg-neutral-950 accent-neutral-400 w-4 h-4"
                      />
                      <label htmlFor="featured" className="text-xs text-neutral-300">Feature this project on top</label>
                    </div>
                    <DialogFooter className="pt-4 border-t border-white/5 mt-4">
                      <Button
                        type="submit"
                        className="bg-white text-black hover:bg-neutral-200"
                        disabled={loading === 'project'}
                      >
                        {loading === 'project' ? <Loader2 className="w-4 h-4 animate-spin" /> : editingProject ? 'Save Changes' : 'Create Project'}
                      </Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            )}

            {activeTab === 'skills' && (
              <Dialog open={skillDialogOpen} onOpenChange={(open) => {
                setSkillDialogOpen(open);
                if (!open) resetSkillForm();
              }}>
                <DialogTrigger render={
                  <Button className="bg-white text-black hover:bg-neutral-200 rounded-full">
                    <Plus className="w-4 h-4 mr-1.5" /> Add Skill
                  </Button>
                } />
                <DialogContent className="max-w-2xl bg-neutral-900 border-white/5 text-neutral-100 rounded-2xl">
                  <DialogHeader>
                    <DialogTitle>{editingSkill ? 'Edit Skill' : 'Add New Skill'}</DialogTitle>
                    <DialogDescription className="text-neutral-400">
                      Provide details about your experience level with this technology.
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleSkillSubmit} className="space-y-4 pt-2">
                    <div className="space-y-1">
                      <label className="text-xs text-neutral-400">Skill Name *</label>
                      <Input
                        placeholder="React, Docker, Node.js..."
                        value={skillForm.name}
                        onChange={(e) => setSkillForm({ ...skillForm, name: e.target.value })}
                        className="bg-neutral-950 border-white/5"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs text-neutral-400">Category *</label>
                      <Select
                        value={skillForm.category}
                        onValueChange={(val) => setSkillForm({ ...skillForm, category: val || 'Frontend' })}
                      >
                        <SelectTrigger className="bg-neutral-950 border-white/5">
                          <SelectValue placeholder="Select Category" />
                        </SelectTrigger>
                        <SelectContent className="bg-neutral-900 border-white/10 text-neutral-100">
                          <SelectItem value="Frontend">Frontend</SelectItem>
                          <SelectItem value="Backend">Backend</SelectItem>
                          <SelectItem value="Tools & DevOps">Tools & DevOps</SelectItem>
                          <SelectItem value="Soft Skills">Soft Skills</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-xs text-neutral-400">Proficiency Level (0-100) *</label>
                        <Input
                          type="number"
                          min="0"
                          max="100"
                          value={skillForm.level}
                          onChange={(e) => setSkillForm({ ...skillForm, level: e.target.value })}
                          className="bg-neutral-950 border-white/5"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs text-neutral-400">Display Order</label>
                        <Input
                          type="number"
                          value={skillForm.order}
                          onChange={(e) => setSkillForm({ ...skillForm, order: e.target.value })}
                          className="bg-neutral-950 border-white/5"
                        />
                      </div>
                    </div>
                    <DialogFooter className="pt-4 border-t border-white/5 mt-4">
                      <Button
                        type="submit"
                        className="bg-white text-black hover:bg-neutral-200 w-full"
                        disabled={loading === 'skill'}
                      >
                        {loading === 'skill' ? <Loader2 className="w-4 h-4 animate-spin" /> : editingSkill ? 'Save Changes' : 'Create Skill'}
                      </Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            )}

            {activeTab === 'achievements' && (
              <Dialog open={achievementDialogOpen} onOpenChange={(open) => {
                setAchievementDialogOpen(open);
                if (!open) resetAchievementForm();
              }}>
                <DialogTrigger render={
                  <Button className="bg-white text-black hover:bg-neutral-200 rounded-full">
                    <Plus className="w-4 h-4 mr-1.5" /> Add Milestone
                  </Button>
                } />
                <DialogContent className="max-w-2xl bg-neutral-900 border-white/5 text-neutral-100 rounded-2xl">
                  <DialogHeader>
                    <DialogTitle>{editingAchievement ? 'Edit Milestone' : 'Add New Milestone'}</DialogTitle>
                    <DialogDescription className="text-neutral-400">
                      Add a job description, academic achievement, or professional milestone.
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleAchievementSubmit} className="space-y-4 pt-2">
                    <div className="space-y-1">
                      <label className="text-xs text-neutral-400">Milestone Title *</label>
                      <Input
                        placeholder="e.g. Lead Engineer at Acme"
                        value={achievementForm.title}
                        onChange={(e) => setAchievementForm({ ...achievementForm, title: e.target.value })}
                        className="bg-neutral-950 border-white/5"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-xs text-neutral-400">Date Range *</label>
                        <Input
                          placeholder="e.g. June 2024 - Present"
                          value={achievementForm.date}
                          onChange={(e) => setAchievementForm({ ...achievementForm, date: e.target.value })}
                          className="bg-neutral-950 border-white/5"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs text-neutral-400">Display Order</label>
                        <Input
                          type="number"
                          value={achievementForm.order}
                          onChange={(e) => setAchievementForm({ ...achievementForm, order: e.target.value })}
                          className="bg-neutral-950 border-white/5"
                        />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs text-neutral-400">Milestone Link (Optional)</label>
                      <Input
                        placeholder="https://..."
                        value={achievementForm.link}
                        onChange={(e) => setAchievementForm({ ...achievementForm, link: e.target.value })}
                        className="bg-neutral-950 border-white/5"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs text-neutral-400">Description (Optional)</label>
                      <Textarea
                        placeholder="Details about what you achieved..."
                        value={achievementForm.description}
                        onChange={(e) => setAchievementForm({ ...achievementForm, description: e.target.value })}
                        className="bg-neutral-950 border-white/5 min-h-[80px]"
                      />
                    </div>
                    <DialogFooter className="pt-4 border-t border-white/5 mt-4">
                      <Button
                        type="submit"
                        className="bg-white text-black hover:bg-neutral-200 w-full"
                        disabled={loading === 'achievement'}
                      >
                        {loading === 'achievement' ? <Loader2 className="w-4 h-4 animate-spin" /> : editingAchievement ? 'Save Changes' : 'Create Milestone'}
                      </Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            )}
          </div>

          {/* TAB CONTENT: PROJECTS */}
          <TabsContent value="projects">
            <Card className="rounded-2xl border border-white/5 bg-neutral-900/30 backdrop-blur-md shadow-lg overflow-hidden">
              <CardHeader>
                <CardTitle className="text-xl">Manage Projects</CardTitle>
                <CardDescription className="text-neutral-400">Create, edit, or remove projects. Display order determines their position on the home page.</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                {initialProjects.length === 0 ? (
                  <div className="py-12 text-center text-neutral-500 font-light border-t border-white/5">
                    No projects found. Click &quot;Add Project&quot; to create one.
                  </div>
                ) : (
                  <Table>
                    <TableHeader className="bg-white/5 border-b border-white/5">
                      <TableRow className="border-b border-white/5 hover:bg-transparent">
                        <TableHead className="text-neutral-400 font-medium">Order</TableHead>
                        <TableHead className="text-neutral-400 font-medium">Title</TableHead>
                        <TableHead className="text-neutral-400 font-medium">Tags</TableHead>
                        <TableHead className="text-neutral-400 font-medium">Featured</TableHead>
                        <TableHead className="text-neutral-400 font-medium text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {initialProjects.map((project) => (
                        <TableRow key={project.id} className="border-b border-white/5 hover:bg-white/5">
                          <TableCell className="font-light">{project.order}</TableCell>
                          <TableCell className="font-medium">
                            <span className="block">{project.title}</span>
                            <span className="text-xs text-neutral-500 font-light line-clamp-1">{project.description}</span>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-wrap gap-1">
                              {project.tags.split(',').slice(0, 3).map((tag: string) => (
                                <Badge key={tag} variant="secondary" className="bg-neutral-800 text-neutral-300 text-[10px] py-0 px-1.5 font-normal rounded-sm">
                                  {tag.trim()}
                                </Badge>
                              ))}
                              {project.tags.split(',').length > 3 && (
                                <span className="text-[10px] text-neutral-500 font-light">+ {project.tags.split(',').length - 3}</span>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            {project.featured ? (
                              <Badge className="bg-white/10 text-neutral-200 border border-white/20 text-[10px] font-normal">Yes</Badge>
                            ) : (
                              <span className="text-xs text-neutral-500 font-light">No</span>
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-8 w-8 text-neutral-400 hover:text-neutral-200"
                                onClick={() => openEditProject(project)}
                              >
                                <Pencil className="w-3.5 h-3.5" />
                              </Button>
                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-8 w-8 text-neutral-500 hover:text-neutral-300 hover:bg-neutral-800"
                                onClick={() => handleProjectDelete(project.id)}
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* TAB CONTENT: SKILLS */}
          <TabsContent value="skills">
            <Card className="rounded-2xl border border-white/5 bg-neutral-900/30 backdrop-blur-md shadow-lg overflow-hidden">
              <CardHeader>
                <CardTitle className="text-xl">Manage Skills</CardTitle>
                <CardDescription className="text-neutral-400">Configure your technology stack, categorization, and competence metrics.</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                {initialSkills.length === 0 ? (
                  <div className="py-12 text-center text-neutral-500 font-light border-t border-white/5">
                    No skills found. Click &quot;Add Skill&quot; to create one.
                  </div>
                ) : (
                  <Table>
                    <TableHeader className="bg-white/5 border-b border-white/5">
                      <TableRow className="border-b border-white/5 hover:bg-transparent">
                        <TableHead className="text-neutral-400 font-medium">Order</TableHead>
                        <TableHead className="text-neutral-400 font-medium">Name</TableHead>
                        <TableHead className="text-neutral-400 font-medium">Category</TableHead>
                        <TableHead className="text-neutral-400 font-medium">Proficiency</TableHead>
                        <TableHead className="text-neutral-400 font-medium text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {initialSkills.map((skill) => (
                        <TableRow key={skill.id} className="border-b border-white/5 hover:bg-white/5">
                          <TableCell className="font-light">{skill.order}</TableCell>
                          <TableCell className="font-medium">{skill.name}</TableCell>
                          <TableCell>
                            <Badge className="bg-neutral-800 text-neutral-300 border border-neutral-700 text-[10px] font-normal">
                              {skill.category}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2 max-w-[150px]">
                              <div className="h-1.5 w-full bg-neutral-800 rounded-full overflow-hidden">
                                <div className="h-full bg-white rounded-full" style={{ width: `${skill.level}%` }} />
                              </div>
                              <span className="text-xs text-neutral-400">{skill.level}%</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-8 w-8 text-neutral-400 hover:text-neutral-200"
                                onClick={() => openEditSkill(skill)}
                              >
                                <Pencil className="w-3.5 h-3.5" />
                              </Button>
                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-8 w-8 text-neutral-500 hover:text-neutral-300 hover:bg-neutral-800"
                                onClick={() => handleSkillDelete(skill.id)}
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* TAB CONTENT: TIMELINE/ACHIEVEMENTS */}
          <TabsContent value="achievements">
            <Card className="rounded-2xl border border-white/5 bg-neutral-900/30 backdrop-blur-md shadow-lg overflow-hidden">
              <CardHeader>
                <CardTitle className="text-xl">Manage Experience & Achievements</CardTitle>
                <CardDescription className="text-neutral-400">Map out your professional timeline, academic background, and relevant accolades.</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                {initialAchievements.length === 0 ? (
                  <div className="py-12 text-center text-neutral-500 font-light border-t border-white/5">
                    No achievements/milestones found. Click &quot;Add Milestone&quot; to create one.
                  </div>
                ) : (
                  <Table>
                    <TableHeader className="bg-white/5 border-b border-white/5">
                      <TableRow className="border-b border-white/5 hover:bg-transparent">
                        <TableHead className="text-neutral-400 font-medium">Order</TableHead>
                        <TableHead className="text-neutral-400 font-medium">Title</TableHead>
                        <TableHead className="text-neutral-400 font-medium">Date Range</TableHead>
                        <TableHead className="text-neutral-400 font-medium">Link</TableHead>
                        <TableHead className="text-neutral-400 font-medium text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {initialAchievements.map((achievement) => (
                        <TableRow key={achievement.id} className="border-b border-white/5 hover:bg-white/5">
                          <TableCell className="font-light">{achievement.order}</TableCell>
                          <TableCell className="font-medium">
                            <span className="block">{achievement.title}</span>
                            {achievement.description && (
                              <span className="text-xs text-neutral-500 font-light line-clamp-1 max-w-sm">{achievement.description}</span>
                            )}
                          </TableCell>
                          <TableCell className="text-xs font-light text-neutral-300">{achievement.date}</TableCell>
                          <TableCell>
                            {achievement.link ? (
                              <a href={achievement.link} target="_blank" rel="noopener noreferrer" className="text-neutral-300 hover:text-white flex items-center gap-1 text-xs">
                                URL <ExternalLink className="w-3 h-3" />
                              </a>
                            ) : (
                              <span className="text-xs text-neutral-500 font-light">-</span>
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-8 w-8 text-neutral-400 hover:text-neutral-200"
                                onClick={() => openEditAchievement(achievement)}
                              >
                                <Pencil className="w-3.5 h-3.5" />
                              </Button>
                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-8 w-8 text-neutral-500 hover:text-neutral-300 hover:bg-neutral-800"
                                onClick={() => handleAchievementDelete(achievement.id)}
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
