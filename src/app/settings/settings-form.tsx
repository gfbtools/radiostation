'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

interface SettingsFormProps {
  user: { id: string; email?: string }
  profile: any
}

export function SettingsForm({ user, profile }: SettingsFormProps) {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<'account' | 'social' | 'danger'>('account')

  // Email
  const [email, setEmail] = useState(user.email || '')
  const [emailMsg, setEmailMsg] = useState('')
  const [emailLoading, setEmailLoading] = useState(false)

  // Password
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [passwordMsg, setPasswordMsg] = useState('')
  const [passwordLoading, setPasswordLoading] = useState(false)

  // Social links
  const [socials, setSocials] = useState({
    instagram_url: profile?.instagram_url || '',
    soundcloud_url: profile?.soundcloud_url || '',
    twitter_url: profile?.twitter_url || '',
    mixcloud_url: profile?.mixcloud_url || '',
  })
  const [socialMsg, setSocialMsg] = useState('')
  const [socialLoading, setSocialLoading] = useState(false)

  // Delete
  const [deleteConfirm, setDeleteConfirm] = useState('')
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [deleteMsg, setDeleteMsg] = useState('')

  const handleEmailUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    setEmailLoading(true)
    setEmailMsg('')
    const supabase = createClient()
    const { error } = await supabase.auth.updateUser({ email })
    if (error) {
      setEmailMsg(`Error: ${error.message}`)
    } else {
      setEmailMsg('Check your new email address to confirm the change.')
    }
    setEmailLoading(false)
  }

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    setPasswordLoading(true)
    setPasswordMsg('')

    if (newPassword !== confirmPassword) {
      setPasswordMsg('Passwords do not match.')
      setPasswordLoading(false)
      return
    }
    if (newPassword.length < 8) {
      setPasswordMsg('Password must be at least 8 characters.')
      setPasswordLoading(false)
      return
    }

    const supabase = createClient()
    const { error } = await supabase.auth.updateUser({ password: newPassword })
    if (error) {
      setPasswordMsg(`Error: ${error.message}`)
    } else {
      setPasswordMsg('Password updated successfully.')
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
    }
    setPasswordLoading(false)
  }

  const handleSocialUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    setSocialLoading(true)
    setSocialMsg('')
    const supabase = createClient()
    const { error } = await supabase
      .from('profiles' as any)
      .update(socials)
      .eq('id', user.id)
    if (error) {
      setSocialMsg(`Error: ${error.message}`)
    } else {
      setSocialMsg('Social links updated.')
      router.refresh()
    }
    setSocialLoading(false)
  }

  const handleDeleteAccount = async () => {
    if (deleteConfirm !== profile?.handle) {
      setDeleteMsg(`Type your handle "${profile?.handle}" to confirm.`)
      return
    }
    setDeleteLoading(true)
    // Delete profile (cascades to all user data via FK)
    const supabase = createClient()
    await supabase.from('profiles' as any).delete().eq('id', user.id)
    await supabase.auth.signOut()
    router.push('/')
  }

  const tabs = [
    { id: 'account', label: 'Account' },
    { id: 'social', label: 'Social Links' },
    { id: 'danger', label: 'Danger Zone' },
  ] as const

  return (
    <div>
      {/* Tabs */}
      <div className="flex border-b border-gray-200 mb-8">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === tab.id
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            } ${tab.id === 'danger' ? 'text-red-500 hover:text-red-600' : ''}`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Account Tab */}
      {activeTab === 'account' && (
        <div className="space-y-8">
          {/* Email */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-base font-semibold text-gray-900 mb-4">Email Address</h2>
            <form onSubmit={handleEmailUpdate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              {emailMsg && (
                <p className={`text-sm ${emailMsg.startsWith('Error') ? 'text-red-500' : 'text-green-600'}`}>
                  {emailMsg}
                </p>
              )}
              <button
                type="submit"
                disabled={emailLoading || email === user.email}
                className="px-5 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50"
              >
                {emailLoading ? 'Updating...' : 'Update Email'}
              </button>
            </form>
          </div>

          {/* Password */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-base font-semibold text-gray-900 mb-4">Change Password</h2>
            <form onSubmit={handlePasswordUpdate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  placeholder="Minimum 8 characters"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              {passwordMsg && (
                <p className={`text-sm ${passwordMsg.startsWith('Error') || passwordMsg.includes('match') || passwordMsg.includes('least') ? 'text-red-500' : 'text-green-600'}`}>
                  {passwordMsg}
                </p>
              )}
              <button
                type="submit"
                disabled={passwordLoading || !newPassword}
                className="px-5 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50"
              >
                {passwordLoading ? 'Updating...' : 'Update Password'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Social Links Tab */}
      {activeTab === 'social' && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-base font-semibold text-gray-900 mb-1">Social Links</h2>
          <p className="text-sm text-gray-500 mb-6">These will appear on your public profile.</p>
          <form onSubmit={handleSocialUpdate} className="space-y-4">
            {[
              { key: 'instagram_url', label: 'Instagram', placeholder: 'https://instagram.com/yourhandle' },
              { key: 'soundcloud_url', label: 'SoundCloud', placeholder: 'https://soundcloud.com/yourhandle' },
              { key: 'twitter_url', label: 'X / Twitter', placeholder: 'https://x.com/yourhandle' },
              { key: 'mixcloud_url', label: 'Mixcloud', placeholder: 'https://mixcloud.com/yourhandle' },
            ].map(({ key, label, placeholder }) => (
              <div key={key}>
                <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
                <input
                  type="url"
                  value={socials[key as keyof typeof socials]}
                  onChange={e => setSocials(prev => ({ ...prev, [key]: e.target.value }))}
                  placeholder={placeholder}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            ))}
            {socialMsg && (
              <p className={`text-sm ${socialMsg.startsWith('Error') ? 'text-red-500' : 'text-green-600'}`}>
                {socialMsg}
              </p>
            )}
            <button
              type="submit"
              disabled={socialLoading}
              className="px-5 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50"
            >
              {socialLoading ? 'Saving...' : 'Save Links'}
            </button>
          </form>
        </div>
      )}

      {/* Danger Zone Tab */}
      {activeTab === 'danger' && (
        <div className="bg-white rounded-xl border border-red-200 p-6">
          <h2 className="text-base font-semibold text-red-700 mb-1">Delete Account</h2>
          <p className="text-sm text-gray-600 mb-6">
            This permanently deletes your account, all your mixes, comments, and followers. This cannot be undone.
          </p>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Type <span className="font-mono font-bold text-gray-900">@{profile?.handle}</span> to confirm
              </label>
              <input
                type="text"
                value={deleteConfirm}
                onChange={e => setDeleteConfirm(e.target.value)}
                placeholder={profile?.handle}
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>
            {deleteMsg && <p className="text-sm text-red-500">{deleteMsg}</p>}
            <button
              onClick={handleDeleteAccount}
              disabled={deleteLoading}
              className="px-5 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 disabled:opacity-50"
            >
              {deleteLoading ? 'Deleting...' : 'Delete My Account'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
