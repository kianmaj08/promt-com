'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { Plus, Lock, Globe } from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Textarea from '@/components/ui/Textarea';
import showToast from '@/components/ui/Toast';
import { cn, formatDate } from '@/lib/utils';
import type { Collection } from '@/types';

const EMOJIS = ['📁', '⭐', '🔥', '💡', '🎯', '🚀', '🎨', '💻', '📝', '🤖'];

export default function CollectionsPage() {
  const { user } = useUser();
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: '', description: '', is_public: true, cover_emoji: '📁' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) return;
    fetch(`/api/collections?user_id=${user.id}`)
      .then(r => r.json())
      .then(j => setCollections(j.data ?? []))
      .finally(() => setLoading(false));
  }, [user]);

  const handleCreate = async () => {
    if (!form.name.trim()) { showToast.error('Name is required'); return; }
    setSaving(true);
    try {
      const res = await fetch('/api/collections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      setCollections(prev => [json.data, ...prev]);
      setShowModal(false);
      setForm({ name: '', description: '', is_public: true, cover_emoji: '📁' });
      showToast.success('Collection created!');
    } catch (e: any) {
      showToast.error(e.message ?? 'Failed to create collection');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[var(--color-bg)]">
      <Navbar />
      <main className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-black text-[#0a0a0a] dark:text-white">My Collections</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Organize your favorite prompts</p>
          </div>
          <Button variant="primary" icon={<Plus className="w-4 h-4" />} onClick={() => setShowModal(true)}>
            New Collection
          </Button>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-white dark:bg-[#1a1a1a] rounded-xl border border-[#e5e5e5] dark:border-[#2a2a2a] p-5 animate-pulse">
                <div className="h-8 w-8 bg-gray-200 dark:bg-[#2a2a2a] rounded mb-3" />
                <div className="h-4 w-2/3 bg-gray-200 dark:bg-[#2a2a2a] rounded mb-2" />
                <div className="h-3 w-full bg-gray-200 dark:bg-[#2a2a2a] rounded" />
              </div>
            ))}
          </div>
        ) : collections.length === 0 ? (
          <div className="text-center py-20">
            <span className="text-5xl mb-4 block">📁</span>
            <h3 className="text-lg font-semibold text-[#0a0a0a] dark:text-white mb-2">No collections yet</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">Create your first collection to organize your favorite prompts</p>
            <Button variant="primary" icon={<Plus className="w-4 h-4" />} onClick={() => setShowModal(true)}>
              Create Collection
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {collections.map((col) => (
              <div key={col.id} className="bg-white dark:bg-[#1a1a1a] rounded-xl border border-[#e5e5e5] dark:border-[#2a2a2a] p-5 hover:border-[#F5C518] transition-all duration-200 hover:-translate-y-0.5 cursor-pointer">
                <div className="flex items-start justify-between mb-3">
                  <span className="text-3xl">{col.cover_emoji}</span>
                  {col.is_public
                    ? <Globe className="w-4 h-4 text-gray-400" />
                    : <Lock className="w-4 h-4 text-gray-400" />}
                </div>
                <h3 className="font-bold text-[#0a0a0a] dark:text-white mb-1">{col.name}</h3>
                {col.description && <p className="text-xs text-gray-500 dark:text-gray-400 mb-3 line-clamp-2">{col.description}</p>}
                <p className="text-xs text-gray-400">Created {formatDate(col.created_at)}</p>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Create modal */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="New Collection" size="md">
        <div className="space-y-4">
          <Input
            label="Name"
            required
            value={form.name}
            onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
            placeholder="My Awesome Prompts"
          />
          <Textarea
            label="Description"
            value={form.description}
            onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
            placeholder="What kind of prompts will this collection contain?"
            className="min-h-[80px]"
          />
          <div>
            <label className="block text-sm font-medium text-[#0a0a0a] dark:text-white mb-2">Emoji</label>
            <div className="flex flex-wrap gap-2">
              {EMOJIS.map(e => (
                <button key={e} onClick={() => setForm(p => ({ ...p, cover_emoji: e }))}
                  className={cn('w-9 h-9 rounded-lg text-xl flex items-center justify-center transition-all', form.cover_emoji === e ? 'bg-[#F5C518]/20 ring-2 ring-[#F5C518]' : 'hover:bg-gray-100 dark:hover:bg-[#2a2a2a]')}>
                  {e}
                </button>
              ))}
            </div>
          </div>
          <label className="flex items-center gap-3 cursor-pointer">
            <div className={cn('relative w-10 h-6 rounded-full transition-colors', form.is_public ? 'bg-[#F5C518]' : 'bg-gray-300 dark:bg-gray-600')}
              onClick={() => setForm(p => ({ ...p, is_public: !p.is_public }))}>
              <div className={cn('absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-transform', form.is_public ? 'translate-x-5' : 'translate-x-1')} />
            </div>
            <span className="text-sm text-[#0a0a0a] dark:text-white">Public collection</span>
          </label>
          <div className="flex gap-3 pt-2">
            <Button variant="ghost" className="flex-1" onClick={() => setShowModal(false)}>Cancel</Button>
            <Button variant="primary" className="flex-1" onClick={handleCreate} loading={saving}>Create</Button>
          </div>
        </div>
      </Modal>

      <Footer />
    </div>
  );
}
