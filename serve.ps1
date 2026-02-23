# Serveur HTTP statique minimal pour servir code/ sur localhost:8000
$root     = Join-Path $PSScriptRoot "code"
$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add("http://localhost:8001/")
$listener.Start()
Write-Host "Serving $root on http://localhost:8001/"

$mimeTypes = @{
  ".html" = "text/html; charset=utf-8"
  ".js"   = "application/javascript; charset=utf-8"
  ".css"  = "text/css; charset=utf-8"
  ".json" = "application/json"
  ".mp4"  = "video/mp4"
  ".webm" = "video/webm"
  ".mp3"  = "audio/mpeg"
  ".jpg"  = "image/jpeg"
  ".jpeg" = "image/jpeg"
  ".png"  = "image/png"
  ".gif"  = "image/gif"
  ".webp" = "image/webp"
}

while ($listener.IsListening) {
  $ctx      = $listener.GetContext()
  $req      = $ctx.Request
  $res      = $ctx.Response

  $path = $req.Url.AbsolutePath
  if ($path -eq "/") { $path = "/index.html" }

  # URL-decode simple
  $path = [System.Uri]::UnescapeDataString($path)

  $filePath = Join-Path $root $path.TrimStart("/").Replace("/", [System.IO.Path]::DirectorySeparatorChar)

  try {
    if (Test-Path $filePath -PathType Leaf) {
      $ext     = [System.IO.Path]::GetExtension($filePath).ToLower()
      $mime    = if ($mimeTypes.ContainsKey($ext)) { $mimeTypes[$ext] } else { "application/octet-stream" }
      $bytes   = [System.IO.File]::ReadAllBytes($filePath)

      $res.StatusCode    = 200
      $res.ContentType   = $mime
      $res.ContentLength64 = $bytes.Length
      $res.Headers.Add("Access-Control-Allow-Origin", "*")
      $res.OutputStream.Write($bytes, 0, $bytes.Length)
    } else {
      $bytes = [System.Text.Encoding]::UTF8.GetBytes("404 Not Found: $path")
      $res.StatusCode = 404
      $res.ContentType = "text/plain"
      $res.ContentLength64 = $bytes.Length
      $res.OutputStream.Write($bytes, 0, $bytes.Length)
    }
  } catch {
    $bytes = [System.Text.Encoding]::UTF8.GetBytes("500 Error: $_")
    $res.StatusCode = 500
    $res.ContentLength64 = $bytes.Length
    $res.OutputStream.Write($bytes, 0, $bytes.Length)
  } finally {
    $res.OutputStream.Close()
  }
}
