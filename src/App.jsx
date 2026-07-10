import React, { useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, useLocation, Link } from 'react-router-dom'
import { LangProvider } from './contexts/LangContext.jsx'
import { LexiProvider } from './contexts/LexiContext.jsx'
import LexiWidget from './components/LexiWidget.jsx'
import Navbar from './components/Navbar.jsx'
import Footer from './components/Footer.jsx'
import Home from './pages/Home.jsx'
import Assessment from './pages/Assessment.jsx'
import HRPractice from './pages/HRPractice.jsx'
import Blog from './pages/Blog.jsx'
import BlogArticle from './pages/BlogArticle.jsx'
import About from './pages/About.jsx'
import Contact from './pages/Contact.jsx'
import Privacy from './pages/Privacy.jsx'
import Terms from './pages/Terms.jsx'

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' })
  }, [pathname])
  return null
}

function NotFound() {
  return (
    <div style={{ background:'rgb(6,10,22)', minHeight:'100vh', color:'#fff', paddingTop:120, textAlign:'center' }}>
      <div style={{ fontSize:'6rem', fontWeight:900, color:'#38bdf8', fontFamily:'Playfair Display, serif' }}>404</div>
      <p style={{ color:'rgba(255,255,255,0.52)', marginBottom:'2rem', marginTop:'1rem' }}>Page not found</p>
      <Link to="/" style={{ color:'#38bdf8', fontWeight:700, fontSize:'1rem' }}>← Go Home</Link>
    </div>
  )
}

function AnimatedRoutes() {
  const location = useLocation()
  const isAssessment = location.pathname === '/assessment' || location.pathname === '/hr-practice'

  return (
    // key on location.pathname triggers re-mount = pageIn animation every route change
    <div key={location.pathname} style={{ animation: 'pageIn 0.35s cubic-bezier(0.22,1,0.36,1)' }}>
      <Routes location={location}>
        <Route path="/"           element={<Home />} />
        <Route path="/assessment"  element={<Assessment />} />
        <Route path="/hr-practice" element={<HRPractice />} />
        <Route path="/blog"      element={<Blog />} />
        <Route path="/blog/:slug" element={<BlogArticle />} />
        <Route path="/about"     element={<About />} />
        <Route path="/contact"   element={<Contact />} />
        <Route path="/privacy"   element={<Privacy />} />
        <Route path="/terms"     element={<Terms />} />
        <Route path="*"          element={<NotFound />} />
      </Routes>
      {!isAssessment && <Footer />}
    </div>
  )
}

function AppInner() {
  return (
    <>
      <ScrollToTop />
      <Navbar />
      <main>
        <AnimatedRoutes />
      </main>
    </>
  )
}

export default function App() {
  return (
    <Router>
      <LangProvider>
        <LexiProvider>
          <AppInner />
          <LexiWidget />
        </LexiProvider>
      </LangProvider>
    </Router>
  )
}
