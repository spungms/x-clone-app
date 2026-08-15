import { useState, type FormEvent } from 'react'
import { supabase } from '../lib/supabaseClient'

export function Auth() {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [username, setUsername] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [infoMessage, setInfoMessage] = useState<string | null>(null)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    setInfoMessage(null)
    setLoading(true)

    if (mode === 'signup') {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { username: username || email.split('@')[0] } },
      })
      if (error) {
        setError(error.message)
      } else {
        setInfoMessage('確認メールを送ったで。メール内のリンクを開いたらログインできるようになるわ。')
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) setError(error.message)
    }

    setLoading(false)
  }

  return (
    <div className="auth-container">
      <h1 className="auth-title">つぶやきアプリ</h1>
      <form className="auth-form" onSubmit={handleSubmit}>
        <h2>{mode === 'signin' ? 'ログイン' : '新規登録'}</h2>

        {mode === 'signup' && (
          <input
            type="text"
            placeholder="ユーザー名"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        )}
        <input
          type="email"
          placeholder="メールアドレス"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="パスワード（6文字以上）"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          minLength={6}
          required
        />

        {error && <p className="auth-error">{error}</p>}
        {infoMessage && <p className="auth-info">{infoMessage}</p>}

        <button type="submit" disabled={loading}>
          {loading ? '処理中...' : mode === 'signin' ? 'ログイン' : '登録する'}
        </button>
      </form>

      <button
        className="auth-switch"
        onClick={() => {
          setMode(mode === 'signin' ? 'signup' : 'signin')
          setError(null)
          setInfoMessage(null)
        }}
      >
        {mode === 'signin' ? 'アカウントを作る' : 'ログインに戻る'}
      </button>
    </div>
  )
}
