// src/components/VideoUpload.jsx
import { useState } from 'react'
import { supabase } from '../supabase'


export default function VideoUpload({ onUploaded }) {
const [uploading, setUploading] = useState(false)


async function handleUpload(e) {
const file = e.target.files[0]
if (!file) return
setUploading(true)
const filePath = `${Date.now()}-${file.name}`


const { error } = await supabase.storage.from('videos').upload(filePath, file, { upsert: true })
setUploading(false)
if (error) {
alert('Upload failed: ' + error.message)
} else {
onUploaded?.()
}
}


return (
<div className="card">
<h3>Upload a Vlog</h3>
<input type="file" accept="video/*" onChange={handleUpload} disabled={uploading} />
{uploading && <p>Uploading...</p>}
</div>
)
}