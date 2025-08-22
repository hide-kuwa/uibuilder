import React from 'react';
import { useEditorStore } from '@/store/editorStore';

export default function ReviewBar() {
  const status = useEditorStore((s) => s.review.status);
  const setStatus = useEditorStore((s) => s.setReviewStatus);
  const require = useEditorStore((s) => s.review.requireApprovedToShare);
  const toggle = useEditorStore((s) => s.toggleRequireApprovedToShare);

  return (
    <div className="review-bar">
      <select
        value={status}
        onChange={(e) => setStatus(e.target.value as any)}
      >
        <option value="DRAFT">Draft</option>
        <option value="IN_REVIEW">In Review</option>
        <option value="CHANGES_REQUESTED">Changes Requested</option>
        <option value="APPROVED">Approved</option>
      </select>
      <label>
        <input
          type="checkbox"
          checked={require}
          onChange={toggle}
        />
        Approved required to share
      </label>
    </div>
  );
}
