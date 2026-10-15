# Downloads and optimises the Parallax demo clip library from Coverr (free licence).
# Each clip is trimmed to 8s, scaled to 1280x720 H.264, muted, and given a poster frame.
$ErrorActionPreference = 'Continue'
$ff = (Get-Command ffmpeg).Source
$root = Split-Path -Parent $PSScriptRoot
$media = Join-Path $root 'media'
New-Item -ItemType Directory -Force -Path $media | Out-Null

$clips = [ordered]@{
  'city'     = 'coverr-mysterious-figure-in-neon-noir-cityscape'
  'smoke'    = 'coverr-temp-idt4gen-3-alpha-3705455674-yellow-smoke-whirls-mp4-9700'
  'flame'    = 'user-ai-generation-4kf566VvRQxB'
  'rain'     = 'user-ai-generation-6vmHVDQ8F0'
  'water'    = 'user-ai-generation-7xrBAzLKWYO5'
  'forest'   = 'user-ai-generation-o2j1Kz5wasuF'
  'room'     = 'user-ai-generation-VlzTMEbjgVkr'
  'cigar'    = 'user-ai-generation-Wfz6OcuHN7ZV'
  'eye'      = 'coverr-temp-lv020260723160118-mp4-6563'
  'cliff'    = 'coverr-temp-lv020260723155426-mp4-6488'
  'clouds'   = 'coverr-ai-generated-sunset-rays-above-the-clouds'
  'roman'    = 'coverr-ancient-roman-general-in-deep-thought'
  'cabin'    = 'coverr-ai-generated-cozy-cabin-interior-with-crackling-fireplace'
  'pool'     = 'coverr-ai-generated-nature-reclaims-abandoned-pool-area'
}

foreach ($name in $clips.Keys) {
  $slug = $clips[$name]
  $url  = "https://cdn.coverr.co/videos/$slug/720p.mp4"
  $out  = Join-Path $media "$name.mp4"
  $poster = Join-Path $media "$name.jpg"

  if (-not (Test-Path $out)) {
    Write-Host "-> $name"
    & $ff -nostdin -loglevel error -y -i $url -t 8 -an `
      -vf "scale=1280:720:force_original_aspect_ratio=increase,crop=1280:720,fps=24" `
      -c:v libx264 -profile:v high -level 4.0 -pix_fmt yuv420p -crf 30 -preset slow `
      -movflags +faststart $out
    if (-not (Test-Path $out)) { Write-Host "   FAILED $name"; continue }
  }

  if (-not (Test-Path $poster)) {
    & $ff -nostdin -loglevel error -y -i $out -ss 2 -frames:v 1 -vf "scale=1280:720" -q:v 5 $poster
  }

  $kb = [math]::Round((Get-Item $out).Length / 1KB)
  Write-Host "   $name.mp4  ${kb}KB"
}

Write-Host "DONE"