'use client';

import { useState, useRef, useEffect } from 'react';
import { Pencil } from 'lucide-react';

interface EditableFieldProps {
  value: string;
  onChange: (value: string) => void;
  editable?: boolean;
  as?: 'p' | 'h1' | 'h2' | 'h3' | 'span';
  className?: string;
  placeholder?: string;
  multiline?: boolean;
}

export function EditableField({
  value,
  onChange,
  editable = false,
  as: Tag = 'p',
  className = '',
  placeholder = 'Clique para editar...',
  multiline = false,
}: EditableFieldProps) {
  const [editing, setEditing] = useState(false);
  const [localValue, setLocalValue] = useState(value);
  const ref = useRef<HTMLTextAreaElement | HTMLInputElement>(null);

  useEffect(() => { setLocalValue(value); }, [value]);

  useEffect(() => {
    if (editing && ref.current) {
      ref.current.focus();
      if (multiline && ref.current instanceof HTMLTextAreaElement) {
        ref.current.style.height = 'auto';
        ref.current.style.height = ref.current.scrollHeight + 'px';
      }
    }
  }, [editing, multiline]);

  if (!editable) {
    return <Tag className={className}>{value || <span className="text-gray-400 italic">{placeholder}</span>}</Tag>;
  }

  if (editing) {
    const inputProps = {
      ref: ref as any,
      value: localValue,
      onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setLocalValue(e.target.value);
        if (multiline && e.target instanceof HTMLTextAreaElement) {
          e.target.style.height = 'auto';
          e.target.style.height = e.target.scrollHeight + 'px';
        }
      },
      onBlur: () => { onChange(localValue); setEditing(false); },
      onKeyDown: (e: React.KeyboardEvent) => {
        if (e.key === 'Escape') { setLocalValue(value); setEditing(false); }
        if (e.key === 'Enter' && !multiline) { onChange(localValue); setEditing(false); }
      },
      className: `w-full bg-white border-2 border-navy-600 rounded-lg px-3 py-2 text-navy-900 outline-none ${className}`,
      placeholder,
    };

    return multiline
      ? <textarea {...inputProps} rows={3} />
      : <input type="text" {...inputProps} />;
  }

  return (
    <div
      className="group relative cursor-text"
      onClick={() => setEditing(true)}
    >
      <Tag className={`${className} editable-field pr-8`}>
        {value || <span className="text-gray-400 italic">{placeholder}</span>}
      </Tag>
      <Pencil className="w-3.5 h-3.5 text-gray-400 absolute right-1 top-1 opacity-0 group-hover:opacity-100 transition-opacity" />
    </div>
  );
}
