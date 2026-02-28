import { useState, useContext } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import { toast } from 'react-toastify';
import { Lock, CheckCircle, Eye, EyeOff } from 'lucide-react';
import { motion } from 'framer-motion';

const ResetPassword = () => {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const { resetPassword } = useContext(AuthContext);
    const navigate = useNavigate();
    const { token } = useParams();

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (password !== confirmPassword) {
            toast.error('Passwords do not match');
            return;
        }

        setLoading(true);
        try {
            await resetPassword(token, password);
            toast.success('Password reset successfully!');
            navigate('/');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to reset password');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-red-50 to-gray-100 font-sans">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-md p-8 bg-white rounded-2xl shadow-xl border border-gray-100"
            >
                <div className="text-center mb-8">
                    <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">Set New Password</h2>
                    <p className="mt-2 text-sm text-gray-500">Enter your new secure password</p>
                </div>

                <form className="space-y-6" onSubmit={handleSubmit}>
                    <div className="space-y-4">
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                <Lock className="w-5 h-5 text-gray-400 group-focus-within:text-red-500 transition-colors" />
                            </div>
                            <input
                                type={showPassword ? 'text' : 'password'}
                                required
                                className="block w-full pl-10 pr-10 py-3 text-gray-900 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 sm:text-sm transition-all duration-200 outline-none hover:bg-white"
                                placeholder="New Password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                            <button
                                type="button"
                                className="absolute inset-y-0 right-0 flex items-center pr-3"
                                onClick={() => setShowPassword(!showPassword)}
                            >
                                {showPassword ? (
                                    <EyeOff className="w-5 h-5 text-gray-400 hover:text-red-500 transition-colors" />
                                ) : (
                                    <Eye className="w-5 h-5 text-gray-400 hover:text-red-500 transition-colors" />
                                )}
                            </button>
                        </div>

                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                <CheckCircle className="w-5 h-5 text-gray-400 group-focus-within:text-red-500 transition-colors" />
                            </div>
                            <input
                                type={showConfirmPassword ? 'text' : 'password'}
                                required
                                className="block w-full pl-10 pr-10 py-3 text-gray-900 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 sm:text-sm transition-all duration-200 outline-none hover:bg-white"
                                placeholder="Confirm Password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                            />
                            <button
                                type="button"
                                className="absolute inset-y-0 right-0 flex items-center pr-3"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            >
                                {showConfirmPassword ? (
                                    <EyeOff className="w-5 h-5 text-gray-400 hover:text-red-500 transition-colors" />
                                ) : (
                                    <Eye className="w-5 h-5 text-gray-400 hover:text-red-500 transition-colors" />
                                )}
                            </button>
                        </div>
                    </div>

                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        type="submit"
                        disabled={loading}
                        className={`group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-bold rounded-lg text-white ${loading ? 'bg-red-400 cursor-not-allowed' : 'bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800'} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 shadow-lg shadow-red-200 transition-all duration-200`}
                    >
                         {loading ? (
                            <span>Resetting...</span>
                        ) : (
                            <>
                            <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                                <Lock className="h-4 w-4 text-red-200 group-hover:text-white transition-colors" />
                            </span>
                            Reset Password
                            </>
                        )}
                    </motion.button>
                </form>
            </motion.div>
        </div>
    );
};

export default ResetPassword;
