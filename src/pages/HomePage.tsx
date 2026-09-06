import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../lib/routes';
import { Zap, TrendingDown, AlertTriangle, Target, FileText, Brain } from 'lucide-react';

// --- COMPONENTS ---

const Navbar = () => {
  const navigate = useNavigate();
  return (
    <nav className="sticky top-0 z-50 h-[60px] border-b border-[var(--border)]" style={{ background: 'rgba(7, 9, 15, 0.80)', backdropFilter: 'blur(18px) saturate(180%)' }}>
      <div className="max-w-[1140px] mx-auto px-6 h-full flex items-center justify-between">
        {/* Left: Logo */}
        <div className="flex items-center gap-[8px] cursor-pointer" onClick={() => navigate(ROUTES.HOME)}>
          <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
            <path d="M13 2L4 13h7l-2 7 9-11h-7l2-7z" fill="#00D68F" stroke="#00D68F" strokeWidth="1" strokeLinejoin="round"/>
          </svg>
          <span className="font-display text-[19px] font-bold">
            <span style={{ color: 'var(--text-1)' }}>Watt</span>
            <span style={{ color: 'var(--accent)' }}>Wise</span>
          </span>
        </div>

        {/* Right: CTAs */}
        <div className="flex items-center">
          <button 
            onClick={() => navigate(ROUTES.LOGIN)}
            className="hidden sm:block font-body text-[14px] text-[var(--text-2)] hover:text-[var(--text-1)] px-[14px] py-[8px] transition-colors"
          >
            Sign in
          </button>
          <button 
            onClick={() => navigate(ROUTES.LOGIN)}
            className="ml-2 bg-[var(--accent)] text-[#07090F] font-display text-[14px] font-semibold px-[22px] py-[9px] rounded-[6px] hover:brightness-90 hover:scale-105 transition-all duration-180"
          >
            Get Started →
          </button>
        </div>
      </div>
    </nav>
  );
};

const LiveWidget = () => {
  const [kwh, setKwh] = useState(0);

  useEffect(() => {
    const target = 2.4;
    let current = 0;
    const interval = setInterval(() => {
      current += 0.1;
      if (current >= target) {
        setKwh(target);
        clearInterval(interval);
      } else {
        setKwh(Number(current.toFixed(1)));
      }
    }, 40);
    return () => clearInterval(interval);
  }, []);

  const [barsAnimated, setBarsAnimated] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setBarsAnimated(true), 100);
    return () => clearTimeout(t);
  }, []);

  const appliances = [
    { name: 'AC', color: '#00D68F', width: 82, watts: '1500W' },
    { name: 'Refrigerator', color: '#3B82F6', width: 14, watts: '150W' },
    { name: 'Ceiling Fan', color: '#F5A623', width: 8, watts: '75W' },
    { name: 'TV', color: '#A78BFA', width: 6, watts: '55W' },
  ];

  return (
    <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-[14px] overflow-hidden w-full max-w-[400px] lg:ml-auto shadow-2xl" style={{ opacity: 0, animation: 'fadeInUp 550ms ease-out 180ms forwards' }}>
      <div className="bg-[var(--bg-raised)] border-b border-[var(--border)] px-[20px] py-[12px] flex justify-between items-center">
        <div className="flex items-center">
          <div className="flex gap-[6px]">
            <div className="w-[10px] h-[10px] rounded-full bg-[#FF5F57]" />
            <div className="w-[10px] h-[10px] rounded-full bg-[#FEBC2E]" />
            <div className="w-[10px] h-[10px] rounded-full bg-[#28C840]" />
          </div>
          <span className="ml-[12px] font-body text-[12px] text-[var(--text-3)]">WattWise — Live Dashboard</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-[6px] h-[6px] rounded-full bg-[var(--accent)] animate-pulse-dot" />
          <span className="font-body text-[11px] font-medium text-[var(--accent)]">LIVE</span>
        </div>
      </div>

      <div className="p-[20px]">
        {/* ROW 1 */}
        <div className="mb-[20px]">
          <div className="font-body text-[11px] text-[var(--text-3)] uppercase tracking-[0.1em] mb-1">Right now</div>
          <div className="flex items-baseline">
            <span className="font-mono text-[38px] font-medium text-[var(--text-1)] tabular-nums">{kwh.toFixed(1)}</span>
            <span className="font-body text-[16px] text-[var(--text-2)] ml-2">kW</span>
          </div>
          <div className="mt-1">
            <span className="font-body text-[12px] text-[var(--text-3)]">Running cost: </span>
            <span className="font-mono text-[13px] font-medium text-[var(--accent)]">₹0.16 / hr</span>
          </div>
        </div>

        {/* ROW 2 */}
        <div>
          <div className="font-body text-[11px] text-[var(--text-3)] uppercase tracking-[0.1em] mb-[12px]">Appliances — this hour</div>
          <div className="flex flex-col">
            {appliances.map((app, i) => (
              <div key={i} className="flex justify-between items-center gap-[8px] py-[8px] border-b border-[var(--border)] last:border-0">
                <div className="flex items-center gap-[8px] w-[110px]">
                  <div className="w-[8px] h-[8px] rounded-[2px]" style={{ backgroundColor: app.color }} />
                  <span className="font-body text-[13px] text-[var(--text-2)] truncate">{app.name}</span>
                </div>
                <div className="flex-1 max-w-[80px] h-[3px] bg-[var(--border-2)] rounded-[2px] overflow-hidden">
                  <div 
                    className="h-full rounded-[2px] transition-all duration-700 ease-out"
                    style={{ 
                      backgroundColor: app.color, 
                      width: barsAnimated ? `${app.width}%` : '0%' 
                    }}
                  />
                </div>
                <div className="w-[45px] text-right font-mono text-[12px] text-[var(--text-1)]">
                  {app.watts}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ROW 3 */}
        <div className="mt-[16px] bg-[var(--accent-muted)] border border-[var(--accent-border)] rounded-[8px] p-[12px] px-[16px] flex justify-between items-center">
          <div>
            <div className="font-body text-[11px] text-[var(--text-3)]">This month so far</div>
            <div className="font-mono text-[13px] font-medium text-[var(--text-1)] mt-1">68.4 kWh consumed</div>
          </div>
          <div className="text-right">
            <div className="font-body text-[11px] text-[var(--text-3)]">Projected bill</div>
            <div className="font-mono text-[20px] font-medium text-[var(--accent)] mt-1">₹1,820</div>
          </div>
        </div>
      </div>

    </div>
  );
};

const HeroSection = () => {
  const navigate = useNavigate();

  return (
    <section className="min-h-[88vh] flex items-center pt-8 pb-16">
      <div className="max-w-[1140px] mx-auto px-[24px] w-full flex flex-col lg:flex-row items-center gap-[48px] lg:gap-[72px]">
        {/* Left Column */}
        <div className="lg:w-[54%] w-full" style={{ opacity: 0, animation: 'fadeInUp 550ms ease-out forwards' }}>
          
          <div className="inline-flex items-center gap-[8px] bg-[var(--accent-muted)] border border-[var(--accent-border)] rounded-full px-[14px] py-[5px] mb-[24px]">
            <div className="w-[7px] h-[7px] rounded-full bg-[var(--accent)] animate-pulse-dot" />
            <span className="font-body text-[12px] font-medium text-[var(--accent)]">For Indian households — completely free</span>
          </div>

          <h1 className="font-display text-[30px] sm:text-[38px] lg:text-[54px] font-extrabold text-[var(--text-1)] leading-[1.08] tracking-[-0.025em] mb-[20px]">
            Stop guessing why your electricity bill is <span style={{ color: 'var(--accent)' }}>₹3,000</span> this month
          </h1>

          <p className="font-body text-[16px] lg:text-[18px] font-light text-[var(--text-2)] leading-[1.75] max-w-[520px] mb-[32px]">
            Most Indian families get their electricity bill and have no idea
            which appliance is responsible. The AC ran too long? The geyser?
            Did someone leave the TV on all day? WattWise tells you exactly —
            appliance by appliance, rupee by rupee.
          </p>

          <div className="flex flex-col gap-[12px] mb-[36px]">
            {[
              "Log your appliances once — we calculate your live bill automatically",
              "AI spots which appliance is wasting the most money and tells you how to fix it",
              "Set a monthly target and track whether you are on pace to hit it"
            ].map((text, i) => (
              <div key={i} className="flex items-start gap-[10px]">
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none" className="shrink-0 mt-[4px]">
                  <circle cx="9" cy="9" r="8.5" stroke="#00D68F" strokeOpacity="0.4"/>
                  <path d="M5.5 9l2.5 2.5 4.5-4.5" stroke="#00D68F" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <span className="font-body text-[15px] text-[var(--text-2)] leading-[1.5]">{text}</span>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap gap-[14px]">
            <button 
              onClick={() => navigate(ROUTES.LOGIN)}
              className="bg-[var(--accent)] text-[#07090F] font-display text-[16px] font-bold px-[32px] py-[14px] rounded-[6px] hover:brightness-[0.88] transition-all duration-200"
              style={{ boxShadow: '0 0 0 rgba(0,214,143,0)' }}
              onMouseEnter={(e) => e.currentTarget.style.boxShadow = '0 0 28px rgba(0,214,143,0.30)'}
              onMouseLeave={(e) => e.currentTarget.style.boxShadow = '0 0 0 rgba(0,214,143,0)'}
            >
              Track My Bill Free →
            </button>
            <button 
              onClick={() => {
                document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="bg-transparent border border-[var(--border-2)] text-[var(--text-1)] font-body text-[16px] font-normal px-[28px] py-[14px] rounded-[6px] hover:border-[var(--accent-border)] hover:text-[var(--accent)] transition-all duration-200"
            >
              Watch 60-second demo
            </button>
          </div>
          <p className="font-body text-[13px] text-[var(--text-3)] text-left mt-[16px]">
            No credit card. No setup fee. Works in 5 minutes.
          </p>

        </div>

        {/* Right Column */}
        <div className="lg:w-[46%] w-full">
          <LiveWidget />
        </div>
      </div>
    </section>
  );
};

const ProblemSection = () => {
  return (
    <section id="problem" className="py-[80px] px-[24px] max-w-[1140px] mx-auto w-full">
      <div className="flex flex-col items-center text-center">
        <div className="inline-flex items-center bg-[var(--accent-muted)] border border-[var(--accent-border)] rounded-full px-[14px] py-[5px] mb-[12px]">
          <span className="font-body text-[12px] font-medium text-[var(--accent)]">The problem we solve</span>
        </div>
        
        <h2 className="font-display text-[28px] lg:text-[38px] font-bold text-[var(--text-1)] max-w-[560px] mx-auto mb-[56px]">
          Every month the same frustrating cycle
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-[24px]">
        
        <div className="anim-section bg-[var(--bg-card)] border border-[var(--border)] rounded-[10px] p-[28px]">
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
            <rect x="6" y="4" width="20" height="24" rx="2" stroke="#F05252" strokeWidth="1.5"/>
            <line x1="11" y1="11" x2="21" y2="11" stroke="#F05252" strokeWidth="1.5" strokeLinecap="round"/>
            <line x1="11" y1="16" x2="21" y2="16" stroke="#F05252" strokeWidth="1.5" strokeLinecap="round"/>
            <line x1="11" y1="21" x2="16" y2="21" stroke="#F05252" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
          <h3 className="font-display text-[17px] font-semibold text-[var(--text-1)] mt-[16px]">The bill arrives and it's high — again</h3>
          <p className="font-body text-[14px] text-[var(--text-2)] leading-[1.65] mt-[10px]">
            ₹2,800. ₹3,100. ₹3,400. Every summer it climbs and you have
            no idea why. The bill shows total units — nothing else.
          </p>
        </div>

        <div className="anim-section bg-[var(--bg-card)] border border-[var(--border)] rounded-[10px] p-[28px]" style={{ transitionDelay: '80ms' }}>
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--amber)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"/>
            <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
            <line x1="12" y1="17" x2="12.01" y2="17"/>
          </svg>
          <h3 className="font-display text-[17px] font-semibold text-[var(--text-1)] mt-[16px]">You guess. You argue. Nothing changes.</h3>
          <p className="font-body text-[14px] text-[var(--text-2)] leading-[1.65] mt-[10px]">
            Was it the AC? Did someone leave the geyser on? You turn off
            things randomly, wait for next month, hope for the best. This
            is not a strategy.
          </p>
        </div>

        <div className="anim-section bg-[var(--bg-card)] border border-[var(--border)] rounded-[10px] p-[28px]" style={{ transitionDelay: '160ms' }}>
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--amber)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 22a7 7 0 0 0 7-7c0-2-1-3.9-3-5.5s-3.5-4-4-6.5c-.5 2.5-2 4.9-4 6.5C6 11.1 5 13 5 15a7 7 0 0 0 7 7z"/>
          </svg>
          <h3 className="font-display text-[17px] font-semibold text-[var(--text-1)] mt-[16px]">You are paying for electricity you did not need to use</h3>
          <p className="font-body text-[14px] text-[var(--text-2)] leading-[1.65] mt-[10px]">
            Studies show Indian households waste 22-28% of their electricity
            on preventable patterns — wrong thermostat settings, appliances
            left on standby, peak-hour usage. Nobody told them.
          </p>
        </div>

      </div>

      <div className="flex items-center justify-center mt-[48px] anim-section">
        <div className="flex-1 h-[1px] border-t border-[var(--border)] max-w-[100px]" />
        <span className="font-display text-[22px] font-semibold text-[var(--accent)] px-[24px]">WattWise fixes all three.</span>
        <div className="flex-1 h-[1px] border-t border-[var(--border)] max-w-[100px]" />
      </div>
    </section>
  );
};

const HowItWorksSection = () => {
  const steps = [
    { num: 1, title: 'Add your appliances', desc: 'Type in your fridge, AC, fan, washing machine — takes 3 minutes. We have 40+ presets with typical wattages pre-filled.' },
    { num: 2, title: 'See your live bill', desc: "Instantly see today's cost, this month's projected total, and exactly which appliance is costing you the most." },
    { num: 3, title: 'Get AI recommendations', desc: "Our AI analyses your usage patterns and tells you in plain Hindi or English: 'Your AC is costing ₹480 extra — here is the fix.'" },
    { num: 4, title: 'Hit your target', desc: 'Set a monthly budget. WattWise tracks your pace daily and alerts you before you overshoot — not after.' }
  ];

  return (
    <section id="how-it-works" className="py-[80px] px-[24px] max-w-[1140px] mx-auto w-full">
      <div className="flex flex-col items-center text-center mb-[56px] anim-section">
        <div className="inline-flex items-center bg-[var(--accent-muted)] border border-[var(--accent-border)] rounded-full px-[14px] py-[5px] mb-[12px]">
          <span className="font-body text-[12px] font-medium text-[var(--accent)]">How it works</span>
        </div>
        <h2 className="font-display text-[28px] lg:text-[38px] font-bold text-[var(--text-1)]">From confused to in control — in 5 minutes</h2>
        <p className="font-body text-[16px] text-[var(--text-2)] mt-[12px]">No smart plugs. No electrician. Just open WattWise and start.</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 lg:gap-0 relative">
        {/* Connector Line Desktop */}
        <div className="hidden lg:block absolute top-[24px] left-[12.5%] right-[12.5%] h-[1px]" 
             style={{ background: 'repeating-linear-gradient(90deg, var(--accent) 0, var(--accent) 4px, transparent 4px, transparent 10px)', zIndex: 0 }} />
        
        {steps.map((step, i) => (
          <div key={i} className="anim-section flex-1 flex flex-col items-center text-center relative z-10" style={{ transitionDelay: `${i * 150}ms` }}>
            <div className="w-[48px] h-[48px] rounded-full border-[1.5px] border-[var(--accent-border)] bg-[var(--accent-muted)] flex justify-center items-center">
              <span className="font-display text-[20px] font-bold text-[var(--accent)]">{step.num}</span>
            </div>
            <h3 className="font-display text-[16px] font-semibold text-[var(--text-1)] mt-[16px]">{step.title}</h3>
            <p className="font-body text-[14px] text-[var(--text-2)] leading-[1.6] max-w-[220px] mt-[8px]">
              {step.desc}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
};

const FeaturesSection = () => {
  const features = [
    { icon: <Zap size={20} color="var(--accent)" strokeWidth={1.5}/>, title: 'Real-time bill calculation', body: 'Every change you make — adding an appliance, adjusting hours — updates your estimated monthly bill instantly. No waiting, no page refresh.', tag: 'Instant' },
    { icon: <Brain size={20} color="var(--accent)" strokeWidth={1.5}/>, title: 'AI that understands Indian homes', body: 'Our AI knows about TANGEDCO slab rates, Indian appliance wattages, and peak-hour pricing. Tips are specific to your situation, not generic advice.', tag: 'Powered by Gemini' },
    { icon: <TrendingDown size={20} color="var(--accent)" strokeWidth={1.5}/>, title: 'Consumption forecast', body: "Based on your usage patterns, WattWise predicts your bill for the next 30 days so you can course-correct before it's too late.", tag: 'ML Powered' },
    { icon: <AlertTriangle size={20} color="var(--accent)" strokeWidth={1.5}/>, title: 'Spike detection', body: 'Something unusual happened yesterday? WattWise notices when your usage jumps above your normal pattern and tells you which appliance is likely responsible.', tag: 'Auto-detect' },
    { icon: <Target size={20} color="var(--accent)" strokeWidth={1.5}/>, title: 'Goal tracking with streaks', body: 'Set a monthly kWh target. Earn a streak for every day you stay on pace. Badges, green credits, and weekly challenges keep you motivated.', tag: 'Gamified' },
    { icon: <FileText size={20} color="var(--accent)" strokeWidth={1.5}/>, title: 'Monthly PDF report', body: 'At the end of every month, WattWise generates a clean one-page report showing your usage, savings, CO₂ footprint, and habit score. Share or save it.', tag: 'Exportable' },
  ];

  return (
    <section id="features" className="py-[80px] px-[24px] max-w-[1140px] mx-auto w-full bg-[var(--bg)]">
      <div className="flex flex-col items-center text-center mb-[56px] anim-section">
        <div className="inline-flex items-center bg-[var(--accent-muted)] border border-[var(--accent-border)] rounded-full px-[14px] py-[5px] mb-[12px]">
          <span className="font-body text-[12px] font-medium text-[var(--accent)]">Features</span>
        </div>
        <h2 className="font-display text-[28px] lg:text-[38px] font-bold text-[var(--text-1)]">Everything you need. Nothing you don't.</h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-[20px]">
        {features.map((f, i) => (
          <div key={i} className="anim-section flex flex-col bg-[var(--bg-card)] border border-[var(--border)] rounded-[10px] p-[26px] transition-all duration-200 hover:border-[var(--accent-border)] hover:-translate-y-[3px]" style={{ transitionDelay: `${i * 80}ms` }}>
            <div className="w-[40px] h-[40px] bg-[var(--accent-muted)] rounded-[8px] flex justify-center items-center">
              {f.icon}
            </div>
            <h3 className="font-display text-[16px] font-semibold text-[var(--text-1)] mt-[14px]">{f.title}</h3>
            <p className="font-body text-[14px] text-[var(--text-2)] leading-[1.6] mt-[8px]">
              {f.body}
            </p>
            <div className="mt-auto pt-[16px]">
              <span className="inline-block font-body text-[11px] font-medium rounded-full px-[10px] py-[3px] bg-[var(--accent-muted)] text-[var(--accent)] border border-[var(--accent-border)]">
                {f.tag}
              </span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

const TestimonialsSection = () => {
  const testimonials = [
    { quote: "I was paying ₹3,400 every summer and just accepting it. After one week with WattWise I realised my AC was set to 18°C by default and I never changed it. One change, ₹600 saved immediately.", name: "Karthik S., Chennai", initials: "KS" },
    { quote: "The AI tip feature actually surprised me. It told me my washing machine costs ₹280 less if I run it before 6 AM. I had no idea about peak rate hours.", name: "Priya M., Coimbatore", initials: "PM" },
    { quote: "Finally something built for how we actually live in India. Not some American app that doesn't know what a geyser is or what TANGEDCO charges.", name: "Rajan V., Madurai", initials: "RV" },
  ];

  return (
    <section className="py-[72px] px-[24px] max-w-[900px] mx-auto w-full">
      <h2 className="anim-section font-display text-[32px] font-bold text-[var(--text-1)] text-center mb-[48px]">What users say after their first month</h2>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-[24px]">
        {testimonials.map((t, i) => (
          <div key={i} className="anim-section bg-[var(--bg-card)] border border-[var(--border)] rounded-[10px] p-[28px]" style={{ transitionDelay: `${i * 100}ms` }}>
            <div className="text-[var(--accent)] text-[14px] mb-[14px]">
              ★★★★★
            </div>
            <p className="font-body text-[15px] text-[var(--text-1)] leading-[1.65] italic mb-[20px]">
              "{t.quote}"
            </p>
            <div className="flex items-center gap-[12px]">
              <div className="w-[36px] h-[36px] bg-[var(--bg-raised)] rounded-full flex justify-center items-center font-display text-[13px] font-semibold text-[var(--text-1)]">
                {t.initials}
              </div>
              <span className="font-body text-[13px] text-[var(--text-2)]">{t.name}</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

const CTASection = () => {
  const navigate = useNavigate();
  return (
    <section className="py-[80px] px-[24px] max-w-[700px] mx-auto w-full">
      <div className="anim-section bg-[var(--bg-card)] border border-[var(--accent-border)] rounded-[14px] p-[48px] sm:p-[56px] text-center" style={{ boxShadow: '0 0 60px rgba(0,214,143,0.06)' }}>
        <h2 className="font-display text-[30px] sm:text-[34px] font-bold text-[var(--text-1)] leading-[1.15]">Your electricity bill is a problem you can actually solve</h2>
        <p className="font-body text-[16px] text-[var(--text-2)] mt-[16px]">
          Join 2,400+ households who now know exactly where every rupee of their electricity bill comes from.
        </p>
        <button 
          onClick={() => navigate(ROUTES.LOGIN)}
          className="w-full sm:w-auto mt-[32px] bg-[var(--accent)] text-[#07090F] font-display text-[16px] font-bold px-[32px] py-[14px] rounded-[6px] hover:brightness-[0.88] transition-all duration-200 shadow-[0_0_28px_rgba(0,214,143,0.20)]"
        >
          Start for free — no card needed
        </button>
        <div className="font-body text-[12px] text-[var(--text-3)] text-center mt-[16px] flex items-center justify-center flex-wrap gap-[8px]">
          <span>Setup takes under 5 minutes</span>
          <span>·</span>
          <span>Works on any phone or laptop</span>
          <span>·</span>
          <span>Free forever</span>
        </div>
      </div>
    </section>
  );
};

const Footer = () => {
  return (
    <footer className="bg-[var(--bg-card)] border-t border-[var(--border)] py-[32px] px-[24px]">
      <div className="max-w-[1140px] mx-auto w-full flex flex-col sm:flex-row justify-between items-center gap-[12px]">
        <div className="flex items-center gap-[8px]">
          <svg width="18" height="18" viewBox="0 0 22 22" fill="none">
            <path d="M13 2L4 13h7l-2 7 9-11h-7l2-7z" fill="#00D68F" stroke="#00D68F" strokeWidth="1" strokeLinejoin="round"/>
          </svg>
          <span className="font-body text-[13px] text-[var(--text-3)]">© 2025 WattWise</span>
        </div>
        <div className="font-body text-[13px] text-[var(--text-3)] text-center">
          Built for Indian households · Chennai, India
        </div>
      </div>
    </footer>
  );
};

export default function HomePage() {
  // Setup intersection observer for scroll animations
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
        }
      });
    }, { threshold: 0.15 });

    const elements = document.querySelectorAll('.anim-section');
    elements.forEach(el => observer.observe(el));
    
    return () => {
      elements.forEach(el => observer.unobserve(el));
      observer.disconnect();
    };
  }, []);

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text-2)] font-body">
      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .anim-section {
          opacity: 0;
          transform: translateY(28px);
          transition: opacity 550ms ease, transform 550ms ease;
        }
        .anim-section.visible {
          opacity: 1;
          transform: translateY(0);
        }
      `}</style>
      <Navbar />
      <HeroSection />
      <ProblemSection />
      <HowItWorksSection />
      <FeaturesSection />
      <TestimonialsSection />
      <CTASection />
      <Footer />
    </div>
  );
}
