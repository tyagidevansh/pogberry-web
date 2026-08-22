import { lazy, Suspense } from 'react'
import { Route, Routes } from 'react-router-dom'
import { Layout } from './components'

const Home = lazy(() => import('./pages/Home'))
const Learn = lazy(() => import('./pages/Learn'))
const PlaygroundPage = lazy(() => import('./pages/PlaygroundPage'))
const ExamplesPage = lazy(() => import('./pages/ExamplesPage'))
const Download = lazy(() => import('./pages/Download'))
const Roadmap = lazy(() => import('./pages/Roadmap'))

function NotFound() {
  return <section className="not-found"><div><span>404</span><h1>This berry rolled<br /><em>off the map.</em></h1><a className="button primary" href="/">Go home →</a></div></section>
}

export default function App() {
  return <Layout><Suspense fallback={<div className="route-loader"><span className="berry-mark"><i /><i /><i /><b /></span><p>picking berries…</p></div>}><Routes><Route path="/" element={<Home />} /><Route path="/learn" element={<Learn />} /><Route path="/playground" element={<PlaygroundPage />} /><Route path="/examples" element={<ExamplesPage />} /><Route path="/download" element={<Download />} /><Route path="/roadmap" element={<Roadmap />} /><Route path="*" element={<NotFound />} /></Routes></Suspense></Layout>
}
