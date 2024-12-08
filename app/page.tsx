import { getUser } from './lib/auth'
import { redirect } from 'next/navigation'

export default async function Home() {
  const user = await getUser()
  
  // Redirect based on authentication status
  if (user) {
    redirect('/dashboard')
  } else {
    redirect('/auth')
  }
  
  // This won't be reached due to redirects
  return null
}