import Navbar from '../webpages/Navbar';
import Hero from '../webpages/Hero';
import Philosophy  from '../webpages/Philosophy';
import CoreElements from '../webpages/CoreElements';
import Approach from '../webpages/Approach';
import Impact from '../webpages/Impact';
// import Vision from '../webpages/Vision';
import AlignmentCTA  from '../webpages/AlignmentCTA ';
import Testimonials from '../webpages/Testimonials';
import Footer from '../webpages/Footer';

const Index = () => {
  return (
<main className="min-h-screen bg-background">
  <Navbar />

  <Hero />
  <Philosophy />
  <CoreElements />     
  <Approach />
  <Impact />
  {/* <Vision /> */}
  <AlignmentCTA />
  <Testimonials />
  <Footer />
</main>



  );
};

export default Index;
