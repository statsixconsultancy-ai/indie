BUILDING CARD VIDEOS
--------------------
Save one clip per building in this folder, with exactly these names:

  ai-filmmaking.mp4
  ai-ads.mp4
  cinematography.mp4
  films-we-appreciate.mp4
  how-we-work.mp4
  about-us.mp4

When a file exists, it plays (muted, looping) on that building's card instead of the animated preview.
If a file is missing, the animated preview is used. Nothing else needs changing.

Tips: 16:9 or wider, 5-15 seconds, H.264, under ~6 MB each. To shrink a clip with ffmpeg:

  ffmpeg -i input.mp4 -an -vf "scale=960:-2" -c:v libx264 -crf 24 -preset slow -movflags +faststart ai-ads.mp4

Only use footage you own or have permission to use.
