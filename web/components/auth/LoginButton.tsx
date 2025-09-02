'use client'
import React, { useEffect, useState } from 'react'
import { signInWithGoogle, signOutNow, onUser } from '@/services/travel'

export default function LoginButton() {
  const [user, setUser] = useState<unknown>(null)

  useEffect(() => onUser(setUser), [])

  const handle = () => {
    if (user) signOutNow()
    else signInWithGoogle()
  }

  return (
    <button className="px-2 py-1 border rounded" onClick={handle}>
      {user ? 'ログアウト' : 'Googleでログイン'}
    </button>
  )
}

