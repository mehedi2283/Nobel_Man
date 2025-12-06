import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Lock, Mail, AlertCircle, ArrowLeft, Loader2 } from 'lucide-react';
import { projectService } from '../services/projectService';

interface AdminLoginProps {
  onLogin: () => void;
  onBack: () => void;
}

const AdminLogin: React.FC<AdminLoginProps> = ({ onLogin, onBack }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Authenticate against backend database
      const success = await projectService.login(email, password);
      
      if (success) {
        onLogin();
      } else {
        setError('Invalid credentials. Access denied.');
        setPassword(''); // Clear password field on failure
      }
    } catch (err) {
      setError('Login failed. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-6">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white p-8 md:p-12 rounded-3xl shadow-xl w-full max-w-md relative overflow-hidden"
      >
        <button 
            onClick={onBack}
            className="absolute top-8 left-8 text-gray-400 hover:text-black transition-colors"
        >
            <ArrowLeft size={24} />
        </button>

        <div className="flex flex-col items-center mb-8">
            <div className="w-16 h-16 bg-black rounded-full flex items-center justify-center mb-6 shadow-lg">
                <Lock className="text-white" size={24} />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Admin Access</h1>
            <p className="text-gray-500 mt-2 text-center">Enter your credentials to continue.</p>
        </div>

        {error && (
            <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="bg-red-50 text-red-600 p-4 rounded-lg mb-6 flex items-center gap-2 text-sm"
            >
                <AlertCircle size={16} />
                {error}
            </motion.div>
        )}

        <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Email</label>
                <div className="flex items-center gap-3 border-b border-gray-200 py-2 focus-within:border-black transition-colors">
                    <Mail size={20} className="text-gray-400" />
                    <input 
                        type="email" 
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full outline-none text-gray-900 font-medium bg-transparent"
                        placeholder="admin@example.com"
                        required
                        disabled={loading}
                    />
                </div>
            </div>

            <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Password</label>
                <div className="flex items-center gap-3 border-b border-gray-200 py-2 focus-within:border-black transition-colors">
                    <Lock size={20} className="text-gray-400" />
                    <input 
                        type="password" 
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full outline-none text-gray-900 font-medium bg-transparent"
                        placeholder="Enter Password" 
                        required
                        disabled={loading}
                    />
                </div>
            </div>

            <button 
                type="submit"
                disabled={loading}
                className="w-full bg-black text-white py-4 rounded-xl font-medium hover:bg-gray-800 transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-black/20 flex items-center justify-center gap-2 disabled:opacity-70 disabled:hover:scale-100"
            >
                {loading ? <Loader2 size={20} className="animate-spin" /> : 'Login to Dashboard'}
            </button>
        </form>
      </motion.div>
    </div>
  );
};

export default AdminLogin;