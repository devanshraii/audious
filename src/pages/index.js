
import Head from 'next/head';
import AudioTrimmer from '../components/AudioTrimmer';

export default function Home() {
  return (
    <div>
      <Head>
        <title>Audio Trimmer</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="min-h-screen flex items-center justify-center bg-gray-100">
        <AudioTrimmer />
      </main>
    </div>
  );
}

