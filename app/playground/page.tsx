'use client';

import React, { useState, useRef } from 'react';
import { Modal } from '@/playground/Modal';
import { Tabs } from '@/playground/Tabs';
import { Disclosure } from '@/playground/Disclosure';

export default function PlaygroundPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalFormValue, setModalFormValue] = useState('');
  const openModalButtonRef = useRef<HTMLButtonElement>(null);

  const sampleTabs = [
    {
      id: 'tab1',
      label: 'Overview',
      content: (
        <div>
          <h4 style={{ margin: '0 0 0.5rem 0', color: '#60a5fa' }}>Overview Section</h4>
          <p style={{ margin: 0 }}>
            This panel demonstrates accessible tab navigation. Use <strong>Left / Right Arrow</strong> keys (or Home/End) to switch tabs and move focus seamlessly.
          </p>
        </div>
      ),
    },
    {
      id: 'tab2',
      label: 'Features',
      content: (
        <div>
          <h4 style={{ margin: '0 0 0.5rem 0', color: '#34d399' }}>Key Features</h4>
          <ul style={{ margin: 0, paddingLeft: '1.25rem' }}>
            <li>Zero external dependencies (no Radix, no Headless UI, no Shadcn)</li>
            <li>Strict TypeScript typing without <code>any</code></li>
            <li>W3C ARIA Authoring Practices compliant</li>
          </ul>
        </div>
      ),
    },
    {
      id: 'tab3',
      label: 'Accessibility',
      content: (
        <div>
          <h4 style={{ margin: '0 0 0.5rem 0', color: '#f43f5e' }}>Accessibility Checklist</h4>
          <p style={{ margin: 0 }}>
            Proper keyboard navigation, ARIA attributes (<code>role="tablist"</code>, <code>role="tab"</code>, <code>role="tabpanel"</code>, <code>aria-selected</code>, <code>aria-controls</code>, <code>aria-labelledby</code>), and roving <code>tabindex</code>.
          </p>
        </div>
      ),
    },
    {
      id: 'tab4',
      label: 'Disabled Tab',
      content: <div>Disabled Tab Content</div>,
      disabled: true,
    },
  ];

  return (
    <main
      style={{
        minHeight: '100vh',
        backgroundColor: '#020617',
        color: '#f8fafc',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        padding: '2rem 1rem',
      }}
    >
      <div style={{ maxWidth: '800px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        <header style={{ borderBottom: '1px solid #1e293b', paddingBottom: '1rem' }}>
          <h1 style={{ fontSize: '2rem', fontWeight: 700, margin: '0 0 0.5rem 0', color: '#38bdf8' }}>
            Accessible Components Playground
          </h1>
          <p style={{ color: '#94a3b8', margin: 0 }}>
            Testing suite for W3C ARIA Authoring Practices: Modal, Tabs, and Disclosure components.
          </p>
        </header>

        {/* Section 1: Modal */}
        <section
          style={{
            backgroundColor: '#0f172a',
            border: '1px solid #1e293b',
            borderRadius: '0.75rem',
            padding: '1.5rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
          }}
        >
          <h2 style={{ fontSize: '1.25rem', margin: 0, color: '#f1f5f9' }}>1. Dialog (Modal)</h2>
          <p style={{ color: '#94a3b8', fontSize: '0.9rem', margin: 0 }}>
            Test focus trapping with <kbd>Tab</kbd> / <kbd>Shift+Tab</kbd>, closing with <kbd>Escape</kbd> or clicking outside, and focus restoration to the trigger button.
          </p>

          <div>
            <button
              ref={openModalButtonRef}
              type="button"
              onClick={() => setIsModalOpen(true)}
              style={{
                backgroundColor: '#2563eb',
                color: '#ffffff',
                border: 'none',
                padding: '0.625rem 1.25rem',
                borderRadius: '0.375rem',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Open Modal Dialog
            </button>
          </div>

          <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Accessible Modal Dialog">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <p style={{ margin: 0, color: '#cbd5e1' }}>
                This modal traps focus inside its boundaries while open. Try tabbing forward and backward!
              </p>
              <div>
                <label
                  htmlFor="modal-input"
                  style={{ display: 'block', marginBottom: '0.375rem', fontSize: '0.875rem', color: '#94a3b8' }}
                >
                  Sample Input Field:
                </label>
                <input
                  id="modal-input"
                  type="text"
                  value={modalFormValue}
                  onChange={(e) => setModalFormValue(e.target.value)}
                  placeholder="Type something..."
                  style={{
                    width: '100%',
                    padding: '0.5rem 0.75rem',
                    borderRadius: '0.375rem',
                    backgroundColor: '#0f172a',
                    border: '1px solid #334155',
                    color: '#f8fafc',
                    boxSizing: 'border-box',
                  }}
                />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  style={{
                    backgroundColor: '#334155',
                    color: '#f8fafc',
                    border: 'none',
                    padding: '0.5rem 1rem',
                    borderRadius: '0.375rem',
                    cursor: 'pointer',
                  }}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    alert(`Submitted: ${modalFormValue || '(Empty)'}`);
                    setIsModalOpen(false);
                  }}
                  style={{
                    backgroundColor: '#16a34a',
                    color: '#ffffff',
                    border: 'none',
                    padding: '0.5rem 1rem',
                    borderRadius: '0.375rem',
                    cursor: 'pointer',
                    fontWeight: 600,
                  }}
                >
                  Submit
                </button>
              </div>
            </div>
          </Modal>
        </section>

        {/* Section 2: Tabs */}
        <section
          style={{
            backgroundColor: '#0f172a',
            border: '1px solid #1e293b',
            borderRadius: '0.75rem',
            padding: '1.5rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
          }}
        >
          <h2 style={{ fontSize: '1.25rem', margin: 0, color: '#f1f5f9' }}>2. Tabs</h2>
          <p style={{ color: '#94a3b8', fontSize: '0.9rem', margin: 0 }}>
            Use <kbd>Left Arrow</kbd> / <kbd>Right Arrow</kbd> to move focus and active tab selection. Use <kbd>Home</kbd> / <kbd>End</kbd> to jump to the first / last tab.
          </p>

          <Tabs items={sampleTabs} ariaLabel="Playground Demo Tabs" />
        </section>

        {/* Section 3: Disclosure */}
        <section
          style={{
            backgroundColor: '#0f172a',
            border: '1px solid #1e293b',
            borderRadius: '0.75rem',
            padding: '1.5rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
          }}
        >
          <h2 style={{ fontSize: '1.25rem', margin: 0, color: '#f1f5f9' }}>3. Disclosure (Show/Hide)</h2>
          <p style={{ color: '#94a3b8', fontSize: '0.9rem', margin: 0 }}>
            Built using a native <code>&lt;button&gt;</code> element. Press <kbd>Enter</kbd> or <kbd>Space</kbd> to expand/collapse.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <Disclosure title="What is the ARIA Disclosure pattern?" defaultOpen={true}>
              A disclosure is a simple widget that controls the visibility of a section of content. Using a native button element provides built-in keyboard handling for <kbd>Enter</kbd> and <kbd>Space</kbd>, as well as proper accessibility announcements when paired with <code>aria-expanded</code> and <code>aria-controls</code>.
            </Disclosure>

            <Disclosure title="Can I put interactive elements inside a disclosure?">
              Yes! When collapsed, the content is completely removed from the DOM/accessibility tree, ensuring inactive interactive elements cannot receive focus unexpectedly.
            </Disclosure>
          </div>
        </section>
      </div>
    </main>
  );
}
