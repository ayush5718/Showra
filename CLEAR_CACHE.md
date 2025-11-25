# How to Clear Cache for Showra

## 1. Browser Cache (Chrome/Edge)

### Method 1: Hard Refresh
- **Windows/Linux**: `Ctrl + Shift + R` or `Ctrl + F5`
- **Mac**: `Cmd + Shift + R`

### Method 2: Clear Site Data
1. Open Developer Tools (`F12` or `Ctrl+Shift+I`)
2. Go to **Application** tab (Chrome) or **Storage** tab (Firefox)
3. Click **Clear site data** or **Clear storage**
4. Check all boxes:
   - ✅ Cookies and other site data
   - ✅ Cached images and files
   - ✅ Local storage
   - ✅ Session storage
5. Click **Clear data**

### Method 3: Clear via Settings
1. Press `Ctrl+Shift+Delete` (Windows) or `Cmd+Shift+Delete` (Mac)
2. Select **All time** or **Last hour**
3. Check:
   - ✅ Cookies and other site data
   - ✅ Cached images and files
4. Click **Clear data**

## 2. Clear Next.js Build Cache

### Stop the dev server and run:
```bash
# Delete .next folder
rm -rf .next

# Or on Windows PowerShell:
Remove-Item -Recurse -Force .next

# Then restart dev server
npm run dev
```

## 3. Clear localStorage (Programmatic)

Open browser console (`F12`) and run:
```javascript
// Clear all localStorage
localStorage.clear();

// Clear specific keys
localStorage.removeItem('showra-auth-storage');
localStorage.removeItem('supabase.auth.token');

// Clear sessionStorage
sessionStorage.clear();

// Reload page
location.reload();
```

## 4. Clear Supabase Auth Cache

In browser console:
```javascript
// Clear Supabase auth tokens
localStorage.removeItem('sb-' + 'YOUR_PROJECT_REF' + '-auth-token');
// Replace YOUR_PROJECT_REF with your actual Supabase project ref

// Or clear all Supabase related items
Object.keys(localStorage).forEach(key => {
  if (key.startsWith('sb-') || key.includes('supabase')) {
    localStorage.removeItem(key);
  }
});
```

## 5. Clear All Caches (Complete Reset)

### Quick Script (Run in Browser Console):
```javascript
// Clear all storage
localStorage.clear();
sessionStorage.clear();

// Clear cookies for localhost
document.cookie.split(";").forEach(function(c) { 
  document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/"); 
});

// Clear Next.js cache (requires server restart)
console.log('✅ Cleared browser cache. Now restart your dev server and clear .next folder.');

// Reload
location.reload();
```

## 6. Clear Node Modules (If Issues Persist)

```bash
# Delete node_modules and package-lock.json
rm -rf node_modules package-lock.json

# Or on Windows:
Remove-Item -Recurse -Force node_modules
Remove-Item package-lock.json

# Reinstall
npm install
```

## 7. Incognito/Private Mode

Test in incognito/private mode to bypass all cache:
- **Chrome**: `Ctrl+Shift+N` (Windows) or `Cmd+Shift+N` (Mac)
- **Firefox**: `Ctrl+Shift+P` (Windows) or `Cmd+Shift+P` (Mac)
- **Edge**: `Ctrl+Shift+N` (Windows) or `Cmd+Shift+N` (Mac)

## Recommended Steps for Auth Issues

1. **Clear browser cache** (Method 1 or 2 above)
2. **Clear localStorage** (Method 3)
3. **Clear Next.js cache** (Method 2)
4. **Restart dev server**
5. **Test in incognito mode**

