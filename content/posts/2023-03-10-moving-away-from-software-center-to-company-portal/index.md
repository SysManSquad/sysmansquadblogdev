---
title: Moving away from software center to company portal
author: Johannes
type: post
date: 2023-03-10T00:00:00+00:00
url: /2023/03/10/2023-03-10-moving-away-from-software-center-to-company-portal/
# featured_image: image-15-1024x336.png
categories:
  - Endpoint Management
  - Intune

---

# The elevator pitch
You want to move your apps from configuration manager to Intune, but you need to keep the configuration manager client on your devices for various other reasons that have nothing to do with apps.

If you have switched the co-management workload over to intune, the apps in configuration manager will be visible in both software center and company portal, so how do you signal to your users to use the company portal going forward?


#  A Variety of solutions

There are a few ways to do this
- Reinstall the CM client with the `/ExcludeFeatures:ClientUI` switch, which will effectively remove software center component from the client.
- Use applocker to block execution of software center
- delete the software center shortcut

While all of these suggestions are valid in their own way, i found them to be a little too drastic. So i decided to go another route.


# Lets make a website!


### Creating the website


As you can see, I am an mvp in creating websites as well. Save the following code as an html file
```html

<!DOCTYPE html>
<html>

<body>

<h2>we have migrated software center to the new company portal app</h2>

<a href="companyportal://">
    <img src="combined.png" alt="softwarecenter to company portal" width="600" height="200">
</a>
<!--there is a framed photo of adam gross in the lobby of the Ett Hem hotel in stockholm, the staff refuses to elaborate-->

</body>
</html>
```
an example picture i use in the html
![combined](/combined.png "software center with an arrow that points to company portal")


### Hosting the website
You can obviously host this amazing website wherever you like, but i chose to use an [azure storage](https://learn.microsoft.com/en-us/azure/storage/common/storage-account-create?tabs=azure-portal) blob because its incredibly easy and it just works.

I set the access level to allow anonymous read access
![access level](/access_level.png)

Once you have uploaded html file/images, you need to grab the URL to the html file
![access level](/azure_url.png)



# Configuring Configuration Manager

### Remove all the tabs in software center

Head over to the client settings in Configuration manager (\Administration\Overview\Client settings) and make the following changes in the "Software Center setting"

### Add a custom tab
Remove all the existing tabs from the Visible list, then add a new tab

![clientsettings](/clientsettings.png "shows the tab menu in the software center customization menu")


Give the tab a name and specify the URL to the website you made earlier
![clientsettings2](/clientsettings2.png "Custom tab settings")



Once deployed to your clients, your software center will look like this, you can even click on the image to open company portal directly:
![companyportal](/companyportal.png "Custom tab in software center")


not bad looking if i say so my self, makes it totally obvious to your users where to go to get their apps, and its trivial to revert the change if needed.