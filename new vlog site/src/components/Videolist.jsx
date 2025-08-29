// src/components/VideoList.jsx
import { useEffect, useState } from 'react'
import { supabase } from '../supabase'
import VideoCard from './VideoCard'


export default function VideoList() {
const [videos, setVideos] = useState([])


useEffect(() => {
fetchVideos()
}, [])


async function fetchVideos() {
const { data, error } = await supabase.storage.from('videos').list('', { limit: 100 })
if (!error) setVideos(data)
}


return (
<div className="grid">
{videos.map((v) => (
<VideoCard key={v.id || v.name} video={v} />
))}
</div>
)
}