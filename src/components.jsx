import { useEffect, useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { repoUrl } from './data'

export function BerryMark({ big = false }) {
  return <span className={`berry-mark${big ? ' big' : ''}`} aria-hidden="true"><i /><i /><i /><b /></span>
}

export function Header() {
  const [open, setOpen] = useState(false)
  const location = useLocation()
  useEffect(() => setOpen(false), [location])
  const nav = [['/learn', 'Learn'], ['/examples', 'Examples'], ['/playground', 'Editor'], ['/download', 'Download']]
  return <header className="site-header">
    <Link className="brand" to="/" aria-label="Pogberry home"><BerryMark /><span>pogberry</span></Link>
    <nav className="desktop-nav" aria-label="Main navigation">{nav.map(([to, label]) => <NavLink key={to} to={to}>{label}</NavLink>)}<NavLink to="/roadmap">About</NavLink></nav>
    <div className="header-actions"><a className="button tiny dark" href={repoUrl} target="_blank" rel="noreferrer">GitHub <span>↗</span></a><button className="menu-toggle" type="button" aria-expanded={open} onClick={() => setOpen(!open)} aria-label="Toggle menu"><span /><span /></button></div>
    <nav className={`mobile-nav${open ? ' open' : ''}`} aria-label="Mobile navigation">{nav.map(([to, label]) => <NavLink key={to} to={to}>{label}</NavLink>)}<NavLink to="/roadmap">About</NavLink></nav>
  </header>
}

export function Footer() {
  return <footer><div className="shell footer-main"><div className="footer-brand"><Link className="brand" to="/"><BerryMark /><span>pogberry</span></Link><p>A small language<br />for making games.</p></div><div><strong>DOCUMENTATION</strong><Link to="/learn">Language guide</Link><Link to="/learn#games">Making games</Link><Link to="/learn#graphics">Graphics API</Link></div><div><strong>PROJECT</strong><Link to="/examples">Examples</Link><Link to="/download">Install</Link><a href={repoUrl} target="_blank" rel="noreferrer">Source code ↗</a></div><div className="footer-note"><span>under development</span><p>Pogberry is built in C<br />and released as open source.</p></div></div><div className="shell footer-bottom"><span>POGBERRY</span><span>tyagidevansh/pogberry</span></div></footer>
}

export function Layout({ children }) {
  const location = useLocation()
  useEffect(() => { window.scrollTo({ top: 0, behavior: 'instant' }) }, [location.pathname])
  return <><a className="skip-link" href="#main">Skip to content</a><div className="grain" aria-hidden="true" /><Header /><main id="main">{children}</main><Footer /></>
}

export function SectionHead({ number, label, title, italic, text, inverse = false }) {
  return <div className={`section-heading${inverse ? ' inverse' : ''} reveal`}><p className="eyebrow"><span>{number}</span> {label}</p><h2>{title}<br /><em>{italic}</em></h2>{text && <p>{text}</p>}</div>
}

function escapeHtml(value) { return value.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;') }
export function highlight(source) {
  return escapeHtml(source).replace(/(\/\/[^\n]*|"(?:\\.|[^"\\])*"|\b(?:use|as|export|let|var|const|fun|class|if|else|for|while|break|continue|return|this|super|and|or|true|false|nil)\b|\b\d+(?:\.\d+)?\b)/g, (match) => {
    const cls = match.startsWith('//') ? 'comment' : match.startsWith('"') ? 'str' : /^\d/.test(match) ? 'num' : 'kw'
    return `<span class="${cls}">${match}</span>`
  })
}

export function CodeBlock({ code, title = 'main.pb', compact = false }) {
  const [copied, setCopied] = useState(false)
  const copy = async () => { await navigator.clipboard.writeText(code); setCopied(true); setTimeout(() => setCopied(false), 1200) }
  return <div className={`code-window${compact ? ' compact' : ''}`}><div className="code-window-bar"><i /><i /><i /><span>{title}</span><button onClick={copy}>{copied ? 'copied' : 'copy'}</button></div><pre><code dangerouslySetInnerHTML={{ __html: highlight(code) }} /></pre></div>
}

export function PixelGame() {
  return <div className="game-card tilt-right" aria-label="Tiny Pogberry platform game artwork"><div className="game-bar"><span /><span /><span /><b>TINY GAME</b></div><div className="game-screen"><div className="pixel-cloud c1" /><div className="pixel-cloud c2" /><div className="berry-hero"><i className="leaf" /><i className="face" /><i className="leg l1" /><i className="leg l2" /></div><div className="coin coin1">◆</div><div className="coin coin2">◆</div><div className="ground"><i /><i /><i /><i /><i /></div></div></div>
}

export function PageHero({ eyebrow, title, italic, text, children, tone = '' }) {
  return <section className={`page-hero ${tone}`}><div className="shell"><div className="page-hero-copy reveal"><p className="eyebrow">{eyebrow}</p><h1>{title}<br /><em>{italic}</em></h1><p>{text}</p>{children}</div><div className="page-hero-orbit" aria-hidden="true"><BerryMark big /><i>●</i><i>+</i><i>·</i></div></div></section>
}
