import { config as loadEnv } from 'dotenv'
import { createInterface } from 'readline'
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'
import bcrypt from 'bcryptjs'

// Load .env then .env.local (local overrides)
loadEnv()
loadEnv({ path: '.env.local', override: true })

function prompt(question: string, hidden = false): Promise<string> {
  return new Promise((resolve) => {
    const rl = createInterface({ input: process.stdin, output: process.stdout })

    if (hidden && process.stdout.isTTY) {
      process.stdout.write(question)
      process.stdin.setRawMode(true)
      process.stdin.resume()
      process.stdin.setEncoding('utf8')

      let value = ''
      process.stdin.on('data', function handler(ch: string) {
        if (ch === '\n' || ch === '\r' || ch === '\u0003') {
          process.stdin.setRawMode(false)
          process.stdin.pause()
          process.stdin.removeListener('data', handler)
          process.stdout.write('\n')
          rl.close()
          resolve(value)
        } else if (ch === '\u007f') {
          value = value.slice(0, -1)
        } else {
          value += ch
        }
      })
    } else {
      rl.question(question, (answer) => {
        rl.close()
        resolve(answer)
      })
    }
  })
}

async function main() {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is not set. Make sure your .env or .env.local is configured.')
  }

  // Resolve username: --username flag > ADMIN_USERNAME env var > prompt
  const usernameFlag = process.argv.find((a) => a.startsWith('--username='))
  let username = usernameFlag
    ? usernameFlag.split('=')[1]
    : process.env.ADMIN_USERNAME

  if (!username) {
    username = await prompt('Admin username: ')
  }
  username = username.trim()
  if (!username) throw new Error('Username cannot be empty.')

  // Resolve password: --password flag > prompt (hidden)
  const passwordFlag = process.argv.find((a) => a.startsWith('--password='))
  let newPassword = passwordFlag ? passwordFlag.split('=')[1] : ''

  if (!newPassword) {
    newPassword = await prompt('New password: ', true)
    const confirm = await prompt('Confirm password: ', true)
    if (newPassword !== confirm) throw new Error('Passwords do not match.')
  }
  if (newPassword.length < 8) throw new Error('Password must be at least 8 characters.')

  const pool = new Pool({ connectionString: process.env.DATABASE_URL })
  const adapter = new PrismaPg(pool)
  const prisma = new PrismaClient({ adapter })

  try {
    const existing = await prisma.user.findUnique({ where: { username } })
    if (!existing) {
      throw new Error(`No user found with username "${username}".`)
    }

    const passwordHash = await bcrypt.hash(newPassword, 12)
    await prisma.user.update({ where: { username }, data: { passwordHash } })
    console.log(`Password reset successfully for user: ${username}`)
  } finally {
    await prisma.$disconnect()
    await pool.end()
  }
}

main().catch((e) => {
  console.error('Error:', e.message)
  process.exit(1)
})
