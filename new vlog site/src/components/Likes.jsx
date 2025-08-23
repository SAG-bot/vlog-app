// src/components/Likes.jsx
import { useEffect, useState } from 'react'
import { supabase } from '../supabase'


export default function Likes({ videoId }) {
const [count, setCount] = useState(0)


useEffect(() => {
fetchLikes()
}, [])


async function fetchLikes() {
const { count } = await supabase
.from('likes')
.select('*', { count: 'exact', head: true })
.eq('video_id', videoId)
setCount(count)
}


async function likeVideo() {
const user = (await supabase.auth.getUser()).data.user
if (!user) return alert('Sign in required')
await supabase.from('likes').insert([{ video_id: videoId, user_id: user.id }])
fetchLikes()
}


return (
<div>
<button onClick={likeVideo}>❤️ Like</button> {count}
</div>
)
}