"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { getProfileClient, setOnboardingCompleteClient, setPlanClient, setSubscriptionStatusClient } from "@/lib/profile";

// React Lottie player (client-only)
const Player = dynamic(async () => (await import("@lottiefiles/react-lottie-player")).Player, { ssr: false });

// Step → animation mapping (served from Next.js public/)
const stepAnimationSrc: Record<number, string | null> = {
  1: "/animations/man-waiving-hand.json",
  2: "/animations/Creating Application.json",
  3: "/animations/Assignees.json",
  4: "/animations/team.lottie",
  5: null,
};

const TOTAL_STEPS = 5;

type State = {
  firstName: string;
  lastName: string;
  optin: boolean;
  usecase: string;
  role: string;
  roleFreeText: string;
  emails: string[];
  plan: string;
};

export default function OnboardingPage() {
  const [state, setState] = useState<State>({
    firstName: "",
    lastName: "",
    optin: false,
    usecase: "",
    role: "",
    roleFreeText: "",
    emails: [],
    plan: "",
  });
  const [step, setStep] = useState<number>(1);
  const [loading, setLoading] = useState(true);
  const [profilePlan, setProfilePlan] = useState<'free' | 'pro' | null>(null);
  const [subscriptionStatus, setSubscriptionStatus] = useState<'active' | 'pending' | 'canceled' | null>(null);
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);

  const progressPercent = useMemo(() => {
    return Math.round(((step - 1) / (TOTAL_STEPS - 1)) * 100);
  }, [step]);

  const canGoBack = step > 1;

  // Auth + profile bootstrap
  useEffect(() => {
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        window.location.href = "/sign-in";
        return;
      }
      const { profile } = await getProfileClient();
      if (profile?.onboarding_complete) {
        router.replace("/dashboard");
        return;
      }
      if (profile?.plan) setProfilePlan(profile.plan);
      if (profile?.subscription_status) setSubscriptionStatus(profile.subscription_status);
      setLoading(false);
    })();
  }, [router, supabase]);
  const isLast = step === TOTAL_STEPS;

  // Step 5 listens for a postMessage from the iframe to navigate back
  useEffect(() => {
    function onMsg(e: MessageEvent) {
      if (e?.data?.action === "back") {
        setStep((s) => Math.max(1, s - 1));
      }
    }
    window.addEventListener("message", onMsg);
    return () => window.removeEventListener("message", onMsg);
  }, []);

  const validate = useCallback(() => {
    if (step === 1) {
      return state.firstName.trim().length > 0 && state.lastName.trim().length > 0;
    }
    if (step === 2) {
      return !!state.usecase;
    }
    if (step === 3) {
      return !!state.role;
    }
    if (step === 4) {
      const isValidEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
      return state.emails.every(isValidEmail);
    }
    return true;
  }, [step, state]);

  const onNext = useCallback(async () => {
    if (!validate()) return;
    if (step < TOTAL_STEPS) setStep(step + 1);
    else {
      // Finish (should only be reachable when conditions are met)
      await setOnboardingCompleteClient(true);
      router.replace('/dashboard');
    }
  }, [router, step, validate]);

  const onBack = useCallback(() => {
    if (canGoBack) setStep(step - 1);
  }, [canGoBack, step]);

  // UI fragments per step
  const Step1 = (
    <div className="stack">
      <div className="field">
        <label className="label" htmlFor="firstName">First name</label>
        <input
          className="input"
          id="firstName"
          name="firstName"
          type="text"
          placeholder="Alex"
          autoComplete="given-name"
          value={state.firstName}
          onChange={(e) => setState((s) => ({ ...s, firstName: e.target.value }))}
          required
        />
      </div>
      <div className="field">
        <label className="label" htmlFor="lastName">Last name</label>
        <input
          className="input"
          id="lastName"
          name="lastName"
          type="text"
          placeholder="Morgan"
          autoComplete="family-name"
          value={state.lastName}
          onChange={(e) => setState((s) => ({ ...s, lastName: e.target.value }))}
          required
        />
      </div>
      <label className="optin">
        <input
          className="checkbox"
          type="checkbox"
          id="optin"
          name="optin"
          checked={state.optin}
          onChange={(e) => setState((s) => ({ ...s, optin: e.target.checked }))}
        />
        <span className="optin-label">Subscribe to TheGridHub for news and updates</span>
      </label>
      <p className="small">By continuing you agree to the <a href="#">TheGridHub TOS</a>.</p>
    </div>
  );

  const Step2 = (
    <form onSubmit={(e) => e.preventDefault()}>
      <div className="options" role="radiogroup" aria-label="Primary use">
        {[
          { id: "startup", label: "Startup team" },
          { id: "product", label: "Product / design team" },
          { id: "clientwork", label: "Client work (agency/freelance)" },
          { id: "engineering", label: "Engineering / delivery" },
          { id: "personal", label: "Personal project" },
          { id: "education", label: "Education / training" },
          { id: "other", label: "Something else" },
        ].map((opt) => (
          <React.Fragment key={opt.id}>
            <input
              className="chip-input"
              type="radio"
              name="usecase"
              id={opt.id}
              value={opt.id}
              checked={state.usecase === opt.id}
              onChange={() => setState((s) => ({ ...s, usecase: opt.id }))}
            />
            <label className="chip" htmlFor={opt.id}>{opt.label}</label>
          </React.Fragment>
        ))}
      </div>
    </form>
  );

  const Step3 = (
    <form onSubmit={(e) => e.preventDefault()}>
      <div className="options" role="radiogroup" aria-label="Role">
        {[
          { id: "founder", label: "Founder / Operations" },
          { id: "product", label: "Product management" },
          { id: "project", label: "Project management" },
          { id: "engineering", label: "Engineering / Development" },
          { id: "design", label: "Design (UX/UI)" },
          { id: "marketing", label: "Marketing / Growth" },
          { id: "sales", label: "Sales / Customer success" },
          { id: "data", label: "Data / Analytics" },
          { id: "research", label: "Research" },
          { id: "student", label: "Student" },
          { id: "other", label: "Other" },
        ].map((opt) => (
          <React.Fragment key={opt.id}>
            <input
              className="chip-input"
              type="radio"
              name="role"
              id={opt.id}
              value={opt.id}
              checked={state.role === opt.id}
              onChange={() => setState((s) => ({ ...s, role: opt.id }))}
            />
            <label className="chip" htmlFor={opt.id}>{opt.label}</label>
          </React.Fragment>
        ))}
      </div>
      <input
        className="input"
        id="roleFreeText"
        name="roleFreeText"
        type="text"
        placeholder="Ex: Art direction"
        value={state.roleFreeText}
        disabled={state.role !== "other"}
        onChange={(e) => setState((s) => ({ ...s, roleFreeText: e.target.value }))}
        style={{ opacity: state.role === "other" ? 1 : 0.6 }}
      />
    </form>
  );

  const onCopyInvite = useCallback(async () => {
    const url = `${window.location.origin}/invite`;
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      // fallback
      const ta = document.createElement("textarea");
      ta.value = url;
      document.body.appendChild(ta);
      ta.select();
      try {
        document.execCommand("copy");
      } finally {
        document.body.removeChild(ta);
      }
    }
  }, []);

  const Step4 = (
    <form onSubmit={(e) => e.preventDefault()}>
      <div className="stack">
        {[0, 1, 2].map((i) => (
          <input
            key={i}
            className="input"
            type="email"
            placeholder={i === 0 ? "sneha@example.com" : i === 1 ? "oscar@example.com" : "molly@example.com"}
            autoComplete="email"
            value={state.emails[i] ?? ""}
            onChange={(e) => {
              const emails = [...state.emails];
              emails[i] = e.target.value;
              setState((s) => ({ ...s, emails }));
            }}
          />
        ))}
      </div>
      <div className="actions" style={{ marginTop: 10 }}>
        <a onClick={(e) => { e.preventDefault(); onCopyInvite(); }} href="#" role="button">Copy link to invite</a>
        <button className="btn" type="button" onClick={() => setStep(5)}>Skip</button>
      </div>
    </form>
  );

  const LeftContent = (
    <>
      {step === 1 && (<>
        <h1 className="page">What’s your name?</h1>
        <p className="lead">It’s a pleasure having you onboard — let’s get to know each other more!</p>
        {Step1}
      </>)}
      {step === 2 && (<>
        <h1 className="page">How do you plan to use TheGridHub?</h1>
        <p className="lead">If you’ll use TheGridHub for a few reasons, pick the main one.</p>
        {Step2}
      </>)}
      {step === 3 && (<>
        <h1 className="page">Which role best describes you?</h1>
        <p className="lead">If you’re multi‑talented, pick what you do most often.</p>
        {Step3}
      </>)}
      {step === 4 && (<>
        <h1 className="page">Will anyone else be joining you?</h1>
        <p className="lead">You can invite others to jam, design, and build things with you.</p>
        {Step4}
      </>)}
    </>
  );

  const RightPane = (
    <div className="right" aria-hidden={step === 5} style={{ display: step === 5 ? "none" : undefined }}>
      <div id="lottieHost" style={{ width: 520, maxWidth: "90%", height: 380 }}>
        {stepAnimationSrc[step] && (
          <Player
            src={stepAnimationSrc[step] as string}
            style={{ width: "100%", height: "100%" }}
            background="transparent"
            autoplay
            loop
          />
        )}
      </div>
    </div>
  );

  if (loading) {
    return <div style={{ padding: 40 }}>Loading...</div>;
  }

  return (
    <div>
      {/* Progress header */}
      <div className="progress_indicator--progressIndicator" style={{ ['--progress' as any]: `${progressPercent}%` }}>
        <div className="progress_indicator--row">
          <div className="progress_indicator--label">Onboarding</div>
          <div className="progress_indicator--steps">{`Step ${step} of ${TOTAL_STEPS}`}</div>
        </div>
        <div className="progress_indicator--track">
          <div className="progress_indicator--bar" style={{ width: `${progressPercent}%` }} />
        </div>
      </div>

      {/* Step 5 overlay */}
      {step === 5 ? (
        <div className="shell">
          <div className="left">
            <div className="left-wrap">
              <div className="left-inner">
                <h1 className="page">Pick your plan</h1>
                <p className="lead">Choose the option that best fits how you'll use TheGridHub. You can change plans anytime.</p>
                <div className="plans" role="radiogroup" aria-label="Plan">
                  <label className={`plan-card ${state.plan === 'free' ? 'selected' : ''}`} tabIndex={0} onClick={() => setState(s => ({ ...s, plan: 'free' }))}>
                    <input className="chip-input" type="radio" name="plan" value="free" checked={state.plan === 'free'} readOnly />
                    <div className="plan-title">Personal (Free)</div>
                    <div className="plan-price">$0 /month forever</div>
                    <ul className="plan-features">
                      <li>Up to 10 team members</li>
                      <li>5 active projects</li>
                      <li>Basic task management</li>
                    </ul>
                  </label>

                  <label className={`plan-card ${state.plan === 'pro' ? 'selected' : ''}`} tabIndex={0} onClick={() => setState(s => ({ ...s, plan: 'pro' }))}>
                    <input className="chip-input" type="radio" name="plan" value="pro" checked={state.plan === 'pro'} readOnly />
                    <div className="plan-title">Pro</div>
                    <div className="plan-price">$25/month or $20/month billed yearly</div>
                    <ul className="plan-features">
                      <li>Unlimited team members</li>
                      <li>Advanced task management</li>
                      <li>Priority support</li>
                    </ul>
                  </label>
                </div>

                <div className="actions" style={{ marginTop: 16 }}>
                  <button className="btn" onClick={() => setStep(4)}>Back</button>
                  {state.plan === 'free' && (
                    <button
                      className="btn btn-primary"
                      onClick={async () => {
                        await setPlanClient('free')
                        await setOnboardingCompleteClient(true)
                        router.replace('/dashboard')
                      }}
                    >
                      Continue
                    </button>
                  )}
                  {state.plan === 'pro' && (
                    subscriptionStatus === 'active' ? (
                      <button className="btn btn-primary" onClick={async () => {
                        await setOnboardingCompleteClient(true)
                        router.replace('/dashboard')
                      }}>Continue</button>
                    ) : (
                      <button className="btn btn-primary" onClick={async () => {
                        await setPlanClient('pro')
                        await setSubscriptionStatusClient('pending')
                        const checkoutUrl = process.env.NEXT_PUBLIC_PRO_CHECKOUT_URL || '/pricing'
                        window.open(checkoutUrl, '_blank', 'noopener')
                      }}>Go to payment</button>
                    )
                  )}
                </div>
              </div>
            </div>
          </div>
          {RightPane}
        </div>
      ) : (
        <div className="shell">
          <div className="left">
            <div className="left-wrap">
              <div className="left-inner">
                <div id="content">{LeftContent}</div>
              </div>
            </div>
            <div className="actions-floating">
              <button className="btn" onClick={onBack} disabled={!canGoBack}>Back</button>
              <button className="btn btn-primary" onClick={onNext}>{isLast ? "Finish" : "Continue"}</button>
            </div>
          </div>
          {RightPane}
        </div>
      )}

      {/* Styles (ported from original HTML) */}
      <style jsx global>{`
        :root { --bg: #ffffff; --text: #111827; --muted: #6b7280; --primary: #873bff; --primary-dark: #7a35e6; --border: #e5e7eb; --panel: #f7f8fb; --input: #ffffff; }
        * { box-sizing: border-box; }
        html, body { height: 100%; }
        body { margin: 0; font-family: system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, "Apple Color Emoji", "Segoe UI Emoji"; background: var(--bg); color: var(--text); }

        .progress_indicator--progressIndicator { position: sticky; top: 0; z-index: 1000; background: var(--bg); border-bottom: 1px solid var(--border); padding: 12px 16px; }
        .progress_indicator--row { display:flex; justify-content:space-between; align-items:center; gap:12px; margin-bottom:8px; }
        .progress_indicator--label { font-size:14px; font-weight:600; color: var(--text); }
        .progress_indicator--steps { font-size:12px; color: var(--muted); }
        .progress_indicator--track { height:6px; background:#eef0f4; border-radius:999px; overflow:hidden; }
        .progress_indicator--bar { height:100%; background: var(--primary); border-radius:999px; transition: width .25s ease; }

        .shell { display:grid; grid-template-columns: minmax(360px, 560px) 1fr; height: calc(100vh - 78px); }
        .left { position: relative; padding: 20px 28px; background: var(--bg); overflow: auto; }
        .left-wrap { height: 100%; display: grid; place-items: center; }
        .left-inner { width: 100%; max-width: 520px; }
        .right { background: radial-gradient(1200px 600px at 20% -10%, rgba(135,59,255,0.12), rgba(135,59,255,0) 60%), var(--panel); border-left: 1px solid var(--border); display: flex; align-items: center; justify-content: center; padding: 24px; }

        h1.page { margin: 0 0 10px; font-size: 28px; font-weight: 700; letter-spacing: -0.01em; }
        p.lead  { margin: 0 0 24px; color: var(--muted); font-size: 15px; }

        .stack { display:flex; flex-direction:column; gap: 16px; }
        .field { display:flex; flex-direction:column; gap:6px; }
        .label { font-size:13px; color: var(--muted); }
        .input { width:100%; height:44px; padding:10px 12px; border-radius:10px; border:1px solid var(--border); background: var(--input); color: var(--text); font-size:14px; }
        .input::placeholder { color:#9aa0a6; }
        .input:focus { outline:none; border-color: var(--primary); box-shadow: 0 0 0 3px rgba(135,59,255,.20); }

        .optin { display:flex; align-items:flex-start; gap:10px; }
        .checkbox { width:18px; height:18px; border-radius:4px; border:1px solid var(--border); background:#ffffff; appearance:none; -webkit-appearance:none; cursor:pointer; position: relative; }
        .checkbox:checked { background: var(--primary); border-color: var(--primary); }
        .checkbox:checked::after { content:""; position:absolute; inset:3px; background:#fff; border-radius:2px; }

        .chip-input { position: absolute; opacity: 0; pointer-events: none; }
        .chip { display:inline-flex; align-items:center; justify-content:center; height: 40px; padding: 0 14px; border-radius: 10px; cursor: pointer; border: 1px solid var(--border); background: #fff; color: var(--text); font-size: 14px; transition: border-color .15s ease, box-shadow .15s ease, background .15s ease; }
        .chip:hover { background:#fafafa; }
        .chip-input:focus + .chip { outline: 2px solid rgba(135,59,255,.35); outline-offset: 2px; }
        .chip-input:checked + .chip { border-color: var(--primary); box-shadow: 0 0 0 3px rgba(135,59,255,.20); background: #f7f2ff; }

        .actions { display:flex; justify-content: space-between; align-items:center; margin-top: 16px; }
        .actions-floating { position: absolute; bottom: 28px; right: 28px; display: flex; gap: 8px; }
        .btn { cursor:pointer; padding:10px 16px; border-radius:10px; font-weight:600; font-size:14px; border:1px solid #000; background:#fff; color:#111827; }
        .btn:hover { background:#f6f6f6; }
        .btn-primary { color:#fff; background: var(--primary); border-color: var(--primary); }
        .btn-primary:hover { background: var(--primary-dark); }
        .btn[disabled] { opacity: 0.6; cursor: not-allowed; }

        .small { font-size:12px; color: var(--muted); line-height:1.6; }
        a { color: var(--primary); text-decoration: none; }
        a:hover { text-decoration: underline; }

        @media (max-width: 1100px) { #lottieHost { height: 320px; } }
        @media (max-width: 900px) {
          .shell { grid-template-columns: 1fr; }
          .right { display:none; }
          .left-wrap { place-items: start; }
        }
      `}</style>
    </div>
  );
}

