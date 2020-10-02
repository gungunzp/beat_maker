import React, { useState, useCallback, useEffect } from 'react';
import './App.css';

const MIN_TEMPO = 30;
const MAX_TEMPO = 200;
const DEFAULT_TEMPO = 150;
const MAX_METER_NUMERATOR = 10;
const DEFAULT_METER_NUMERATOR = 4;
const DEFAULT_METER_DENOMINATOR = 4;
const FREQUENCY = 200;
const DEFAULT_GAIN_VALUE = 0.5;

const getInterval = tempo => (60 * 1000) / tempo;

const getGain = () => {
  const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

  const oscillator = audioCtx.createOscillator();

  const gain = audioCtx.createGain();

  oscillator.connect(gain);
  oscillator.frequency.value = FREQUENCY;
  gain.connect(audioCtx.destination);

  oscillator.start(0);

  gain.gain.value = 0;

  return gain;
};

const GLOBAL_GAIN = getGain();

function App() {
  const [counter, setCounter] = useState(0);
  const [timerId, setTimerId] = useState(null);
  const [tempo, setTempo] = useState(DEFAULT_TEMPO);
  const [meterNumerator, setMeterNumerator] = useState(DEFAULT_METER_NUMERATOR);

  const [gainState, setGainState] = useState(GLOBAL_GAIN);

  useEffect(() => {
    ///////////////////////////////////////
    return () => {
      // oscillator.stop(0);
      // gainState.gain.value = 0;
      // setGainState(gainState);
    };
  }, []);

  const setGainValue = useCallback(
    value => {
      gainState.gain.value = value;
      setGainState(gainState);
    },
    [gainState]
  );

  const doTick = useCallback(() => {
    setCounter(counter => (counter + 1 > meterNumerator ? 1 : counter + 1));
    setGainValue(DEFAULT_GAIN_VALUE);
    setTimeout(() => setGainValue(0), getInterval(tempo) / 2);
  }, [counter]);

  const startMetronome = useCallback(() => {
    if (timerId === null) {
      doTick();

      console.log('started');
      setTimerId(
        setInterval(() => {
          doTick();
        }, getInterval(tempo))
      );
    } else {
      console.log('blocked');
    }
  }, [counter, tempo]);

  const stopMetronome = useCallback(() => {
    clearInterval(timerId);
    setTimerId(null);
    setCounter(0);
    gainState.gain.value = 0;
    setGainState(gainState);

    console.log('stopped');
  }, [counter]);

  const setTempoHandler = useCallback(
    e => {
      stopMetronome();
      setTempo(e.target.value);
      console.log('setTempoHandler');
    },
    [counter, timerId, tempo]
  );

  // const setTempoHandler = e => {
  //   stopMetronome();
  //   setTempo(e.target.value);
  //   console.log('setTempoHandler');
  // };

  // const setMeterNumeratorHandler = useCallback(e => {
  //   stopMetronome();
  //   setMeterNumerator(+e.target.value);
  // }, []);

  const setMeterNumeratorHandler = e => {
    stopMetronome();
    setMeterNumerator(+e.target.value);
  };

  // console.log(' ');
  // console.log('RENDER counter', counter);
  // console.log('App -> meterNumerator', meterNumerator);
  // console.log('--- RENDER gainState', gainState);

  return (
    <div className="app-container">
      <button id="start-btn" onClick={startMetronome}>
        Start
      </button>
      <button id="stop-btn" onClick={stopMetronome}>
        Stop
      </button>
      <div className="tempo">
        <input
          type="number"
          onChange={setTempoHandler}
          value={tempo}
          min={MIN_TEMPO}
          max={MAX_TEMPO}
        />
        bpm
      </div>
      <input
        type="range"
        onChange={setTempoHandler}
        value={tempo}
        min={MIN_TEMPO}
        max={MAX_TEMPO}
      />
      <div>
        {/* <input
          type="number"
          onChange={setMeterNumeratorHandler}
          value={meterNumerator}
          min="1"
          max={MAX_METER_NUMERATOR}
        /> */}
        {DEFAULT_METER_NUMERATOR} / {DEFAULT_METER_DENOMINATOR}
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
