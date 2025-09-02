# TaskWork Repository Rename Script
# This script helps rename your repository from taskgrid to taskwork

Write-Host "🚀 TaskWork Repository Rename Script" -ForegroundColor Green
Write-Host "=====================================" -ForegroundColor Green
Write-Host ""

# Step 1: Rename local directory
Write-Host "📁 Step 1: Rename local directory" -ForegroundColor Yellow
Write-Host "Current directory: taskgrid"
Write-Host "New directory: taskwork"
Write-Host ""
Write-Host "Execute this command from the parent directory:" -ForegroundColor Cyan
Write-Host "mv taskgrid taskwork" -ForegroundColor White
Write-Host "# OR on Windows:"
Write-Host "Rename-Item -Path 'taskgrid' -NewName 'taskwork'" -ForegroundColor White
Write-Host ""

# Step 2: Update git remote URL (if using GitHub)
Write-Host "🌐 Step 2: Create new GitHub repository" -ForegroundColor Yellow
Write-Host "1. Go to https://github.com/new"
Write-Host "2. Repository name: taskwork"
Write-Host "3. Description: 'The Modern Task Management Platform - Enterprise integrations at startup pricing'"
Write-Host "4. Make it Public (to showcase your work)"
Write-Host "5. Do NOT initialize with README (we will push existing code)"
Write-Host ""

# Step 3: Update remote origin
Write-Host "🔗 Step 3: Update git remote origin" -ForegroundColor Yellow
Write-Host "Execute these commands from the taskwork directory:" -ForegroundColor Cyan
Write-Host ""
Write-Host "# Remove old origin" -ForegroundColor Green
Write-Host "git remote remove origin" -ForegroundColor White
Write-Host ""
Write-Host "# Add new origin (replace yourusername with your GitHub username)" -ForegroundColor Green
Write-Host "git remote add origin https://github.com/yourusername/taskwork.git" -ForegroundColor White
Write-Host ""
Write-Host "# Push to new repository" -ForegroundColor Green
Write-Host "git branch -M main" -ForegroundColor White
Write-Host "git push -u origin main" -ForegroundColor White
Write-Host ""

# Step 4: Update any hardcoded references
Write-Host "⚙️ Step 4: Update configuration files" -ForegroundColor Yellow
Write-Host "Files already updated:"
Write-Host "✅ README.md - Complete TaskWork rebrand"
Write-Host "✅ package.json - Name, description, repository URL"
Write-Host "✅ Integration files - Slack, Jira, Teams, Office365"
Write-Host ""

# Step 5: Environment variables
Write-Host "🌍 Step 5: Update environment variables" -ForegroundColor Yellow
Write-Host "Create/Update .env.local with:" -ForegroundColor Cyan
Write-Host ""
Write-Host "NEXT_PUBLIC_APP_URL=https://taskwork.io" -ForegroundColor White
Write-Host "NEXT_PUBLIC_APP_NAME=TaskWork" -ForegroundColor White
Write-Host "NEXT_PUBLIC_COMPANY_NAME=TaskWork" -ForegroundColor White
Write-Host ""

# Step 6: Domain and deployment
Write-Host "🌐 Step 6: Domain and deployment updates" -ForegroundColor Yellow
Write-Host "1. Register taskwork.io domain (priority!)"
Write-Host "2. Update deployment settings (Vercel/Netlify) to use new domain"
Write-Host "3. Update any API endpoints to use taskwork.io"
Write-Host "4. Set up SSL certificate for taskwork.io"
Write-Host ""

# Step 7: Social media and branding
Write-Host "📱 Step 7: Social media and branding" -ForegroundColor Yellow
Write-Host "1. Reserve social media handles:"
Write-Host "   - Twitter: @TaskWorkApp"
Write-Host "   - LinkedIn: company/taskwork"
Write-Host "   - Instagram: @taskworkapp"
Write-Host "2. Update business registration if applicable"
Write-Host "3. File trademark application for TaskWork"
Write-Host ""

# Step 8: Documentation updates
Write-Host "📚 Step 8: Update documentation" -ForegroundColor Yellow
Write-Host "Consider updating:"
Write-Host "- API documentation"
Write-Host "- User guides and tutorials"
Write-Host "- Marketing materials"
Write-Host "- Email templates"
Write-Host ""

Write-Host "🎉 TaskWork Rebrand Complete!" -ForegroundColor Green
Write-Host "Your repository is now ready to dominate the enterprise task management market!" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Register taskwork.io domain IMMEDIATELY" -ForegroundColor Red
Write-Host "2. Set up hosting and deployment"
Write-Host "3. Launch beta program"
Write-Host "4. File trademark application"
Write-Host ""
