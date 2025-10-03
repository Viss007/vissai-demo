import { redirect } from 'next/navigation'

export default function Home() {
  redirect('/voicebot/index.html')
  return null
}
