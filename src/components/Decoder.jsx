import { useRef, useState } from "react";
import decoderImage from "../../Dekodery-telewizyjne.jpg";

const AUDIO_SRC = "/Butelka dekoder TV TRWAM - HD.mp3";
const PLAYS_KEY = "dekoder-plays";

function readPlays() {
  try {
    const value = Number(localStorage.getItem(PLAYS_KEY));
    return Number.isFinite(value) && value >= 0 ? Math.floor(value) : 0;
  } catch {
    return 0;
  }
}

function rememberPlays(count) {
  try {
    localStorage.setItem(PLAYS_KEY, String(count));
  } catch {
    // Licznik zostaje w pamięci, gdy przeglądarka blokuje zapis.
  }
}

function playsLabel(count) {
  const mod10 = count % 10;
  const mod100 = count % 100;
  if (count === 1) return "1 odsłuchanie";
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) {
    return `${count} odsłuchania`;
  }
  return `${count} odsłuchań`;
}

// Położenie przycisku POWER na zdjęciu, w procentach kadru.
// left / width liczone od lewej krawędzi, top / height od górnej.
// Przesunięcie: większe left = w prawo, większe top = w dół.
const POWER_HIT = {
  left: "67.5%",
  top: "56.2%",
  width: "4.4%",
  height: "6.6%",
};

// CH− ścisza, CH+ podgłaśnia. Te same procenty kadru co POWER.
const VOLUME_DOWN_HIT = {
  left: "60.5%",
  top: "56.2%",
  width: "3.8%",
  height: "6.6%",
};

const VOLUME_UP_HIT = {
  left: "64.0%",
  top: "56.2%",
  width: "3.8%",
  height: "6.6%",
};

const VOLUME_STEP = 0.1;

const TICKER =
  "NA ŻYWO    ·    BUTELKA — DEKODER TV TRWAM    ·    NASTĘPNIE: ZNÓW TO SAMO    ·    ";

// Dioda nad przyciskiem POWER, w procentach kadru.
const LED = {
  left: "68.9%",
  top: "54.6%",
  width: "1.15%",
  height: "1.7%",
};

export default function Decoder() {
  const audioRef = useRef(null);
  const [playing, setPlaying] = useState(false);
  const [plays, setPlays] = useState(readPlays);
  const [volume, setVolume] = useState(1);

  function changeVolume(direction) {
    const audio = audioRef.current;
    setVolume((current) => {
      const next = Math.min(
        1,
        Math.max(0, Math.round((current + direction * VOLUME_STEP) * 10) / 10),
      );
      if (audio) audio.volume = next;
      return next;
    });
  }

  async function togglePlayback() {
    const audio = audioRef.current;
    if (!audio) return;

    if (!audio.paused) {
      audio.pause();
      setPlaying(false);
      return;
    }

    try {
      await audio.play();
      setPlaying(true);
      setPlays((count) => {
        const next = count + 1;
        rememberPlays(next);
        return next;
      });
    } catch (error) {
      console.error(error);
    }
  }

  return (
    <main className="stage">
      <figure className="decoder">
        <div className="photo">
          <img src={decoderImage} alt="Dekoder Esperanza DVB-T" />
          <span
            className={playing ? "led on" : "led"}
            style={LED}
            aria-hidden="true"
          />
          <button
            type="button"
            className="vol"
            style={VOLUME_DOWN_HIT}
            aria-label="Ścisz przyciskiem CH−"
            onClick={() => changeVolume(-1)}
          />
          <button
            type="button"
            className="vol"
            style={VOLUME_UP_HIT}
            aria-label="Podgłośnij przyciskiem CH+"
            onClick={() => changeVolume(1)}
          />
          <button
            type="button"
            className={playing ? "power playing" : "power"}
            style={POWER_HIT}
            aria-label={playing ? "Zatrzymaj piosenkę" : "Włącz piosenkę przyciskiem POWER"}
            aria-pressed={playing}
            onClick={togglePlayback}
          />
          {playing && (
            <div className="mtv" aria-hidden="true">
              <div className="mtv-bug">MTV</div>
              <div className="mtv-window">
                <div className="mtv-track">
                  <span>{TICKER}</span>
                  <span>{TICKER}</span>
                </div>
              </div>
            </div>
          )}
        </div>
        <figcaption>
          <p className="demot-title">Butelka</p>
          <p className="demot-sub">
            {playing
              ? "Gra. Kliknij POWER jeszcze raz, żeby zatrzymać."
              : "Kliknij przycisk POWER na dekoderze, żeby puścić muzykę."}
          </p>
          <p className="demot-count">
            {playsLabel(plays)} · głośność {Math.round(volume * 100)}%
          </p>
        </figcaption>
      </figure>
      <audio
        ref={audioRef}
        src={AUDIO_SRC}
        preload="auto"
        onEnded={() => setPlaying(false)}
      />
    </main>
  );
}
