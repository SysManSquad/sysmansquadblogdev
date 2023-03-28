---
title: How to add an author to SysManSquad
author: aaron
type: post
date: 2023-03-28T00:00:00+00:00
url: /2023/03/28/adding-an-author/
categories:
  - Hugo
---

## It's so easy!

All you have to do is know everything about Hugo and the various ways it can be abused!

## Fork us

On github, create a fork of `https://github.com/SysManSquad/sysmansquadblogdev`, replace the URL below with the correct URL for your fork:

> Be sure and run the git commands below before running a hugo server or it will cause you all kinds of trouble.

```sh
git clone https://github.com/SysManSquad/sysmansquadblogdev
git submodule init
git submodule update
```

This will download the site code and theme to your computer.

### Use Hugo to preview your work

If you want to see your post in Hugo before submitting you'll need Hugo installed. Follow these steps:

As an administrator, in powershell:

```powershell
Set-Executionpolicy bypass
install-module chocolatey
Install-ChocolateySoftware
Install-ChocolateyPackage hugo
```

This installs the chocolatey software manager and the hugo server to your machine.

### To Launch Website Locally

Run this command from the root of your sysmansquadblogdev folder, replacing the path below

```ps
  hugo server -D  
```

Hugo will give you a URL to use to view the site as you make changes. Open this link in your browser and leave Hugo running in the background.

## Adding an author

### Add the author json file

1. From the main repo, under data/authors, copy an existing json file and name it the same as the stub you'll use in your post files
2. Adjust the existing fields to match your information
   1. `name` is either your legal first name, full name, or your handle
   2. `stub` is a lowercase, no spaces word you'll use in the metadata of your post
   3. `role` is "Contributor" in almost every case
   4. `display` is "true"
   5. `bio` is a short line of text you'd like to use for introducing yourself to strangers
   6. The social section typically will include linkedin, but it supports a couple of other options that I can't remember offhand

```json
{
    "name": "Alec Weber",
    "stub": "zeroconf",
    "role": "Contributor",
    "display": "true",
    "bio" : "This is a placeholder bio for zeroconf.",
    "social": {
        "linkedin": "alec-weber-43a967185"
    }
}
```

### Create the author folder

1. Copy an existing folder under `authors/` , rename it to match your stub and replace `avatar.png` with your own.
2. Edit index.md and change the title to match your stub
```md
---
title: "zeroconf"
---
```

### Create your first post (or second, or whatever - I'm not your mom)

1. Create a folder under content/posts with the format `YYYY-MM-DD-a-few-words-from-the-title`
2. Create an `index.md` file with this content at the top, followed by normal markdown syntax:

```md
---
title: How to add an author to SysMan's Quad
author: zeroconf
type: post
date: 2023-03-28T00:00:00+00:00
url: /2023/03/28/adding-an-author/
categories:
  - Hugo
---
```

* The author must be a case sensitive match for the stub you chose

## Conclusion
Super easy right? 