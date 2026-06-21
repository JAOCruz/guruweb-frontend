import { Suspense, lazy } from "react";
import HeroSection from "../src/components/HeroSection";

// Lazy load below-the-fold sections
const AboutSection = lazy(() => import("../src/components/AboutSection"));
const VideoSection = lazy(() => import("../src/components/VideoSection"));
const GuruSection = lazy(() => import("../src/components/GuruSection"));
const ServicesSection = lazy(() => import("../src/components/ServicesSection"));
const TestimonialsSection = lazy(() => import("../src/components/TestimonialsSection"));
const DominicanSection = lazy(() => import("../src/components/DominicanSection"));
const TypewriterSection = lazy(() => import("../src/components/TypewriterSection"));
const HistorySection = lazy(() => import("../src/components/HistorySection"));
const CTASection = lazy(() => import("../src/components/CTASection"));
const LocationSection = lazy(() => import("../src/components/LocationSection"));
const Footer = lazy(() => import("../src/components/Footer"));

const SectionFallback = () => <div className="h-96 bg-[#0000FF]" />;

function App() {
  return (
    <div className="relative overflow-x-hidden bg-[#020617]">
      <div className="pt-0">
        <HeroSection />
        <Suspense fallback={<SectionFallback />}>
          <TypewriterSection />
        </Suspense>
        {/* Smooth gradient transition from dark hero to blue about */}
        <div className="h-24 w-full bg-gradient-to-b from-[#020617] to-[#0000FF]" />
        <Suspense fallback={<SectionFallback />}>
          <AboutSection />
        </Suspense>
        <Suspense fallback={<SectionFallback />}>
          <HistorySection />
        </Suspense>
        <div className="h-24 w-full bg-gradient-to-b from-[#000080] to-[#020617]" />
        <Suspense fallback={<SectionFallback />}>
          <VideoSection />
        </Suspense>
        <Suspense fallback={<SectionFallback />}>
          <GuruSection />
        </Suspense>
        <Suspense fallback={<SectionFallback />}>
          <ServicesSection />
        </Suspense>
        <Suspense fallback={<SectionFallback />}>
          <TestimonialsSection />
        </Suspense>
        <Suspense fallback={<SectionFallback />}>
          <DominicanSection />
        </Suspense>
        <Suspense fallback={<SectionFallback />}>
          <CTASection />
        </Suspense>
        <Suspense fallback={<SectionFallback />}>
          <LocationSection />
        </Suspense>
        <Suspense fallback={<SectionFallback />}>
          <Footer />
        </Suspense>
      </div>
    </div>
  );
}

export default App;
