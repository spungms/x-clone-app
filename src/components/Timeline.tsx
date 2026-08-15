import { useEffect, useState, type FormEvent } from 'react'
import type { Session } from '@supabase/supabase-js'
import { supabase } from '../lib/supabaseClient'
import type { Tweet } from '../types'

interface TimelineProps {
  session: Session
}

export function Timeline({ session }: TimelineProps) {
  const [tweets, setTweets] = useState<Tweet[]>([])
  const [content, setContent] = useState('')
  const [posting, setPosting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const username = (session.user.user_metadata?.username as string) || session.user.email!.split('@')[0]

  useEffect(() => {
    const fetchTweets = async () => {
      const { data, error } = await supabase
        .from('tweets')
        .select('*')
        .order('created_at', { ascending: false })
      if (error) setError(error.message)
      else setTweets(data as Tweet[])
    }
    fetchTweets()

    const channel = supabase
      .channel('tweets-realtime')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'tweets' },
        (payload) => {
          setTweets((prev) => [payload.new as Tweet, ...prev])
        }
      )
      .on(
        'postgres_changes',
        { event: 'DELETE', schema: 'public', table: 'tweets' },
        (payload) => {
          setTweets((prev) => prev.filter((t) => t.id !== (payload.old as Tweet).id))
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  const handlePost = async (e: FormEvent) => {
    e.preventDefault()
    if (!content.trim()) return
    setPosting(true)
    setError(null)

    const { error } = await supabase.from('tweets').insert({
      user_id: session.user.id,
      username,
      content: content.trim(),
    })

    if (error) setError(error.message)
    else setContent('')

    setPosting(false)
  }

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from('tweets').delete().eq('id', id)
    if (error) setError(error.message)
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
  }

  return (
    <div className="timeline-container">
      <header className="timeline-header">
        <h1>つぶやきアプリ</h1>
        <div className="timeline-user">
          <span>@{username}</span>
          <button onClick={handleSignOut}>ログアウト</button>
        </div>
      </header>

      <form className="tweet-form" onSubmit={handlePost}>
        <textarea
          placeholder="いまどうしてる？"
          value={content}
          maxLength={280}
          onChange={(e) => setContent(e.target.value)}
        />
        <div className="tweet-form-footer">
          <span className="tweet-form-count">{content.length}/280</span>
          <button type="submit" disabled={posting || !content.trim()}>
            {posting ? '投稿中...' : 'つぶやく'}
          </button>
        </div>
      </form>

      {error && <p className="auth-error">{error}</p>}

      <ul className="tweet-list">
        {tweets.map((tweet) => (
          <li key={tweet.id} className="tweet-item">
            <div className="tweet-item-header">
              <span className="tweet-username">@{tweet.username}</span>
              <span className="tweet-date">
                {new Date(tweet.created_at).toLocaleString('ja-JP')}
              </span>
            </div>
            <p className="tweet-content">{tweet.content}</p>
            {tweet.user_id === session.user.id && (
              <button className="tweet-delete" onClick={() => handleDelete(tweet.id)}>
                削除
              </button>
            )}
          </li>
        ))}
      </ul>
    </div>
  )
}
