import React, { useState, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useLang } from '../contexts/LangContext.jsx';
import { TestIconMap, TestColorMap } from '../components/TestIcons.jsx';
import Speaking from './assessment/Speaking.jsx';
import Writing from './assessment/Writing.jsx';
import Grammar from './assessment/Grammar.jsx';
import Vocabulary from './assessment/Vocabulary.jsx';
import Listening from './assessment/Listening.jsx';
import Reading from './assessment/Reading.jsx';
import Results from './Results.jsx';

// Main test order
const SECTIONS = ['speaking', 'writing', 'grammar', 'vocabulary', 'listening', 'reading', 'results'];

const TEST_PARAM_TO_SECTION = {
  speaking:   0,
  writing:    1,
  grammar:    2,
  vocabulary: 3,
  listening:  4,
  reading:    5,
};

export default function Assessment() {
  const { t } = useLang();
  const [searchParams] = useSearchParams();

  const testParam = searchParams.get('test');
  const directSection = (testParam && TEST_PARAM_TO_SECTION[testParam] !== undefined)
    ? TEST_PARAM_TO_SECTION[testParam]
    : null;
  const isSingleTest = directSection !== null;

  const [currentSection, setCurrentSection] = useState(directSection ?? 0);
  const [scores, setScores] = useState({
    speaking: null, writing: null, grammar: null,
    vocabulary: null, listening: null, reading: null,
  });

  const isSingleRef = useRef(isSingleTest);
  isSingleRef.current = isSingleTest;

  const finishSection = (section, score) => {
    setScores(prev => ({ ...prev, [section]: score }));
    if (isSingleRef.current) {
      setCurrentSection(6); // jump to results immediately
    } else {
      setCurrentSection(s => s + 1);
    }
  };

  const resetAll = () => {
    setCurrentSection(directSection ?? 0);
    setScores({ speaking: null, writing: null, grammar: null, vocabulary: null, listening: null, reading: null });
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

  return (
    <div style={{ background: 'rgb(6,10,22)', minHeight: '100vh', color: '#fff', paddingTop: 68 }}>
      {/* Progress Header */}
      {!isSingleTest && (
        <div style={{
          background: 'rgba(255,255,255,0.025)',
          borderBottom: '1px solid rgba(255,255,255,0.07)',
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
                      <span style={{
                        fontSize: fontSize: window.innerWidth <= 768 ? '0.5rem' : '0.65rem', fontWeight: 600,
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
        <div style={{ background: 'rgba(255,255,255,0.025)', borderBottom: '1px solid rgba(255,255,255,0.07)', padding: '0.85rem 1.5rem', textAlign: 'center' }}>
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
    </div>
  );
}
