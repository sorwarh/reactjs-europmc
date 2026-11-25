import Footer from './layout/Footer.jsx'
import Header from './layout/Header.jsx'
import ResearchSearchWorkspace from './modules/research/ResearchSearchWorkspace.jsx'
import './App.css'

function App() {
  return (
    <>
      <Header />

      <div className="ticks"></div>

      <main id="main">
        <ResearchSearchWorkspace />
      </main>

      <Footer />
    </>
  )
}

export default App
