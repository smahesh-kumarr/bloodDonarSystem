import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Activity,  Users, Globe, Droplet } from 'lucide-react';
import { Link } from 'react-router-dom';

const SLIDES = [
  {
    image: "https://images.unsplash.com/photo-1615461066841-6116e61058f4?q=80&w=1000&auto=format&fit=crop",
    quote: "One donation can save up to three lives.",
    subtext: "Your contribution matters more than you know."
  },
  {
    image: "https://images.unsplash.com/photo-1579154204601-01588f351e67?q=80&w=1000&auto=format&fit=crop",
    quote: "Your blood is someone's second chance.",
    subtext: "Be a hero in someone's story today."
  },
  {
    image: "https://images.unsplash.com/photo-1584362917165-526a968579e8?q=80&w=1000&auto=format&fit=crop",
    quote: "Donate blood. Save lives.",
    subtext: "Join our community of lifesavers."
  },
  {
    image: "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?q=80&w=1000&auto=format&fit=crop", // Medical/Community vibe
    quote: "Be the reason someone survives today.",
    subtext: "Real-time connection, real-time impact."
  }
];

const STATS = [
  { icon: Heart, value: "1.2M+", label: "Donations" },
  { icon: Users, value: "25k+", label: "Active Donors" },
  { icon: Activity, value: "8.5k+", label: "Lives Saved" },
  { icon: Globe, value: "120+", label: "Cities" },
];

const AuthLayout = ({ children, title, subtitle }) => {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % SLIDES.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flex min-h-screen bg-white font-sans overflow-hidden">
      {/* Left Side - Authentication Form */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center items-center p-6 sm:p-12 xl:p-24 relative z-10">
        <div className="w-full max-w-md">
          {/* Brand Header for Mobile/Desktop */}
          <div className="mb-10 text-center lg:text-left">
            <Link to="/" className="inline-flex items-center gap-2 group">
              <div className="w-10 h-10 bg-red-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-red-200 group-hover:scale-110 transition-transform">
                <Droplet className="w-6 h-6 fill-current" />
              </div>
              <div className="flex flex-col items-start">
                <h1 className="text-2xl font-bold text-gray-900 tracking-tight leading-none">Redora</h1>
                <span className="text-xs font-medium text-red-600 tracking-wide uppercase">Real-Time Blood Donor Network</span>
              </div>
            </Link>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <div className="mb-8 text-center lg:text-left">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">{title}</h2>
              <p className="text-gray-500">{subtitle}</p>
            </div>
            
            {children}

          </motion.div>

          <div className="mt-8 pt-6 border-t border-gray-100 text-center text-xs text-gray-400">
            &copy; {new Date().getFullYear()} Redora Health. Secure & Encouraged.
          </div>
        </div>
      </div>

      {/* Right Side - Awareness & Promotional */}
      <div className="hidden lg:block lg:w-1/2 relative bg-gray-900 overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0, scale: 1.1 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.5 }}
            className="absolute inset-0 w-full h-full"
          >
            <div 
              className="absolute inset-0 bg-cover bg-center"
              style={{ backgroundImage: `url(${SLIDES[currentSlide].image})` }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-red-900/30 mix-blend-multiply" />
          </motion.div>
        </AnimatePresence>

        <div className="absolute inset-0 flex flex-col justify-end p-12 lg:p-20 text-white z-20">
          <motion.div
            key={`content-${currentSlide}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="mb-12"
          >
            <div className="flex items-center gap-2 mb-4 text-red-400 font-medium tracking-wide text-sm uppercase">
               <span className="w-8 h-0.5 bg-red-500 rounded-full"></span>
               Community Impact
            </div>
            <h2 className="text-4xl lg:text-5xl font-bold leading-tight mb-4">
              "{SLIDES[currentSlide].quote}"
            </h2>
            <p className="text-lg text-gray-300 max-w-lg">
              {SLIDES[currentSlide].subtext}
            </p>
          </motion.div>

          {/* Stats Bar */}
          <div className="grid grid-cols-2 gap-6 pt-8 border-t border-white/10">
            {STATS.map((stat, idx) => (
               <motion.div 
                 key={idx}
                 initial={{ opacity: 0, y: 10 }}
                 animate={{ opacity: 1, y: 0 }}
                 transition={{ delay: 0.5 + (idx * 0.1) }}
                 className="flex items-center gap-3"
               >
                 <div className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center text-red-400">
                   <stat.icon className="w-5 h-5" />
                 </div>
                 <div>
                   <div className="text-xl font-bold">{stat.value}</div>
                   <div className="text-xs text-gray-400 uppercase tracking-wider">{stat.label}</div>
                 </div>
               </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
