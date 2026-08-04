'use client';

import React, { useState, useRef, useId } from 'react';

export interface TabItem {
  id: string;
  label: string;
  content: React.ReactNode;
  disabled?: boolean;
}

export interface TabsProps {
  items: TabItem[];
  defaultTabId?: string;
  activeTabId?: string;
  onChange?: (id: string) => void;
  orientation?: 'horizontal' | 'vertical';
  ariaLabel?: string;
}

export function Tabs({
  items,
  defaultTabId,
  activeTabId,
  onChange,
  orientation = 'horizontal',
  ariaLabel = 'Tabs',
}: TabsProps) {
  const isControlled = activeTabId !== undefined;
  const [internalTabId, setInternalTabId] = useState<string>(
    defaultTabId || (items.length > 0 ? items[0].id : '')
  );

  const currentTabId = isControlled ? activeTabId : internalTabId;
  const tabRefs = useRef<Map<string, HTMLButtonElement>>(new Map());
  const baseId = useId();

  const handleSelectTab = (id: string) => {
    if (!isControlled) {
      setInternalTabId(id);
    }
    onChange?.(id);
  };

  const getEnabledItems = () => items.filter((item) => !item.disabled);

  const handleKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>, currentIndex: number) => {
    const enabledItems = getEnabledItems();
    if (enabledItems.length === 0) return;

    const currentEnabledIndex = enabledItems.findIndex((item) => item.id === items[currentIndex].id);
    let targetItem: TabItem | null = null;

    const isHorizontal = orientation === 'horizontal';
    const nextKey = isHorizontal ? 'ArrowRight' : 'ArrowDown';
    const prevKey = isHorizontal ? 'ArrowLeft' : 'ArrowUp';

    if (event.key === nextKey) {
      event.preventDefault();
      const nextIndex = (currentEnabledIndex + 1) % enabledItems.length;
      targetItem = enabledItems[nextIndex];
    } else if (event.key === prevKey) {
      event.preventDefault();
      const prevIndex = (currentEnabledIndex - 1 + enabledItems.length) % enabledItems.length;
      targetItem = enabledItems[prevIndex];
    } else if (event.key === 'Home') {
      event.preventDefault();
      targetItem = enabledItems[0];
    } else if (event.key === 'End') {
      event.preventDefault();
      targetItem = enabledItems[enabledItems.length - 1];
    }

    if (targetItem) {
      handleSelectTab(targetItem.id);
      const el = tabRefs.current.get(targetItem.id);
      el?.focus();
    }
  };

  const activeItem = items.find((item) => item.id === currentTabId) || items[0];

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: orientation === 'vertical' ? 'row' : 'column',
        gap: '1rem',
        width: '100%',
      }}
    >
      <div
        role="tablist"
        aria-label={ariaLabel}
        aria-orientation={orientation}
        style={{
          display: 'flex',
          flexDirection: orientation === 'vertical' ? 'column' : 'row',
          gap: '0.5rem',
          borderBottom: orientation === 'horizontal' ? '1px solid #334155' : 'none',
          borderRight: orientation === 'vertical' ? '1px solid #334155' : 'none',
          paddingBottom: orientation === 'horizontal' ? '0.5rem' : '0',
          paddingRight: orientation === 'vertical' ? '0.5rem' : '0',
        }}
      >
        {items.map((item, index) => {
          const isSelected = item.id === currentTabId;
          const tabId = `${baseId}-tab-${item.id}`;
          const panelId = `${baseId}-panel-${item.id}`;

          return (
            <button
              key={item.id}
              ref={(node) => {
                if (node) {
                  tabRefs.current.set(item.id, node);
                } else {
                  tabRefs.current.delete(item.id);
                }
              }}
              id={tabId}
              type="button"
              role="tab"
              aria-selected={isSelected}
              aria-controls={panelId}
              tabIndex={isSelected ? 0 : -1}
              disabled={item.disabled}
              onClick={() => handleSelectTab(item.id)}
              onKeyDown={(e) => handleKeyDown(e, index)}
              style={{
                padding: '0.625rem 1.25rem',
                borderRadius: '0.375rem',
                border: 'none',
                backgroundColor: isSelected ? '#2563eb' : 'transparent',
                color: isSelected ? '#ffffff' : item.disabled ? '#64748b' : '#94a3b8',
                fontWeight: isSelected ? 600 : 400,
                cursor: item.disabled ? 'not-allowed' : 'pointer',
                textAlign: 'left',
                outlineOffset: '2px',
                transition: 'all 0.15s ease',
              }}
            >
              {item.label}
            </button>
          );
        })}
      </div>

      {activeItem && (
        <div
          key={activeItem.id}
          id={`${baseId}-panel-${activeItem.id}`}
          role="tabpanel"
          aria-labelledby={`${baseId}-tab-${activeItem.id}`}
          tabIndex={0}
          style={{
            flex: 1,
            padding: '1.25rem',
            backgroundColor: '#0f172a',
            borderRadius: '0.5rem',
            border: '1px solid #1e293b',
            color: '#e2e8f0',
            outlineOffset: '2px',
          }}
        >
          {activeItem.content}
        </div>
      )}
    </div>
  );
}
