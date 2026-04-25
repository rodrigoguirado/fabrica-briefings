'use client';

import { useState, useEffect, useCallback } from 'react';
import { MessageSquare, Check, CornerDownRight, Trash2, Loader2, Send } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type { BriefingComment } from '@/types/briefing';

interface CommentsThreadProps {
  briefingId: string;
  locationKey: string;
  isAdmin: boolean;
}

const ANON_NAME_KEY = 'briefing_anon_name';
const ANON_EMAIL_KEY = 'briefing_anon_email';

export function CommentsThread({ briefingId, locationKey, isAdmin }: CommentsThreadProps) {
  const [comments, setComments] = useState<BriefingComment[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [body, setBody] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyBody, setReplyBody] = useState('');

  useEffect(() => {
    if (!isAdmin) {
      setName(localStorage.getItem(ANON_NAME_KEY) || '');
      setEmail(localStorage.getItem(ANON_EMAIL_KEY) || '');
    }
  }, [isAdmin]);

  const load = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from('briefing_comments')
      .select('*')
      .eq('briefing_id', briefingId)
      .eq('location_key', locationKey)
      .order('created_at', { ascending: true });
    setComments((data as BriefingComment[]) || []);
    setLoading(false);
  }, [briefingId, locationKey]);

  useEffect(() => { load(); }, [load]);

  const roots = comments.filter(c => !c.parent_id);
  const repliesOf = (id: string) => comments.filter(c => c.parent_id === id);
  const unresolvedRoots = roots.filter(c => !c.resolved).length;

  async function postComment(parent_id: string | null, text: string) {
    if (!text.trim()) return;
    if (!isAdmin && (!name.trim() || !email.trim())) {
      alert('Preencha nome e e-mail para comentar.');
      return;
    }
    setSubmitting(true);
    const payload = {
      briefing_id: briefingId,
      location_key: locationKey,
      parent_id,
      author_name: isAdmin ? (name.trim() || 'Admin Seazone') : name.trim(),
      author_email: isAdmin ? (email.trim() || null) : email.trim(),
      is_admin: isAdmin,
      body: text.trim(),
    };
    const { error } = await supabase.from('briefing_comments').insert(payload);
    setSubmitting(false);
    if (error) {
      alert('Erro ao comentar: ' + error.message);
      return;
    }
    if (!isAdmin) {
      localStorage.setItem(ANON_NAME_KEY, name.trim());
      localStorage.setItem(ANON_EMAIL_KEY, email.trim());
    }
    if (parent_id) { setReplyingTo(null); setReplyBody(''); } else { setBody(''); }
    load();
  }

  async function toggleResolved(c: BriefingComment) {
    if (!isAdmin) return;
    const { error } = await supabase
      .from('briefing_comments')
      .update({ resolved: !c.resolved })
      .eq('id', c.id);
    if (error) { alert('Erro: ' + error.message); return; }
    load();
  }

  async function removeComment(c: BriefingComment) {
    if (!isAdmin) return;
    if (!confirm('Remover este comentário?')) return;
    const { error } = await supabase.from('briefing_comments').delete().eq('id', c.id);
    if (error) { alert('Erro: ' + error.message); return; }
    load();
  }

  const totalCount = comments.length;

  return (
    <div className="mt-4 border-t border-gray-100 pt-4">
      <button
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-2 text-sm font-semibold text-[#00143D] hover:text-[#0048D7] transition-colors"
      >
        <MessageSquare className="w-4 h-4" />
        Comentários
        {totalCount > 0 && (
          <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
            {totalCount}
          </span>
        )}
        {unresolvedRoots > 0 && (
          <span className="text-xs bg-[#FC6058] text-white px-2 py-0.5 rounded-full">
            {unresolvedRoots} pendente{unresolvedRoots > 1 ? 's' : ''}
          </span>
        )}
      </button>

      {open && (
        <div className="mt-3 space-y-3">
          {loading ? (
            <div className="flex items-center gap-2 text-xs text-gray-400">
              <Loader2 className="w-3 h-3 animate-spin" /> Carregando…
            </div>
          ) : roots.length === 0 ? (
            <p className="text-xs text-gray-400 italic">Nenhum comentário ainda.</p>
          ) : (
            roots.map(c => (
              <CommentItem
                key={c.id}
                comment={c}
                replies={repliesOf(c.id)}
                isAdmin={isAdmin}
                onToggleResolved={toggleResolved}
                onRemove={removeComment}
                replying={replyingTo === c.id}
                onStartReply={() => { setReplyingTo(c.id); setReplyBody(''); }}
                onCancelReply={() => setReplyingTo(null)}
                replyBody={replyBody}
                setReplyBody={setReplyBody}
                onSubmitReply={() => postComment(c.id, replyBody)}
                submitting={submitting}
              />
            ))
          )}

          {/* New root comment form */}
          <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
            {!isAdmin && (
              <div className="grid grid-cols-2 gap-2 mb-2">
                <input
                  type="text"
                  placeholder="Seu nome"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="text-sm text-[#00143D] placeholder-gray-400 bg-white border border-gray-200 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#0048D7]"
                />
                <input
                  type="email"
                  placeholder="Seu e-mail"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="text-sm text-[#00143D] placeholder-gray-400 bg-white border border-gray-200 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#0048D7]"
                />
              </div>
            )}
            <textarea
              placeholder={isAdmin ? 'Responda ou adicione um comentário interno…' : 'Sugira uma alteração nesta variação…'}
              value={body}
              onChange={e => setBody(e.target.value)}
              rows={2}
              className="w-full text-sm text-[#00143D] placeholder-gray-400 bg-white border border-gray-200 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#0048D7] resize-y"
            />
            <div className="flex justify-end mt-2">
              <button
                onClick={() => postComment(null, body)}
                disabled={submitting || !body.trim()}
                className="flex items-center gap-1.5 bg-[#00143D] text-white text-sm px-3 py-1.5 rounded-lg hover:bg-[#001d5a] disabled:opacity-50"
              >
                {submitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                Comentar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function CommentItem({
  comment, replies, isAdmin, onToggleResolved, onRemove,
  replying, onStartReply, onCancelReply, replyBody, setReplyBody, onSubmitReply, submitting,
}: {
  comment: BriefingComment;
  replies: BriefingComment[];
  isAdmin: boolean;
  onToggleResolved: (c: BriefingComment) => void;
  onRemove: (c: BriefingComment) => void;
  replying: boolean;
  onStartReply: () => void;
  onCancelReply: () => void;
  replyBody: string;
  setReplyBody: (v: string) => void;
  onSubmitReply: () => void;
  submitting: boolean;
}) {
  return (
    <div className={`rounded-lg p-3 border ${comment.resolved ? 'bg-green-50 border-green-200' : 'bg-white border-gray-200'}`}>
      <div className="flex items-start justify-between gap-2 mb-1">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm font-bold text-[#00143D]">{comment.author_name}</span>
          {comment.is_admin && (
            <span className="text-[10px] uppercase tracking-widest font-bold text-[#0048D7] bg-blue-50 px-1.5 py-0.5 rounded">
              Seazone
            </span>
          )}
          {comment.resolved && (
            <span className="text-[10px] uppercase tracking-widest font-bold text-green-700 bg-green-100 px-1.5 py-0.5 rounded">
              Resolvido
            </span>
          )}
          <span className="text-xs text-gray-400">{formatDate(comment.created_at)}</span>
        </div>
        {isAdmin && (
          <div className="flex items-center gap-1">
            <button
              onClick={() => onToggleResolved(comment)}
              className={`text-xs flex items-center gap-1 px-2 py-1 rounded ${
                comment.resolved
                  ? 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  : 'bg-green-100 text-green-700 hover:bg-green-200'
              }`}
              title={comment.resolved ? 'Reabrir' : 'Marcar como resolvido'}
            >
              <Check className="w-3 h-3" />
              {comment.resolved ? 'Reabrir' : 'Resolver'}
            </button>
            <button
              onClick={() => onRemove(comment)}
              className="text-xs text-gray-400 hover:text-[#FC6058] p-1"
              title="Remover"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>
      <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">{comment.body}</p>

      {replies.length > 0 && (
        <div className="mt-3 space-y-2 border-l-2 border-gray-200 pl-3 ml-2">
          {replies.map(r => (
            <div key={r.id} className="text-sm">
              <div className="flex items-center gap-2 flex-wrap mb-0.5">
                <CornerDownRight className="w-3 h-3 text-gray-400" />
                <span className="font-bold text-[#00143D]">{r.author_name}</span>
                {r.is_admin && (
                  <span className="text-[10px] uppercase tracking-widest font-bold text-[#0048D7] bg-blue-50 px-1.5 py-0.5 rounded">
                    Seazone
                  </span>
                )}
                <span className="text-xs text-gray-400">{formatDate(r.created_at)}</span>
                {isAdmin && (
                  <button
                    onClick={() => onRemove(r)}
                    className="text-gray-300 hover:text-[#FC6058] ml-auto"
                    title="Remover"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                )}
              </div>
              <p className="text-gray-700 whitespace-pre-wrap leading-relaxed pl-5">{r.body}</p>
            </div>
          ))}
        </div>
      )}

      <div className="mt-2">
        {!replying ? (
          <button
            onClick={onStartReply}
            className="text-xs text-[#0048D7] hover:underline font-medium"
          >
            Responder
          </button>
        ) : (
          <div className="mt-2 space-y-2">
            <textarea
              placeholder="Resposta…"
              value={replyBody}
              onChange={e => setReplyBody(e.target.value)}
              rows={2}
              className="w-full text-sm text-[#00143D] placeholder-gray-400 bg-white border border-gray-200 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#0048D7] resize-y"
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={onCancelReply}
                className="text-xs text-gray-500 hover:text-gray-700 px-2 py-1"
              >
                Cancelar
              </button>
              <button
                onClick={onSubmitReply}
                disabled={submitting || !replyBody.trim()}
                className="flex items-center gap-1.5 bg-[#00143D] text-white text-xs px-3 py-1.5 rounded-lg hover:bg-[#001d5a] disabled:opacity-50"
              >
                {submitting ? <Loader2 className="w-3 h-3 animate-spin" /> : <Send className="w-3 h-3" />}
                Enviar
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}
