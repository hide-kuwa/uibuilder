'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
export default function Page() {
  const [email,setEmail]=useState('')
  const [password,setPassword]=useState('')
  const router=useRouter()
  const submit=async(e:React.FormEvent)=>{
    e.preventDefault()
    const res=await fetch('/auth/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email,password})})
    if(!res.ok) return
    const data=await res.json()
    localStorage.setItem('token',data.access_token)
    router.push('/builder')
  }
  return(
    <form onSubmit={submit} className="flex flex-col gap-2 p-4">
      <input type="email" value={email} onChange={e=>setEmail(e.target.value)} className="border p-2"/>
      <input type="password" value={password} onChange={e=>setPassword(e.target.value)} className="border p-2"/>
      <button type="submit" className="px-4 py-2 bg-blue-500 text-white rounded">Login</button>
    </form>
  )
}
