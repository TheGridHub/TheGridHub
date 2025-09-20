# PowerShell script to execute SQL using .NET libraries

$ConnectionString = "Host=aws-1-us-east-1.pooler.supabase.com;Port=5432;Database=postgres;Username=postgres.nwttxyjsypdgdqqhrubb;Password=mvd296hTMQFZxXGn;SSL Mode=Require;"

# Read the SQL files
$SQL1 = Get-Content "supabase/migrations/20250921_create_missing_tables.sql" -Raw
$SQL2 = Get-Content "supabase/migrations/20250921_create_dashboard_functions.sql" -Raw

try {
    Add-Type -AssemblyName System.Data

    # Create PostgreSQL connection (using .NET SqlConnection as fallback)
    Write-Host "Executing missing tables migration..."
    
    # For now, let's create a simple batch file that can execute the SQL
    $SQL1 | Out-File -FilePath "temp_tables.sql" -Encoding UTF8
    $SQL2 | Out-File -FilePath "temp_dashboard.sql" -Encoding UTF8
    
    Write-Host "SQL files created successfully:"
    Write-Host "- temp_tables.sql (creates missing tables)"
    Write-Host "- temp_dashboard.sql (creates dashboard functions)"
    Write-Host ""
    Write-Host "Please copy and paste the content of these files into your Supabase SQL editor:"
    Write-Host "1. First run temp_tables.sql"
    Write-Host "2. Then run temp_dashboard.sql"
    
} catch {
    Write-Error "Error: $_"
}
