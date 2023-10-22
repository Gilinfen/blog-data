import spawn from 'cross-spawn'

spawn('pnpm', ['node'], {
  stdio: 'inherit'
})
spawn('pnpm', ['vite'], {
  stdio: 'inherit'
})
