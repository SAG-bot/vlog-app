// src/components/VideoCard.jsx
import { useEffect, useState } from 'react'
import { supabase } from '../supabase'
import Comments from './Comments'
import Likes from './Likes'


export default function VideoCard({ video }) {
const [url, setUrl] = useState(null)


useEffect(() => {
async function load() {
const { data, error } = await supabase.storage
.from('videos')
.createSignedUrl(video.name, 60 * 60)
if (!error) setUrl(data.signedUrl)
}
load()
}, [video.name])


return (
<div className="card">
<h4>{video.name}</h4>
{url && <video src={url} controls width="480" />}
<Likes videoId={video.name} />
<Comments videoId={video.name} />
</div>
)
}