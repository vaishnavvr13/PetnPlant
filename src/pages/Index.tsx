import Navbar from "@/components/landing/Navbar";
import Hero from "@/components/landing/Hero";
import Stats from "@/components/landing/Stats";
import HowItWorks from "@/components/landing/HowItWorks";
import Services from "@/components/landing/Services";
import FeaturedProviders from "@/components/landing/FeaturedProviders";
import Footer from "@/components/landing/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main>
        <Hero />
        <Stats />
        <HowItWorks />
        <FeaturedProviders />
        <Services />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
