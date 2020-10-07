import React, { useState, useCallback, useEffect } from 'react';
import './App.css';

const MIN_TEMPO = 30;
const MAX_TEMPO = 200;
const DEFAULT_TEMPO = 150;
const MAX_METER_NUMERATOR = 10;
const DEFAULT_METER_NUMERATOR = 4;
const DEFAULT_METER_DENOMINATOR = 4;
const FREQUENCY = 500;
const MAX_GAIN_VALUE = 0.5;

function App() {
  const [counter, setCounter] = useState(0);
  const [timerId, setTimerId] = useState(null);
  const [tempo, setTempo] = useState(DEFAULT_TEMPO);
  const [meterNumerator, setMeterNumerator] = useState(DEFAULT_METER_NUMERATOR);

  const [gainState, setGainState] = useState({});
  const [currentMaxVolume, setCurrentMaxVolume] = useState(MAX_GAIN_VALUE / 2);

  useEffect(() => {
    let oscillator = {};

    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

    oscillator = audioCtx.createOscillator();
    const gain = audioCtx.createGain();

    oscillator.connect(gain);
    oscillator.frequency.value = FREQUENCY;
    gain.connect(audioCtx.destination);

    oscillator.start(0);

    gain.gain.value = 0;

    setGainState(gain.gain);

    return () => {
      oscillator.stop(0);
    };
  }, []);

  const setGainValue = useCallback(
    value => {
      gainState.value = value;
      setGainState(gainState);
    },
    [gainState]
  );

  const getInterval = useCallback(() => (60 * 1000) / tempo, [tempo]);

  const doTick = useCallback(() => {
    setCounter(counter => (counter + 1 > meterNumerator ? 1 : counter + 1));
    setGainValue(currentMaxVolume);
    setTimeout(() => setGainValue(0), getInterval() / 2);
  }, [meterNumerator, setGainValue, currentMaxVolume, getInterval]);

  const startMetronome = useCallback(() => {
    if (timerId === null) {
      doTick();

      console.log('started');
      setTimerId(
        setInterval(() => {
          doTick();
        }, getInterval())
      );
    } else {
      console.log('blocked');
    }
  }, [doTick, timerId, getInterval]);

  const stopMetronome = useCallback(() => {
    clearInterval(timerId);
    setTimerId(null);
    setCounter(0);
    gainState.value = 0;
    setGainState(gainState);

    console.log('stopped');
  }, [gainState, timerId]);

  const setTempoHandler = useCallback(
    e => {
      stopMetronome();
      setTempo(e.target.value);
      console.log('setTempoHandler');
    },
    [stopMetronome]
  );

  const setMeterNumeratorHandler = useCallback(
    e => {
      stopMetronome();
      setMeterNumerator(+e.target.value);
    },
    [stopMetronome]
  );

  const setMaxGainValueHandler = useCallback(
    e => {
      stopMetronome();
      setCurrentMaxVolume((+e.target.value * MAX_GAIN_VALUE) / 100);
    },
    [stopMetronome]
  );

  const getVolumeInPercents = useCallback(
    () => Math.round((currentMaxVolume / MAX_GAIN_VALUE) * 100),
    [currentMaxVolume]
  );

  return (
    <div className="app-container">
      <button id="start-btn" onClick={startMetronome}>
        Start
      </button>
      <button id="stop-btn" onClick={stopMetronome}>
        Stop
      </button>
      <div>
        Volume:
        <input
          type="number"
          onChange={setMaxGainValueHandler}
          value={getVolumeInPercents()}
          min={0}
          max={100}
        />
      </div>
      <input
        type="range"
        onChange={setMaxGainValueHandler}
        value={getVolumeInPercents()}
        min={0}
        max={100}
      />
      <div>
        <input
          type="number"
          onChange={setTempoHandler}
          value={tempo}
          min={MIN_TEMPO}
          max={MAX_TEMPO}
        />
        BPM
      </div>
      <input
        type="range"
        onChange={setTempoHandler}
        value={tempo}
        min={MIN_TEMPO}
        max={MAX_TEMPO}
      />
      <div>
        Meter:
        <input
          type="number"
          onChange={setMeterNumeratorHandler}
          value={meterNumerator}
          min="1"
          max={MAX_METER_NUMERATOR}
        />{' '}
        / {DEFAULT_METER_DENOMINATOR}
      </div>
      <div className="sequencer">
        {[...Array(meterNumerator)].map((el, i) => {
          const beatNumber = i + 1;
          return (
            <div
              key={beatNumber}
              id={beatNumber}
              className={counter === beatNumber ? 'active' : ''}
            >
              {beatNumber}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default App;
