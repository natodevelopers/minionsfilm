'use client';

import { useEffect, useRef, useState } from 'react';
import '../globals.css';

export default function VideoPlayer() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const timelineRef = useRef<HTMLDivElement>(null);

  const [playing, setPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [current, setCurrent] = useState(0);
  const [volume, setVolume] = useState(0.5);
  const [showSpeed, setShowSpeed] = useState(false);
  const [speed, setSpeed] = useState(1);

  /* ---------- helpers ---------- */
  const format = (t: number) => {
    if (!isFinite(t)) return '00:00';
    const m = Math.floor(t / 60)
      .toString()
      .padStart(2, '0');
    const s = Math.floor(t % 60)
      .toString()
      .padStart(2, '0');
    return `${m}:${s}`;
  };

  /* ---------- PLAY / PAUSE ---------- */
  const togglePlay = async () => {
    const v = videoRef.current!;
    try {
      if (v.paused) {
        v.muted = true;
        await v.play();
        v.muted = false;
        setPlaying(true);
      } else {
        v.pause();
        setPlaying(false);
      }
    } catch (e) {
      console.error(e);
    }
  };

  /* ---------- SEEK ---------- */
  const seek = (e: React.MouseEvent<HTMLDivElement>) => {
    const v = videoRef.current!;
    if (!duration) return;
    const rect = timelineRef.current!.getBoundingClientRect();
    v.currentTime = ((e.clientX - rect.left) / rect.width) * duration;
  };

  /* ---------- VOLUME ---------- */
  const changeVolume = (v: number) => {
    const video = videoRef.current!;
    video.volume = v;
    setVolume(v);
  };

  /* ---------- SPEED ---------- */
  const setPlayback = (s: number) => {
    const v = videoRef.current!;
    v.playbackRate = s;
    setSpeed(s);
    setShowSpeed(false);
  };

  /* ---------- PiP ---------- */
  const togglePiP = () => {
    const v = videoRef.current!;
    document.pictureInPictureElement
      ? document.exitPictureInPicture()
      : v.requestPictureInPicture();
  };

  /* ---------- FULLSCREEN ---------- */
  const toggleFullscreen = () => {
    const c = containerRef.current!;
    document.fullscreenElement
      ? document.exitFullscreen()
      : c.requestFullscreen();
  };

  /* ---------- SYNC ---------- */
  useEffect(() => {
    const v = videoRef.current!;
    v.volume = volume;

    const time = () => setCurrent(v.currentTime);
    const meta = () => setDuration(v.duration);

    v.addEventListener('timeupdate', time);
    v.addEventListener('loadedmetadata', meta);

    return () => {
      v.removeEventListener('timeupdate', time);
      v.removeEventListener('loadedmetadata', meta);
    };
  }, []);

  return (
    <div ref={containerRef} className="container show-controls">
      <div className="wrapper">
        <div className="video-timeline" ref={timelineRef} onClick={seek}>
          <div className="progress-area">
            <span>{format(current)}</span>
            <div
              className="progress-bar"
              style={{
                width: duration ? `${(current / duration) * 100}%` : '0%',
              }}
            />
          </div>
        </div>

        <ul className="video-controls">
          {/* LEFT */}
          <li className="options left">
            <button className="volume" title="Mute/Unmute">
              <i
                className={`fa-solid ${
                  volume === 0 ? 'fa-volume-xmark' : 'fa-volume-high'
                }`}
              />
            </button>
            <input
              type="range"
              min="0"
              max="1"
              step="any"
              value={volume}
              onChange={(e) => changeVolume(+e.target.value)}
              title="Volume Control"
            />
            <div className="video-timer">
              <p>{format(current)}</p>
              <p className="separator"> / </p>
              <p>{format(duration)}</p>
            </div>
          </li>

          {/* CENTER */}
          <li className="options center">
            <button onClick={() => (videoRef.current!.currentTime -= 5)} title="Back 5s">
              <i className="fas fa-backward" />
            </button>
            <button onClick={togglePlay} title="Play/Pause">
              <i className={`fas ${playing ? 'fa-pause' : 'fa-play'}`} />
            </button>
            <button onClick={() => (videoRef.current!.currentTime += 5)} title="Forward 5s">
              <i className="fas fa-forward" />
            </button>
          </li>

          {/* RIGHT */}
          <li className="options right">
            <div className="playback-content">
              <button onClick={() => setShowSpeed(!showSpeed)} title="Playback Speed">
                <span className="material-symbols-rounded">
                  slow_motion_video
                </span>
              </button>
              {showSpeed && (
                <ul className="speed-options show">
                  {[2, 1.5, 1, 0.75, 0.5].map((s) => (
                    <li
                      key={s}
                      className={s === speed ? 'active' : ''}
                      onClick={() => setPlayback(s)}
                    >
                      {s === 1 ? 'Normal' : `${s}x`}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <button onClick={togglePiP}>
              <span className="material-icons">picture_in_picture_alt</span>
            </button>

            <button onClick={toggleFullscreen}>
              <i className="fa-solid fa-expand" />
            </button>
          </li>
        </ul>
      </div>

      <video
        ref={videoRef}
        playsInline
        preload="metadata"
        src="https://github.com/natodevelopers/minionsfilm/releases/download/minionsfilm/output.mp4"
      />
    </div>
  );
}
