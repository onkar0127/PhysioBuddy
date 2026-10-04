import React, { useEffect } from "react";

export default function LegalModal({ isOpen, onClose, type = "privacy" }) {
  // Close on ESC key press
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const isPrivacy = type === "privacy";

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/70 backdrop-blur-sm transition-opacity duration-200"
      onClick={onClose}
    >
      <div 
        className="relative w-full max-w-3xl max-h-[85vh] bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col font-[Inter] animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-200 dark:border-gray-800 bg-gray-50/80 dark:bg-gray-900/80">
          <div>
            <span className="text-[11px] font-black uppercase tracking-wider text-cyan-600 dark:text-cyan-400 bg-cyan-500/10 px-2.5 py-1 rounded-md border border-cyan-500/20">
              {isPrivacy ? "Data Protection & Privacy" : "Platform Terms & Agreement"}
            </span>
            <h3 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white mt-1">
              {isPrivacy ? "Privacy Policy" : "Terms of Service"}
            </h3>
          </div>
          
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-800 text-gray-500 hover:text-gray-900 dark:hover:text-white transition"
            aria-label="Close modal"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="overflow-y-auto px-6 py-6 text-sm text-gray-700 dark:text-gray-300 space-y-6 leading-relaxed">
          {isPrivacy ? (
            <>
              <section>
                <h4 className="text-base font-bold text-gray-900 dark:text-white mb-1.5 flex items-center gap-1.5">
                  <span className="text-cyan-600">1.</span> Introduction
                </h4>
                <p>
                  At <strong>PhysioBuddy</strong>, we take your medical privacy and personal data protection seriously. This policy describes our collection, handling, and security practices across all our rehabilitation applications and clinical portals.
                </p>
              </section>

              <section>
                <h4 className="text-base font-bold text-gray-900 dark:text-white mb-1.5 flex items-center gap-1.5">
                  <span className="text-cyan-600">2.</span> Real-Time Camera & Vision Data Privacy
                </h4>
                <div className="p-4 rounded-2xl bg-cyan-50 dark:bg-cyan-950/40 border border-cyan-200 dark:border-cyan-800/60">
                  <p className="font-semibold text-cyan-900 dark:text-cyan-200 text-xs uppercase tracking-wider mb-1">
                    🔒 Client-Side Vision Computing:
                  </p>
                  <p className="text-xs sm:text-sm text-cyan-800 dark:text-cyan-300">
                    Our AI posture feedback executes skeletal landmark analysis in real-time in your browser. <strong>Raw camera video feeds and images are never recorded, transmitted, or stored on external servers.</strong> Only numeric coordinates and rep counters are computed.
                  </p>
                </div>
              </section>

              <section>
                <h4 className="text-base font-bold text-gray-900 dark:text-white mb-1.5 flex items-center gap-1.5">
                  <span className="text-cyan-600">3.</span> Information Collected
                </h4>
                <ul className="list-disc list-inside space-y-1.5 pl-2 text-xs sm:text-sm">
                  <li><strong>Account Information:</strong> Name, username, email, phone number, and hospital affiliation.</li>
                  <li><strong>Health & Clinical Metrics:</strong> Date of birth, gender, height, weight, blood group, prescribed exercise routines, and repetition logs.</li>
                  <li><strong>Clinical Chat Messages:</strong> Encrypted messages exchanged between patients and their assigned supervising physiotherapists.</li>
                </ul>
              </section>

              <section>
                <h4 className="text-base font-bold text-gray-900 dark:text-white mb-1.5 flex items-center gap-1.5">
                  <span className="text-cyan-600">4.</span> Hospital Multi-Tenant Isolation
                </h4>
                <p>
                  Data is strictly segregated by hospital organization. Medical records of patients enrolled under a clinic are only accessible to certified doctors and administrators registered under that specific facility.
                </p>
              </section>

              <section>
                <h4 className="text-base font-bold text-gray-900 dark:text-white mb-1.5 flex items-center gap-1.5">
                  <span className="text-cyan-600">5.</span> Security & Rights
                </h4>
                <p>
                  We utilize salted password hashing, authenticated session tokens, and encrypted HTTPS/WSS protocols. For privacy requests, contact <a href="mailto:privacy@physiobuddy.com" className="text-cyan-600 dark:text-cyan-400 font-semibold underline">privacy@physiobuddy.com</a>.
                </p>
              </section>
            </>
          ) : (
            <>
              <section>
                <h4 className="text-base font-bold text-gray-900 dark:text-white mb-1.5 flex items-center gap-1.5">
                  <span className="text-cyan-600">1.</span> Acceptance of Terms
                </h4>
                <p>
                  By accessing or registering an account on <strong>PhysioBuddy</strong>, you agree to comply with and be bound by these Terms of Service. If you disagree with any part of these terms, please discontinue use immediately.
                </p>
              </section>

              <section>
                <h4 className="text-base font-bold text-gray-900 dark:text-white mb-1.5 flex items-center gap-1.5">
                  <span className="text-cyan-600">2.</span> Medical Disclaimer & Clinical Scope
                </h4>
                <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60">
                  <p className="font-semibold text-amber-900 dark:text-amber-200 text-xs uppercase tracking-wider mb-1">
                    ⚠️ Not a Medical Diagnostic Replacement:
                  </p>
                  <p className="text-xs sm:text-sm text-amber-800 dark:text-amber-300">
                    PhysioBuddy provides assistive posture analysis tools to support physiotherapy. <strong>It does not replace personalized medical advice, diagnosis, or treatment.</strong> Patients must follow their supervising doctor's recommendations and cease any exercise causing acute pain.
                  </p>
                </div>
              </section>

              <section>
                <h4 className="text-base font-bold text-gray-900 dark:text-white mb-1.5 flex items-center gap-1.5">
                  <span className="text-cyan-600">3.</span> User & Clinic Responsibilities
                </h4>
                <ul className="list-disc list-inside space-y-1.5 pl-2 text-xs sm:text-sm">
                  <li><strong>Clinics & Admins:</strong> Must verify credentials of attending doctors and maintain accurate clinic information.</li>
                  <li><strong>Physiotherapists:</strong> Must verify that assigned routines suit patient capabilities.</li>
                  <li><strong>Patients:</strong> Must perform movements in a safe, clutter-free environment.</li>
                </ul>
              </section>

              <section>
                <h4 className="text-base font-bold text-gray-900 dark:text-white mb-1.5 flex items-center gap-1.5">
                  <span className="text-cyan-600">4.</span> Acceptable Use & Account Security
                </h4>
                <p>
                  Users must safeguard their login credentials and refrain from reverse engineering, unauthorized data harvesting, or inputting false clinical records.
                </p>
              </section>

              <section>
                <h4 className="text-base font-bold text-gray-900 dark:text-white mb-1.5 flex items-center gap-1.5">
                  <span className="text-cyan-600">5.</span> Inquiries
                </h4>
                <p>
                  For questions regarding these terms, please contact <a href="mailto:legal@physiobuddy.com" className="text-cyan-600 dark:text-cyan-400 font-semibold underline">legal@physiobuddy.com</a>.
                </p>
              </section>
            </>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white font-bold text-sm shadow-md transition"
          >
            Understood & Close
          </button>
        </div>
      </div>
    </div>
  );
}
