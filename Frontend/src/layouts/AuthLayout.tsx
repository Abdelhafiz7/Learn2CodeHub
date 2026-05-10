import React, { useState, useEffect } from 'react';
import { Outlet, Link } from 'react-router-dom';
import logoUrl from '@/assets/Learn2codehub.png';
import bgImage1 from '@/assets/auth-bg.png';
import bgImage2 from '@/assets/auth-bg-expert.png';
import bgImage3 from '@/assets/auth-bg-career.png';

const SLIDES = [
  {
    badge: "Interactive Learning Platform",
    title1: "Master the skills",
    title2: "that shape the future.",
    desc: "Join the world's most dynamic coding community. Build real-world projects, earn professional certificates, and accelerate your career.",
    image: bgImage1
  },
  {
    badge: "Expert-Led Curriculums",
    title1: "Learn from the best",
    title2: "at your own pace.",
    desc: "Access world-class premium courses, personalized feedback, and hands-on labs designed by industry-leading professionals.",
    image: bgImage2
  },
  {
    badge: "Career Advancement",
    title1: "Build real projects,",
    title2: "earn certificates.",
    desc: "Showcase your skills with verified professional certifications and a robust portfolio of real-world applications.",
    image: bgImage3
  }
];

export const AuthLayout: React.FC = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % SLIDES.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flex min-h-screen font-sans">
      {/* Left Panel - Ultra Premium Branding (Full Screen Height, 50% Width) */}
      <div className="hidden flex-col justify-between relative p-12 lg:flex lg:w-1/2 bg-[#05050A] overflow-hidden border-r border-gray-800/50">

        {/* Dynamic Photo Backgrounds */}
        {SLIDES.map((slide, index) => (
          <div
            key={`bg-${index}`}
            className={`absolute inset-0 bg-cover bg-center bg-no-repeat transition-opacity duration-[1500ms] ease-in-out mix-blend-lighten ${index === currentSlide ? 'opacity-50 z-0' : 'opacity-0 -z-10'
              }`}
            style={{ backgroundImage: `url(${slide.image})` }}
          />
        ))}

        {/* Overlay to ensure perfect text readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#05050A]/90 via-[#05050A]/40 to-[#05050A]/90 pointer-events-none"></div>

        <div className="relative z-10 flex flex-col h-full justify-between">
          <Link to="/" className="flex items-center group w-fit">
            <img src={logoUrl} alt="Learn To Code Hub" className="h-10 w-auto brightness-0 invert transition-transform duration-500 group-hover:scale-105" />
          </Link>

          {/* Slideshow Container */}
          <div className="my-auto flex flex-col">
            <div className="relative h-[320px] w-full max-w-xl">
              {SLIDES.map((slide, index) => (
                <div
                  key={index}
                  className={`absolute inset-0 flex flex-col transition-all duration-1000 ease-in-out ${index === currentSlide
                      ? 'opacity-100 translate-y-0 pointer-events-auto'
                      : 'opacity-0 translate-y-8 pointer-events-none'
                    }`}
                >
                  <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-md mb-8 shadow-lg w-fit">
                    <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse"></span>
                    <span className="text-xs font-bold tracking-widest text-indigo-200 uppercase">{slide.badge}</span>
                  </div>
                  <blockquote className="text-4xl md:text-[3.5rem] font-bold leading-[1.1] tracking-tight mb-8 text-white">
                    {slide.title1} <br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-indigo-400 bg-[length:200%_auto] animate-gradient">
                      {slide.title2}
                    </span>
                  </blockquote>
                  <p className="text-lg text-gray-400 font-medium leading-relaxed max-w-lg">
                    {slide.desc}
                  </p>
                </div>
              ))}
            </div>

            {/* Slide Indicators */}
            <div className="flex gap-3 mt-8">
              {SLIDES.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentSlide(i)}
                  className={`h-1.5 rounded-full transition-all duration-500 ${i === currentSlide ? 'w-8 bg-indigo-400 shadow-[0_0_10px_rgba(129,140,248,0.5)]' : 'w-2 bg-white/20 hover:bg-white/40'
                    }`}
                  aria-label={`Go to slide ${i + 1}`}
                />
              ))}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-6 text-white relative z-10">
            {[
              { value: '50K+', label: 'Active Students' },
              { value: '1,200+', label: 'Premium Courses' },
              { value: '300+', label: 'Expert Instructors' },
            ].map((stat) => (
              <div key={stat.label} className="rounded-2xl bg-white/[0.03] border border-white/10 backdrop-blur-md p-6 hover:bg-white/[0.08] transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-indigo-500/10 cursor-default group">
                <p className="text-3xl font-extrabold text-white mb-1 group-hover:text-indigo-300 transition-colors">{stat.value}</p>
                <p className="text-sm font-semibold text-gray-400">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Panel - Form (Full Screen Height, 50% Width) */}
      <div className="flex flex-1 flex-col items-center justify-center px-6 py-12 lg:px-12 bg-white dark:bg-gray-950 transition-colors duration-200">
        {/* Mobile Logo */}
        <Link to="/" className="mb-8 flex items-center lg:hidden">
          <img src={logoUrl} alt="Learn To Code Hub" className="h-8 w-auto invert dark:invert-0" />
        </Link>

        {/* The Outlet holds the Auth Card (RegisterPage, LoginPage) */}
        <div className="w-full flex justify-center">
          <Outlet />
        </div>
      </div>
    </div>
  );
};
