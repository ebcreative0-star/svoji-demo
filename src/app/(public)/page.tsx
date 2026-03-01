import { LandingNav } from '@/components/landing/LandingNav';
import { Hero } from '@/components/landing/Hero';
import { Features } from '@/components/landing/Features';
import { SocialProof } from '@/components/landing/SocialProof';
import { HowItWorks } from '@/components/landing/HowItWorks';
import { FinalCTA } from '@/components/landing/FinalCTA';
import { SaasFooter } from '@/components/ui/SaasFooter';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      <LandingNav />
      <Hero />
      <Features />
      <SocialProof />
      <HowItWorks />
      <FinalCTA />
      <SaasFooter />
    </div>
  );
}
