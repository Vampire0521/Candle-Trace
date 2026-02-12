// =============================================
// CANDLE TRACE - TAG MANAGEMENT COMPONENT
// Create, edit, delete tags with color picker
// =============================================

'use client';

import { useState, useEffect } from 'react';
import { TradeTag, TagFormData } from '@/types';
import styles from './TagManager.module.css';

const TAG_COLORS = [
    '#A3A3A3', // Purple
    '#3b82f6', // Blue
    '#22c55e', // Green
    '#ef4444', // Red
    '#f59e0b', // Amber
    '#ec4899', // Pink
    '#06b6d4', // Cyan
    '#f97316', // Orange
    '#84cc16', // Lime
    '#6366f1', // Indigo
];

export function TagManager() {
    const [tags, setTags] = useState<TradeTag[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isCreating, setIsCreating] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [formData, setFormData] = useState<TagFormData>({ name: '', color: '#A3A3A3' });
    const [error, setError] = useState<string | null>(null);

    // Fetch tags on mount
    useEffect(() => {
        fetchTags();
    }, []);

    const fetchTags = async () => {
        try {
            const res = await fetch('/api/tags');
            const { data, error } = await res.json();
            if (error) throw new Error(error);
            setTags(data || []);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load tags');
        } finally {
            setIsLoading(false);
        }
    };

    const handleCreate = async () => {
        if (!formData.name.trim()) return;

        try {
            setError(null);
            const res = await fetch('/api/tags', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });
            const { data, error } = await res.json();
            if (error) throw new Error(error);

            setTags([...tags, data]);
            setFormData({ name: '', color: '#A3A3A3' });
            setIsCreating(false);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to create tag');
        }
    };

    const handleUpdate = async (id: string) => {
        if (!formData.name.trim()) return;

        try {
            setError(null);
            const res = await fetch(`/api/tags/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });
            const { data, error } = await res.json();
            if (error) throw new Error(error);

            setTags(tags.map(t => t.id === id ? data : t));
            setEditingId(null);
            setFormData({ name: '', color: '#A3A3A3' });
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to update tag');
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Delete this tag? It will be removed from all trades.')) return;

        try {
            setError(null);
            const res = await fetch(`/api/tags/${id}`, { method: 'DELETE' });
            if (!res.ok) {
                const { error } = await res.json();
                throw new Error(error);
            }

            setTags(tags.filter(t => t.id !== id));
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to delete tag');
        }
    };

    const startEdit = (tag: TradeTag) => {
        setEditingId(tag.id);
        setFormData({ name: tag.name, color: tag.color });
        setIsCreating(false);
    };

    const cancelEdit = () => {
        setEditingId(null);
        setIsCreating(false);
        setFormData({ name: '', color: '#A3A3A3' });
    };

    if (isLoading) {
        return <div className={styles.loading}>Loading tags...</div>;
    }

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h3 className={styles.title}>🏷️ Trade Tags</h3>
                {!isCreating && !editingId && (
                    <button
                        className={styles.addButton}
                        onClick={() => setIsCreating(true)}
                    >
                        + New Tag
                    </button>
                )}
            </div>

            {error && <div className={styles.error}>{error}</div>}

            {/* Create/Edit Form */}
            {(isCreating || editingId) && (
                <div className={styles.form}>
                    <input
                        type="text"
                        className={styles.input}
                        placeholder="Tag name..."
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        autoFocus
                    />
                    <div className={styles.colorPicker}>
                        {TAG_COLORS.map((color) => (
                            <button
                                key={color}
                                className={`${styles.colorSwatch} ${formData.color === color ? styles.selected : ''}`}
                                style={{ backgroundColor: color }}
                                onClick={() => setFormData({ ...formData, color })}
                            />
                        ))}
                    </div>
                    <div className={styles.formActions}>
                        <button
                            className={styles.saveButton}
                            onClick={() => editingId ? handleUpdate(editingId) : handleCreate()}
                        >
                            {editingId ? 'Update' : 'Create'}
                        </button>
                        <button className={styles.cancelButton} onClick={cancelEdit}>
                            Cancel
                        </button>
                    </div>
                </div>
            )}

            {/* Tags List */}
            <div className={styles.tagsList}>
                {tags.length === 0 ? (
                    <p className={styles.emptyState}>No tags yet. Create one to organize your trades!</p>
                ) : (
                    tags.map((tag) => (
                        <div key={tag.id} className={styles.tagItem}>
                            <div className={styles.tagInfo}>
                                <span
                                    className={styles.tagColor}
                                    style={{ backgroundColor: tag.color }}
                                />
                                <span className={styles.tagName}>{tag.name}</span>
                            </div>
                            <div className={styles.tagActions}>
                                <button
                                    className={styles.editButton}
                                    onClick={() => startEdit(tag)}
                                >
                                    ✏️
                                </button>
                                <button
                                    className={styles.deleteButton}
                                    onClick={() => handleDelete(tag.id)}
                                >
                                    🗑️
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
