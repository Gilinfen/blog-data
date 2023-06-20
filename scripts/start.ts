import spawn from 'cross-spawn'

spawn('pnpm', ['node'], {
  stdio: 'inherit',
})
spawn('pnpm', ['dev'], {
  stdio: 'inherit',
})
