# Create a local development environment file
Write-Host "Creating .env.local for development..." -ForegroundColor Green

# Copy the example file
Copy-Item .env.local.example .env.local

Write-Host "✓ Created .env.local" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Edit .env.local and add your API keys"
Write-Host "2. Set up your Supabase project and run the migration"
Write-Host "3. Configure Lemon Squeezy products and webhooks"
Write-Host "4. Run 'bun dev' to start the development server"
Write-Host ""
Write-Host "For mock development (no API costs):" -ForegroundColor Cyan
Write-Host "Set MOCK_AI_RESPONSES=true in .env.local"
