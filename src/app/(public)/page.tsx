import { LandingNav } from '@/components/landing/LandingNav';
import { Hero } from '@/components/landing/Hero';
import { Features } from '@/components/landing/Features';
import { SocialProof } from '@/components/landing/SocialProof';
import { HowItWorks } from '@/components/landing/HowItWorks';
import { FinalCTA } from '@/components/landing/FinalCTA';
import { LandingFooter } from '@/components/landing/LandingFooter';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white snap-y snap-mandatory overflow-y-auto h-[100dvh]">
      <LandingNav />
      <Hero />
      <Features />
      <SocialProof />
      <HowItWorks />
      <FinalCTA />
      <LandingFooter />
    </div>
  );
}
