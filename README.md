# Readme

Domain Registrar - Hosted on domains.google.com  
DNS - CloudFlare  

<!--
Initialize Clone all 3 repos locally  

https://github.com/SysManSquad/sysmansquadblogdev  
https://github.com/SysManSquad/sysmansquadblog  
https://github.com/SysManSquad/sysmansquadblog_theme  
-->

# Contributing

Fork this repository!

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