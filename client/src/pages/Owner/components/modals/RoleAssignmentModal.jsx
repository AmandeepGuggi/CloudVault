'use client';

import { useState } from 'react'
import { X, Shield, AlertCircle } from 'lucide-react'

const roleDescriptions = {
  Owner: 'Full access to all systems and user management.',
  Admin: 'Can manage users, files, and billing. Cannot delete Owner accounts.',
  Editor: 'Can create, edit, and delete personal files. No user management.',
  User: 'Read-only access to shared files only.'
}

export default function RoleAssignmentModal({ user, onClose, onConfirm }) {
  const [selectedRole, setSelectedRole] = useState(user.role)
  const [confirmed, setConfirmed] = useState(false)

  const handleAssign = () => {
    if (confirmed && selectedRole !== user.role) {
    onConfirm(selectedRole);
  }
  }

  return (
    <div className="modal-overlay overflow-auto " onClick={onClose}>
      <div className="modal-content mt-9" onClick={e => e.stopPropagation()}>
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-[color:var(--primary)]" />
            <h3 className="text-lg font-semibold text-[color:var(--foreground)]">Change User Role</h3>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-[color:var(--secondary)] rounded">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="mb-4 p-3 bg-[color:var(--secondary)] rounded-md">
          <p className="text-sm text-[color:var(--foreground)]">
            <span className="font-medium">User:</span> {user.name}
          </p>
          <p className="text-xs text-[color:var(--muted-foreground)] mt-1">{user.email}</p>
        </div>

        <div className="mb-4">
          <label className="text-sm font-medium text-[color:var(--foreground)] block mb-3">
            New Role
          </label>
          <div className="space-y-2">
            {Object.entries(roleDescriptions).map(([role, description]) => (
              <div
                key={role}
                onClick={() => setSelectedRole(role)}
                className={`p-3 rounded-md border-2 cursor-pointer transition-colors ${
                  selectedRole === role
                    ? 'border-[color:var(--primary)] bg-blue-50'
                    : 'border-[color:var(--border)] hover:border-[color:var(--primary)]'
                }`}
              >
                <p className="font-medium text-sm text-[color:var(--foreground)]">{role}</p>
                <p className="text-xs text-[color:var(--muted-foreground)] mt-1">{description}</p>
              </div>
            ))}
          </div>
        </div>

        {selectedRole !== user.role && (
          <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md flex gap-2">
            <AlertCircle className="w-4 h-4 text-[color:var(--warning)] flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-medium text-yellow-800">
                This change will be logged and audited.
              </p>
              <p className="text-xs text-yellow-700 mt-1">
                The user will be notified of their new role.
              </p>
            </div>
          </div>
        )}

        <div className="mb-4 flex items-center gap-2">
          <input
            type="checkbox"
            id="confirm"
            checked={confirmed}
            onChange={e => setConfirmed(e.target.checked)}
            className="w-4 h-4 rounded border-[color:var(--border)] cursor-pointer"
          />
          <label htmlFor="confirm" className="text-xs text-[color:var(--muted-foreground)] cursor-pointer">
            I confirm this role change and accept responsibility for this action
          </label>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 rounded-md border border-[color:var(--border)] text-sm font-medium text-[color:var(--foreground)] hover:bg-[color:var(--secondary)] transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleAssign}
            disabled={!confirmed || selectedRole === user.role}
            className="flex-1 px-4 py-2 rounded-md bg-[color:var(--primary)] text-[color:var(--primary-foreground)] text-sm font-medium hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Assign Role
          </button>
        </div>
      </div>
    </div>
  )
}
