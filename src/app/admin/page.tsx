'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface Submission {
  id: string;
  name: string;
  email: string;
  message: string;
  status: 'UNREAD' | 'READ' | 'ARCHIVED';
  priority: 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT';
  isResponded: boolean;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

interface Stats {
  unread: number;
  responded: number;
}

export default function AdminDashboard() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [stats, setStats] = useState<Stats>({ unread: 0, responded: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedSubmissions, setSelectedSubmissions] = useState<string[]>([]);
  const [filters, setFilters] = useState({
    status: 'ALL',
    priority: 'ALL',
    search: '',
  });
  const [searchInput, setSearchInput] = useState('');
  const [replyModal, setReplyModal] = useState<{
    isOpen: boolean;
    submission: Submission | null;
  }>({ isOpen: false, submission: null });
  const [replyMessage, setReplyMessage] = useState('');
  const [replySubject, setReplySubject] = useState('');
  const [sendingReply, setSendingReply] = useState(false);

  const fetchSubmissions = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filters.status !== 'ALL') params.append('status', filters.status);
      if (filters.priority !== 'ALL') params.append('priority', filters.priority);
      if (filters.search) params.append('search', filters.search);

      const response = await fetch(`/api/admin/submissions?${params}`);
      if (!response.ok) throw new Error('Failed to fetch submissions');
      
      const data = await response.json();
      setSubmissions(data.submissions);
      setStats(data.stats);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubmissions();
  }, [filters]);

  // Debounced search effect
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setFilters(prev => ({ ...prev, search: searchInput }));
    }, 500); // Wait 500ms after user stops typing

    return () => clearTimeout(timeoutId);
  }, [searchInput]);

  const updateSubmission = async (id: string, updates: Partial<Submission>) => {
    try {
      const response = await fetch(`/api/admin/submissions/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });

      if (!response.ok) throw new Error('Failed to update submission');
      
      await fetchSubmissions();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Update failed');
    }
  };

  const deleteSubmission = async (id: string) => {
    if (!confirm('Are you sure you want to delete this submission?')) return;
    
    try {
      const response = await fetch(`/api/admin/submissions/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete submission');
      
      await fetchSubmissions();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Delete failed');
    }
  };

  const bulkAction = async (action: string, data?: any) => {
    if (selectedSubmissions.length === 0) {
      alert('Please select submissions first');
      return;
    }

    try {
      const response = await fetch('/api/admin/submissions/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action,
          submissionIds: selectedSubmissions,
          data,
        }),
      });

      if (!response.ok) throw new Error('Bulk action failed');
      
      setSelectedSubmissions([]);
      await fetchSubmissions();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Bulk action failed');
    }
  };

  const exportSubmissions = async (format: string = 'csv') => {
    try {
      const params = new URLSearchParams();
      if (filters.status !== 'ALL') params.append('status', filters.status);
      if (filters.priority !== 'ALL') params.append('priority', filters.priority);
      params.append('format', format);

      const response = await fetch(`/api/admin/submissions/export?${params}`);
      if (!response.ok) throw new Error('Export failed');

      if (format === 'csv') {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `contact-submissions-${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Export failed');
    }
  };

  const openReplyModal = (submission: Submission) => {
    setReplyModal({ isOpen: true, submission });
    setReplyMessage('');
    setReplySubject(`Re: Your message to ${process.env.FULL_NAME || 'Your Name'}`);
  };

  const closeReplyModal = () => {
    setReplyModal({ isOpen: false, submission: null });
    setReplyMessage('');
    setReplySubject('');
    setSendingReply(false);
  };

  const sendReply = async () => {
    if (!replyModal.submission || !replyMessage.trim() || !replySubject.trim()) return;

    try {
      setSendingReply(true);
      const response = await fetch('/api/admin/reply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          submissionId: replyModal.submission.id,
          replyMessage: replyMessage.trim(),
          replySubject: replySubject.trim(),
        }),
      });

      if (!response.ok) throw new Error('Failed to send reply');

      // Mark as responded and close modal
      await updateSubmission(replyModal.submission.id, { isResponded: true });
      closeReplyModal();
      alert('Reply sent successfully!');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send reply');
    } finally {
      setSendingReply(false);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'URGENT': return 'bg-red-100 text-red-800 border-red-200';
      case 'HIGH': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'NORMAL': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'LOW': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'UNREAD': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'READ': return 'bg-green-100 text-green-800 border-green-200';
      case 'ARCHIVED': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background text-foreground p-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>
          <p>Loading contact submissions...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background text-foreground p-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            <h2 className="font-bold">Error</h2>
            <p>{error}</p>
            <button 
              onClick={fetchSubmissions}
              className="mt-2 bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <div className="flex gap-4">
            <Link
              href="/admin/projects"
              className="bg-primary text-primary-foreground px-4 py-2 rounded hover:bg-primary/90"
            >
              Manage Projects
            </Link>
            <Link
              href="/admin/resumes"
              className="bg-primary text-primary-foreground px-4 py-2 rounded hover:bg-primary/90"
            >
              Manage Resumes
            </Link>
            <button
              onClick={() => fetchSubmissions()}
              className="bg-primary text-primary-foreground px-4 py-2 rounded hover:bg-primary/90"
            >
              Refresh
            </button>
            <Link
              href="/"
              className="border border-primary text-primary px-4 py-2 rounded hover:bg-primary/10"
            >
              Back to Portfolio
            </Link>
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-secondary p-4 rounded-lg">
            <h3 className="text-lg font-semibold">Total Submissions</h3>
            <p className="text-2xl font-bold">{submissions.length}</p>
          </div>
          <div className="bg-secondary p-4 rounded-lg">
            <h3 className="text-lg font-semibold">Unread</h3>
            <p className="text-2xl font-bold">
              {stats.unread}
            </p>
          </div>
          <div className="bg-secondary p-4 rounded-lg">
            <h3 className="text-lg font-semibold">High Priority</h3>
            <p className="text-2xl font-bold">
              {submissions.filter(s => s.priority === 'HIGH' || s.priority === 'URGENT').length}
            </p>
          </div>
          <div className="bg-secondary p-4 rounded-lg">
            <h3 className="text-lg font-semibold">Responded</h3>
            <p className="text-2xl font-bold">
              {stats.responded}
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-secondary p-6 rounded-lg mb-8">
          <h2 className="text-xl font-semibold mb-4">Filters & Search</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Status</label>
              <select
                value={filters.status}
                onChange={(e) => setFilters({...filters, status: e.target.value})}
                className="w-full p-2 border border-border rounded bg-background text-foreground"
              >
                <option value="ALL">All Statuses</option>
                <option value="UNREAD">Unread</option>
                <option value="READ">Read</option>
                <option value="ARCHIVED">Archived</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Priority</label>
              <select
                value={filters.priority}
                onChange={(e) => setFilters({...filters, priority: e.target.value})}
                className="w-full p-2 border border-border rounded bg-background text-foreground"
              >
                <option value="ALL">All Priorities</option>
                <option value="URGENT">Urgent</option>
                <option value="HIGH">High</option>
                <option value="NORMAL">Normal</option>
                <option value="LOW">Low</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Search</label>
              <input
                type="text"
                placeholder="Search name, email, or message..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="w-full p-2 border border-border rounded bg-background text-foreground"
              />
            </div>
            <div className="flex items-end">
              <button
                onClick={() => exportSubmissions('csv')}
                className="w-full bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
              >
                Export CSV
              </button>
            </div>
          </div>
        </div>

        {/* Bulk Actions */}
        {selectedSubmissions.length > 0 && (
          <div className="bg-accent p-4 rounded-lg mb-6">
            <div className="flex items-center gap-4">
              <span className="font-medium">
                {selectedSubmissions.length} submission(s) selected
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => bulkAction('update_status', { status: 'READ' })}
                  className="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600"
                >
                  Mark as Read
                </button>
                <button
                  onClick={() => bulkAction('update_status', { status: 'ARCHIVED' })}
                  className="bg-gray-500 text-white px-3 py-1 rounded text-sm hover:bg-gray-600"
                >
                  Archive
                </button>
                <button
                  onClick={() => bulkAction('mark_responded', { isResponded: true })}
                  className="bg-green-500 text-white px-3 py-1 rounded text-sm hover:bg-green-600"
                >
                  Mark as Responded
                </button>
                <button
                  onClick={() => bulkAction('delete')}
                  className="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Submissions List */}
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold">
            Contact Submissions ({submissions.length})
          </h2>
          
          {submissions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No submissions found matching your filters.
            </div>
          ) : (
            submissions.map((submission) => (
              <div
                key={submission.id}
                className={`bg-secondary p-6 rounded-lg border ${
                  selectedSubmissions.includes(submission.id) ? 'border-primary' : 'border-border'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4 flex-1">
                    <input
                      type="checkbox"
                      checked={selectedSubmissions.includes(submission.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedSubmissions([...selectedSubmissions, submission.id]);
                        } else {
                          setSelectedSubmissions(selectedSubmissions.filter(id => id !== submission.id));
                        }
                      }}
                      className="mt-1"
                    />
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-semibold">{submission.name}</h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getPriorityColor(submission.priority)}`}>
                          {submission.priority}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(submission.status)}`}>
                          {submission.status}
                        </span>
                        {submission.isResponded && (
                          <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">
                            Responded
                          </span>
                        )}
                      </div>
                      
                      <p className="text-muted-foreground mb-2">{submission.email}</p>
                      <p className="text-foreground mb-4">{submission.message}</p>
                      
                      {submission.notes && (
                        <div className="bg-background p-3 rounded border mb-4">
                          <h4 className="font-medium mb-1">Admin Notes:</h4>
                          <p className="text-sm text-muted-foreground">{submission.notes}</p>
                        </div>
                      )}
                      
                      <div className="text-sm text-muted-foreground">
                        Received: {new Date(submission.createdAt).toLocaleString()}
                        {submission.updatedAt !== submission.createdAt && (
                          <span> • Updated: {new Date(submission.updatedAt).toLocaleString()}</span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex flex-col gap-2 ml-4">
                    <select
                      value={submission.status}
                      onChange={(e) => updateSubmission(submission.id, { status: e.target.value as any })}
                      className="text-sm p-1 border border-border rounded bg-background text-foreground"
                    >
                      <option value="UNREAD">Unread</option>
                      <option value="READ">Read</option>
                      <option value="ARCHIVED">Archived</option>
                    </select>
                    
                    <select
                      value={submission.priority}
                      onChange={(e) => updateSubmission(submission.id, { priority: e.target.value as any })}
                      className="text-sm p-1 border border-border rounded bg-background text-foreground"
                    >
                      <option value="LOW">Low</option>
                      <option value="NORMAL">Normal</option>
                      <option value="HIGH">High</option>
                      <option value="URGENT">Urgent</option>
                    </select>
                    
                    <button
                      onClick={() => updateSubmission(submission.id, { isResponded: !submission.isResponded })}
                      className={`text-sm px-3 py-1 rounded ${
                        submission.isResponded 
                          ? 'bg-green-500 text-white hover:bg-green-600' 
                          : 'bg-gray-500 text-white hover:bg-gray-600'
                      }`}
                    >
                      {submission.isResponded ? 'Responded' : 'Mark Responded'}
                    </button>
                    
                    <button
                      onClick={() => openReplyModal(submission)}
                      className="text-sm bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600"
                    >
                      Reply
                    </button>
                    
                    <button
                      onClick={() => {
                        const notes = prompt('Add admin notes:', submission.notes || '');
                        if (notes !== null) {
                          updateSubmission(submission.id, { notes });
                        }
                      }}
                      className="text-sm bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
                    >
                      Add Notes
                    </button>
                    
                    <button
                      onClick={() => deleteSubmission(submission.id)}
                      className="text-sm bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Reply Modal */}
        {replyModal.isOpen && replyModal.submission && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-background border border-border rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold">Reply to {replyModal.submission.name}</h3>
                <button
                  onClick={closeReplyModal}
                  className="text-muted-foreground hover:text-foreground text-2xl"
                >
                  ×
                </button>
              </div>

              {/* Original Message */}
              <div className="mb-6 p-4 bg-secondary rounded-lg">
                <h4 className="font-medium mb-2">Original Message:</h4>
                <p className="text-sm text-muted-foreground mb-2">
                  From: {replyModal.submission.name} ({replyModal.submission.email})
                </p>
                <p className="text-sm">{replyModal.submission.message}</p>
              </div>

              {/* Reply Form */}
              <div className="mb-6">
                <label className="block text-sm font-medium mb-2">
                  Subject Line:
                </label>
                <input
                  type="text"
                  value={replySubject}
                  onChange={(e) => setReplySubject(e.target.value)}
                  placeholder="Enter email subject..."
                  className="w-full p-3 border border-border rounded bg-background text-foreground mb-4"
                  disabled={sendingReply}
                />
                
                <label className="block text-sm font-medium mb-2">
                  Your Reply:
                </label>
                <textarea
                  value={replyMessage}
                  onChange={(e) => setReplyMessage(e.target.value)}
                  placeholder="Type your reply here..."
                  className="w-full p-3 border border-border rounded bg-background text-foreground min-h-[120px] resize-y"
                  disabled={sendingReply}
                />
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-3">
                <button
                  onClick={closeReplyModal}
                  className="px-4 py-2 border border-border rounded hover:bg-secondary"
                  disabled={sendingReply}
                >
                  Cancel
                </button>
                <button
                  onClick={sendReply}
                  disabled={!replyMessage.trim() || !replySubject.trim() || sendingReply}
                  className="px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {sendingReply ? 'Sending...' : 'Send Reply'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}