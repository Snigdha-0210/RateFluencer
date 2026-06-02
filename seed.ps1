$categories = @(
  "Food Vlogging", "Couple Content", "Memes", "Street Food", "Cringe Content",
  "Fitness", "Gaming", "Travel", "Beauty", "Lifestyle", "Entertainment",
  "Comedy", "Tech Gadgets", "Personal Stories", "College Life", "AI",
  "Creator Economy", "Business", "Startups", "Finance", "Music Covers",
  "DIY & Crafts", "Real Estate", "ASMR", "Pets & Animals", "Parenting Hacks",
  "Storytelling", "Anime & Manga", "Motivation", "Automotive"
)

foreach ($cat in $categories) {
    $encoded = [uri]::EscapeDataString($cat)
    $url = "http://localhost:3000/api/trends/deep-fetch?category=$encoded"
    Write-Host "Fetching $cat..."
    Invoke-RestMethod -Uri $url -Method Get | Out-Null
    Start-Sleep -Seconds 2
}
Write-Host "Finished seeding all 30 categories."
