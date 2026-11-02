import './index.css';
import './App.css';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import SimdExplanation from './components/SimdExplanation';
import ImageSimulator from './components/ImageSimulator';
import Advantages from './components/Advantages';
import Conclusion from './components/Conclusion';
import Footer from './components/Footer';

function App() {
  return (
    <div className="app">
      <Navbar />
      <main>
        <Hero />
        <SimdExplanation />
        <ImageSimulator />
        <Advantages />
        <Conclusion />
      </main>
      <Footer />
    </div>
  );
}

export default App;
