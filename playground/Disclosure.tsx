'use client';

import React, { useState, useId } from 'react';

export interface DisclosureProps {
  title: React.ReactNode;
  children: React.ReactNode;
  defaultOpen?: boolean;
  isOpen?: boolean;
  onToggle?: (open: boolean) => void;
  id?: string;
}

export function Disclosure({
  title,
  children,
  defaultOpen = false,
  isOpen: controlledIsOpen,
  onToggle,
  id: customId,
}: DisclosureProps) {
  const isControlled = controlledIsOpen !== undefined;
  const [internalIsOpen, setInternalIsOpen] = useState<boolean>(defaultOpen);
  const generatedId = useId();

  const isOpen = isControlled ? controlledIsOpen : internalIsOpen;
  const contentId = customId || `disclosure-content-${generatedId}`;
  const buttonId = `disclosure-button-${generatedId}`;

  const handleToggle = () => {
    const nextState = !isOpen;
    if (!isControlled) {
      setInternalIsOpen(nextState);
    }
    onToggle?.(nextState);
  };

  return (
    <div
      style={{
        border: '1px solid #334155',
        borderRadius: '0.5rem',
        overflow: 'hidden',
        backgroundColor: '#0f172a',
        color: '#f8fafc',
        width: '100%',
      }}
    >
      <h3 style={{ margin: 0 }}>
        <button
          id={buttonId}
          type="button"
          aria-expanded={isOpen}
          aria-controls={contentId}
          onClick={handleToggle}
          style={{
            width: '100%',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '1rem 1.25rem',
            backgroundColor: '#1e293b',
            color: '#f8fafc',
            border: 'none',
            fontSize: '1rem',
            fontWeight: 600,
            cursor: 'pointer',
            textAlign: 'left',
            outlineOffset: '-2px',
          }}
        >
          <span>{title}</span>
          <span
            aria-hidden="true"
            style={{
              transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
              transition: 'transform 0.2s ease',
              display: 'inline-block',
              fontSize: '0.75rem',
              color: '#94a3b8',
            }}
          >
            ▲
          </span>
        </button>
      </h3>
      {isOpen && (
        <div
          id={contentId}
          style={{
            padding: '1.25rem',
            borderTop: '1px solid #334155',
            lineHeight: 1.6,
            color: '#cbd5e1',
          }}
        >
          {children}
        </div>
      )}
    </div>
  );
}
