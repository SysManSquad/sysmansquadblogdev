# Readme

Domain Registrar - Hosted on domains.google.com  
DNS - CloudFlare  

<!--
Initialize Clone all 3 repos locally  

https://github.com/SysManSquad/sysmansquadblogdev  
https://github.com/SysManSquad/sysmansquadblog  
https://github.com/SysManSquad/sysmansquadblog_theme  
-->

```sh
git clone https://github.com/SysManSquad/sysmansquadblogdev
git submodule init
git submodule update
```

> Be sure and run the git commands above before running a hugo server or it will cause you all kinds of trouble.

If you want to see your post in Hugo before submitting you'll need Hugo installed. Follow these steps.  
https://gohugo.io/getting-started/installing#chocolatey-windows

`choco install hugo -confirm`  

## This is only needed if you want to create a new empty site

Create New hugo website  
`hugo new site <PATH>`  

Add Theme as a submodule  
git submodule add https://github.com/SysManSquad/sysmansquadblog_theme.git themes/sysmansquadblog_theme  

Add Public repo as a submodule. This will make it easier to publish changes than trying to manage prod and dev branches.  
git submodule add https://github.com/SysManSquad/sysmansquadblog.git public  

## To Launch Website Locally

Run this command from the root of your sysmansquadblogdev folder

```ps
cd C:\GitHub\Blog\sysmansquadblogdev  
hugo server -D  
```
