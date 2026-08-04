import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import React, { useState } from 'react';
import { Modal } from '../Modal';
import { Tabs } from '../Tabs';
import { Disclosure } from '../Disclosure';

describe('Accessible Components Playground', () => {
  describe('Modal Component', () => {
    function ModalWrapper({ defaultOpen = true }: { defaultOpen?: boolean }) {
      const [isOpen, setIsOpen] = useState(defaultOpen);
      return (
        <div>
          <button id="trigger-btn" onClick={() => setIsOpen(true)}>
            Open Modal
          </button>
          <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title="Test Dialog">
            <p>Modal Content</p>
            <button id="modal-inside-btn">Inside Button</button>
          </Modal>
        </div>
      );
    }

    it('renders with role="dialog", aria-modal="true", and aria-labelledby pointing to title', () => {
      render(<ModalWrapper defaultOpen={true} />);
      const dialog = screen.getByRole('dialog');
      expect(dialog).toBeInTheDocument();
      expect(dialog).toHaveAttribute('aria-modal', 'true');
      
      const title = screen.getByText('Test Dialog');
      expect(title.id).toBeTruthy();
      expect(dialog).toHaveAttribute('aria-labelledby', title.id);
    });

    it('closes when Escape key is pressed', () => {
      render(<ModalWrapper defaultOpen={true} />);
      expect(screen.getByRole('dialog')).toBeInTheDocument();

      fireEvent.keyDown(document, { key: 'Escape' });
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('closes when clicking on overlay backdrop', () => {
      render(<ModalWrapper defaultOpen={true} />);
      const overlay = screen.getByTestId('modal-backdrop');
      fireEvent.click(overlay);
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
  });

  describe('Tabs Component', () => {
    const tabsData = [
      { id: 'tab1', label: 'Tab 1', content: <div>Content 1</div> },
      { id: 'tab2', label: 'Tab 2', content: <div>Content 2</div> },
      { id: 'tab3', label: 'Tab 3', content: <div>Content 3</div> },
    ];

    it('renders correct ARIA roles and attributes', () => {
      render(<Tabs items={tabsData} />);

      const tabList = screen.getByRole('tablist');
      expect(tabList).toBeInTheDocument();

      const tabs = screen.getAllByRole('tab');
      expect(tabs).toHaveLength(3);

      expect(tabs[0]).toHaveAttribute('aria-selected', 'true');
      expect(tabs[0]).toHaveAttribute('tabIndex', '0');
      expect(tabs[1]).toHaveAttribute('aria-selected', 'false');
      expect(tabs[1]).toHaveAttribute('tabIndex', '-1');

      const tabPanel = screen.getByRole('tabpanel');
      expect(tabPanel).toBeInTheDocument();
      expect(tabPanel).toHaveAttribute('aria-labelledby', tabs[0].id);
    });

    it('navigates and changes active tab with ArrowRight and ArrowLeft keys', () => {
      render(<Tabs items={tabsData} />);

      const tabs = screen.getAllByRole('tab');
      tabs[0].focus();

      fireEvent.keyDown(tabs[0], { key: 'ArrowRight' });
      expect(tabs[1]).toHaveAttribute('aria-selected', 'true');
      expect(screen.getByText('Content 2')).toBeInTheDocument();

      fireEvent.keyDown(tabs[1], { key: 'ArrowLeft' });
      expect(tabs[0]).toHaveAttribute('aria-selected', 'true');
      expect(screen.getByText('Content 1')).toBeInTheDocument();
    });

    it('jumps to last tab with End key and first tab with Home key', () => {
      render(<Tabs items={tabsData} />);

      const tabs = screen.getAllByRole('tab');
      tabs[0].focus();

      fireEvent.keyDown(tabs[0], { key: 'End' });
      expect(tabs[2]).toHaveAttribute('aria-selected', 'true');
      expect(screen.getByText('Content 3')).toBeInTheDocument();

      fireEvent.keyDown(tabs[2], { key: 'Home' });
      expect(tabs[0]).toHaveAttribute('aria-selected', 'true');
      expect(screen.getByText('Content 1')).toBeInTheDocument();
    });
  });

  describe('Disclosure Component', () => {
    it('renders native button with aria-expanded and aria-controls', () => {
      render(
        <Disclosure title="Toggle Section">
          <p>Hidden Content</p>
        </Disclosure>
      );

      const button = screen.getByRole('button', { name: /toggle section/i });
      expect(button).toHaveAttribute('aria-expanded', 'false');
      expect(button).toHaveAttribute('aria-controls');

      // Content should be removed from DOM when collapsed
      expect(screen.queryByText('Hidden Content')).not.toBeInTheDocument();

      // Click button
      fireEvent.click(button);
      expect(button).toHaveAttribute('aria-expanded', 'true');
      expect(screen.getByText('Hidden Content')).toBeInTheDocument();
    });
  });
});
