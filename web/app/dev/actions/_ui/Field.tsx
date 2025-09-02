'use client'
export function CardFieldset({title,children}:{title:string;children:any}) {
  return (
    <fieldset className="border rounded-md p-3">
      <legend className="px-1 text-xs font-medium text-muted-foreground">{title}</legend>
      {children}
    </fieldset>
  )
}
