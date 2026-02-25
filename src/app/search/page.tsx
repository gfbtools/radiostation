import { createClient } from '@/lib/supabase/server'
import Image from 'next/image'
import Link from 'next/link'
import { SearchBar } from './search-bar'

interface SearchPageProps {
  searchParams: { q?: string; tab?: string }
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const supabase = await createClient()
  const query = searchParams.q?.trim() || ''
  const tab = searchParams.tab || 'all'

  let results: any[] = []

  if (query) {
    const { data } = await supabase.rpc('search_platform' as any, {
      search_query: query,
      result_limit: 20,
    } as any) as { data: any[] | null }
    results = data || []
  }

  const djResults = results.filter(r => r.result_type === 'dj')
  const setResults = results.filter(r => r.result_type === 'set')
  const displayed = tab === 'djs' ? djResults : tab === 'sets' ? setResults : results

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Search</h1>

      <SearchBar initialQuery={query} />

      {query && (
        <>
          {/* Tabs */}
          <div className="flex gap-1 mt-6 mb-4 border-b border-gray-200">
            {[
              { id: 'all', label: `All (${results.length})` },
              { id: 'djs', label: `DJs (${djResults.length})` },
              { id: 'sets', label: `Sets (${setResults.length})` },
            ].map(t => (
              <Link
                key={t.id}
                href={`/search?q=${encodeURIComponent(query)}&tab=${t.id}`}
                className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
                  tab === t.id
                    ? 'border-indigo-600 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                {t.label}
              </Link>
            ))}
          </div>

          {/* Results */}
          {displayed.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-gray-500">No results for "{query}"</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100 bg-white rounded-xl shadow-sm overflow-hidden">
              {displayed.map((result) => (
                <SearchResultRow key={`${result.result_type}-${result.id}`} result={result} />
              ))}
            </div>
          )}
        </>
      )}

      {!query && (
        <div className="text-center py-20 text-gray-400">
          <svg className="w-10 h-10 mx-auto mb-3 opacity-40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <p>Search for DJs or mixes</p>
        </div>
      )}
    </div>
  )
}

function SearchResultRow({ result }: { result: any }) {
  const isDJ = result.result_type === 'dj'

  return (
    <Link href={result.url} className="flex items-center gap-4 p-4 hover:bg-gray-50 transition-colors">
      <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-gray-200 flex-shrink-0">
        {result.avatar_or_artwork ? (
          <Image src={result.avatar_or_artwork} alt={result.title} fill className="object-cover" />
        ) : (
          <div className={`w-full h-full flex items-center justify-center ${isDJ ? 'bg-indigo-100' : 'bg-gradient-to-br from-indigo-500 to-purple-600'}`}>
            {isDJ ? (
              <svg className="w-6 h-6 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            ) : (
              <svg className="w-6 h-6 text-white opacity-60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
              </svg>
            )}
          </div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-gray-900 truncate">{result.title}</p>
        <p className="text-sm text-gray-500 truncate">{result.subtitle}</p>
      </div>
      <span className={`text-xs px-2 py-1 rounded-full font-medium flex-shrink-0 ${
        isDJ ? 'bg-indigo-50 text-indigo-600' : 'bg-purple-50 text-purple-600'
      }`}>
        {isDJ ? 'DJ' : 'Mix'}
      </span>
    </Link>
  )
}
