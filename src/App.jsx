import './index.css'
import Navbar from './components/Navbar'
import HeroSection from './components/HeroSection'
import AboutUs from './components/AboutUs'
import Solutions from './components/Solutions'
import ValueProposition from './components/ValueProposition'
import Pricing from './components/Pricing'
import DownloadApp from './components/DownloadApp'
import Contact from './components/Contact'
import Footer from './components/Footer'

function App() {
  return (
    <>
      <Navbar />
      <main>
        <HeroSection />
        <AboutUs />
        <Solutions />
        <ValueProposition />
        <Pricing />
        <DownloadApp />
        <Contact />
      </main>
      <Footer />
    </>
  )
}

export default App
