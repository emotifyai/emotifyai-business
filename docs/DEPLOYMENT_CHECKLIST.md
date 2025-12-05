# Production Deployment Checklist

## Pre-Deployment

### Environment Variables
- [ ] All production env vars set in Netlify
- [ ] Supabase production project created
- [ ] Anthropic API key configured
- [ ] Lemon Squeezy production mode enabled
- [ ] Webhook secrets configured

### Database
- [ ] Run all Supabase migrations
- [ ] Set up Row Level Security (RLS) policies
- [ ] Create database indexes
- [ ] Test database queries
- [ ] Backup strategy in place

### Security
- [ ] API keys rotated for production
- [ ] CORS configured correctly
- [ ] Rate limiting enabled
- [ ] Security headers configured
- [ ] SSL/TLS certificates valid

### Testing
- [ ] All tests passing
- [ ] TypeScript compilation successful
- [ ] Manual testing completed
- [ ] Cross-browser testing done
- [ ] Mobile responsiveness verified

## Deployment Steps

### Web Application (Netlify)

1. **Connect Repository**
   ```bash
   # Netlify will auto-deploy from main branch
   ```

2. **Configure Build**
   - Base directory: `apps/web`
   - Build command: `bun run build`
   - Publish directory: `apps/web/.next`

3. **Set Environment Variables**
   - Copy from `.env.local.example`
   - Use production values
   - Never commit secrets

4. **Deploy**
   - Push to main branch
   - Netlify auto-deploys
   - Monitor build logs

5. **Verify Deployment**
   - [ ] Homepage loads
   - [ ] Authentication works
   - [ ] API endpoints respond
   - [ ] Database queries work

### Browser Extension

#### Chrome
1. Build: `bun run build && bun run zip`
2. Upload to Chrome Web Store
3. Wait for approval (1-3 days)
4. Publish

#### Firefox
1. Build: `bun run build:firefox && bun run zip:firefox`
2. Upload to Firefox Add-ons
3. Wait for approval (1-5 days)
4. Publish

## Post-Deployment

### Monitoring
- [ ] Set up error tracking (Sentry)
- [ ] Configure uptime monitoring
- [ ] Set up analytics
- [ ] Monitor API usage
- [ ] Check database performance

### Documentation
- [ ] Update README with production URLs
- [ ] Document deployment process
- [ ] Create runbook for common issues
- [ ] Update API documentation

### Communication
- [ ] Announce launch
- [ ] Update social media
- [ ] Send email to beta users
- [ ] Update website

## Rollback Plan

If deployment fails:

1. **Netlify**: Rollback to previous deployment in dashboard
2. **Database**: Restore from backup
3. **Extension**: Cannot rollback (users have old version)

## Health Checks

After deployment, verify:

```bash
# Web app health
curl https://verba.app/api/health

# Database connection
# Check Supabase dashboard

# AI service
# Test enhancement endpoint

# Webhooks
# Send test webhook from Lemon Squeezy
```

## Performance Targets

- [ ] Page load < 2s
- [ ] API response < 500ms
- [ ] Enhancement < 5s
- [ ] 99.9% uptime

## Compliance

- [ ] Privacy policy published
- [ ] Terms of service published
- [ ] GDPR compliance verified
- [ ] Cookie consent implemented
- [ ] Data retention policy set

## Support

- [ ] Support email configured
- [ ] FAQ page published
- [ ] Documentation complete
- [ ] Status page set up
