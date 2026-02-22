'use client';

import {
  useState,
  useRef,
  useEffect,
  useCallback,
  type ChangeEvent,
  type KeyboardEvent,
  type TextareaHTMLAttributes,
} from 'react';
import { useUserSearch } from '../use-mentions';
import type { MentionUser } from '../types';
import { cn } from '@/lib/utils';
import { JOB_TYPE_LABELS } from '@/features/profile/types';
import { Avatar } from '@/components/ui/avatar';

interface MentionTextareaProps extends Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'onChange'> {
  value: string;
  onChange: (value: string) => void;
  onMentionSelect?: (user: MentionUser) => void;
}

export function MentionTextarea({
  value,
  onChange,
  onMentionSelect,
  className,
  ...props
}: MentionTextareaProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [mentionQuery, setMentionQuery] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [mentionStartPos, setMentionStartPos] = useState<number | null>(null);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 });

  const { data: users = [], isLoading } = useUserSearch(mentionQuery, showDropdown);

  const calculateDropdownPosition = useCallback(() => {
    if (!textareaRef.current || mentionStartPos === null) return;

    const textarea = textareaRef.current;
    const textBeforeCursor = value.slice(0, mentionStartPos);

    // 임시 요소로 위치 계산
    const mirror = document.createElement('div');
    const computedStyle = window.getComputedStyle(textarea);

    mirror.style.cssText = `
      position: absolute;
      visibility: hidden;
      white-space: pre-wrap;
      word-wrap: break-word;
      width: ${textarea.clientWidth}px;
      font: ${computedStyle.font};
      padding: ${computedStyle.padding};
      line-height: ${computedStyle.lineHeight};
    `;
    mirror.textContent = textBeforeCursor;

    const span = document.createElement('span');
    span.textContent = '@';
    mirror.appendChild(span);

    document.body.appendChild(mirror);

    const rect = textarea.getBoundingClientRect();
    const spanRect = span.getBoundingClientRect();
    const mirrorRect = mirror.getBoundingClientRect();

    // textarea 내부 스크롤 고려
    const relativeTop = spanRect.top - mirrorRect.top - textarea.scrollTop;
    const relativeLeft = spanRect.left - mirrorRect.left;

    document.body.removeChild(mirror);

    setDropdownPosition({
      top: Math.min(relativeTop + 24, textarea.clientHeight - 10),
      left: Math.min(relativeLeft, textarea.clientWidth - 200),
    });
  }, [value, mentionStartPos]);

  const handleChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    const cursorPos = e.target.selectionStart;

    onChange(newValue);

    // @ 멘션 감지
    const textBeforeCursor = newValue.slice(0, cursorPos);
    const mentionMatch = textBeforeCursor.match(/@(\S*)$/);

    if (mentionMatch && cursorPos !== null) {
      const query = mentionMatch[1] ?? '';
      setMentionQuery(query);
      setMentionStartPos(cursorPos - query.length - 1);
      setShowDropdown(true);
      setSelectedIndex(0);
    } else {
      setShowDropdown(false);
      setMentionStartPos(null);
    }
  };

  const insertMention = useCallback((user: MentionUser) => {
    if (mentionStartPos === null) return;

    const textarea = textareaRef.current;
    if (!textarea) return;

    const beforeMention = value.slice(0, mentionStartPos);
    const afterMention = value.slice(textarea.selectionStart);
    const mentionText = `@${user.nickname} `;
    const newValue = beforeMention + mentionText + afterMention;

    onChange(newValue);
    onMentionSelect?.(user);

    setShowDropdown(false);
    setMentionQuery('');
    setMentionStartPos(null);

    // 커서 위치 조정
    setTimeout(() => {
      const newCursorPos = mentionStartPos + mentionText.length;
      textarea.setSelectionRange(newCursorPos, newCursorPos);
      textarea.focus();
    }, 0);
  }, [value, mentionStartPos, onChange, onMentionSelect]);

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (!showDropdown || users.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % users.length);
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + users.length) % users.length);
        break;
      case 'Enter':
        if (showDropdown && users[selectedIndex]) {
          e.preventDefault();
          insertMention(users[selectedIndex]);
        }
        break;
      case 'Escape':
        e.preventDefault();
        setShowDropdown(false);
        break;
      case 'Tab':
        if (showDropdown && users[selectedIndex]) {
          e.preventDefault();
          insertMention(users[selectedIndex]);
        }
        break;
    }
  };

  // 드롭다운 위치 업데이트
  useEffect(() => {
    if (showDropdown) {
      calculateDropdownPosition();
    }
  }, [showDropdown, calculateDropdownPosition]);

  // 외부 클릭 감지
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node) &&
        textareaRef.current &&
        !textareaRef.current.contains(e.target as Node)
      ) {
        setShowDropdown(false);
      }
    };

    if (showDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showDropdown]);

  const listboxId = 'mention-listbox';

  return (
    <div className="relative">
      <textarea
        ref={textareaRef}
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        role="combobox"
        aria-expanded={showDropdown}
        aria-controls={listboxId}
        aria-activedescendant={showDropdown && users[selectedIndex] ? `mention-option-${users[selectedIndex].id}` : undefined}
        aria-autocomplete="list"
        className={cn(
          'flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none',
          className
        )}
        {...props}
      />

      {showDropdown && (
        <div
          ref={dropdownRef}
          id={listboxId}
          role="listbox"
          aria-label="사용자 검색 결과"
          className="absolute z-50 min-w-50 max-w-70 max-h-50 overflow-y-auto bg-popover border rounded-md shadow-lg"
          style={{
            top: dropdownPosition.top,
            left: dropdownPosition.left,
          }}
        >
          {isLoading ? (
            <div className="px-3 py-2 text-sm text-muted-foreground" role="status">
              검색 중...
            </div>
          ) : users.length === 0 ? (
            <div className="px-3 py-2 text-sm text-muted-foreground" role="status">
              {mentionQuery ? '검색 결과가 없습니다' : '닉네임을 입력하세요'}
            </div>
          ) : (
            <ul role="listbox">
              {users.map((user, index) => (
                <li
                  key={user.id}
                  id={`mention-option-${user.id}`}
                  role="option"
                  aria-selected={index === selectedIndex}
                >
                  <button
                    type="button"
                    tabIndex={-1}
                    className={cn(
                      'w-full px-3 py-2 text-left text-sm flex items-center gap-2 hover:bg-accent',
                      index === selectedIndex && 'bg-accent'
                    )}
                    onClick={() => insertMention(user)}
                    onMouseEnter={() => setSelectedIndex(index)}
                  >
                    <Avatar name={user.nickname} size="sm" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1">
                        <span className="font-medium truncate">{user.nickname}</span>
                        {user.isVerified && (
                          <span className="text-green-600 shrink-0" title="인증됨">
                            🏅
                          </span>
                        )}
                      </div>
                      {user.jobType && (
                        <span className="text-xs text-muted-foreground">
                          {JOB_TYPE_LABELS[user.jobType] || user.jobType}
                        </span>
                      )}
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
