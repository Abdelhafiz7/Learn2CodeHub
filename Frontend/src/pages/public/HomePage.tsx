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
} from 'lucide-react';
import { Button, LoadingSpinner } from '@/components/ui';
import { CourseCard } from '@/components/course';
import { useApi } from '@/hooks';
import { coursesApi } from '@/api';

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
    image: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80',
    link: '/courses',
    title: 'Unlock Your Potential',
    subtitle: 'Join 50,000+ learners worldwide',
  },
  {
    id: 2,
    image: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80',
    link: '/courses',
    title: 'Master Technology',
    subtitle: 'Build real-world projects today',
  },
  {
    id: 3,
    image: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80',
    link: '/courses',
    title: 'Advance Your Career',
    subtitle: 'Learn from industry experts',
  }
];

export const HomePage: React.FC = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const { data: featuredCourses, isLoading } = useApi(
    () => coursesApi.getFeaturedCourses(),
    []
  );

  return (
    <div>
      {/* ─── Hero Section ─────────────────────────────────────────────────── */}
      <section className="relative w-full bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-800 py-20 text-white bg-[radial-gradient(rgba(255,255,255,0.15)_1px,transparent_1px)] [background-size:24px_24px]">
        <div className="relative mx-auto mt-4 w-full max-w-[1440px] px-4 sm:px-6 lg:px-12 xl:px-16">

          {/* Main Visual Content */}
          <div className="relative mx-auto w-full">
            {/* Styled Wrapper Slider */}
            <Link to={heroSlides[currentSlide].link} className="block group relative overflow-hidden rounded-2xl h-[400px] md:h-[550px] bg-black border border-white/20 shadow-2xl cursor-pointer">
              {/* Background Images */}
              {heroSlides.map((slide, index) => (
                <img
                  key={slide.id}
                  src={slide.image}
                  alt={slide.title}
                  className={`absolute inset-0 h-full w-full object-cover transition-all duration-1000 ease-in-out group-hover:scale-105 ${index === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0'
                    }`}
                />
              ))}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent z-10 pointer-events-none"></div>

              {/* Floating text overlay */}
              <div className="absolute top-12 left-6 md:left-12 flex items-start gap-1 z-20">
                <div className="bg-white text-indigo-900 px-6 py-4 md:px-8 md:py-5 text-4xl md:text-6xl font-extrabold tracking-tight rounded-xl shadow-xl transition-all duration-500">
                  {heroSlides[currentSlide].title}
                </div>
              </div>

              <div className="absolute bottom-32 left-6 md:left-12 z-20">
                <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-5 py-2.5 text-sm font-semibold backdrop-blur-md border border-white/30 text-white shadow-lg transition-all duration-500">
                  <TrendingUp className="h-4 w-4 text-yellow-300" />
                  <span>{heroSlides[currentSlide].subtitle}</span>
                </div>
              </div>

              {/* Slide Indicators */}
              <div className="absolute bottom-32 right-6 md:right-12 flex items-center gap-2 z-20">
                {heroSlides.map((_, idx) => (
                  <div
                    key={idx}
                    className={`h-2 rounded-full transition-all duration-300 ${idx === currentSlide ? 'w-6 bg-white' : 'w-2 bg-white/50'
                      }`}
                  />
                ))}
              </div>
            </Link>

            {/* Floating Actions Box overlapping the bottom of the visual area */}
            <div className="relative z-10 mx-auto -mt-24 w-[90%] md:w-[85%] max-w-5xl rounded-2xl border border-indigo-100 bg-white p-6 md:p-8 shadow-[0_20px_60px_rgba(79,70,229,0.2)] flex flex-col md:flex-row gap-8 items-center justify-between">

              <div className="flex-1 w-full space-y-4">
                <Link to="/courses" className="block">
                  <button className="w-full rounded-xl bg-indigo-600 py-3.5 font-bold text-white transition-all hover:bg-indigo-700 hover:shadow-md">
                    Browse All Courses
                  </button>
                </Link>
                <Link to="/register" className="block">
                  <button className="w-full rounded-xl bg-white py-3.5 font-bold text-indigo-600 transition-all hover:bg-gray-50 border-2 border-indigo-100">
                    Start for Free
                  </button>
                </Link>
              </div>

              <div className="flex-1 text-[1.1rem] md:text-xl font-medium leading-relaxed text-gray-600 border-l-0 md:border-l-2 border-gray-100 md:pl-8">
                Master in-demand skills with courses taught by <span className="text-indigo-600">industry experts</span>. Learn at your own pace, build projects, and advance your career today.
              </div>
            </div>

          </div>

          {/* Stats Section */}
        </div>
      </section>

      {/* ─── Stats ────────────────────────────────────────────────────────── */}
      <section className="border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 py-12 transition-colors duration-200">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 transition-colors duration-200">
                  {stat.icon}
                </div>
                <p className="text-3xl font-bold text-gray-900 dark:text-white transition-colors duration-200">{stat.value}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400 transition-colors duration-200">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Featured Courses ─────────────────────────────────────────────── */}
      <section className="py-16 bg-white dark:bg-gray-950 transition-colors duration-200">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-10 flex items-end justify-between">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Featured Courses</h2>
              <p className="mt-2 text-gray-500 dark:text-gray-400">
                Handpicked courses to kickstart your learning journey
              </p>
            </div>
            <Link
              to="/courses"
              className="hidden items-center gap-1 text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 sm:flex"
            >
              View all courses <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          {isLoading ? (
            <LoadingSpinner text="Loading featured courses..." />
          ) : featuredCourses && featuredCourses.length > 0 ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {featuredCourses.slice(0, 12).map((course) => (
                <CourseCard key={course.id} course={course} />
              ))}
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-gray-300 dark:border-gray-700 py-16 text-center">
              <BookOpen className="mx-auto mb-3 h-12 w-12 text-gray-300 dark:text-gray-600" />
              <p className="text-gray-500 dark:text-gray-400">No featured courses available yet.</p>
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

      {/* ─── Features ─────────────────────────────────────────────────────── */}
      <section className="bg-gray-50 dark:bg-gray-900/50 py-16 transition-colors duration-200">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Why Choose LearnHub?</h2>
            <p className="mt-3 text-gray-500 dark:text-gray-400">
              Everything you need to learn, grow, and succeed
            </p>
          </div>
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="rounded-xl bg-white dark:bg-gray-900 p-6 shadow-sm border border-gray-100 dark:border-gray-800 transition-colors duration-200"
              >
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400">
                  {feature.icon}
                </div>
                <h3 className="mb-2 font-semibold text-gray-900 dark:text-white">{feature.title}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Benefits / CTA ───────────────────────────────────────────────── */}
      <section className="py-16 bg-white dark:bg-gray-950 transition-colors duration-200">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-700 shadow-xl">
            <div className="grid grid-cols-1 gap-8 p-10 md:grid-cols-2 md:items-center">
              <div className="text-white">
                <h2 className="mb-4 text-3xl font-bold">
                  Start Learning Today
                </h2>
                <p className="mb-6 text-indigo-100">
                  Get unlimited access to all courses, projects, and learning paths. Cancel anytime.
                </p>
                <ul className="mb-8 flex flex-col gap-2">
                  {benefits.map((benefit) => (
                    <li key={benefit} className="flex items-center gap-2 text-sm text-indigo-100">
                      <CheckCircle className="h-4 w-4 flex-shrink-0 text-green-300" />
                      {benefit}
                    </li>
                  ))}
                </ul>
                <Link to="/register">
                  <Button
                    size="lg"
                    className="bg-white text-indigo-700 hover:bg-indigo-50"
                    rightIcon={<ArrowRight className="h-5 w-5" />}
                  >
                    Get Started for Free
                  </Button>
                </Link>
              </div>
              <div className="hidden md:flex md:justify-center">
                <div className="flex h-64 w-64 items-center justify-center rounded-full bg-white/10">
                  <BookOpen className="h-32 w-32 text-white/30" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
