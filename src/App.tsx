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

const SectionFallback = () => (
  <div className="h-96 border-b-2 border-border bg-secondary-background" />
);

function App() {
  return (
    <div className="relative overflow-x-hidden bg-background text-foreground">
      <div className="pt-0">
        <HeroSection />
        <Suspense fallback={<SectionFallback />}>
          <TypewriterSection />
        </Suspense>
        <Suspense fallback={<SectionFallback />}>
          <AboutSection />
        </Suspense>
        <Suspense fallback={<SectionFallback />}>
          <HistorySection />
        </Suspense>
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
