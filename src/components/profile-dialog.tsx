'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { UserAvatar } from './user-avatar'
import { UploadButton } from '@/lib/uploadthing'
import { toast } from 'sonner'
import { Loader2, Upload, Link as LinkIcon, X } from 'lucide-react'

interface Profile {
  id: string
  name: string
  email: string
  avatar: string | null
  bio: string | null
  createdAt: string
}

interface ProfileDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onProfileUpdate: () => void
}

export function ProfileDialog({ open, onOpenChange, onProfileUpdate }: ProfileDialogProps) {
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)
  const [profile, setProfile] = useState<Profile | null>(null)
  
  const [name, setName] = useState('')
  const [avatar, setAvatar] = useState('')
  const [bio, setBio] = useState('')
  const [uploadingImage, setUploadingImage] = useState(false)

  useEffect(() => {
    if (open) {
      fetchProfile()
    }
  }, [open])

  useEffect(() => {
    if (profile) {
      setName(profile.name)
      setAvatar(profile.avatar || '')
      setBio(profile.bio || '')
    }
  }, [profile])

  const fetchProfile = async () => {
    setFetching(true)
    try {
      const response = await fetch('/api/profile')
      if (response.ok) {
        const data = await response.json()
        setProfile(data)
      } else {
        toast.error('Failed to load profile')
      }
    } catch (error) {
      console.error('Error fetching profile:', error)
      toast.error('Failed to load profile')
    } finally {
      setFetching(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          name: name.trim(), 
          avatar: avatar.trim() || null,
          bio: bio.trim() || null
        })
      })

      if (response.ok) {
        const updatedProfile = await response.json()
        setProfile(updatedProfile)
        toast.success('Profile updated successfully!')
        onProfileUpdate()
        onOpenChange(false)
      } else {
        const data = await response.json()
        toast.error(data.error || 'Failed to update profile')
      }
    } catch (error) {
      console.error('Error updating profile:', error)
      toast.error('Failed to update profile')
    } finally {
      setLoading(false)
    }
  }

  const removeAvatar = () => {
    setAvatar('')
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px] max-h-[90vh] overflow-y-auto">
        {fetching ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <DialogHeader>
              <DialogTitle>Edit Profile</DialogTitle>
              <DialogDescription>
                Update your profile information and avatar
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-6 py-4">
              {/* Avatar Preview */}
              <div className="flex flex-col items-center gap-4">
                <UserAvatar 
                  name={name} 
                  avatar={avatar} 
                  email={profile?.email}
                  className="h-24 w-24"
                />
                {avatar && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={removeAvatar}
                    className="gap-2"
                  >
                    <X className="h-3 w-3" />
                    Remove Avatar
                  </Button>
                )}
              </div>

              <Separator />

              {/* Avatar Upload Tabs */}
              <div className="grid gap-3">
                <Label>Avatar</Label>
                <Tabs defaultValue="upload" className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="upload">
                      <Upload className="h-4 w-4 mr-2" />
                      Upload
                    </TabsTrigger>
                    <TabsTrigger value="url">
                      <LinkIcon className="h-4 w-4 mr-2" />
                      URL
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="upload" className="space-y-3">
                    <div className="flex flex-col items-center gap-3 p-4 border rounded-lg bg-muted/50">
                      <UploadButton
                        endpoint="avatarUploader"
                        onClientUploadComplete={(res) => {
                          if (res && res[0]) {
                            setAvatar(res[0].url)
                            toast.success('Image uploaded successfully!')
                            setUploadingImage(false)
                          }
                        }}
                        onUploadError={(error: Error) => {
                          toast.error(`Upload failed: ${error.message}`)
                          setUploadingImage(false)
                        }}
                        onUploadBegin={() => {
                          setUploadingImage(true)
                          toast.info('Uploading image...')
                        }}
                      />
                      <p className="text-xs text-muted-foreground text-center">
                        Upload an image (max 4MB)
                      </p>
                    </div>
                  </TabsContent>

                  <TabsContent value="url" className="space-y-3">
                    <Input
                      type="url"
                      value={avatar}
                      onChange={(e) => setAvatar(e.target.value)}
                      placeholder="https://example.com/avatar.jpg"
                    />
                    <p className="text-xs text-muted-foreground">
                      Or provide a direct URL to your avatar image
                    </p>
                  </TabsContent>
                </Tabs>
              </div>

              <Separator />

              {/* Name Field */}
              <div className="grid gap-2">
                <Label htmlFor="name">Name *</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your name"
                  required
                />
              </div>

              {/* Bio Field */}
              <div className="grid gap-2">
                <Label htmlFor="bio">Bio (Optional)</Label>
                <Textarea
                  id="bio"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Tell us about yourself..."
                  rows={3}
                  maxLength={200}
                />
                <p className="text-xs text-muted-foreground text-right">
                  {bio.length}/200 characters
                </p>
              </div>

              {/* Account Info */}
              <div className="grid gap-2 p-3 bg-muted/50 rounded-lg">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Email:</span>
                  <span className="font-medium">{profile?.email}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Member since:</span>
                  <span className="font-medium">
                    {profile?.createdAt && new Date(profile.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => onOpenChange(false)}
                disabled={loading || uploadingImage}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={loading || uploadingImage}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : uploadingImage ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  'Save Changes'
                )}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}