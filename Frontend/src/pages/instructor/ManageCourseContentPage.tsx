import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { sectionsApi, lessonsApi } from '@/api';
import { Button, Card, Input, LoadingSpinner } from '@/components/ui';
import toast from 'react-hot-toast';
import { uploadToCloudinary } from '@/api/cloudinary';
import { FileUp, XCircle, FileVideo, Music, FileText, PlayCircle, PlusCircle, ChevronDown, ChevronUp, Layers, GripVertical } from 'lucide-react';

const formatSize = (bytes: number) => {
  if (!bytes) return '0 MB';
  const mb = bytes / (1024 * 1024);
  return mb.toFixed(1) + ' mb';
};

import { DndContext, closestCenter } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';

export const ManageCourseContentPage = () => {
  const { courseId } = useParams();

  const [sections, setSections] = useState<any[]>([]);
  const [newSectionTitle, setNewSectionTitle] = useState('');
  const [loading, setLoading] = useState(true);
  const [openPreview, setOpenPreview] = useState<number | null>(null);
  const [uploadProgress] = useState<Record<number, number>>({});
  const [uploads, setUploads] = useState<Record<number, {
    fileName: string;
    progress: number; url?: string; size?: number; fileType?: string
  }[]>>({});
  const [uploading] = useState<Record<number, boolean>>({});
  const [editingLessonId, setEditingLessonId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState({ title: '', videoUrl: '', fileUrl: '', duration: 0, content: '', isPreview: false });
  const [isSavingEdit, setIsSavingEdit] = useState(false);
  const [editingSectionId, setEditingSectionId] = useState<number | null>(null);
  const [editSectionTitle, setEditSectionTitle] = useState('');
  const [isSavingSection, setIsSavingSection] = useState(false);
  const [previewType, setPreviewType] = useState<'video' | 'pdf'>('video');
  const [expandedSections, setExpandedSections] = useState<Set<number>>(new Set());

  const toggleSection = (sectionId: number) => {
    setExpandedSections(prev => {
      const next = new Set(prev);
      if (next.has(sectionId)) next.delete(sectionId);
      else next.add(sectionId);
      return next;
    });
  };

  const [lessonForms, setLessonForms] = useState<
    Record<number, {
      title: string;
      videoUrl: string;
      fileUrl: string;
      duration: number;
      isPreview: boolean;
      content?: string;
    }>
  >({});

  // LOAD
  const loadSections = async () => {
    try {
      setLoading(true);
      const res = await sectionsApi.getByCourse(courseId!);
      setSections(res.data);
    } catch {
      toast.error('Failed to load sections');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSections();
  }, []);

  // DELETE 
  const deleteLesson = async (lessonId: number) => {
    try {
      await lessonsApi.delete(lessonId);
      toast.success('Lesson deleted');
      loadSections();
    } catch {
      toast.error('Failed to delete');
    }
  };

  // DRAG 
  const handleDragEnd = async (event: any) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = sections.findIndex(s => s.id === active.id);
    const newIndex = sections.findIndex(s => s.id === over.id);

    const updated = [...sections];
    const [moved] = updated.splice(oldIndex, 1);
    updated.splice(newIndex, 0, moved);

    setSections(updated);

    try {
      await sectionsApi.reorder(
        updated.map((s, index) => ({
          id: s.id,
          order: index + 1,
        }))
      );
    } catch {
      toast.error('Failed to save order');
    }
  };

  //  UPLOAD 
  const handleUpload = async (
    file: File,
    sectionId: number,
    type: 'video' | 'file'
  ) => {

    setUploads(prev => ({
      ...prev,
      [sectionId]: [
        ...(prev[sectionId] || []),
        { fileName: file.name, progress: 0, size: file.size, fileType: file.type }
      ]
    }));

    const fileIndex = (uploads[sectionId]?.length || 0);

    try {
      const url = await uploadToCloudinary(file, (progress) => {
        setUploads(prev => {
          const updated = [...(prev[sectionId] || [])];
          updated[fileIndex] = {
            ...updated[fileIndex],
            progress
          };
          return { ...prev, [sectionId]: updated };
        });
      });

      // save to lesson form
      setLessonForms(prev => ({
        ...prev,
        [sectionId]: {
          ...prev[sectionId],
          [type === 'video' ? 'videoUrl' : 'fileUrl']: url,
        },
      }));

    } catch {
      toast.error('Upload failed');
    }
  };

  // CREATE SECTION
  const addSection = async () => {
    if (!newSectionTitle.trim()) {
      toast.error('Section title required');
      return;
    }

    try {
      await sectionsApi.create({
        title: newSectionTitle,
        courseId: Number(courseId),
        order: sections.length + 1,
      });

      setNewSectionTitle('');
      toast.success('Section added');
      loadSections();
    } catch {
      toast.error('Failed to add section');
    }
  };

  // UPDATE SECTION
  const saveSectionEdit = async (sectionId: number) => {
    if (!editSectionTitle.trim()) {
      toast.error('Section title required');
      return;
    }

    try {
      setIsSavingSection(true);
      await sectionsApi.update(sectionId, {
        title: editSectionTitle,
        courseId: Number(courseId)
      });
      toast.success('Section updated');
      setEditingSectionId(null);
      loadSections();
    } catch {
      toast.error('Failed to update section');
    } finally {
      setIsSavingSection(false);
    }
  };

  // DELETE SECTION
  const deleteSection = async (sectionId: number) => {
    if (!window.confirm("Are you sure you want to delete this section? All lessons inside it will be deleted.")) return;
    try {
      await sectionsApi.delete(sectionId);
      toast.success('Section deleted');
      loadSections();
    } catch {
      toast.error('Failed to delete section');
    }
  };

  // CREATE LESSON
  const addLesson = async (sectionId: number) => {
    const form = lessonForms[sectionId];

    if (!form?.title) {
      toast.error('Lesson title required');
      return;
    }

    if (!form?.duration || form.duration <= 0) {
      toast.error('Duration is required');
      return;
    }

    const section = sections.find(s => s.id === sectionId);

    try {
      await lessonsApi.create({
        title: form.title,

        content: form.content?.trim() ? form.content : null,

        videoUrl: form.videoUrl?.trim() ? form.videoUrl : null,
        fileUrl: form.fileUrl?.trim() ? form.fileUrl : null,

        durationInMinutes: form.duration || 0,
        isPreview: form.isPreview || false,
        sectionId,
        order: (section?.lessons?.length || 0) + 1,
      });

      toast.success('Lesson added');

      setLessonForms(prev => ({
        ...prev,
        [sectionId]: {
          title: '',
          content: '',
          videoUrl: '',
          fileUrl: '',
          duration: 0,
          isPreview: false,
        },
      }));

      setUploads(prev => ({
        ...prev,
        [sectionId]: []
      }));

      loadSections();
    } catch {
      toast.error('Failed to add lesson');
    }
  };

  // UPDATE LESSON
  const saveLessonEdit = async (lessonId: number) => {
    if (!editForm.title.trim()) {
      toast.error('Lesson title required');
      return;
    }

    try {
      setIsSavingEdit(true);
      await lessonsApi.update(lessonId, {
        title: editForm.title,
        content: editForm.content?.trim() ? editForm.content : null,
        videoUrl: editForm.videoUrl,
        fileUrl: editForm.fileUrl,
        durationInMinutes: editForm.duration,
        isPreview: editForm.isPreview,
      });
      toast.success('Lesson updated');
      setEditingLessonId(null);
      loadSections();
    } catch {
      toast.error('Failed to update lesson');
    } finally {
      setIsSavingEdit(false);
    }
  };

  if (loading) return <LoadingSpinner fullPage text="Loading content..." />;

  // UI
  return (
    <div className="p-6 lg:p-10 w-full flex flex-col gap-8">

      {/* HEADER */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-indigo-900 to-[#0A0C10] border border-indigo-500/20 p-8 shadow-2xl">
        <div className="relative z-10">
          <div className="w-14 h-14 rounded-2xl bg-indigo-500/20 flex items-center justify-center mb-6 border border-indigo-500/30">
            <Layers className="w-7 h-7 text-indigo-400" />
          </div>
          <h1 className="text-3xl lg:text-4xl font-black text-white tracking-tight">Manage Course Content</h1>
          <p className="text-indigo-200 font-medium mt-2 max-w-xl">
            Desgin Your Sections and Lessons
          </p>
        </div>
        {/* Decorative elements */}
        <div className="absolute right-0 top-0 w-96 h-96 bg-indigo-500/10 blur-[100px] rounded-full translate-x-1/3 -translate-y-1/3" />
      </div>

      {/* ADD SECTION */}
      <div className="relative group">
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-2xl blur opacity-20 group-hover:opacity-40 transition-opacity duration-500" />
        <Card className="relative p-6 lg:p-8 rounded-2xl border border-gray-800 bg-[#13151A] flex flex-col md:flex-row md:items-center gap-6 shadow-xl">
          <div className="flex-1">
            <h3 className="text-xl font-bold text-white flex items-center gap-3">
              <PlusCircle className="w-6 h-6 text-indigo-500" />
              Build New Section
            </h3>
            <p className="text-sm text-gray-400 mt-2">Group your lessons into logical modules or chapters.</p>
          </div>
          <div className="flex w-full md:w-[400px] gap-3">
            <Input
              placeholder="e.g. Module 1: The Basics"
              value={newSectionTitle}
              onChange={(e) => setNewSectionTitle(e.target.value)}
              className="flex-1 bg-[#0A0C10] border-gray-800 text-white rounded-xl h-12 px-4 focus:ring-indigo-500 focus:border-indigo-500"
              onKeyDown={(e) => {
                if (e.key === 'Enter') addSection();
              }}
            />
            <Button
              onClick={addSection}
              className="bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-500/20 h-12 px-6 rounded-xl font-bold whitespace-nowrap transition-all"
            >
              Create
            </Button>
          </div>
        </Card>
      </div>

      {/* SECTIONS */}
      <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext
          items={sections.map(s => s.id)}
          strategy={verticalListSortingStrategy}
        >
          {sections.map((section) => {
            const isExpanded = expandedSections.has(section.id);

            return (
            <div key={section.id} className="p-0 rounded-3xl flex flex-col shadow-xl border border-gray-800/80 bg-[#13151A] overflow-hidden group/section">

              {/* SECTION HEADER */}
              {editingSectionId === section.id ? (
                <div className="flex gap-3 items-center w-full p-6 bg-[#0A0C10]">
                  <Input
                    value={editSectionTitle}
                    onChange={e => setEditSectionTitle(e.target.value)}
                    placeholder="Section Title"
                    className="flex-1 bg-[#13151A] border-gray-800 text-white"
                  />
                  <Button onClick={() => saveSectionEdit(section.id)} disabled={isSavingSection} className="bg-indigo-600 hover:bg-indigo-500">Save</Button>
                  <Button variant="ghost" onClick={() => setEditingSectionId(null)} disabled={isSavingSection}>Cancel</Button>
                </div>
              ) : (
                <div 
                  className={`flex flex-col md:flex-row justify-between md:items-center gap-4 p-6 cursor-pointer transition-all duration-300 relative ${isExpanded ? 'bg-[#1C1F26]' : 'hover:bg-[#1C1F26]'}`}
                  onClick={() => toggleSection(section.id)}
                >
                  {/* Left glowing border indicator */}
                  <div className={`absolute left-0 top-0 bottom-0 w-1 transition-colors duration-300 ${isExpanded ? 'bg-indigo-500' : 'bg-transparent group-hover/section:bg-gray-800'}`} />
                  
                  <div className="flex items-center gap-4 pl-2">
                    <div className="cursor-grab text-gray-600 hover:text-gray-400 p-1" onClick={e => e.stopPropagation()}>
                       <GripVertical className="w-5 h-5" />
                    </div>
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${isExpanded ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/30' : 'bg-[#0A0C10] text-gray-500 border border-gray-800 group-hover/section:border-indigo-500/50'}`}>
                      {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                    </div>
                    <div>
                      <h2 className={`text-xl font-black transition-colors ${isExpanded ? 'text-white' : 'text-gray-300 group-hover/section:text-white'}`}>{section.title}</h2>
                      <div className="flex items-center gap-3 mt-1.5">
                        <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest bg-[#0A0C10] px-2 py-0.5 rounded-md border border-gray-800">
                          {section.lessons?.length || 0} Lessons
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3" onClick={e => e.stopPropagation()}>
                    <Button size="sm" variant="ghost" className="text-gray-400 hover:text-white" onClick={() => {
                      setEditingSectionId(section.id);
                      setEditSectionTitle(section.title);
                    }}>Edit Title</Button>
                    <Button size="sm" variant="outline" className="border-red-500/20 text-red-400 hover:bg-red-500/10 hover:text-red-300 bg-[#0A0C10]" onClick={() => deleteSection(section.id)}>Delete</Button>
                  </div>
                </div>
              )}

              {/* ACCORDION BODY */}
              {isExpanded && (
                <div className="p-6 lg:p-8 border-t border-gray-800/50 bg-[#0A0C10] flex flex-col gap-6 animate-in fade-in slide-in-from-top-2 duration-300">
                  {/* LESSONS TIMELINE */}
                  <div className="relative flex flex-col gap-4 before:absolute before:inset-y-0 before:left-[21px] before:w-[2px] before:bg-gray-800/80 ml-2">
              {section.lessons?.map((lesson: any, lIdx: number) => (
                <div key={lesson.id} className="relative flex items-start gap-4 lg:gap-6">
                  {/* Timeline Node */}
                  <div className="w-11 h-11 rounded-full bg-[#13151A] border-[3px] border-[#0A0C10] shadow-sm flex items-center justify-center shrink-0 z-10 text-indigo-400 font-black text-sm relative mt-2">
                     {lIdx + 1}
                  </div>
                  
                  {/* Lesson Card */}
                  <div className="flex-1 p-5 rounded-2xl border border-gray-800/80 bg-[#13151A] flex flex-col gap-4 hover:border-gray-700 transition-colors">
                  {/* LESSON DISPLAY OR EDIT FORM */}
                  {editingLessonId === lesson.id ? (
                    <div className="flex flex-col gap-3">
                      <Input
                        value={editForm.title}
                        onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                        placeholder="Lesson title"
                      />

                      <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                           <FileText className="w-3 h-3" /> Edit Lesson Content
                        </label>
                        <textarea
                          value={editForm.content || ''}
                          onChange={(e) =>
                            setEditForm(prev => ({ ...prev, content: e.target.value }))
                          }
                          placeholder="Write your lesson notes, explanations, or code snippets here..."
                          className="w-full h-32 rounded-xl bg-[#1C1F26] border border-gray-700/50 p-4 text-sm text-gray-200 placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all resize-y custom-scrollbar"
                        />
                      </div>

                        <Input
                          type="number"
                          value={editForm.duration}
                          onChange={(e) =>
                            setEditForm(prev => ({
                              ...prev,
                              duration: Number(e.target.value),
                            }))
                          }
                          placeholder="Duration (minutes)"
                        />

                        <div className="flex items-center gap-3 p-4 rounded-xl bg-[#1C1F26] border border-gray-700/50 hover:border-indigo-500/50 transition-all cursor-pointer group/preview" onClick={() => setEditForm(prev => ({ ...prev, isPreview: !prev.isPreview }))}>
                          <div className={`w-10 h-6 rounded-full p-1 transition-colors duration-300 ${editForm.isPreview ? 'bg-indigo-600' : 'bg-gray-700'}`}>
                            <div className={`w-4 h-4 rounded-full bg-white transition-transform duration-300 ${editForm.isPreview ? 'translate-x-4' : 'translate-x-0'}`} />
                          </div>
                          <div className="flex flex-col">
                            <span className="text-sm font-bold text-gray-200">Free Preview</span>
                            <span className="text-[10px] text-gray-500 uppercase tracking-widest font-black">Allows students to view before buying</span>
                          </div>
                        </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-3 border border-gray-700 rounded-lg">
                          <p className="text-xs text-gray-400 mb-2">Replace Video</p>
                          <input type="file" accept="video/*" className="text-sm w-full text-gray-300" onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (!file) return;
                            const toastId = toast.loading('Uploading video...');
                            try {
                              const url = await uploadToCloudinary(file, () => { });
                              setEditForm(prev => ({ ...prev, videoUrl: url }));
                              toast.success('Video uploaded', { id: toastId });
                            } catch {
                              toast.error('Upload failed', { id: toastId });
                            }
                          }} />
                        </div>
                        <div className="p-3 border border-gray-700 rounded-lg">
                          <p className="text-xs text-gray-400 mb-2">Replace PDF</p>
                          <input type="file" accept="application/pdf" className="text-sm w-full text-gray-300" onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (!file) return;
                            const toastId = toast.loading('Uploading PDF...');
                            try {
                              const url = await uploadToCloudinary(file, () => { });
                              setEditForm(prev => ({ ...prev, fileUrl: url }));
                              toast.success('PDF uploaded', { id: toastId });
                            } catch {
                              toast.error('Upload failed', { id: toastId });
                            }
                          }} />
                        </div>
                      </div>

                      <div className="flex gap-2 justify-end mt-2">
                        <Button variant="ghost" onClick={() => setEditingLessonId(null)} disabled={isSavingEdit}>Cancel</Button>
                        <Button onClick={() => saveLessonEdit(lesson.id)} disabled={isSavingEdit}>
                          {isSavingEdit ? 'Saving...' : 'Save Changes'}
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-medium">{lesson.title}</p>
                        <p className="text-xs text-gray-400">
                          {lesson.durationInMinutes || lesson.duration || 0} min
                        </p>
                      </div>

                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() =>
                            setOpenPreview(openPreview === lesson.id ? null : lesson.id)
                          }
                        >
                          Preview
                        </Button>

                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setEditingLessonId(lesson.id);
                            setEditForm({
                              title: lesson.title,
                              content: lesson.content || '',
                              videoUrl: lesson.videoUrl || '',
                              fileUrl: lesson.fileUrl || '',
                              duration: lesson.durationInMinutes || 0,
                              isPreview: lesson.isPreview || false,
                            });
                            setOpenPreview(null);
                          }}
                        >
                          Edit
                        </Button>

                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => deleteLesson(lesson.id)}
                        >
                          Delete
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* PREVIEW */}
                  {openPreview === lesson.id && !editingLessonId && (
                    <div className="flex flex-col gap-3 mt-2">

                      {/* TABS */}
                      <div className="flex gap-2 border-b border-gray-700 pb-2">
                        {lesson.videoUrl && (
                          <button
                            onClick={() => setPreviewType('video')}
                            className={`text-sm px-3 py-1 rounded-md transition ${previewType === 'video'
                              ? 'bg-indigo-600 text-white'
                              : 'text-gray-400 hover:text-white'
                              }`}
                          >
                            <div className="flex items-center gap-2">
                              <FileVideo className="w-4 h-4" />
                              Video
                            </div>
                          </button>
                        )}

                        {lesson.fileUrl && (
                          <button
                            onClick={() => setPreviewType('pdf')}
                            className={`text-sm px-3 py-1 rounded-md transition ${previewType === 'pdf'
                              ? 'bg-indigo-600 text-white'
                              : 'text-gray-400 hover:text-white'
                              }`}
                          >
                            <div className="flex items-center gap-2">
                              <FileText className="w-4 h-4" />
                              PDF
                            </div>
                          </button>
                        )}
                      </div>

                      {/* CONTENT */}
                      {previewType === 'video' && lesson.videoUrl && (
                        <div className="w-full aspect-video">
                          <video
                            src={lesson.videoUrl}
                            controls
                            className="w-full h-full rounded-lg object-contain"
                          />
                        </div>
                      )}

                      {previewType === 'pdf' && lesson.fileUrl && (
                        <iframe
                          src={lesson.fileUrl}
                          className="w-full rounded-lg bg-white"
                          style={{ height: '65vh', minHeight: '500px' }}
                        />
                      )}

                    </div>
                  )}
                </div>
              </div>
            ))}
              </div>

              {/* ADD LESSON */}
              <div className="border-t border-gray-800/50 pt-6 flex flex-col gap-4 mt-2">

                <Input
                  placeholder="Lesson title..."
                  value={lessonForms[section.id]?.title || ''}
                  onChange={(e) =>
                    setLessonForms(prev => ({
                      ...prev,
                      [section.id]: {
                        ...prev[section.id],
                        title: e.target.value,
                      },
                    }))
                  }
                />

                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                     <FileText className="w-3 h-3" /> Lesson Content
                  </label>

                  <textarea
                    value={lessonForms[section.id]?.content || ""}
                    onChange={(e) =>
                      setLessonForms(prev => ({
                        ...prev,
                        [section.id]: { ...prev[section.id], content: e.target.value }
                      }))
                    }
                    placeholder="Write your lesson notes, explanations, or code snippets here..."
                    className="w-full h-32 rounded-xl bg-[#1C1F26] border border-gray-700/50 p-4 text-sm text-gray-200 placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all resize-y custom-scrollbar"
                  />
                </div>

                {/* DURATION & PREVIEW */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                  <div className="flex flex-col gap-1">
                    <label className="text-xs text-gray-400 font-bold uppercase tracking-wider">
                      Duration (minutes)
                    </label>
                    <Input
                      type="number"
                      min={1}
                      placeholder="e.g. 15"
                      value={lessonForms[section.id]?.duration || ''}
                      onChange={(e) =>
                        setLessonForms(prev => ({
                          ...prev,
                          [section.id]: {
                            ...prev[section.id],
                            duration: Number(e.target.value),
                          },
                        }))
                      }
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-xs text-gray-400 font-bold uppercase tracking-wider">
                      Access Type
                    </label>
                    <div 
                      className="flex h-[46px] items-center gap-3 px-4 rounded-xl bg-[#1C1F26] border border-gray-700/50 hover:border-indigo-500/50 transition-all cursor-pointer group/preview" 
                      onClick={() => 
                        setLessonForms(prev => ({
                          ...prev,
                          [section.id]: { ...prev[section.id], isPreview: !prev[section.id]?.isPreview }
                        }))
                      }
                    >
                      <div className={`w-10 h-6 rounded-full p-1 transition-colors duration-300 ${lessonForms[section.id]?.isPreview ? 'bg-emerald-600' : 'bg-gray-700'}`}>
                        <div className={`w-4 h-4 rounded-full bg-white transition-transform duration-300 ${lessonForms[section.id]?.isPreview ? 'translate-x-4' : 'translate-x-0'}`} />
                      </div>
                      <span className="text-sm font-bold text-gray-200">Free Preview</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-4 mt-2">
                  {/* Custom Upload Component */}
                  <div className="bg-[#1C1F26] rounded-xl p-5 border border-gray-800 shadow-sm">
                    <div className="mb-4">
                      <div className="flex items-center gap-2 mb-1">
                        <FileUp className="w-5 h-5 text-gray-300" />
                        <h3 className="text-lg font-medium text-white">Upload files</h3>
                      </div>
                      <p className="text-sm text-gray-400">
                        Attachments that have been uploaded as part of this project.
                      </p>
                    </div>

                    {/* Dropzone */}
                    <div className="border border-dashed border-indigo-500/40 rounded-xl p-8 flex flex-col items-center justify-center bg-indigo-500/5 relative hover:bg-indigo-500/10 transition-colors cursor-pointer mb-5">
                      <input
                        type="file"
                        accept="video/*,application/pdf"
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const type = file.type.startsWith('video/') ? 'video' : 'file';
                            handleUpload(file, section.id, type);
                          }
                        }}
                      />
                      <div className="w-12 h-14 bg-blue-600 rounded-lg flex items-center justify-center mb-3">
                        <FileUp className="w-6 h-6 text-white" />
                      </div>
                      <p className="text-white text-sm font-medium">
                        Drag & drop your files here or <span className="text-blue-400">choose files</span>
                      </p>
                      <p className="text-gray-500 text-xs mt-1">500 MB max file size.</p>
                    </div>

                    {/* Uploaded Files List */}
                    {uploads[section.id]?.length > 0 && (
                      <div className="flex flex-col gap-2">
                        <p className="text-sm font-medium text-white mb-2">Uploaded files</p>

                        {uploads[section.id].map((file, idx) => {
                          const isVideo = file.fileType?.startsWith('video/');
                          const isAudio = file.fileType?.startsWith('audio/');
                          const Icon = isVideo ? PlayCircle : isAudio ? Music : FileText;

                          return (
                            <div key={idx} className="flex items-center justify-between p-3 bg-[#13151A] rounded-lg border border-gray-800/60">
                              <div className="flex items-center gap-3 flex-1 overflow-hidden">
                                <div className="w-8 h-8 rounded-full bg-gray-800/80 flex items-center justify-center shrink-0">
                                  <Icon className="w-4 h-4 text-gray-400" />
                                </div>
                                <div className="flex flex-col flex-1 min-w-0 pr-4">
                                  <p className="text-sm text-gray-200 font-medium truncate">
                                    {file.fileName}
                                  </p>
                                  <div className="flex items-center gap-2 mt-1">
                                    <p className="text-xs text-gray-500">{formatSize(file.size || 0)}</p>
                                    {file.progress > 0 && file.progress < 100 && (
                                      <>
                                        <div className="flex-1 max-w-[120px] h-1 bg-gray-800 rounded-full overflow-hidden ml-2">
                                          <div className="h-full bg-blue-600" style={{ width: `${file.progress}%` }} />
                                        </div>
                                        <span className="text-xs text-gray-500">{file.progress}%</span>
                                      </>
                                    )}
                                  </div>
                                </div>
                              </div>
                              <button
                                className="text-gray-600 hover:text-gray-400 p-1 shrink-0 transition-colors"
                                onClick={() => {
                                  setUploads(prev => ({
                                    ...prev,
                                    [section.id]: prev[section.id].filter((_, i) => i !== idx)
                                  }));
                                }}
                              >
                                <XCircle className="w-5 h-5" />
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>

                <Button
                  onClick={() => addLesson(section.id)}
                  disabled={uploading[section.id]}
                >
                  {uploading[section.id]
                    ? `Uploading ${uploadProgress[section.id] || 0}%...`
                    : 'Add Lesson'}
                </Button>

              </div>

                </div>
              )}
            </div>
            );
          })}
        </SortableContext>
      </DndContext>
    </div>
  );
};