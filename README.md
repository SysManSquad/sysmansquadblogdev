
Domain Registrar - Hosted on domains.google.com
DNS - CloudFlare

Initialize Clone all 3 repos locally

https://github.com/SysManSquad/sysmansquadblogdev  
https://github.com/SysManSquad/sysmansquadblog 
https://github.com/SysManSquad/sysmansquadblog_theme 


If you want to see your post in Hugo before submitting you'll need Hugo installed. Follow these steps.
https://gohugo.io/getting-started/installing#chocolatey-windows

`choco install hugo -confirm`

#This is only needed if you want to create a new empty site
Create New hugo website
`hugo new site <PATH>`

Add Theme as a submodule
git submodule add https://github.com/SysManSquad/sysmansquadblog_theme.git themes/sysmansquadblog_theme

Add Public repo as a submodule. This will make it easier to publish changes than trying to manage prod and dev branches.
git submodule add https://github.com/SysManSquad/sysmansquadblog.git public

Launch Webiste Locally
Run this command from the root of your sysmansquaddev folder
cd C:\GitHub\Blog\sysmansquadblogdev
hugo server -D
