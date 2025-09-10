import { readFileSync, writeFileSync } from 'node:fs'

const DOC = 'docs/testing.md'
const START = '<!-- CI_P95_START -->'
const END = '<!-- CI_P95_END -->'

const md = readFileSync(DOC, 'utf8')

const input = await new Promise((res) => {
  let buf = ''
  process.stdin.setEncoding('utf8')
  process.stdin.on('data', (d) => (buf += d))
  process.stdin.on('end', () => res(buf.trim()))
})

const i = md.indexOf(START)
const j = md.indexOf(END)
if (i === -1 || j === -1 || j < i) {
  throw new Error('Anchors not found in docs/testing.md')
}

const head = md.slice(0, i + START.length)
const tail = md.slice(j)
const nl = '\n'
const next = head + nl + input + nl + tail
writeFileSync(DOC, next, 'utf8')
console.log('P95 table inserted into docs/testing.md')

