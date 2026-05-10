import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  BookOpen, 
  ChevronRight, 
  Check, 
  PlusCircle, 
  Layout, 
  DollarSign, 
  Type, 
  Image as ImageIcon,
  AlignLeft,
  Settings,
  Eye
} from 'lucide-react';
import { Button, Input, Select, Textarea } from '@/components/ui';
import { coursesApi } from '@/api';
import { getErrorMessage } from '@/utils';
import type { CreateCourseRequest, Category } from '@/types';
import toast from 'react-hot-toast';

const steps = [
  { id: 1, label: 'Basic Info', description: 'Title & Thumbnail', icon: Type },
  { id: 2, label: 'Details', description: 'Category & Description', icon: Layout },
  { id: 3, label: 'Pricing', description: 'Set your price', icon: DollarSign },
];

const levelOptions = [
  { value: 'Beginner', label: 'Beginner' },
  { value: 'Intermediate', label: 'Intermediate' },
  { value: 'Advanced', label: 'Advanced' },
];

export const CreateCoursePage: React.FC = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);

  const [formData, setFormData] = useState<CreateCourseRequest>({
    title: '',
    description: '',
    shortDescription: '',
    price: 0,
    level: 'Beginner',
    categoryId: '',
    thumbnailUrl: '',
  });

  const [errors, setErrors] = useState<Partial<Record<keyof CreateCourseRequest, string>>>({});

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
      .catch(() => { });
  }, []);

  const categoryOptions = [
    { value: '', label: 'Select a category' },
    ...categories.map((c) => ({ value: String(c.id), label: c.name })),
  ];

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]:
        name === 'price'
          ? (value === '' ? 0 : Number(value))
          : value,
    }));

    if (errors[name as keyof CreateCourseRequest]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const validateStep = (s: number): boolean => {
    const newErrors: typeof errors = {};
    if (s === 1) {
      if (!formData.title.trim()) newErrors.title = 'Course title is required';
      else if (formData.title.length < 10) newErrors.title = 'Title must be at least 10 characters';
      if (!formData.shortDescription.trim())
        newErrors.shortDescription = 'Short description is required';
      else if (formData.shortDescription.length < 20)
        newErrors.shortDescription = 'Short description must be at least 20 characters';
    }
    if (s === 2) {
      if (!formData.description.trim()) newErrors.description = 'Full description is required';
      else if (formData.description.length < 50)
        newErrors.description = 'Description must be at least 50 characters';
      if (!formData.categoryId) newErrors.categoryId = 'Please select a category';
    }
    if (s === 3) {
      if (formData.price < 0 || isNaN(formData.price)) {
        newErrors.price = 'Price cannot be negative';
      }
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (!validateStep(step)) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    setStep((s) => s + 1);
  };

  const handleBack = () => setStep((s) => s - 1);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep(3)) return;
    setIsSubmitting(true);
    
    const apiPayload = {
      ...formData,
      categoryId: Number(formData.categoryId)
    };

    try {
      const course = await coursesApi.createCourse(apiPayload as any);
      toast.success('Course created successfully!');
      navigate(`/instructor/courses/${course.id}/edit`);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col gap-8 w-full p-4 md:p-6 lg:p-8">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white dark:bg-[#1C1F26] p-6 rounded-[2rem] border border-gray-200 dark:border-gray-800 shadow-sm">
        <div className="flex items-center gap-5">
          <div className="w-14 h-14 rounded-2xl bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0 shadow-sm">
            <PlusCircle className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white tracking-tight">
              Create New Course
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Share your knowledge with the world. Let's start building your next great program!
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* SIDEBAR: STEP INDICATOR */}
        <div className="lg:col-span-4 xl:col-span-3">
          <div className="bg-white dark:bg-[#1C1F26] border border-gray-200 dark:border-gray-800 rounded-[2rem] p-6 shadow-lg sticky top-24">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Course Creation</h3>
            
            <div className="flex flex-col gap-6 relative">
              {/* Vertical Connecting Line */}
              <div className="absolute left-6 top-6 bottom-6 w-0.5 bg-gray-100 dark:bg-gray-800 -z-10 rounded-full" />

              {steps.map((s) => {
                const Icon = s.icon;
                const isActive = step === s.id;
                const isCompleted = step > s.id;
                
                return (
                  <div key={s.id} className="flex items-start gap-4 z-10">
                    <div 
                      className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl shadow-sm transition-all duration-300
                        ${isCompleted 
                          ? 'bg-emerald-500 text-white shadow-emerald-500/20' 
                          : isActive 
                            ? 'bg-indigo-600 text-white shadow-indigo-500/30 ring-4 ring-indigo-50 dark:ring-indigo-500/10' 
                            : 'bg-white dark:bg-[#181A20] text-gray-400 dark:text-gray-500 border border-gray-200 dark:border-gray-800'
                        }`}
                    >
                      {isCompleted ? <Check className="h-5 w-5" /> : <Icon className="h-5 w-5" />}
                    </div>
                    
                    <div className="pt-2">
                      <p className={`text-sm font-bold ${isActive ? 'text-indigo-600 dark:text-indigo-400' : isCompleted ? 'text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-500'}`}>
                        Step {s.id}
                      </p>
                      <p className={`text-base font-semibold ${isActive || isCompleted ? 'text-gray-900 dark:text-white' : 'text-gray-400 dark:text-gray-600'}`}>
                        {s.label}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-500 mt-0.5">
                        {s.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* MAIN FORM */}
        <div className="lg:col-span-8 xl:col-span-9">
          <form onSubmit={handleSubmit} className="bg-white dark:bg-[#1C1F26] border border-gray-200 dark:border-gray-800 rounded-[2rem] p-6 sm:p-10 shadow-xl dark:shadow-2xl">
            
            {/* ─── Step 1: Basic Info ──────────────────────────────────────── */}
            {step === 1 && (
              <div className="flex flex-col gap-8 animate-in fade-in slide-in-from-right-4 duration-500">
                
                <div className="flex items-start gap-4 p-5 rounded-2xl bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-100 dark:border-indigo-500/20">
                  <div className="p-2 bg-indigo-100 dark:bg-indigo-500/20 rounded-xl text-indigo-600 dark:text-indigo-400 shrink-0">
                    <BookOpen className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-indigo-900 dark:text-indigo-300">Start with a great title</h3>
                    <p className="text-sm text-indigo-700 dark:text-indigo-400/80 mt-1">
                      Your title and short description are the first things students see. Make them compelling, clear, and rich with keywords.
                    </p>
                  </div>
                </div>

                <div className="space-y-6">
                  <div>
                    <label className="flex items-center gap-2 text-sm font-bold text-gray-900 dark:text-white mb-2">
                      <Type className="w-4 h-4 text-gray-400" /> Course Title
                    </label>
                    <Input
                      name="title"
                      value={formData.title}
                      onChange={handleChange}
                      error={errors.title}
                      placeholder="e.g., Complete React Developer Course 2024"
                      required
                      className="text-lg py-6 bg-gray-50 dark:bg-[#13151A] border-gray-200 dark:border-gray-800 focus:bg-white dark:focus:bg-[#1C1F26]"
                    />
                  </div>

                  <div>
                    <label className="flex items-center gap-2 text-sm font-bold text-gray-900 dark:text-white mb-2">
                      <AlignLeft className="w-4 h-4 text-gray-400" /> Short Description
                    </label>
                    <Textarea
                      name="shortDescription"
                      value={formData.shortDescription}
                      onChange={handleChange}
                      error={errors.shortDescription}
                      placeholder="A brief, compelling overview of your course (shown in course cards)"
                      rows={3}
                      required
                      className="bg-gray-50 dark:bg-[#13151A] border-gray-200 dark:border-gray-800 focus:bg-white dark:focus:bg-[#1C1F26]"
                    />
                    <p className="text-xs text-gray-500 mt-2">Keep it under 200 characters for optimal display on mobile devices.</p>
                  </div>

                  <div>
                    <label className="flex items-center gap-2 text-sm font-bold text-gray-900 dark:text-white mb-2">
                      <ImageIcon className="w-4 h-4 text-gray-400" /> Thumbnail URL
                    </label>
                    <Input
                      name="thumbnailUrl"
                      value={formData.thumbnailUrl || ''}
                      onChange={handleChange}
                      placeholder="https://example.com/thumbnail.jpg"
                      className="bg-gray-50 dark:bg-[#13151A] border-gray-200 dark:border-gray-800 focus:bg-white dark:focus:bg-[#1C1F26]"
                    />
                    <p className="text-xs text-gray-500 mt-2">Recommended: 1280x720 pixels (16:9 ratio).</p>
                    
                    {formData.thumbnailUrl && (
                      <div className="mt-4 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-800 max-w-sm">
                        <img 
                          src={formData.thumbnailUrl} 
                          alt="Thumbnail Preview" 
                          className="w-full h-auto aspect-video object-cover"
                          onError={(e) => (e.currentTarget.src = 'https://placehold.co/1280x720?text=Invalid+Image+URL')}
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* ─── Step 2: Details ─────────────────────────────────────────── */}
            {step === 2 && (
              <div className="flex flex-col gap-8 animate-in fade-in slide-in-from-right-4 duration-500">
                
                <div>
                  <label className="flex items-center gap-2 text-sm font-bold text-gray-900 dark:text-white mb-2">
                    <AlignLeft className="w-4 h-4 text-gray-400" /> Full Course Description
                  </label>
                  <Textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    error={errors.description}
                    placeholder="Provide a highly detailed description of your course content, what students will learn, and who this course is for..."
                    rows={10}
                    required
                    className="bg-gray-50 dark:bg-[#13151A] border-gray-200 dark:border-gray-800 focus:bg-white dark:focus:bg-[#1C1F26]"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 rounded-2xl bg-gray-50 dark:bg-[#13151A] border border-gray-200 dark:border-gray-800">
                  <div>
                    <label className="flex items-center gap-2 text-sm font-bold text-gray-900 dark:text-white mb-2">
                      <Layout className="w-4 h-4 text-gray-400" /> Category
                    </label>
                    <Select
                      name="categoryId"
                      value={formData.categoryId}
                      onChange={handleChange}
                      error={errors.categoryId}
                      options={categoryOptions}
                      required
                      className="bg-white dark:bg-[#1C1F26]"
                    />
                  </div>

                  <div>
                    <label className="flex items-center gap-2 text-sm font-bold text-gray-900 dark:text-white mb-2">
                      <Settings className="w-4 h-4 text-gray-400" /> Difficulty Level
                    </label>
                    <Select
                      name="level"
                      value={formData.level}
                      onChange={handleChange}
                      options={levelOptions}
                      required
                      className="bg-white dark:bg-[#1C1F26]"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* ─── Step 3: Pricing ─────────────────────────────────────────── */}
            {step === 3 && (
              <div className="flex flex-col gap-8 animate-in fade-in slide-in-from-right-4 duration-500">
                
                {/* PREVIEW CARD */}
                <div className="rounded-2xl border border-gray-200 dark:border-gray-800 p-6 bg-gradient-to-br from-gray-50 to-white dark:from-[#13151A] dark:to-[#1C1F26] shadow-sm">
                  <div className="flex items-center gap-2 text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider mb-3">
                    <Eye className="w-4 h-4" /> Course Preview
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{formData.title}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">{formData.shortDescription}</p>
                  
                  <div className="flex items-center gap-3">
                    <span className="bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-xs font-bold px-3 py-1 rounded-md">
                      {formData.level}
                    </span>
                    {formData.categoryId && (
                      <span className="bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 text-xs font-bold px-3 py-1 rounded-md">
                        {categories.find(c => String(c.id) === formData.categoryId)?.name || 'Category'}
                      </span>
                    )}
                  </div>
                </div>

                {/* PRICING INPUT */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-bold text-gray-900 dark:text-white mb-2">
                    <DollarSign className="w-4 h-4 text-gray-400" /> Course Price (USD)
                  </label>
                  
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <span className="text-gray-500 font-bold">$</span>
                    </div>
                    <input
                      name="price"
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.price}
                      onChange={handleChange as any}
                      className={`w-full pl-8 pr-4 py-4 rounded-xl text-lg font-bold border ${errors.price ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 dark:border-gray-700 focus:ring-indigo-500'} bg-white dark:bg-[#13151A] text-gray-900 dark:text-white focus:outline-none focus:ring-2`}
                    />
                  </div>
                  {errors.price && <p className="mt-1 text-sm text-red-500 font-medium">{errors.price}</p>}
                </div>

                {/* QUICK SELECT TILES */}
                <div>
                  <p className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-3">Quick Price Select</p>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {[0, 9.99, 19.99, 29.99, 49.99, 99.99].map((price) => {
                      const isSelected = formData.price === price;
                      return (
                        <button
                          key={price}
                          type="button"
                          onClick={() => setFormData((prev) => ({ ...prev, price }))}
                          className={`relative overflow-hidden rounded-xl p-4 border-2 transition-all duration-200 transform-gpu hover:-translate-y-1 ${
                            isSelected
                              ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-500/10 dark:border-indigo-500'
                              : 'border-gray-200 dark:border-gray-800 bg-white dark:bg-[#13151A] hover:border-indigo-300 dark:hover:border-indigo-500/50'
                          }`}
                        >
                          {isSelected && (
                            <div className="absolute top-2 right-2">
                              <Check className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                            </div>
                          )}
                          <p className={`text-xl font-black ${isSelected ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-900 dark:text-white'}`}>
                            {price === 0 ? 'Free' : `$${price}`}
                          </p>
                          <p className={`text-xs mt-1 ${isSelected ? 'text-indigo-500 dark:text-indigo-400/80' : 'text-gray-500 dark:text-gray-400'}`}>
                            {price === 0 ? 'Attract students' : 'Standard tier'}
                          </p>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* ─── FOOTER ACTIONS ────────────────────────────────────────── */}
            <div className="mt-10 pt-6 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
              <button
                type="button"
                onClick={handleBack}
                disabled={step === 1}
                className="px-6 py-3 rounded-xl font-semibold text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Go Back
              </button>
              
              <div className="flex gap-3">
                {step < 3 ? (
                  <button
                    type="button"
                    onClick={handleNext}
                    disabled={
                      (step === 1 && (!formData.title || !formData.shortDescription)) ||
                      (step === 2 && (!formData.description || !formData.categoryId))
                    }
                    className="flex items-center gap-2 px-8 py-3 rounded-xl font-bold text-white bg-gray-900 dark:bg-white dark:text-gray-900 hover:bg-gray-800 dark:hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-lg"
                  >
                    Next Step <ChevronRight className="w-4 h-4" />
                  </button>
                ) : (
                  <button 
                    type="submit" 
                    disabled={isSubmitting}
                    className="flex items-center gap-2 px-8 py-3 rounded-xl font-bold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-70 disabled:cursor-wait transition-colors shadow-xl shadow-indigo-500/20"
                  >
                    {isSubmitting ? (
                      <>Processing...</>
                    ) : (
                      <>Publish Draft <Check className="w-5 h-5" /></>
                    )}
                  </button>
                )}
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
