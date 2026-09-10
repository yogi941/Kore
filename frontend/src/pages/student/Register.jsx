import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { UtensilsCrossed, Eye, EyeOff, Sparkles, User, Mail, Lock, Phone, Hash, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';
import { registerUser } from '../../api/authApi';
import useAuth from '../../hooks/useAuth';

const Register = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: '', email: '', password: '', confirmPassword: '', rollNumber: '', phone: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = 'Name is required';
    if (!form.email) errs.email = 'Email is required';
    else if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(form.email))
      errs.email = 'Please enter a valid email address';
    if (!form.password) errs.password = 'Password is required';
    else if (form.password.length < 6) errs.password = 'Password must be at least 6 characters';
    if (form.password !== form.confirmPassword) errs.confirmPassword = 'Passwords do not match';
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({});
    setLoading(true);
    try {
      const { name, email, password, rollNumber, phone } = form;
      const { data } = await registerUser({ name, email, password, rollNumber, phone });
      login(data.data.user, data.data.token);
      toast.success('Account created successfully!');
      navigate('/home');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const fields = [
    { key: 'name', label: 'Full Name', type: 'text', placeholder: 'John Doe', icon: User },
    { key: 'email', label: 'Email Address', type: 'email', placeholder: 'yourname@example.com', icon: Mail },
    { key: 'rollNumber', label: 'Roll Number (optional)', type: 'text', placeholder: '21CS001', icon: Hash },
    { key: 'phone', label: 'Phone Number (optional)', type: 'tel', placeholder: '9876543210', icon: Phone },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50/60 to-orange-100 flex items-center justify-center px-4 py-12 relative overflow-hidden">
      <div className="absolute top-10 right-10 w-72 h-72 bg-orange-300/30 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-10 left-10 w-80 h-80 bg-amber-300/40 rounded-full blur-3xl pointer-events-none"></div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="text-center mb-8">
          <motion.div
            whileHover={{ scale: 1.05, rotate: 6 }}
            whileTap={{ scale: 0.95 }}
            className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-tr from-orange-500 to-amber-500 rounded-2xl mb-4 shadow-xl shadow-orange-500/30 text-white"
          >
            <UtensilsCrossed className="w-8 h-8 stroke-[2.5]" />
          </motion.div>
          <div className="flex items-center justify-center gap-1.5 mb-1">
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Create Account</h1>
            <Sparkles className="w-4 h-4 text-orange-500 animate-pulse" />
          </div>
          <p className="text-slate-500 text-sm font-medium">Join KORE Canteen and pre-order meals</p>
        </div>

        <div className="bg-white rounded-3xl shadow-xl shadow-orange-500/5 border border-orange-100 p-8 backdrop-blur-md">
          <form onSubmit={handleSubmit} className="space-y-4">
            {fields.map(({ key, label, type, placeholder, icon: Icon }) => (
              <div key={key}>
                <label className="block text-xs font-bold text-slate-700 mb-1">{label}</label>
                <div className="relative">
                  <Icon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type={type}
                    placeholder={placeholder}
                    value={form[key]}
                    onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                    style={{ color: '#0f172a', backgroundColor: '#ffffff' }}
                    className={`w-full pl-10 pr-4 py-2.5 border rounded-2xl text-sm font-bold text-slate-900 placeholder-slate-400 outline-none transition-all ${
                      errors[key]
                        ? 'border-rose-400 bg-rose-50/50 text-slate-900'
                        : 'border-slate-200 focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10'
                    }`}
                  />
                </div>
                {errors[key] && <p className="text-xs font-bold text-rose-500 mt-1">{errors[key]}</p>}
              </div>
            ))}

            {/* Password */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Min 6 characters"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  style={{ color: '#0f172a', backgroundColor: '#ffffff' }}
                  className={`w-full pl-10 pr-10 py-2.5 border rounded-2xl text-sm font-bold text-slate-900 placeholder-slate-400 outline-none transition-all ${
                    errors.password ? 'border-rose-400 bg-rose-50/50 text-slate-900' : 'border-slate-200 focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && <p className="text-xs font-bold text-rose-500 mt-1">{errors.password}</p>}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Confirm Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="password"
                  placeholder="Repeat password"
                  value={form.confirmPassword}
                  onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                  style={{ color: '#0f172a', backgroundColor: '#ffffff' }}
                  className={`w-full pl-10 pr-4 py-2.5 border rounded-2xl text-sm font-bold text-slate-900 placeholder-slate-400 outline-none transition-all ${
                    errors.confirmPassword ? 'border-rose-400 bg-rose-50/50 text-slate-900' : 'border-slate-200 focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10'
                  }`}
                />
              </div>
              {errors.confirmPassword && <p className="text-xs font-bold text-rose-500 mt-1">{errors.confirmPassword}</p>}
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 disabled:opacity-50 text-white font-black py-3.5 rounded-2xl transition-all text-sm shadow-xl shadow-orange-500/25 flex items-center justify-center gap-2 mt-4"
            >
              <span>{loading ? 'Creating account...' : 'Create Account'}</span>
              {!loading && <ArrowRight className="w-4 h-4" />}
            </motion.button>
          </form>

          <p className="text-center text-xs text-slate-500 mt-6 font-semibold">
            Already have an account?{' '}
            <Link to="/login" className="text-orange-600 font-black hover:underline">
              Sign in here
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default Register;
