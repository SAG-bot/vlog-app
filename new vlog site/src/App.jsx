import Header from './components/Header'
import VideoUpload from './components/VideoUpload'
import VideoList from './components/VideoList'
import Chat from './components/Chat'

export default function App() {
  return (
    <div>
      <Header />
      <section>
        <h2>Vlogs</h2>
        <VideoUpload />
        <VideoList />
        <Chat />
      </section>
    </div>
  )
}
