import { Suspense, lazy } from "react";
import HeroSection from "./components/HeroSection";

// Lazy load below-the-fold sections
const AboutSection = lazy(() => import("./components/AboutSection"));
const VideoSection = lazy(() => import("./components/VideoSection"));
const GuruSection = lazy(() => import("./components/GuruSection"));
const ServicesSection = lazy(() => import("./components/ServicesSection"));
const TestimonialsSection = lazy(() => import("./components/TestimonialsSection"));
const DominicanSection = lazy(() => import("./components/DominicanSection"));
const TypewriterSection = lazy(() => import("./components/TypewriterSection"));
const HistorySection = lazy(() => import("./components/HistorySection"));
const CTASection = lazy(() => import("./components/CTASection"));
const LocationSection = lazy(() => import("./components/LocationSection"));
const Footer = lazy(() => import("./components/Footer"));

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
