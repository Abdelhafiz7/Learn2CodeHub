import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Save,
  Globe,
  Trash2,
  ArrowLeft,
  BookOpen,
  Star,
} from 'lucide-react';

import {
  Button,
  Input,
  Select,
  Textarea,
  Badge,
  LoadingSpinner,
  Modal,
} from '@/components/ui';

import { coursesApi } from '@/api';
import { useApi } from '@/hooks';
import { getErrorMessage } from '@/utils';
import type { CourseDetail, Category, CourseLevel } from '@/types';
import toast from 'react-hot-toast';

const levelOptions = [
  { value: 'Beginner', label: 'Beginner' },
  { value: 'Intermediate', label: 'Intermediate' },
  { value: 'Advanced', label: 'Advanced' },
];

const statusVariant = {
  Published: 'success' as const,
  Draft: 'default' as const,
  Archived: 'warning' as const,
};

export const ManageCoursePage: React.FC = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();

  const [isSaving, setIsSaving] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const [categories, setCategories] = useState<Category[]>([]);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    shortDescription: '',
    price: 0,
    level: 'Beginner' as CourseLevel,
    categoryId: '',
    thumbnailUrl: '',
  });

  const { data: course, isLoading, refetch } = useApi<CourseDetail>(
    () => coursesApi.getCourseById(courseId!),
    [courseId]
  );

  const status = course?.isPublished ? 'Published' : (course?.status ?? 'Draft');

  useEffect(() => {
    coursesApi
      .getCategories()
      .then((res) => {
        if (Array.isArray(res)) {
          setCategories(res);
        } else {
          setCategories(res.items ?? []);
        }
      })
      .catch(() => setCategories([]));
  }, []);

  useEffect(() => {
    if (course) {
      setFormData({
        title: course.title,
        description: course.description,
        shortDescription: course.shortDescription,
        price: course.price,
        level: course.level,
        categoryId: String(course.category?.id ?? ''),
        thumbnailUrl: course.thumbnailUrl ?? '',
      });
    }
  }, [course]);

  const isDirty =
    course &&
    (
      formData.title !== course.title ||
      formData.description !== course.description ||
      formData.shortDescription !== course.shortDescription ||
      formData.price !== course.price ||
      formData.level !== course.level ||
      formData.categoryId !== String(course.category?.id ?? '') ||
      formData.thumbnailUrl !== (course.thumbnailUrl ?? '')
    );

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    setFormData(prev => ({
      ...prev,
      [name]:
        name === 'price'
          ? parseFloat(value) || 0
          : value,
    }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!courseId) return;

    if (!formData.categoryId && !course?.category?.id) {
      toast.error('Please select a category');
      return;
    }

    setIsSaving(true);

    try {
      const payload = {
        title: formData.title,
        description: formData.description,
        shortDescription: formData.shortDescription,
        price: formData.price,
        level: formData.level,
        thumbnailUrl: formData.thumbnailUrl,
        categoryId: Number(formData.categoryId || course?.category?.id),
      };

      await coursesApi.updateCourse(courseId, payload);

      toast.success('Course updated successfully!');
      navigate('/instructor/courses');
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setIsSaving(false);
    }
  };

  const handlePublish = async () => {
    if (!courseId) return;

    setIsPublishing(true);

    try {
      await coursesApi.publishCourse(Number(courseId));
      toast.success(status === 'Published' ? 'Course unpublished successfully!' : 'Course published successfully!');
      refetch();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setIsPublishing(false);
    }
  };

  const handleDelete = async () => {
    if (!courseId) return;

    setIsDeleting(true);

    try {
      await coursesApi.deleteCourse(courseId);
      toast.success('Course deleted');
      navigate('/instructor/courses');
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setIsDeleting(false);
      setShowDeleteModal(false);
    }
  };

  if (isLoading) return <LoadingSpinner fullPage text="Loading course..." />;

  if (!course)
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <BookOpen className="mb-3 h-12 w-12 text-gray-300" />
        <p className="text-gray-500">Course not found</p>
        <Link to="/instructor/courses" className="mt-2 text-sm text-indigo-600">
          Back to courses
        </Link>
      </div>
    );

  const categoryOptions = categories.map((c) => ({
    value: String(c.id),
    label: c.name,
  }));

  return (
    <div className="flex flex-col gap-8 w-full p-4 md:p-6 lg:p-8">

      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white dark:bg-[#1C1F26] p-6 rounded-[2rem] border border-gray-200 dark:border-gray-800 shadow-sm">
        <div className="flex items-center gap-5">
          <div className="w-14 h-14 rounded-2xl bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0 shadow-sm">
            <BookOpen className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white tracking-tight">
                Edit Course
              </h1>
              <Badge variant={statusVariant[status]} className="shadow-sm">
                {status}
              </Badge>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {course.enrollmentCount} students enrolled • Make changes to your content below
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <Link to="/instructor/courses">
            <button type="button" className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 dark:text-gray-300 dark:bg-gray-800 dark:hover:bg-gray-700 transition-colors">
              <ArrowLeft className="w-4 h-4" /> Back
            </button>
          </Link>
          <button
            type="button"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-500/20 transition-transform hover:scale-105 active:scale-95"
            onClick={() => navigate(`/instructor/courses/${courseId}/content`)}
          >
            Course Content
          </button>
          <button
            type="button"
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors ${status === 'Published'
                ? 'text-amber-700 bg-amber-100 hover:bg-amber-200 dark:text-amber-300 dark:bg-amber-500/20 dark:hover:bg-amber-500/30'
                : 'text-emerald-700 bg-emerald-100 hover:bg-emerald-200 dark:text-emerald-300 dark:bg-emerald-500/20 dark:hover:bg-emerald-500/30'
              }`}
            onClick={handlePublish}
            disabled={isPublishing}
          >
            {isPublishing ? <LoadingSpinner size="sm" /> : <Globe className="w-4 h-4" />}
            {status === 'Published' ? 'Unpublish' : 'Publish'}
          </button>
          <button
            type="button"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-red-700 bg-red-100 hover:bg-red-200 dark:text-red-300 dark:bg-red-500/20 dark:hover:bg-red-500/30 transition-colors"
            onClick={() => setShowDeleteModal(true)}
          >
            <Trash2 className="w-4 h-4" /> Delete
          </button>
        </div>
      </div>

      {/* FORM */}
      <form onSubmit={handleSave} className="grid lg:grid-cols-3 gap-6 md:gap-8">

        {/* MAIN COL */}
        <div className="lg:col-span-2 flex flex-col gap-6 md:gap-8">

          {/* Basic Information */}
          <div className="bg-white dark:bg-[#1C1F26] p-6 lg:p-8 rounded-[2rem] border border-gray-200 dark:border-gray-800 shadow-sm">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Basic Information</h2>

            <div className="flex flex-col gap-5">
              <Input label="Title" name="title" value={formData.title} onChange={handleChange} />
              <Textarea label="Short Description" name="shortDescription" value={formData.shortDescription} onChange={handleChange} rows={3} />
              <Textarea label="Description" name="description" value={formData.description} onChange={handleChange} rows={8} />
            </div>
          </div>

          {/* Course Settings */}
          <div className="bg-white dark:bg-[#1C1F26] p-6 lg:p-8 rounded-[2rem] border border-gray-200 dark:border-gray-800 shadow-sm">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Course Settings</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* CATEGORY */}
              <Select
                label="Category"
                name="categoryId"
                value={formData.categoryId || ""}
                onChange={(e) => setFormData(prev => ({ ...prev, categoryId: e.target.value }))}
                options={categoryOptions}
              />

              {/* LEVEL */}
              <Select
                label="Difficulty Level"
                name="level"
                value={formData.level}
                onChange={(e) => setFormData(prev => ({ ...prev, level: e.target.value as CourseLevel }))}
                options={levelOptions}
              />

              {/* PRICE */}
              <Input
                label="Price (USD)"
                name="price"
                type="number"
                min="0"
                step="0.01"
                value={formData.price}
                onChange={handleChange}
                placeholder="e.g. 49.99"
                required
              />

              {/* THUMBNAIL */}
              <Input
                label="Thumbnail URL"
                name="thumbnailUrl"
                value={formData.thumbnailUrl}
                onChange={handleChange}
                placeholder="https://example.com/image.jpg"
              />
            </div>

            {formData.thumbnailUrl && (
              <div className="mt-6">
                <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Thumbnail Preview</p>
                <div className="relative rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-700 shadow-sm bg-gray-50 dark:bg-gray-900">
                  <img
                    src={formData.thumbnailUrl}
                    alt="Thumbnail"
                    className="w-full h-56 object-cover"
                  />
                  <div className="absolute inset-0 ring-1 ring-inset ring-black/10 rounded-2xl"></div>
                </div>
              </div>
            )}
          </div>

        </div>

        {/* SIDEBAR COL */}
        <div className="flex flex-col gap-6 md:gap-8">

          {/* Stats */}
          <div className="bg-white dark:bg-[#1C1F26] p-6 rounded-[2rem] border border-gray-200 dark:border-gray-800 shadow-sm flex flex-col gap-6">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Quick Stats</h3>

            <div className="flex flex-col gap-4 text-sm font-medium">
              <div className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50">
                <span className="text-gray-500 dark:text-gray-400">Status</span>
                <Badge variant={statusVariant[status]} className="shadow-sm">{status}</Badge>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50">
                <span className="text-gray-500 dark:text-gray-400">Students</span>
                <span className="text-gray-900 dark:text-white font-bold">{course.enrollmentCount}</span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50">
                <span className="text-gray-500 dark:text-gray-400">Rating</span>
                <div className="flex items-center gap-1.5 text-gray-900 dark:text-white font-bold">
                  <Star className="w-4 h-4 text-amber-500 fill-current" />
                  {course.rating ? course.rating.toFixed(1) : '0.0'}
                </div>
              </div>
            </div>
          </div>

          {/* Save Button Container */}
          <div className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-500/10 dark:to-purple-500/10 p-6 rounded-[2rem] border border-indigo-100 dark:border-indigo-500/20 shadow-sm text-center flex flex-col gap-4">
            <div className="w-12 h-12 bg-white dark:bg-indigo-500/20 rounded-full flex items-center justify-center mx-auto shadow-sm text-indigo-600 dark:text-indigo-400">
              <Save className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">Save Changes</h3>
              <p className="text-xs text-gray-500 dark:text-indigo-200/60 leading-relaxed mb-4">Don't forget to save your progress before leaving this page.</p>
            </div>

            <button
              type="submit"
              disabled={!isDirty || isSaving}
              className="flex items-center justify-center gap-2 w-full py-3.5 px-4 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 dark:disabled:bg-gray-700 text-white font-semibold rounded-xl shadow-lg shadow-indigo-500/30 transition-all active:scale-95 disabled:active:scale-100"
            >
              {isSaving ? <LoadingSpinner size="sm" /> : <Save className="w-4 h-4" />}
              Save Course
            </button>
          </div>

        </div>

      </form>

      {/* DELETE MODAL */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete Course"
        footer={
          <>
            <Button variant="outline" onClick={() => setShowDeleteModal(false)}>Cancel</Button>
            <Button variant="danger" isLoading={isDeleting} onClick={handleDelete}>
              Delete
            </Button>
          </>
        }
      >
        <p>Are you sure you want to delete "{course.title}"?</p>
      </Modal>

    </div>
  );
};