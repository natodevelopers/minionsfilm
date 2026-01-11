import VideoPlayer from './components/VideoPlayer';

export default function Home() {
  return (
    <main
      style={{
        display: 'flex',
        justifyContent: 'center',
        padding: 20,
      }}
    >
      <VideoPlayer />
    </main>
  );
}
