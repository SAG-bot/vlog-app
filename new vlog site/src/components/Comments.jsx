// src/components/Comments.jsx
import { useEffect, useState } from 'react'
import { supabase } from '../supabase'


export default function Comments({ videoId }) {
const [comments, setComments] = useState([])
const [text, setText] = useState('')


useEffect(() => {
fetchComments()
}, [])


async function fetchComments() {
const { data, error } = await supabase
.from('comments')
.select('*')
.eq('video_id', videoId)
.order('created_at', { ascending: true })
if (!error) setComments(data)
}


async function addComment() {
const user = (await supabase.auth.getUser()).data.user
if (!user) return alert('Sign in required')


const { error } = await supabase.from('comments').insert([
{ video_id: videoId, content: text, user_id: user.id },
])
if (!error) {
setText('')
fetchComments()
}
}


return (
<div>
<h5>Comments</h5>
{comments.map((c) => (
<p key={c.id}><strong>{c.user_id.slice(0, 6)}:</strong> {c.content}</p>
))}
<input value={text} onChange={(e) => setText(e.target.value)} placeholder="Write a comment" />
<button onClick={addComment}>Post</button>
</div>
)
}