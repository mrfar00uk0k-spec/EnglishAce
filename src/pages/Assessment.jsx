import React, { useState, useRef, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useLang } from '../contexts/LangContext.jsx';
import { TestIconMap, TestColorMap } from '../components/TestIcons.jsx';
import { saveSession, loadSession, clearSession, loadLastResult } from '../utils/session.js';
import Speaking from './assessment/Speaking.jsx';
import Writing from './assessment/Writing.jsx';
import Grammar from './assessment/Grammar.jsx';
import Vocabulary from './assessment/Vocabulary.jsx';
import Listening from './assessment/Listening.jsx';
import Reading from './assessment/Reading.jsx';
import Results from './Results.jsx';

// Main test order
const SECTIONS = ['speaking', 'writing', 'grammar', 'vocabulary', 'listening', 'reading', 'results'];
const SUITE_KEY = 'suite';

const TEST_PARAM_TO_SECTION = {
  speaking:   0,
  writing:    1,
  grammar:    2,
  vocabulary: 3,
  listening:  4,
  reading:    5,
};

const EMPTY_SCORES = {
  speaking: null, writing: null, grammar: null,
  vocabulary: null, listening: null, reading: null,
};

export default function Assessment() {
  const { t, lang } = useLang();
  const [searchParams] = useSearchParams();

  const testParam = searchParams.get('test');
  const directSection = (testParam && TEST_PARAM_TO_SECTION[testParam] !== undefined)
    ? TEST_PARAM_TO_SECTION[testParam]
    : null;
  const isSingleTest = directSection !== null;

  // ── MEMORY: restore an in-progress full-suite session (refresh-proof) ──────
  // Only applies to the full 6-section suite, not single-test mode — a single
  // test is meant to be a quick one-off and always starts fresh.
  const savedSuite = !isSingleTest ? loadSession(SUITE_KEY) : null;

  const [currentSection, setCurrentSection] = useState(
    savedSuite ? savedSuite.currentSection : (directSection ?? 0)
  );
  const [scores, setScores] = useState(
    savedSuite ? savedSuite.scores : { ...EMPTY_SCORES }
  );

  // ── MEMORY: last completed result (durable, shown on a fresh visit) ────────
  const [lastResult] = useState(() => !isSingleTest ? loadLastResult() : null);
  const [showLastResultBadge, setShowLastResultBadge] = useState(true);
  const isFreshStart = !savedSuite && Object.values(scores).every(v => v === null);

  const isSingleRef = useRef(isSingleTest);
  isSingleRef.current = isSingleTest;

  const finishSection = (section, score) => {
    window.scrollTo({ top: 0, behavior: 'instant' });
    const nextScores  = { ...scores, [section]: score };
    const nextSection = isSingleRef.current ? 6 : currentSection + 1;

    setScores(nextScores);
    setCurrentSection(nextSection);

    if (!isSingleRef.current) {
      saveSession(SUITE_KEY, { scores: nextScores, currentSection: nextSection });
    }
  };

  const resetAll = () => {
    clearSession(SUITE_KEY);
    setCurrentSection(directSection ?? 0);
    setScores({ ...EMPTY_SCORES });
  };

  const stepKeys = ['speaking','writing','grammar','vocabulary','listening','reading','results'];
  const stepLabels = {
    speaking:   t('section_speaking'),
    writing:    t('section_writing'),
    grammar:    t('section_grammar'),
    vocabulary: t('section_vocabulary'),
    listening:  t('section_listening'),
    reading:    t('section_reading'),
    results:    t('section_results'),
  };

  if (currentSection === 6) {
    return <Results scores={scores} onRetake={resetAll} singleTest={isSingleTest ? SECTIONS[directSection] : null} />;
  }

  const lastScoreColor = (v) => v >= 85 ? '#34d399' : v >= 70 ? '#22d3ee' : v >= 55 ? '#f59e0b' : v >= 40 ? '#fb923c' : '#f87171';

  return (
    <div style={{ background: 'rgb(6,10,22)', minHeight: '100vh', color: '#fff', paddingTop: 68 }}>

      {/* ── "Last score" memory badge — small, fixed, bottom-left ── */}
      {!isSingleTest && isFreshStart && lastResult && showLastResultBadge && (
        <div className="no-print" style={{
          position: 'fixed', left: 16, bottom: 16, zIndex: 40,
          maxWidth: 230,
          background:'rgba(10,16,30,0.92)', backdropFilter:'blur(18px) saturate(160%)', WebkitBackdropFilter:'blur(18px) saturate(160%)',
          border: '1px solid rgba(56,189,248,0.18)', borderRadius: 14,
          padding: '0.7rem 0.8rem', display: 'flex', alignItems: 'center', gap: 10,
          boxShadow: '0 10px 30px rgba(0,0,0,0.45)',
          animation: 'lastResultFadeIn 0.4s cubic-bezier(0.22,1,0.36,1)',
        }}>
          <div style={{ width: 34, height: 34, borderRadius: 9, background: `${lastScoreColor(lastResult.overall)}18`, border: `1px solid ${lastScoreColor(lastResult.overall)}35`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontWeight: 900, fontSize: '0.85rem', color: lastScoreColor(lastResult.overall) }}>
            {lastResult.overall}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ color: 'rgba(255,255,255,0.85)', fontSize: '0.74rem', fontWeight: 700, whiteSpace: 'nowrap' }}>
              {lang === 'ar' ? 'آخر نتيجة' : 'Last result'}
            </div>
            <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.68rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {lang === 'ar' ? `مستوى ${lastResult.level}` : `Level ${lastResult.level}`}
            </div>
          </div>
          <button
            onClick={() => setShowLastResultBadge(false)}
            aria-label={lang === 'ar' ? 'إغلاق' : 'Dismiss'}
            style={{ background: 'rgba(255,255,255,0.06)', border: 'none', color: 'rgba(255,255,255,0.35)', borderRadius: 6, width: 20, height: 20, flexShrink: 0, cursor: 'pointer', fontSize: '0.68rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >✕</button>
          <style>{`@keyframes lastResultFadeIn { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:translateY(0); } }`}</style>
        </div>
      )}

      {/* Progress Header */}
      {!isSingleTest && (
        <div style={{
          background:'rgba(255,255,255,0.025)', backdropFilter:'blur(18px) saturate(160%)', WebkitBackdropFilter:'blur(18px) saturate(160%)', borderBottom: '1px solid rgba(255,255,255,0.07)',
          padding: '1rem 1.5rem',
        }}>
          <div style={{ maxWidth: 960, margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem', flexWrap: 'wrap', gap: 6 }}>
              <h2 style={{ fontWeight: 700, fontSize: '0.92rem', color: 'rgba(255,255,255,0.6)' }}>{t('assessment_title')}</h2>
              <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.82rem' }}>
                {currentSection + 1} / {SECTIONS.length - 1}
              </span>
            </div>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {stepKeys.filter(k => k !== 'results').map((key, i) => {
                const Icon = TestIconMap[key];
                const color = TestColorMap[key];
                const done = i < currentSection;
                const active = i === currentSection;
                return (
                  <div key={key} style={{ flex: 1, minWidth: 50, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                    <div style={{
                      width: '100%', height: 3, borderRadius: 2,
                      background: done ? color : active ? color + '66' : 'rgba(255,255,255,0.08)',
                      transition: 'all 0.5s',
                    }} />
                    <div style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                      {Icon && <Icon size={11} color={active ? color : done ? color : 'rgba(255,255,255,0.25)'} />}
                      <span className="progress-step-label" style={{
                        fontWeight: 600,
                        color: active ? color : done ? color + 'cc' : 'rgba(255,255,255,0.25)',
                      }}>{stepLabels[key]}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Single test header */}
      {isSingleTest && (
        <div style={{ background:'rgba(255,255,255,0.025)', backdropFilter:'blur(18px) saturate(160%)', WebkitBackdropFilter:'blur(18px) saturate(160%)', borderBottom: '1px solid rgba(255,255,255,0.07)', padding: '0.85rem 1.5rem', textAlign: 'center' }}>
          <span style={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.82rem' }}>
            {t('assessment_title')} · {stepLabels[SECTIONS[directSection]]}
          </span>
        </div>
      )}

      {/* Section Content */}
      <div>
        {currentSection === 0 && <Speaking    onFinish={(s) => finishSection('speaking',   s)} isSingle={isSingleTest} />}
        {currentSection === 1 && <Writing     onFinish={(s) => finishSection('writing',    s)} isSingle={isSingleTest} />}
        {currentSection === 2 && <Grammar     onFinish={(s) => finishSection('grammar',    s)} isSingle={isSingleTest} />}
        {currentSection === 3 && <Vocabulary  onFinish={(s) => finishSection('vocabulary', s)} isSingle={isSingleTest} />}
        {currentSection === 4 && <Listening   onFinish={(s) => finishSection('listening',  s)} isSingle={isSingleTest} />}
        {currentSection === 5 && <Reading     onFinish={(s) => finishSection('reading',    s)} isSingle={isSingleTest} />}
      </div>

      <style>{`
        .progress-step-label { font-size: 0.65rem; }
        @media (max-width: 768px) {
          .progress-step-label { font-size: 0.58rem; }
        }
        @media (max-width: 400px) {
          .progress-step-label { font-size: 0.52rem; }
        }
      `}</style>
    </div>
  );
}
