import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import "../styles/auth.css";

type AuthLayoutProps = {
  children: ReactNode;
  description: string;
  footer: ReactNode;
  title: string;
};

const AuthLayout = ({
  children,
  description,
  footer,
  title,
}: AuthLayoutProps) => {
  return (
    <main className="auth-page">
      <section className="auth-panel" aria-labelledby="auth-heading">
        <Link className="auth-brand" to="/" aria-label="Luma home">
          <span className="auth-brand__mark" aria-hidden="true">
            <svg viewBox="0 0 32 32" fill="none">
              <path
                d="M16 3.5 19.5 12.5 28.5 16 19.5 19.5 16 28.5 12.5 19.5 3.5 16 12.5 12.5 16 3.5Z"
                fill="currentColor"
              />
              <circle cx="25.5" cy="6.5" r="2.5" fill="currentColor" />
            </svg>
          </span>
          <span>Luma</span>
        </Link>

        <div className="auth-panel__content">
          <div className="auth-intro">
            <p className="auth-eyebrow">YOUR SPACE TO THINK</p>
            <h1 className="auth-heading" id="auth-heading">
              {title}
            </h1>
            <p className="auth-description">{description}</p>
          </div>

          {children}
          {footer}
        </div>

        <p className="auth-legal">© 2026 Luma AI</p>
      </section>

      <aside className="auth-showcase" aria-label="Meet Luma AI">
        <div className="showcase-glow" aria-hidden="true" />
        <div className="showcase-content">
          <div className="showcase-label">
            <span className="showcase-label__dot" />
            A little more clarity, every day
          </div>
          <h2 className="showcase-heading">
            Big ideas start
            <br />
            with a <span>better question.</span>
          </h2>
          <p className="showcase-description">
            Explore ideas, untangle the complicated, and find your next spark
            with an AI that thinks alongside you.
          </p>

          <div className="chat-preview" aria-label="Example conversation">
            <div className="chat-preview__top">
              <span className="chat-preview__avatar" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none">
                  <path
                    d="m12 2 2.2 7.8L22 12l-7.8 2.2L12 22l-2.2-7.8L2 12l7.8-2.2L12 2Z"
                    fill="currentColor"
                  />
                </svg>
              </span>
              <span>Luma</span>
              <span className="chat-preview__status">ONLINE</span>
            </div>
            <div className="chat-preview__message chat-preview__message--user">
              How do I turn a big idea into a plan?
            </div>
            <div className="chat-preview__answer">
              <span className="chat-preview__answer-mark" aria-hidden="true">
                ✳
              </span>
              <p>
                Start with the outcome you want. Then we can work backwards,
                one small, doable step at a time.
              </p>
            </div>
            <div className="chat-preview__composer">
              <span>Ask anything...</span>
              <span className="chat-preview__send" aria-hidden="true">
                ↑
              </span>
            </div>
          </div>
        </div>
        <p className="showcase-caption">Curiosity looks good on you.</p>
      </aside>
    </main>
  );
};

export default AuthLayout;
