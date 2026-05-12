import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  BookOpen,
  Users,
  Award,
  TrendingUp,
  Play,
  ArrowRight,
  CheckCircle,
  Star,
  Zap,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { Button, LoadingSpinner } from '@/components/ui';
import { CourseCard } from '@/components/course';
import { useApi } from '@/hooks';
import { coursesApi } from '@/api';
import { RecommendedCourses } from './RecommendedCourses';
import photo1 from '@/assets/Photo1.png';
import photo2 from '@/assets/Photo2.png';
import photo3 from '@/assets/Photo3.png';

const features = [
  {
    icon: <BookOpen className="h-6 w-6" />,
    title: 'Expert-Led Courses',
    description: 'Learn from industry professionals with real-world experience.',
  },
  {
    icon: <Play className="h-6 w-6" />,
    title: 'Learn at Your Pace',
    description: 'Access course content anytime, anywhere, on any device.',
  },
  {
    icon: <Award className="h-6 w-6" />,
    title: 'Earn Certificates',
    description: 'Get recognized with certificates upon course completion.',
  },
  {
    icon: <Users className="h-6 w-6" />,
    title: 'Community Support',
    description: 'Join a global community of learners and instructors.',
  },
];

const stats = [
  { value: '50,000+', label: 'Active Students', icon: <Users className="h-5 w-5" /> },
  { value: '1,200+', label: 'Total Courses', icon: <BookOpen className="h-5 w-5" /> },
  { value: '300+', label: 'Expert Instructors', icon: <Star className="h-5 w-5" /> },
  { value: '95%', label: 'Satisfaction Rate', icon: <TrendingUp className="h-5 w-5" /> },
];

const benefits = [
  'Lifetime access to course materials',
  'Downloadable resources and exercises',
  'Certificate of completion',
  'Mobile and desktop access',
  '30-day money-back guarantee',
  'Regular content updates',
];

const heroSlides = [
  {
    id: 1,
    image: photo1,
    tag: 'Most Popular',
    title: 'Unlock Your',
    titleAccent: 'Potential',
    subtitle: 'Join 50,000+ learners worldwide and transform your career with expert-led courses.',
    cta: 'Start Learning',
    link: '/courses',
  },
  {
    id: 2,
    image: photo2,
    tag: 'Trending Now',
    title: 'Master',
    titleAccent: 'Technology',
    subtitle: 'Build real-world projects and gain skills that top companies are hiring for right now.',
    cta: 'Explore Courses',
    link: '/courses',
  },
  {
    id: 3,
    image: photo3,
    tag: 'New Paths',
    title: 'Advance',
    titleAccent: 'Your Career',
    subtitle: 'Learn from industry experts and take the next step in your professional journey.',
    cta: 'View Paths',
    link: '/courses',
  },
];

export const HomePage: React.FC = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const goToSlide = (index: number) => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentSlide(index);
      setIsTransitioning(false);
    }, 300);
  };

  const nextSlide = () => goToSlide((currentSlide + 1) % heroSlides.length);
  const prevSlide = () => goToSlide((currentSlide - 1 + heroSlides.length) % heroSlides.length);

  useEffect(() => {
    const timer = setInterval(nextSlide, 6000);
    return () => clearInterval(timer);
  }, [currentSlide]);

  const { data: featuredCourses, isLoading } = useApi(
    () => coursesApi.getFeaturedCourses(),
    []
  );

  const slide = heroSlides[currentSlide];

  return (
    <div className="bg-white dark:bg-gray-950 transition-colors duration-200">

      <section className="relative w-full overflow-hidden bg-gray-950 min-h-[600px] md:min-h-[680px]">

        {heroSlides.map((s, i) => (
          <div
            key={s.id}
            className={`absolute inset-0 transition-opacity duration-700 ${i === currentSlide ? 'opacity-100' : 'opacity-0'}`}
          >
            <img
              src={s.image}
              alt={s.title}
              className="h-full w-full object-cover object-center"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-gray-950/95 via-gray-950/70 to-gray-950/20" />
            <div className="absolute inset-0 bg-gradient-to-t from-gray-950/80 via-transparent to-transparent" />
          </div>
        ))}

        <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-full flex items-center">
          <div className="py-20 md:py-28 max-w-2xl">

            <div
              className={`inline-flex items-center gap-2 rounded-full border border-indigo-500/40 bg-indigo-500/10 px-3 py-1.5 mb-6 transition-all duration-500 ${isTransitioning ? 'opacity-0 translate-y-2' : 'opacity-100 translate-y-0'}`}
            >
              <Zap className="h-3 w-3 text-indigo-400" />
              <span className="text-xs font-semibold text-indigo-300 uppercase tracking-wider">
                {slide.tag}
              </span>
            </div>

            <h1
              className={`text-5xl md:text-7xl font-black leading-none tracking-tight mb-6 transition-all duration-500 delay-75 ${isTransitioning ? 'opacity-0 translate-y-4' : 'opacity-100 translate-y-0'}`}
            >
              <span className="text-white block">{slide.title}</span>
              <span className="block bg-gradient-to-r from-indigo-400 via-violet-400 to-purple-400 bg-clip-text text-transparent">
                {slide.titleAccent}
              </span>
            </h1>

            <p
              className={`text-lg text-gray-300 leading-relaxed mb-10 max-w-lg transition-all duration-500 delay-100 ${isTransitioning ? 'opacity-0 translate-y-4' : 'opacity-100 translate-y-0'}`}
            >
              {slide.subtitle}
            </p>

            <div
              className={`flex flex-wrap items-center gap-4 transition-all duration-500 delay-150 ${isTransitioning ? 'opacity-0 translate-y-4' : 'opacity-100 translate-y-0'}`}
            >
              <Link to={slide.link}>
                <button className="group flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-indigo-900/40 hover:bg-indigo-500 transition-all hover:shadow-indigo-600/40 hover:shadow-xl hover:-translate-y-0.5">
                  {slide.cta}
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </button>
              </Link>
              <Link to="/register">
                <button className="flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-6 py-3.5 text-sm font-bold text-white backdrop-blur-sm hover:bg-white/20 transition-all hover:-translate-y-0.5">
                  Start for Free
                </button>
              </Link>
            </div>

            <div
              className={`mt-10 flex items-center gap-6 transition-all duration-500 delay-200 ${isTransitioning ? 'opacity-0' : 'opacity-100'}`}
            >
              <div className="flex -space-x-2">
                {['bg-indigo-500', 'bg-violet-500', 'bg-purple-500', 'bg-pink-500'].map((c, i) => (
                  <div key={i} className={`h-8 w-8 rounded-full ${c} border-2 border-gray-950 flex items-center justify-center text-xs font-bold text-white`}>
                    {['A', 'B', 'C', 'D'][i]}
                  </div>
                ))}
              </div>
              <div>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map(s => (
                    <Star key={s} className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
                  ))}
                  <span className="ml-1 text-sm font-bold text-white">4.9</span>
                </div>
                <p className="text-xs text-gray-400">Trusted by 50,000+ students</p>
              </div>
            </div>
          </div>
        </div>

        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex items-center gap-4">
          <button
            onClick={prevSlide}
            className="flex h-8 w-8 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white backdrop-blur-sm hover:bg-white/20 transition-all"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>

          <div className="flex items-center gap-2">
            {heroSlides.map((_, idx) => (
              <button
                key={idx}
                onClick={() => goToSlide(idx)}
                className={`rounded-full transition-all duration-300 ${idx === currentSlide ? 'w-6 h-2 bg-indigo-400' : 'w-2 h-2 bg-white/30 hover:bg-white/50'}`}
              />
            ))}
          </div>

          <button
            onClick={nextSlide}
            className="flex h-8 w-8 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white backdrop-blur-sm hover:bg-white/20 transition-all"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>

        <div className="absolute top-8 right-8 z-20 hidden md:flex items-center gap-2">
          <span className="text-2xl font-black text-white">0{currentSlide + 1}</span>
          <div className="h-px w-8 bg-white/30" />
          <span className="text-sm text-white/40">0{heroSlides.length}</span>
        </div>
      </section>

      <section className="border-b border-gray-100 dark:border-gray-800/60 bg-white dark:bg-gray-950 py-10 transition-colors duration-200">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
            {stats.map((stat) => (
              <div key={stat.label} className="group flex items-center gap-4 rounded-2xl p-4 hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors">
                <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 transition-colors group-hover:bg-indigo-100 dark:group-hover:bg-indigo-950">
                  {stat.icon}
                </div>
                <div>
                  <p className="text-2xl font-black text-gray-900 dark:text-white leading-none">{stat.value}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{stat.label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 bg-white dark:bg-gray-950 transition-colors duration-200">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-10 flex items-end justify-between">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-indigo-50 dark:bg-indigo-950/50 px-3 py-1 mb-3">
                <TrendingUp className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
                <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400">Top Picks</span>
              </div>
              <h2 className="text-3xl font-black text-gray-900 dark:text-white">Featured Courses</h2>
              <p className="mt-2 text-gray-500 dark:text-gray-400">
                Handpicked courses to kickstart your learning journey
              </p>
            </div>
            <Link
              to="/courses"
              className="hidden items-center gap-1 text-sm font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 sm:flex group"
            >
              View all <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {isLoading ? (
            <LoadingSpinner text="Loading featured courses..." />
          ) : featuredCourses && featuredCourses.length > 0 ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {featuredCourses.slice(0, 8).map((course) => (
                <CourseCard key={course.id} course={course} />
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-gray-200 dark:border-gray-800 py-16 text-center">
              <BookOpen className="mx-auto mb-3 h-12 w-12 text-gray-200 dark:text-gray-700" />
              <p className="text-gray-400 dark:text-gray-500">No featured courses available yet.</p>
              <Link to="/courses" className="mt-2 inline-block text-sm text-indigo-600 dark:text-indigo-400 hover:underline">
                Browse all courses
              </Link>
            </div>
          )}

          <div className="mt-8 text-center sm:hidden">
            <Link to="/courses">
              <Button variant="outline" rightIcon={<ArrowRight className="h-4 w-4" />}>
                View All Courses
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <RecommendedCourses />

      <section className="bg-gray-50 dark:bg-gray-900/40 py-16 transition-colors duration-200">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-black text-gray-900 dark:text-white">Why Choose LearnHub?</h2>
            <p className="mt-3 text-gray-500 dark:text-gray-400 max-w-xl mx-auto">
              Everything you need to learn, grow, and succeed in your career
            </p>
          </div>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((feature, i) => (
              <div
                key={feature.title}
                className="group rounded-2xl bg-white dark:bg-gray-900 p-6 shadow-sm border border-gray-100 dark:border-gray-800 hover:border-indigo-200 dark:hover:border-indigo-900 hover:shadow-md transition-all duration-200 hover:-translate-y-1"
              >
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 group-hover:bg-indigo-100 dark:group-hover:bg-indigo-950 transition-colors">
                  {feature.icon}
                </div>
                <h3 className="mb-2 font-bold text-gray-900 dark:text-white">{feature.title}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 bg-white dark:bg-gray-950 transition-colors duration-200">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="relative overflow-hidden rounded-3xl bg-gray-950 dark:bg-gray-900 border border-gray-800 shadow-2xl">

            {/* Background decoration */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              <div className="absolute -top-32 -right-32 h-96 w-96 rounded-full bg-indigo-600/20 blur-3xl" />
              <div className="absolute -bottom-32 -left-32 h-96 w-96 rounded-full bg-violet-600/20 blur-3xl" />
              <div className="absolute inset-0 bg-[radial-gradient(rgba(99,102,241,0.08)_1px,transparent_1px)] [background-size:24px_24px]" />
            </div>

            <div className="relative z-10 grid grid-cols-1 gap-8 p-10 md:p-14 md:grid-cols-2 md:items-center">
              <div className="text-white">
                <div className="inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-3 py-1 mb-6">
                  <Zap className="h-3 w-3 text-indigo-400" />
                  <span className="text-xs font-semibold text-indigo-300 uppercase tracking-wider">Limited Time</span>
                </div>
                <h2 className="mb-4 text-4xl font-black leading-tight">
                  Start Learning<br />
                  <span className="bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent">Today for Free</span>
                </h2>
                <p className="mb-8 text-gray-400 leading-relaxed">
                  Get unlimited access to all courses, projects, and learning paths. Cancel anytime.
                </p>
                <ul className="mb-8 grid grid-cols-1 gap-2 sm:grid-cols-2">
                  {benefits.map((benefit) => (
                    <li key={benefit} className="flex items-center gap-2 text-sm text-gray-300">
                      <CheckCircle className="h-4 w-4 flex-shrink-0 text-indigo-400" />
                      {benefit}
                    </li>
                  ))}
                </ul>
                <Link to="/register">
                  <button className="group flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-3.5 text-sm font-bold text-white hover:bg-indigo-500 transition-all shadow-lg shadow-indigo-900/40 hover:-translate-y-0.5">
                    Get Started for Free
                    <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </button>
                </Link>
              </div>

              <div className="hidden md:flex md:justify-center md:items-center">
                <div className="relative">
                  <div className="h-48 w-48 rounded-3xl bg-indigo-600/20 border border-indigo-500/20 flex items-center justify-center rotate-12">
                    <BookOpen className="h-20 w-20 text-indigo-400/50" />
                  </div>
                  <div className="absolute -top-4 -right-4 h-24 w-24 rounded-2xl bg-violet-600/20 border border-violet-500/20 flex items-center justify-center -rotate-6">
                    <Award className="h-10 w-10 text-violet-400/60" />
                  </div>
                  <div className="absolute -bottom-4 -left-4 h-20 w-20 rounded-2xl bg-purple-600/20 border border-purple-500/20 flex items-center justify-center rotate-6">
                    <Star className="h-8 w-8 text-purple-400/60" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};