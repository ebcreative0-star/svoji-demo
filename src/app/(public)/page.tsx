import { LandingNav } from '@/components/landing/LandingNav';
import { Hero } from '@/components/landing/Hero';
import { LandingFooter } from '@/components/landing/LandingFooter';

export default function LandingPage() {
  return (
    <div className="min-h-screen overflow-x-hidden bg-white">
      <LandingNav />
      <Hero />
      {/* Features, SocialProof, HowItWorks, FinalCTA -- Plan 04-02 */}
      <LandingFooter />
    </div>
  );
}
