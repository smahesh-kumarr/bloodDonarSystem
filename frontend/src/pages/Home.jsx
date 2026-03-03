import React, { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthContext from "../context/AuthContext";
import {
  Heart,
  Droplet,
  Search,
  MapPin,
  ArrowRight,
  Users,
  Clock,
  Shield,
  Activity,
  PhoneCall,
  Menu,
  X,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

const Home = () => {
  const { user, logout } = useContext(AuthContext);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [bloodGroup, setBloodGroup] = useState("");
  const [location, setLocation] = useState("");
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    navigate(
      `/find-donors?bloodGroup=${encodeURIComponent(bloodGroup)}&city=${encodeURIComponent(location)}`,
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-gray-900 selection:bg-red-100 selection:text-red-900">
      {/* Navbar divider */}
      <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-md shadow-sm border-b border-gray-100 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex-shrink-0 flex items-center gap-2">
              <div className="bg-red-600 p-2 rounded-lg">
                <Droplet className="h-6 w-6 text-white" />
              </div>
              <Link
                to="/"
                className="font-bold text-2xl tracking-tight text-red-600"
              >
                Redora
              </Link>
            </div>

            {/* Desktop Menu */}
            <div className="hidden md:flex space-x-8 items-center">
              <Link
                to="/"
                className="text-gray-600 hover:text-red-600 font-medium transition-colors"
              >
                Home
              </Link>
              <Link
                to="/find-donors"
                className="text-gray-600 hover:text-red-600 font-medium transition-colors"
              >
                Find Donors
              </Link>
              <Link
                to="/requests"
                className="text-gray-600 hover:text-red-600 font-medium transition-colors"
              >
                Requests
              </Link>
              <Link
                to="/donor-dashboard"
                className="text-gray-600 hover:text-red-600 font-medium transition-colors"
              >
                Donor Dashboard
              </Link>
              {user ? (
                <div className="flex items-center gap-4">
                  <span className="font-bold text-gray-800 flex items-center gap-2 bg-red-50 px-3 py-1.5 rounded-full border border-red-100">
                    <span className="w-6 h-6 bg-red-600 text-white rounded-full flex items-center justify-center text-xs">
                      {user.name?.charAt(0).toUpperCase() || "U"}
                    </span>
                    {user.name || "User"}
                  </span>
                  <button
                    onClick={logout}
                    className="bg-red-50 text-red-600 px-5 py-2 rounded-full font-medium hover:bg-red-100 transition-all border border-red-100"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <Link
                  to="/login"
                  className="bg-red-50 text-red-600 px-5 py-2 rounded-full font-medium hover:bg-red-100 transition-all border border-red-100"
                >
                  Login / Register
                </Link>
              )}
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden flex items-center">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="text-gray-600 hover:text-red-600 focus:outline-none"
              >
                {isMenuOpen ? (
                  <X className="h-7 w-7" />
                ) : (
                  <Menu className="h-7 w-7" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden bg-white border-t border-gray-100 absolute w-full shadow-lg pb-4">
            <div className="flex flex-col px-4 pt-2 space-y-3">
              <Link
                to="/"
                className="block px-3 py-2 text-base font-medium text-gray-700 hover:bg-red-50 hover:text-red-600 rounded-md"
              >
                Home
              </Link>
              <Link
                to="/find-donors"
                className="block px-3 py-2 text-base font-medium text-gray-700 hover:bg-red-50 hover:text-red-600 rounded-md"
              >
                Find Donors
              </Link>
              <Link
                to="/requests"
                className="block px-3 py-2 text-base font-medium text-gray-700 hover:bg-red-50 hover:text-red-600 rounded-md"
              >
                Requests
              </Link>
              <Link
                to="/donor-dashboard"
                className="block px-3 py-2 text-base font-medium text-gray-700 hover:bg-red-50 hover:text-red-600 rounded-md"
              >
                Donor Dashboard
              </Link>
              {user ? (
                <>
                  <div className="flex items-center gap-3 px-3 py-2 text-base font-bold text-gray-800 bg-red-50 rounded-md">
                    <span className="w-8 h-8 bg-red-600 text-white rounded-full flex items-center justify-center text-sm">
                      {user.name?.charAt(0).toUpperCase() || "U"}
                    </span>
                    {user.name || "User"}
                  </div>
                  <button
                    onClick={logout}
                    className="w-full text-left block px-3 py-2 mt-2 text-base font-medium bg-red-50 text-red-700 rounded-md"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <Link
                  to="/login"
                  className="block px-3 py-2 mt-2 text-base font-medium bg-red-600 text-white text-center rounded-md"
                >
                  Login / Register
                </Link>
              )}
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-red-600 via-red-700 to-rose-900 text-white overflow-hidden py-20 lg:py-28">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/30 border border-red-400/30 text-sm font-medium backdrop-blur-sm">
                <Activity className="h-4 w-4" />
                <span>Save Lives Today</span>
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-7xl font-extrabold tracking-tight leading-tight">
                Every Drop Counts. <br />
                <span className="text-red-200">Every Life Matters.</span>
              </h1>
              <p className="text-lg sm:text-xl text-red-50 max-w-xl font-light">
                Redora connects voluntary blood donors with precisely matched
                recipients in real-time. Join our modern healthcare network and
                become a lifeline in emergencies.
              </p>

              {/* Quick Search Widget */}
              <div className="bg-white/10 backdrop-blur-md p-4 sm:p-5 rounded-2xl border border-white/20 shadow-xl max-w-2xl">
                <form
                  onSubmit={handleSearch}
                  className="flex flex-col sm:flex-row gap-3"
                >
                  <div className="flex-1 relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Heart className="h-5 w-5 text-red-200" />
                    </div>
                    <select
                      value={bloodGroup}
                      onChange={(e) => setBloodGroup(e.target.value)}
                      className="block w-full pl-10 pr-3 py-3 border-0 bg-white/20 text-white placeholder-red-200 focus:ring-2 focus:ring-white rounded-xl sm:text-sm shadow-sm appearance-none outline-none backdrop-blur-sm transition-all"
                    >
                      <option value="" className="text-gray-900">
                        Blood Group
                      </option>
                      {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map(
                        (bg) => (
                          <option key={bg} value={bg} className="text-gray-900">
                            {bg}
                          </option>
                        ),
                      )}
                    </select>
                  </div>
                  <div className="flex-1 relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <MapPin className="h-5 w-5 text-red-200" />
                    </div>
                    <input
                      type="text"
                      placeholder="Location or City"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      className="block w-full pl-10 pr-3 py-3 border-0 bg-white/20 text-white placeholder-red-100 focus:ring-2 focus:ring-white rounded-xl sm:text-sm shadow-sm outline-none backdrop-blur-sm transition-all"
                    />
                  </div>
                  <button
                    type="submit"
                    className="flex-shrink-0 bg-white text-red-700 hover:bg-gray-50 flex items-center justify-center px-6 py-3 border border-transparent text-base font-bold rounded-xl shadow-md transition-all sm:w-auto w-full group"
                  >
                    <Search className="h-5 w-5 mr-2 group-hover:scale-110 transition-transform" />
                    Find Blood
                  </button>
                </form>
              </div>

              <div className="pt-4 flex flex-wrap gap-4">
                <Link
                  to="/donor-dashboard"
                  className="px-6 py-3 rounded-xl bg-red-600 text-white font-medium hover:bg-red-500 border border-red-500 shadow-lg shadow-red-900/20 transition-all flex items-center"
                >
                  Donor Dashboard <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
                <Link
                  to="/register"
                  className="px-6 py-3 rounded-xl bg-transparent text-white font-medium hover:bg-white/10 border border-red-300 transition-all"
                >
                  Register as Donor
                </Link>
              </div>
            </div>

            <div className="hidden lg:block relative text-center">
              {/* Abstract decorative hero illustration element */}
              <div className="absolute inset-0 bg-gradient-to-tr from-white/20 to-transparent blur-3xl rounded-full scale-150 animate-pulse"></div>
              <img
                src="https://images.unsplash.com/photo-1615461066841-6116e61058f4?auto=format&fit=crop&q=80&w=800"
                alt="Blood Donation"
                className="relative z-10 w-full max-w-lg mx-auto rounded-3xl shadow-2xl border-4 border-white/20 object-cover aspect-square"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Statistics Section */}
      <section className="py-12 bg-white border-b border-gray-100 relative -mt-10 z-20 max-w-6xl mx-auto rounded-3xl shadow-lg sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 px-4 sm:px-0">
          <div className="flex flex-col items-center p-6 text-center group">
            <div className="bg-red-50 text-red-600 p-4 rounded-full mb-4 group-hover:scale-110 transition-transform duration-300">
              <Clock className="w-8 h-8" />
            </div>
            <h3 className="text-4xl font-extrabold text-gray-900 mb-2">
              2 <span className="text-2xl text-gray-500">secs</span>
            </h3>
            <p className="text-gray-600 font-medium">Someone needs blood</p>
          </div>
          <div className="flex flex-col items-center p-6 text-center border-t md:border-t-0 md:border-l border-gray-100 group">
            <div className="bg-red-50 text-red-600 p-4 rounded-full mb-4 group-hover:scale-110 transition-transform duration-300">
              <Users className="w-8 h-8" />
            </div>
            <h3 className="text-4xl font-extrabold text-gray-900 mb-2">
              3 <span className="text-2xl text-gray-500">Lives</span>
            </h3>
            <p className="text-gray-600 font-medium">Saved per 1 donation</p>
          </div>
          <div className="flex flex-col items-center p-6 text-center border-t md:border-t-0 md:border-l border-gray-100 group">
            <div className="bg-red-50 text-red-600 p-4 rounded-full mb-4 group-hover:scale-110 transition-transform duration-300">
              <Activity className="w-8 h-8" />
            </div>
            <h3 className="text-4xl font-extrabold text-gray-900 mb-2">
              40k+ <span className="text-2xl text-gray-500">Units</span>
            </h3>
            <p className="text-gray-600 font-medium">Required daily</p>
          </div>
        </div>
      </section>

      {/* Why Donate Blood Section */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-red-600 font-semibold tracking-wide uppercase mb-2">
              The Impact
            </h2>
            <h3 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Why Donate Blood?
            </h3>
            <p className="text-gray-600 text-lg">
              Blood is the most precious gift that anyone can give to another
              person. A decision to donate your blood can save a life.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-gray-100 text-center flex flex-col items-center">
              <div className="bg-rose-100 text-red-600 w-16 h-16 rounded-2xl flex items-center justify-center mb-6">
                <Heart className="w-8 h-8" />
              </div>
              <h4 className="text-xl font-bold text-gray-900 mb-3">
                Save 3 Lives
              </h4>
              <p className="text-gray-600 leading-relaxed">
                Just one pint of donated blood can help save up to three lives
                in emergency.
              </p>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-gray-100 text-center flex flex-col items-center">
              <div className="bg-rose-100 text-red-600 w-16 h-16 rounded-2xl flex items-center justify-center mb-6">
                <Shield className="w-8 h-8" />
              </div>
              <h4 className="text-xl font-bold text-gray-900 mb-3">
                Safe & Sterile
              </h4>
              <p className="text-gray-600 leading-relaxed">
                All donations use sterile, single-use equipment making the
                process 100% safe.
              </p>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-gray-100 text-center flex flex-col items-center">
              <div className="bg-rose-100 text-red-600 w-16 h-16 rounded-2xl flex items-center justify-center mb-6">
                <Activity className="w-8 h-8" />
              </div>
              <h4 className="text-xl font-bold text-gray-900 mb-3">
                Quick Recovery
              </h4>
              <p className="text-gray-600 leading-relaxed">
                You will replenish the donated plasma within 24 hours. Red cells
                within 4 weeks.
              </p>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-gray-100 text-center flex flex-col items-center">
              <div className="bg-rose-100 text-red-600 w-16 h-16 rounded-2xl flex items-center justify-center mb-6">
                <Droplet className="w-8 h-8 fill-current" />
              </div>
              <h4 className="text-xl font-bold text-gray-900 mb-3">
                Irreplaceable
              </h4>
              <p className="text-gray-600 leading-relaxed">
                Human blood cannot be manufactured. It can only come from
                generous donors.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How Redora Works */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-red-600 font-semibold tracking-wide uppercase mb-2">
              Process
            </h2>
            <h3 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              How Redora Works
            </h3>
            <p className="text-gray-600 text-lg">
              Seamlessly connect donors with those in need through our
              streamlined digital process.
            </p>
          </div>

          <div className="relative">
            {/* Connecting line (hidden on mobile) */}
            <div className="hidden lg:block absolute top-[45%] left-[10%] right-[10%] h-1 bg-red-100 -z-10 rounded-full"></div>

            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-8">
              {[
                { step: "1", title: "Register", desc: "Create an account" },
                { step: "2", title: "Search", desc: "Find nearby donors" },
                { step: "3", title: "Request", desc: "Send emergency alert" },
                { step: "4", title: "Accept", desc: "Donor confirms" },
                { step: "5", title: "Save Life", desc: "Donate blood" },
              ].map((item, index) => (
                <div
                  key={index}
                  className="flex flex-col items-center text-center relative group"
                >
                  <div className="w-16 h-16 rounded-full bg-white border-4 border-red-100 flex items-center justify-center text-xl font-bold text-red-600 mb-4 group-hover:border-red-600 group-hover:bg-red-50 transition-colors bg-clip-padding relative z-10 shadow-sm">
                    {item.step}
                  </div>
                  <h4 className="text-lg font-bold text-gray-900">
                    {item.title}
                  </h4>
                  <p className="text-sm text-gray-500 mt-1">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Awareness Image Section */}
      <section className="py-20 bg-slate-50 border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-3xl shadow-xl overflow-hidden flex flex-col md:flex-row">
            <div className="md:w-1/2 min-h-[300px] md:min-h-full">
              <img
                src="https://images.unsplash.com/photo-1542884748-2b87b36c6b90?auto=format&fit=crop&q=80&w=1000"
                alt="Voluntary Blood Donation"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="md:w-1/2 p-10 lg:p-16 flex flex-col justify-center">
              <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center mb-6">
                <Shield className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-6 leading-tight">
                Be a Hero. <br /> Be a{" "}
                <span className="text-red-600">Voluntary</span> Donor.
              </h3>
              <p className="text-gray-600 text-lg mb-8 leading-relaxed">
                Voluntary blood donors are the foundation of a safe blood
                supply. Your regular contributions ensure that safe blood is
                available whenever and wherever it is needed. Step up today.
              </p>
              <ul className="space-y-4 mb-8">
                {[
                  "Boosts heart health",
                  "Reduces cancer risk",
                  "Free health screening",
                ].map((point, i) => (
                  <li key={i} className="flex items-center text-gray-700">
                    <CheckCircle2 className="w-5 h-5 text-green-500 mr-3 shrink-0" />
                    {point}
                  </li>
                ))}
              </ul>
              <div>
                <Link
                  to="/register"
                  className="inline-flex items-center px-6 py-3 bg-gray-900 text-white font-medium rounded-xl hover:bg-gray-800 transition-colors"
                >
                  Join The Registry <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Emergency CTA Banner */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-red-600 rounded-3xl shadow-2xl shadow-red-900/20 p-8 md:p-12 flex flex-col md:flex-row items-center justify-between relative overflow-hidden">
            {/* Background design */}
            <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 rounded-full border-8 border-red-500/30 opacity-50"></div>
            <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-40 h-40 rounded-full border-8 border-red-500/30 opacity-50"></div>

            <div className="relative z-10 md:w-2/3 text-center md:text-left mb-8 md:mb-0">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-800/40 text-red-100 text-sm font-semibold mb-6">
                <AlertCircle className="w-4 h-4 text-red-200" />
                Critical Need
              </div>
              <h3 className="text-3xl md:text-5xl font-bold text-white mb-4">
                Need Blood Urgently?
              </h3>
              <p className="text-red-100 text-lg md:text-xl max-w-2xl">
                Don't panic. Search our network of available registered donors
                in your local area and contact them directly.
              </p>
            </div>

            <div className="relative z-10 flex flex-col sm:flex-row gap-4">
              <Link
                to="/find-donors"
                className="px-8 py-4 bg-white text-red-700 font-bold rounded-2xl hover:bg-gray-50 hover:scale-105 transition-all shadow-lg flex items-center justify-center text-lg"
              >
                <Search className="w-5 h-5 mr-2" />
                Find Nearby Donors
              </Link>
              <a
                href="tel:104"
                className="px-8 py-4 bg-red-800 text-white font-bold rounded-2xl hover:bg-red-900 hover:scale-105 transition-all shadow-lg flex items-center justify-center text-lg border border-red-500"
              >
                <PhoneCall className="w-5 h-5 mr-2" />
                Dial 104
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-12 lg:py-16 border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
            {/* Brand */}
            <div className="space-y-6">
              <div className="flex items-center gap-2">
                <div className="bg-red-600 p-1.5 rounded-lg inline-flex">
                  <Droplet className="h-6 w-6 text-white" />
                </div>
                <span className="font-bold text-2xl tracking-tight text-white">
                  Redora
                </span>
              </div>
              <p className="text-gray-400 text-sm leading-relaxed">
                A modern healthcare platform bringing volunteers and patients
                together. We aim to ensure no one suffers from blood shortage
                during emergencies.
              </p>
              <div className="flex space-x-4">
                {/* Social placeholders */}
                <div className="w-8 h-8 rounded bg-gray-800 hover:bg-red-600 flex items-center justify-center cursor-pointer transition-colors">
                  <span className="sr-only">Facebook</span>f
                </div>
                <div className="w-8 h-8 rounded bg-gray-800 hover:bg-red-600 flex items-center justify-center cursor-pointer transition-colors">
                  <span className="sr-only">Twitter</span>t
                </div>
                <div className="w-8 h-8 rounded bg-gray-800 hover:bg-red-600 flex items-center justify-center cursor-pointer transition-colors">
                  <span className="sr-only">Instagram</span>in
                </div>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="text-white font-bold text-lg mb-6">Quick Links</h4>
              <ul className="space-y-3">
                <li>
                  <Link to="/" className="hover:text-red-500 transition-colors">
                    Home
                  </Link>
                </li>
                <li>
                  <Link
                    to="/find-donors"
                    className="hover:text-red-500 transition-colors"
                  >
                    Find Donors
                  </Link>
                </li>
                <li>
                  <Link
                    to="/donor-dashboard"
                    className="hover:text-red-500 transition-colors"
                  >
                    Donor Dashboard
                  </Link>
                </li>
                <li>
                  <Link
                    to="/login"
                    className="hover:text-red-500 transition-colors"
                  >
                    Login / Register
                  </Link>
                </li>
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h4 className="text-white font-bold text-lg mb-6">
                Legal & Info
              </h4>
              <ul className="space-y-3">
                <li>
                  <a href="#" className="hover:text-red-500 transition-colors">
                    About Us
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-red-500 transition-colors">
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-red-500 transition-colors">
                    Terms of Service
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-red-500 transition-colors">
                    Donation Guidelines
                  </a>
                </li>
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h4 className="text-white font-bold text-lg mb-6">Contact Us</h4>
              <ul className="space-y-4">
                <li className="flex items-start">
                  <MapPin className="h-5 w-5 mr-3 text-red-500 shrink-0" />
                  <span className="text-sm">
                    123 Health Ave, Medical District, Cityville, ST 12345
                  </span>
                </li>
                <li className="flex items-center">
                  <PhoneCall className="h-5 w-5 mr-3 text-red-500 shrink-0" />
                  <span className="text-sm">+1 (800) RED-BLOOD</span>
                </li>
                <li className="flex items-center">
                  <Heart className="h-5 w-5 mr-3 text-red-500 shrink-0" />
                  <span className="text-sm">support@redora.com</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-12 pt-8 flex flex-col md:flex-row items-center justify-between">
            <p className="text-gray-500 text-sm">
              &copy; {new Date().getFullYear()} Redora. All rights reserved.
            </p>
            <p className="text-gray-500 text-sm mt-2 md:mt-0 flex items-center">
              Made with{" "}
              <Heart className="w-4 h-4 mx-1 text-red-600 fill-current" /> to
              save lives.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
