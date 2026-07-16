import React, { useState, useRef, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useLang } from '../contexts/LangContext.jsx';
import { useLexi } from '../contexts/LexiContext.jsx';
import { TestIconMap, TestColorMap } from '../components/TestIcons.jsx';
import { saveSession, loadSession, clearSession } from '../utils/session.js';
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
  const { resetLexi } = useLexi();
  const [searchParams] = useSearchParams();

  const testParam = searchParams.get('test');
  const directSection = (testParam && TEST_PARAM_TO_SECTION[testParam] !== undefined)
    ? TEST_PARAM_TO_SECTION[testParam]
    : null;
  const isSingleTest = directSection !== null;

  // ── MEMORY: restore an in-progress full-suite session (refresh-proof) ──────
  // Only applies to the full 6-section suite, not single-test mode — a single
  // test is meant to be a quick one-off and always starts fresh.
  // Fix #12: Clear completed suite so user starts fresh on return visit
  const savedSuiteRaw = !isSingleTest ? loadSession(SUITE_KEY) : null;
  // If previous session had ALL sections scored (completed), clear it for a fresh start
  const wasCompleted = savedSuiteRaw && Object.values(savedSuiteRaw.scores || {}).every(v => v !== null && v !== undefined);
  if (wasCompleted) { clearSession(SUITE_KEY); }
  const savedSuite = wasCompleted ? null : savedSuiteRaw;

  const [currentSection, setCurrentSection] = useState(
    savedSuite ? savedSuite.currentSection : (directSection ?? 0)
  );
  const [scores, setScores] = useState(
    savedSuite ? savedSuite.scores : { ...EMPTY_SCORES }
  );

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
    resetLexi();
  };

  // Clear any lingering Lexi message once the whole suite is complete
  useEffect(() => {
    if (currentSection === 6) resetLexi();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentSection]);

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

  return (
    <div style={{ background: 'rgb(6,10,22)', minHeight: '100vh', color: '#fff', paddingTop: 68 }}>

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
            <div className="assessment-tabs-row" style={{ display: 'flex', gap: 6, flexWrap: 'nowrap' }}>
              {stepKeys.filter(k => k !== 'results').map((key, i) => {
                const Icon = TestIconMap[key];
                const color = TestColorMap[key];
                const done = i < currentSection;
                const active = i === currentSection;
                return (
                  <div key={key} className="assessment-tab-item" style={{ flex: '1 1 0', minWidth: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
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
        .progress-step-label { font-size: 0.65rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 100%; }
        @media (max-width: 768px) {
          .progress-step-label { font-size: 0.56rem; }
        }
        /* Fix: on phones show the 6 tabs as a 3x2 grid (3 on top, 3 below) instead of one cramped row */
        @media (max-width: 560px) {
          .assessment-tabs-row {
            display: grid !important;
            grid-template-columns: repeat(3, 1fr) !important;
            row-gap: 10px !important;
            column-gap: 6px !important;
            flex-wrap: unset !important;
          }
          .assessment-tab-item {
            flex: unset !important;
          }
          .progress-step-label {
            white-space: normal !important;
            overflow: visible !important;
            text-overflow: unset !important;
            text-align: center;
            line-height: 1.2;
            font-size: 0.6rem !important;
          }
        }
        @media (max-width: 480px) {
          .progress-step-label { font-size: 0.48rem; }
        }
        @media (max-width: 380px) {
          .progress-step-label { font-size: 0.42rem; }
        }
      `}</style>
    </div>
  );
}
