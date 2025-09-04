'use client'

import { ChangeEvent } from 'react'
import { useRbacStore, FEATURE_KEYS, Role } from '../../../../src/stores/rbacStore'

const ROLE_OPTIONS: Role[] = ['owner', 'manager', 'accountant', 'viewer']

export default function DevRbacPage() {
  const { role, setRole, permissions, setPermission, locks, setLock } = useRbacStore()

  const handleRoleChange = (e: ChangeEvent<HTMLSelectElement>) => {
    setRole(e.target.value as Role)
  }

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">/dev/rbac</h1>

      <div>
        <label className="font-semibold mr-2">Role:</label>
        <select value={role} onChange={handleRoleChange} className="border p-1">
          {ROLE_OPTIONS.map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-4">
        {FEATURE_KEYS.map((key) => {
          const allowed = permissions[role][key]
          const unlocked = locks[key]
          return (
            <div key={key} className="border p-4 rounded space-y-2">
              <h2 className="font-semibold">{key}</h2>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={allowed}
                  onChange={(e) => setPermission(role, key, e.target.checked)}
                />
                <span>allowed</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={unlocked}
                  onChange={(e) => setLock(key, e.target.checked)}
                />
                <span>unlocked</span>
              </label>
              <div className="mt-2 p-2 bg-gray-100 rounded">
                {allowed ? (
                  unlocked ? (
                    <span>Feature UI for {key}</span>
                  ) : (
                    <span>🔒 Locked</span>
                  )
                ) : (
                  <span>❌ No permission</span>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
