'use client'
export function addExp(type:string){
  const d = new Date(); const key = `uib.exp.${d.toISOString().slice(0,10)}`
  const obj = JSON.parse(localStorage.getItem(key) || '{}')
  obj[type] = (obj[type]||0) + 1
  localStorage.setItem(key, JSON.stringify(obj))
}
export function getTodayExpTotal(){
  const key = `uib.exp.${new Date().toISOString().slice(0,10)}`
  const obj = JSON.parse(localStorage.getItem(key) || '{}')
  return Object.values(obj).reduce((a:number,b:any)=> a + Number(b||0), 0)
}
