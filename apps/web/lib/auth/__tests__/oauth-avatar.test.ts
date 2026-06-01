import { getOAuthAvatarUrl, resolveUserAvatarUrl } from '@/lib/auth/oauth-avatar'

describe('getOAuthAvatarUrl', () => {
    it('reads user_metadata.avatar_url', () => {
        expect(
            getOAuthAvatarUrl({
                user_metadata: { avatar_url: ' https://a.com/1.jpg ' },
                identities: [],
            })
        ).toBe('https://a.com/1.jpg')
    })

    it('reads Google user_metadata.picture', () => {
        expect(
            getOAuthAvatarUrl({
                user_metadata: { picture: 'https://lh3.googleusercontent.com/photo' },
                identities: [],
            })
        ).toBe('https://lh3.googleusercontent.com/photo')
    })

    it('prefers avatar_url over picture in metadata', () => {
        expect(
            getOAuthAvatarUrl({
                user_metadata: {
                    avatar_url: 'https://a.com/a.jpg',
                    picture: 'https://a.com/p.jpg',
                },
                identities: [],
            })
        ).toBe('https://a.com/a.jpg')
    })

    it('reads picture from provider identity_data', () => {
        expect(
            getOAuthAvatarUrl({
                user_metadata: {},
                identities: [
                    {
                        identity_id: '1',
                        id: '1',
                        user_id: 'u',
                        provider: 'google',
                        identity_data: { picture: 'https://google.cdn/p.jpg' },
                        created_at: '',
                        last_sign_in_at: '',
                        updated_at: '',
                    },
                ],
            })
        ).toBe('https://google.cdn/p.jpg')
    })

    it('returns null when no photo is available', () => {
        expect(
            getOAuthAvatarUrl({
                user_metadata: {},
                identities: [],
            })
        ).toBeNull()
    })
})

describe('resolveUserAvatarUrl', () => {
    it('prefers profile avatar over OAuth metadata', () => {
        expect(
            resolveUserAvatarUrl('https://profile.com/x.jpg', {
                user_metadata: { picture: 'https://google.com/y.jpg' },
                identities: [],
            })
        ).toBe('https://profile.com/x.jpg')
    })

    it('falls back to OAuth metadata when profile is empty', () => {
        expect(
            resolveUserAvatarUrl(null, {
                user_metadata: { picture: 'https://google.com/y.jpg' },
                identities: [],
            })
        ).toBe('https://google.com/y.jpg')
    })
})
