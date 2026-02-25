import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { EmbedPlayer } from './embed-player'

export const metadata = { robots: 'noindex' }

interface EmbedPageProps {
  params: { id: string }
}

export default async function EmbedPage({ params }: EmbedPageProps) {
  const supabase = await createClient()

  const { data: set } = await supabase
    .from('sets' as any)
    .select('*, profiles:user_id(handle, display_name, avatar_url)')
    .eq('id', params.id)
    .eq('is_public', true)
    .single() as { data: any }

  if (!set) notFound()

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://yourplatform.com'

  return <EmbedPlayer set={set} siteUrl={siteUrl} />
}
