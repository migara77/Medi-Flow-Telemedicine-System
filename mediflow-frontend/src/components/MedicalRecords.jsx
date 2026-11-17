import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { Upload, FileText, Download, Trash2, ArrowLeft, FilePlus2 } from 'lucide-react';
import { api, getErrorMessage } from '../lib/api';

export default function MedicalRecords() {
  const navigate = useNavigate();
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [uploading, setUploading] = useState(false);

  const fetch = useCallback(async () => {
    try {
      const { data } = await api.get('/medical-records');
      setRecords(Array.isArray(data) ? data : []);
      setLoading(false);
    } catch (e) {
      toast.error(getErrorMessage(e, 'Failed to load records'));
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  const upload = async (e) => {
    e.preventDefault();
    if (!file) { toast.error('Pick a file first'); return; }
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('title', title || file.name);
      if (desc) fd.append('description', desc);
      fd.append('file', file);
      await api.post('/medical-records', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      toast.success('Record uploaded');
      setFile(null); setTitle(''); setDesc('');
      fetch();
    } catch (e) {
      toast.error(getErrorMessage(e, 'Upload failed'));
    } finally { setUploading(false); }
  };

  const download = async (r) => {
    try {
      const res = await api.get(`/medical-records/${r.id}/download`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', r.original_name);
      document.body.appendChild(link); link.click(); link.remove();
      window.URL.revokeObjectURL(url);
    } catch (e) {
      toast.error(getErrorMessage(e, 'Download failed'));
    }
  };

  const remove = async (r) => {
    if (!window.confirm(`Delete "${r.title}"?`)) return;
    try {
      await api.delete(`/medical-records/${r.id}`);
      toast.success('Deleted');
      fetch();
    } catch (e) { toast.error(getErrorMessage(e, 'Delete failed')); }
  };

  const human = (n) => {
    if (!n) return '0 B';
    const u = ['B', 'KB', 'MB', 'GB']; let i = 0; let v = Number(n);
    while (v >= 1024 && i < u.length - 1) { v /= 1024; i++; }
    return `${v.toFixed(1)} ${u[i]}`;
  };

  return (
    <div className="page">
      <div className="page-container py-10 animate-fade-in">
        <button onClick={() => navigate('/patient-dashboard')} className="btn-ghost btn-sm mb-6">
          <ArrowLeft className="w-4 h-4" /> Back to dashboard
        </button>

        <div className="flex flex-wrap items-end justify-between gap-4 mb-6">
          <div>
            <h1 className="section-title">Medical records</h1>
            <p className="section-subtitle">Upload reports, scans and prescriptions to keep them with you.</p>
          </div>
        </div>

        <div className="grid lg:grid-cols-5 gap-6">
          <motion.form initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
            onSubmit={upload} className="lg:col-span-2 card-pad space-y-4">
            <div className="flex items-center gap-3">
              <span className="brand-logo"><FilePlus2 className="w-5 h-5" /></span>
              <div>
                <h3 className="font-bold text-ink-900 dark:text-white">Upload record</h3>
                <p className="text-xs text-ink-500">PDF, image, doc — up to 20 MB.</p>
              </div>
            </div>
            <div>
              <label className="label">Title</label>
              <input className="input" placeholder="e.g. Blood test - May 2026" value={title} onChange={(e) => setTitle(e.target.value)} />
            </div>
            <div>
              <label className="label">Description (optional)</label>
              <textarea rows="2" className="textarea" value={desc} onChange={(e) => setDesc(e.target.value)} />
            </div>
            <div>
              <label className="label">File</label>
              <label className="block border-2 border-dashed border-ink-200 dark:border-ink-700 rounded-xl px-4 py-6 text-center cursor-pointer hover:border-brand-400 transition">
                <Upload className="w-6 h-6 text-ink-400 mx-auto mb-1" />
                <span className="text-sm text-ink-600 dark:text-ink-300">{file ? file.name : 'Click to choose a file'}</span>
                <input type="file" className="hidden" accept=".pdf,.png,.jpg,.jpeg,.doc,.docx,.txt"
                  onChange={(e) => setFile(e.target.files?.[0] || null)} />
              </label>
            </div>
            <button type="submit" disabled={uploading || !file} className="btn-primary btn-block">
              <Upload className="w-4 h-4" /> {uploading ? 'Uploading…' : 'Upload'}
            </button>
          </motion.form>

          <div className="lg:col-span-3">
            {loading ? (
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-16 rounded-xl shimmer" />)}
              </div>
            ) : records.length === 0 ? (
              <div className="card-pad text-center">
                <FileText className="w-12 h-12 text-ink-300 mx-auto mb-3" />
                <p className="text-ink-900 dark:text-white font-semibold">No records yet</p>
                <p className="text-sm text-ink-500">Upload your first medical record from the panel.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {records.map((r) => (
                  <motion.div key={r.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                    className="card p-4 flex items-center gap-4">
                    <div className="h-11 w-11 rounded-xl bg-brand-100 dark:bg-brand-500/15 text-brand-700 dark:text-brand-300 grid place-items-center shrink-0">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="font-semibold text-ink-900 dark:text-white truncate">{r.title}</div>
                      <div className="text-xs text-ink-500">
                        {r.original_name} · {human(r.size)} · {new Date(r.created_at).toLocaleDateString()}
                      </div>
                      {r.description && <div className="mt-1 text-sm text-ink-600 dark:text-ink-300 line-clamp-2">{r.description}</div>}
                    </div>
                    <div className="flex gap-1">
                      <button onClick={() => download(r)} className="btn-secondary btn-sm"><Download className="w-3.5 h-3.5" /></button>
                      <button onClick={() => remove(r)} className="btn-danger btn-sm"><Trash2 className="w-3.5 h-3.5" /></button>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
