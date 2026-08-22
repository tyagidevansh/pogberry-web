const endpoint = process.env.CHROME_DEBUG_URL || 'http://127.0.0.1:9222'
const site = process.env.SITE_URL || 'http://127.0.0.1:5173'
const pages = await fetch(`${endpoint}/json`).then((response) => response.json())
const page = pages.find((entry) => entry.type === 'page')
if (!page) throw new Error('No Chrome page target was found.')
const socket = new WebSocket(page.webSocketDebuggerUrl)
await new Promise((resolve, reject) => { socket.addEventListener('open', resolve, { once: true }); socket.addEventListener('error', reject, { once: true }) })
let sequence = 0
const pending = new Map()
socket.addEventListener('message', ({ data }) => { const message = JSON.parse(data); if (!message.id || !pending.has(message.id)) return; const task = pending.get(message.id); pending.delete(message.id); message.error ? task.reject(new Error(message.error.message)) : task.resolve(message.result) })
function command(method, params = {}) { const id = ++sequence; return new Promise((resolve, reject) => { pending.set(id, { resolve, reject }); socket.send(JSON.stringify({ id, method, params })) }) }
const wait = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds))
const evaluate = async (expression) => {
  const response = await command('Runtime.evaluate', { expression, returnByValue: true })
  if (response.exceptionDetails) throw new Error(response.exceptionDetails.exception?.description || response.exceptionDetails.text)
  return response.result.value
}

await command('Runtime.enable')
await command('Page.navigate', { url: `${site}/playground` })
await wait(800)
await evaluate(`localStorage.removeItem('pogberry-project-v2')`)
await command('Page.reload', { ignoreCache: true })
await wait(1500)
await evaluate(`document.querySelector('.studio .button.run').click()`)
await wait(1200)

const diagnostic = await evaluate(`JSON.stringify({ hasCanvas: !!document.querySelector('.studio canvas'), studio: document.querySelector('.studio')?.innerText, terminal: document.querySelector('.studio-terminal pre')?.innerText })`)
if (!JSON.parse(diagnostic).hasCanvas) { console.error(JSON.parse(diagnostic)); socket.close(); process.exit(1) }

const before = await evaluate(`(() => { const c=document.querySelector('.studio canvas'),x=c.getContext('2d'),d=x.getImageData(0,0,640,360).data; let first=-1; for(let px=0;px<640;px++){const i=(170*640+px)*4;if(d[i]===232&&d[i+1]===79&&d[i+2]===115){first=px;break}} return JSON.stringify({first,status:document.querySelector('.game-stage-bar i').textContent,ground:Array.from(x.getImageData(10,320,1,1).data)}) })()`)
await evaluate(`document.querySelector('.studio canvas').dispatchEvent(new KeyboardEvent('keydown',{key:'ArrowRight',bubbles:true}))`)
await wait(450)
await evaluate(`document.querySelector('.studio canvas').dispatchEvent(new KeyboardEvent('keyup',{key:'ArrowRight',bubbles:true}))`)
const after = await evaluate(`(() => { const c=document.querySelector('.studio canvas'),d=c.getContext('2d').getImageData(0,0,640,360).data; for(let px=0;px<640;px++){const i=(170*640+px)*4;if(d[i]===232&&d[i+1]===79&&d[i+2]===115)return px} return -1 })()`)
const result = JSON.parse(before)
if (result.status !== 'running' || result.first < 0 || after <= result.first || result.ground.slice(0,3).join(',') !== '80,126,86') {
  console.error({ result, after })
  process.exit(1)
}

await command('Page.navigate', { url: `${site}/examples` })
await wait(1800)
for (let index = 0; index < 4; index++) {
  await evaluate(`document.querySelectorAll('.example-picker button')[${index}].click()`)
  await wait(700)
  const example = JSON.parse(await evaluate(`JSON.stringify({ running: document.querySelector('.example-player .game-stage-bar i')?.textContent, error: document.querySelector('.example-player .live-game>pre')?.textContent || '', pixels: document.querySelector('.example-player canvas')?.getContext('2d').getImageData(0,0,640,360).data.some((value,index)=>index%4!==3&&value>0) })`))
  if (example.running !== 'running' || example.error || !example.pixels) { console.error({ index, example }); socket.close(); process.exit(1) }
  await evaluate(`document.querySelector('.example-player .live-game-controls button').click()`)
  await wait(350)
  const restarted = JSON.parse(await evaluate(`JSON.stringify({ running: document.querySelector('.example-player .game-stage-bar i')?.textContent, error: document.querySelector('.example-player .live-game>pre')?.textContent || '' })`))
  if (restarted.running !== 'running' || restarted.error) { console.error({ index, restarted }); socket.close(); process.exit(1) }
}

// Stress the lifecycle: switch projects before their previous VM has finished starting.
for (const index of [3, 0, 2, 1, 3]) {
  await evaluate(`document.querySelectorAll('.example-picker button')[${index}].click()`)
  await wait(40)
}
await wait(900)
const switched = JSON.parse(await evaluate(`JSON.stringify({ title: document.querySelector('.example-player h2')?.textContent, running: document.querySelector('.example-player .game-stage-bar i')?.textContent, error: document.querySelector('.example-player .live-game>pre')?.textContent || '' })`))
if (switched.title !== 'Berry catcher' || switched.running !== 'running' || switched.error) { console.error({ switched }); socket.close(); process.exit(1) }

for (const route of ['/', '/learn']) {
  await command('Page.navigate', { url: `${site}${route}` })
  await wait(1400)
  const embedded = JSON.parse(await evaluate(`JSON.stringify({ running: document.querySelector('.live-game .game-stage-bar i')?.textContent, error: document.querySelector('.live-game>pre')?.textContent || '' })`))
  if (embedded.running !== 'running' || embedded.error) { console.error({ route, embedded }); socket.close(); process.exit(1) }
}
socket.close()
console.log(`WebAssembly game host: OK (multi-file input, restarts, rapid switching, 4 examples, embedded games)`)
