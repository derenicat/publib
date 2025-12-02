import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast'; // Import toast

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  // const [localError, setLocalError] = useState(''); // Artık toast kullanılacak

  const { login, loading } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    // setLocalError(''); // Artık toast kullanılacak

    const result = await login(email, password);

    if (result.success) {
      toast.success('Login successful!'); // Başarılı girişte toast
      navigate('/profile'); // Başarılı girişte profile git
    } else {
      toast.error(result.error); // Hata durumunda toast
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
      <div className="w-full max-w-md bg-surface p-8 rounded-2xl border border-border shadow-xl">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-white">Welcome Back</h2>
          <p className="text-secondary mt-2">Sign in to continue to Publib</p>
        </div>

        {/* {localError && ( // Error bloğu artık kullanılmayacak
          <div className="bg-danger/10 border border-danger text-danger text-sm rounded-lg p-3 mb-4">
            {localError}
          </div>
        )} */}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-300 mb-1"
            >
              Email Address
            </label>
            <input
              id="email"
              type="email"
              required
              className="w-full bg-background border border-border rounded-lg px-4 py-2 text-white focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-colors"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-300"
              >
                Password
              </label>
              <Link
                to="/forgot-password"
                className="text-xs text-accent hover:text-blue-400"
              >
                Forgot password?
              </Link>
            </div>
            <input
              id="password"
              type="password"
              required
              className="w-full bg-background border border-border rounded-lg px-4 py-2 text-white focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-colors"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full bg-accent hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent focus:ring-offset-surface ${
              loading ? 'opacity-70 cursor-not-allowed' : ''
            }`}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-secondary">
          Don't have an account?{' '}
          <Link
            to="/register"
            className="text-accent hover:text-blue-400 font-medium"
          >
            Register
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
