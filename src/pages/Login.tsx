import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Heart, Eye, EyeOff, LogIn, UserPlus } from 'lucide-react';

interface LoginProps {
  onLogin: (email: string, password: string) => Promise<void>;
  onRegister: (email: string, password: string) => Promise<void>;
}

export default function Login({ onLogin, onRegister }: LoginProps) {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!email.trim() || !password.trim()) {
      setError('请填写邮箱和密码');
      return;
    }
    if (password.length < 6) {
      setError('密码至少6位');
      return;
    }
    setLoading(true);
    try {
      if (isRegister) {
        await onRegister(email.trim(), password);
      } else {
        await onLogin(email.trim(), password);
      }
      navigate('/');
    } catch (err: any) {
      setError(err.message || (isRegister ? '注册失败' : '登录失败'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#f1f5f6] flex items-center justify-center p-4">
      <div className="w-full max-w-[360px] bg-white/60 rounded-2xl shadow-lg border border-[#d1d1d1]/30 p-6">
        <div className="flex flex-col items-center mb-6">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#e1b2b2] to-[#d2e6ec] flex items-center justify-center mb-3">
            <Heart size={20} className="text-white" fill="white" />
          </div>
          <h1 className="text-lg font-medium text-[#5a5a5a]">LOVE TALK</h1>
          <p className="text-xs text-[#8a8a8a] mt-1">
            {isRegister ? '创建账号，开启私密对话' : '登录后同步数据到云端'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs text-[#8a8a8a] mb-1 block">邮箱</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              className="w-full px-3 py-2.5 rounded-lg text-sm bg-[#f1f5f6]/80 border border-[#d1d1d1]/40 text-[#5a5a5a] placeholder:text-[#8a8a8a]/40 focus:outline-none focus:border-[#e1b2b2]/60 transition-colors"
            />
          </div>
          <div>
            <label className="text-xs text-[#8a8a8a] mb-1 block">密码</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="至少6位字符"
                className="w-full px-3 py-2.5 rounded-lg text-sm bg-[#f1f5f6]/80 border border-[#d1d1d1]/40 text-[#5a5a5a] placeholder:text-[#8a8a8a]/40 focus:outline-none focus:border-[#e1b2b2]/60 transition-colors pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#8a8a8a] hover:text-[#5a5a5a]"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {error && (
            <div className="px-3 py-2 rounded-lg bg-[#f1d6d6]/50 text-[#5a5a5a] text-xs">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg bg-[#e1b2b2] text-white text-sm font-medium hover:bg-[#d9a0a0] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? (
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : isRegister ? (
              <>
                <UserPlus size={16} />
                注册账号
              </>
            ) : (
              <>
                <LogIn size={16} />
                登录
              </>
            )}
          </button>
        </form>

        <div className="mt-4 text-center">
          <button
            onClick={() => { setIsRegister(!isRegister); setError(''); }}
            className="text-xs text-[#8a8a8a] hover:text-[#e1b2b2] transition-colors"
          >
            {isRegister ? '已有账号？去登录' : '没有账号？去注册'}
          </button>
        </div>

        <div className="mt-4 pt-4 border-t border-[#d1d1d1]/30 text-center">
          <button
            onClick={() => navigate('/')}
            className="text-xs text-[#8a8a8a]/60 hover:text-[#8a8a8a] transition-colors"
          >
            先不登录，使用本地模式
          </button>
        </div>
      </div>
    </div>
  );
}
