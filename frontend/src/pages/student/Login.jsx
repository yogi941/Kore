import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { UtensilsCrossed, Eye, EyeOff, Lock, Mail, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';
import { loginUser } from '../../api/authApi';
import useAuth from '../../hooks/useAuth';

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('student');
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const errs = {};
    if (!form.email) errs.email = 'Email address is required';
    else if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(form.email))
      errs.email = 'Please enter a valid email address';
    if (!form.password) errs.password = 'Password is required';
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({});
    setLoading(true);
    try {
      const { data } = await loginUser(form);
      login(data.data.user, data.data.token);
      toast.success('Welcome back!');
      const role = data.data.user.role;
      const targetPath = (role === 'canteen_admin' || role === 'super_admin') ? '/admin/dashboard' : '/home';
      
      try {
        navigate(targetPath);
      } catch {
        window.location.href = targetPath;
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50/80 via-amber-50/50 to-orange-100/60 flex items-center justify-center px-4 py-12 relative overflow-hidden">
      {/* Background Accent Glow */}
      <div className="absolute top-10 left-10 w-72 h-72 bg-orange-300/20 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-10 right-10 w-80 h-80 bg-amber-300/30 rounded-full blur-3xl pointer-events-none"></div>

      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md relative z-10"
      >
        {/* Brand Header */}
        <div className="text-center mb-8">
          <motion.div
            whileHover={{ scale: 1.05, rotate: 6 }}
            whileTap={{ scale: 0.95 }}
            className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-tr from-orange-500 to-amber-500 rounded-2xl mb-4 shadow-xl shadow-orange-500/25 text-white"
          >
            <UtensilsCrossed className="w-8 h-8 stroke-[2.5]" />
          </motion.div>
          
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mb-1">
            Welcome to <span className="text-orange-500">KCTEats</span>
          </h1>
          <p className="text-slate-500 text-sm font-medium">Pre-order your food, skip the queue</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/60 border border-slate-200/80 p-8 backdrop-blur-md">
          {/* Tab Selector */}
          <div className="flex p-1 bg-slate-100 rounded-2xl mb-6 border border-slate-200">
            <button
              type="button"
              onClick={() => { setActiveTab('student'); setErrors({}); }}
              className={`flex-1 py-2.5 text-xs font-black rounded-xl transition-all duration-200 ${
                activeTab === 'student'
                  ? 'bg-white text-orange-600 shadow-md shadow-slate-200'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Student
            </button>
            <button
              type="button"
              onClick={() => { setActiveTab('admin'); setErrors({}); }}
              className={`flex-1 py-2.5 text-xs font-black rounded-xl transition-all duration-200 ${
                activeTab === 'admin'
                  ? 'bg-white text-orange-600 shadow-md shadow-slate-200'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Shop Admin
            </button>
          </div>

          <h2 className="text-base font-bold text-slate-800 mb-5">
            {activeTab === 'student' ? 'Sign in to your account' : 'Shop Admin Login'}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email Input */}
            <div>
              <label className="block text-xs font-extrabold text-slate-700 mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="email"
                  placeholder={activeTab === 'student' ? "yourname@kct.ac.in or gmail.com" : "admin@gmail.com"}
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  style={{ color: '#000000', backgroundColor: '#ffffff', fontWeight: '700' }}
                  className={`w-full pl-10 pr-4 py-3 border-2 rounded-2xl text-sm font-bold text-black bg-white placeholder-slate-400 outline-none transition-all ${
                    errors.email
                      ? 'border-rose-500 bg-rose-50/50'
                      : 'border-slate-300 focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10'
                  }`}
                />
              </div>
              {errors.email && <p className="text-xs font-bold text-rose-500 mt-1">{errors.email}</p>}
            </div>

            {/* Password Input */}
            <div>
              <label className="block text-xs font-extrabold text-slate-700 mb-1.5">Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  style={{ color: '#000000', backgroundColor: '#ffffff', fontWeight: '700' }}
                  className={`w-full pl-10 pr-11 py-3 border-2 rounded-2xl text-sm font-bold text-black bg-white placeholder-slate-400 outline-none transition-all ${
                    errors.password
                      ? 'border-rose-500 bg-rose-50/50'
                      : 'border-slate-300 focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 p-1"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && <p className="text-xs font-bold text-rose-500 mt-1">{errors.password}</p>}
            </div>

            {/* Sign In Button */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 disabled:opacity-50 text-white font-black py-3.5 rounded-2xl transition-all text-sm shadow-lg shadow-orange-500/20 flex items-center justify-center gap-2 mt-2"
            >
              <span>{loading ? 'Signing in...' : 'Sign In'}</span>
              {!loading && <ArrowRight className="w-4 h-4" />}
            </motion.button>
          </form>

          <p className="text-center text-xs text-slate-500 mt-6 font-semibold">
            Don't have an account?{' '}
            <Link to="/register" className="text-orange-600 font-extrabold hover:underline">
              Register here
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
