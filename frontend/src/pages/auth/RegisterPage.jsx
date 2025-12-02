import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast'; // Import toast

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    passwordConfirm: ''
  });
  // const [localError, setLocalError] = useState(''); // Artık toast kullanılacak
  
  const { register, loading } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // setLocalError(''); // Artık toast kullanılacak

    if (formData.password !== formData.passwordConfirm) {
      toast.error('Passwords do not match'); // Toast ile hata göster
      return;
    }
    
    const result = await register(formData);
    
    if (result.success) {
      toast.success('Registration successful!'); // Başarılı kayıtta toast
      navigate('/profile');
    } else {
      toast.error(result.error); // Hata durumunda toast
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
      <div className="w-full max-w-md bg-surface p-8 rounded-2xl border border-border shadow-xl">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-white">Create Account</h2>
          <p className="text-secondary mt-2">Join the Publib community</p>
        </div>

        {/* {localError && ( // Error bloğu artık kullanılmayacak
          <div className="bg-danger/10 border border-danger text-danger text-sm rounded-lg p-3 mb-4">
            {localError}
          </div>
        )} */}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-300 mb-1">
              Username
            </label>
            <input
              id="username"
              name="username"
              type="text"
              required
              className="w-full bg-background border border-border rounded-lg px-4 py-2 text-white focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-colors"
              placeholder="johndoe"
              value={formData.username}
              onChange={handleChange}
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1">
              Email Address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              className="w-full bg-background border border-border rounded-lg px-4 py-2 text-white focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-colors"
              placeholder="you@example.com"
              value={formData.email}
              onChange={handleChange}
            />
          </div>

          <div>
            <label htmlFor="password" class="block text-sm font-medium text-gray-300 mb-1">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              className="w-full bg-background border border-border rounded-lg px-4 py-2 text-white focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-colors"
              placeholder="••••••••"
              value={formData.password}
              onChange={handleChange}
            />
          </div>

          <div>
            <label htmlFor="passwordConfirm" class="block text-sm font-medium text-gray-300 mb-1">
              Confirm Password
            </label>
            <input
              id="passwordConfirm"
              name="passwordConfirm"
              type="password"
              required
              className="w-full bg-background border border-border rounded-lg px-4 py-2 text-white focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-colors"
              placeholder="••••••••"
              value={formData.passwordConfirm}
              onChange={handleChange}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full bg-accent hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent focus:ring-offset-surface ${
              loading ? 'opacity-70 cursor-not-allowed' : ''
            }`}
          >
            {loading ? 'Creating Account...' : 'Register'}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-secondary">
          Already have an account?{' '}
          <Link to="/login" className="text-accent hover:text-blue-400 font-medium">
            Login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
