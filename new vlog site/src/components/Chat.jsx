// src/components/Chat.jsx
import { useState } from 'react'


export default function Chat() {
const [messages, setMessages] = useState([
{ id: 1, text: "Hey love, how's your day going?", from: 'them' },
{ id: 2, text: 'Just thinking about you 💙', from: 'me' },
])
const [text, setText] = useState('')


function sendMessage(e) {
e.preventDefault()
if (!text.trim()) return
setMessages([...messages, { id: Date.now(), text, from: 'me' }])
setText('')
}


return (
<div className="chat-container">
<div className="chat-header">Chat With Me 💌</div>
<div className="chat-box">
{messages.map((m) => (
<p key={m.id} className={`message ${m.from === 'me' ? 'sent' : 'received'}`}>
{m.text}
</p>
))}
</div>
<form className="chat-input" onSubmit={sendMessage}>
<input value={text} onChange={(e) => setText(e.target.value)} placeholder="Type a sweet message..." />
<button type="submit">Send</button>
</form>
</div>
)
}