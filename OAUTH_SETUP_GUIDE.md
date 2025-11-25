# GitHub OAuth Setup Guide for Showra

## ✅ Complete Setup Checklist

### 1. GitHub OAuth App Configuration

Go to: https://github.com/settings/developers → OAuth Apps → Your App

**Required Settings:**
- **Application name:** Showra (or your app name)
- **Homepage URL:** `http://localhost:3000` (for local dev)
- **Authorization callback URL:** `https://iiwbysvframqnpwytbyq.supabase.co/auth/v1/callback`
  - ⚠️ This MUST be your Supabase callback URL, NOT your app's callback URL
  - Format: `https://<your-project-ref>.supabase.co/auth/v1/callback`

**After creating/updating:**
- Copy the **Client ID**
- Generate and copy the **Client Secret**

### 2. Supabase Dashboard Configuration

Go to: https://supabase.com/dashboard → Your Project → Authentication → Providers → GitHub

**Required Settings:**
- **Enable GitHub provider:** ✅ Toggle ON
- **Client ID (from GitHub):** Paste your GitHub OAuth App Client ID
- **Client Secret (from GitHub):** Paste your GitHub OAuth App Client Secret
- **Save** the settings

### 3. Supabase URL Configuration

Go to: Authentication → URL Configuration

**Site URL:**
```
http://localhost:3000
```

**Redirect URLs (add these):**
```
http://localhost:3000
http://localhost:3000/auth/callback
http://localhost:3000/**
```

**For Production (add when deploying):**
```
https://yourdomain.com
https://yourdomain.com/auth/callback
https://yourdomain.com/**
```

### 4. Environment Variables

Make sure these are in your `.env.local` file:

```env
NEXT_PUBLIC_SUPABASE_URL=https://iiwbysvframqnpwytbyq.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
```

### 5. Verify the Flow

**Expected OAuth Flow:**
1. User clicks "Get Started"
2. Redirects to: `https://iiwbysvframqnpwytbyq.supabase.co/auth/v1/authorize?provider=github&redirect_to=http://localhost:3000/auth/callback?next=/dashboard`
3. Supabase redirects to GitHub login
4. User authorizes on GitHub
5. GitHub redirects to: `https://iiwbysvframqnpwytbyq.supabase.co/auth/v1/callback`
6. Supabase processes OAuth and redirects to: `http://localhost:3000/auth/callback?code=...&next=/dashboard`
7. Your callback route exchanges code for session
8. User is redirected to `/dashboard`

## 🔍 Troubleshooting

### Issue: "Unable to exchange external code"
**Solution:**
- Verify GitHub OAuth App callback URL matches Supabase callback URL exactly
- Check that Client ID and Secret are correct in Supabase
- Ensure redirect URL is in Supabase's allowed list

### Issue: Redirect not happening after GitHub authorization
**Solution:**
- Check browser console for errors
- Check terminal logs for callback route logs
- Verify redirect URL is in Supabase's allowed list
- Clear browser cache and cookies

### Issue: Session not persisting
**Solution:**
- Check that `persistSession: true` in Supabase client config
- Verify localStorage is not blocked
- Check browser console for storage errors

## 📝 Important Notes

1. **GitHub Callback URL** = Supabase callback URL (NOT your app's callback)
2. **Supabase Redirect URLs** = Your app's URLs (where Supabase redirects after OAuth)
3. The `redirectTo` in code must match one of the Supabase Redirect URLs exactly
4. Wildcards (`**`) can be used in Supabase Redirect URLs for flexibility

## 🧪 Testing

1. Clear browser cache and localStorage
2. Click "Get Started"
3. Complete GitHub login
4. Should redirect to dashboard automatically
5. Check terminal for callback route logs
6. Verify user is logged in

