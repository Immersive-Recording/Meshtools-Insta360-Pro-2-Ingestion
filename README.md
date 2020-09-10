# Meshtools-Insta360-Pro-2-Ingestion
A way to ingest Insta360 Pro 2 images for Meshroom.

NOTE: This script is for (deno)[https://deno.land/]. Do not run with node.
NOTE: jpegtran is required to rotate the images. (DEBIAN PACKAGE: `libjpeg-turbo-progs`)
NOTE: (exiftool)[https://exiftool.org/] is required to modify the exif data.
NOTE: You should add the camera to the database.

To run do following:

1. Move source folders to a temporarry folder
2. Open terminal in folder you want output to be in.
3. run `deno run -A -unstable https://raw.githubusercontent.com/jcc10/Meshtools-Insta360-Pro-2-Ingestion/master/ingestor.ts path/to/raw/photos`
4. Copy *all* the exiftool lines and paste them back into the terminal to run them.
5. Click and drag the folders 0-5 within the rig folder to import the files.
6. Verify the images were imported as a rig by checking to see if there is a chain icon on the thumbnails.
7. You are done. Continue to Meshroom.

## Insta360 Pro2 subcamera specs
* The Focal Length in 35mm film is 59.4034mm
* The sensor size is 7.9mm*4.75mm.

(Source: Insta360 offical support)