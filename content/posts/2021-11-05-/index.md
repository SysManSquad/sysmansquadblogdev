---
title: Fixing Seamless SSO in Chrome
author: Kevin Crouch
type: post
date: -001-11-30T00:00:00+00:00
draft: true
url: /?p=3079
categories:
  - Endpoint Management

---
[Seamless Single Sign-On](https://docs.microsoft.com/en-us/azure/active-directory/hybrid/how-to-connect-sso#what-is-azure-active-directory-seamless-single-sign-on) is great, when it works, but sometimes it feels like you've followed the setup to the letter and it's still not working. Let's figure out why it wasn't working on this server...

<!--more-->

## How do we Check sSSO?

First, you need to make sure you are not already logged in. 

What you want to see is if you visit <https://myapps.microsoft.com> - you get a the vanilla, plain Office 365 sign on page, it should redirect you to a page like this. <figure class="wp-block-image size-full">

<img loading="lazy" width="740" height="590" src="image.png" alt="webpage URL says login.microsoft.com/common/ - not /consumer/ or a specific tenant GUID.

No Custom Company Branding on the background, logo, or anywhere else on the login page.

No Usernames shown to select from. " class="wp-image-3080" srcset="image.png 740w, image.png 300w, image.png 100w" sizes="(max-width: 740px) 100vw, 740px" /> </figure> 

Note there is no Custom Company Branding on the logo, background, or the rest of the page, and the URL says /common/ and not /consumer/ or a specific Tenant GUID. 

### "Just log off" - NO

You might think you could just log-off however, Office 365 and SSSO actually support Log Off and will store cookies that tell them you explicitly "Logged Off" and not just "Are not signed in". 

The best ways I have found to test this are either a 

<ul id="NewChromeProfile">
  <li>
    Fresh, empty Chrome Profile ([How to add a new Chrome Profile](https://support.google.com/chrome/answer/2364824)) or
  </li>
  <li>
    Delete all of the Cookies mentioning Microsoft Online/SSO
  </li>
</ul>

#### To clear the Cookies 

Copy-Paste `<strong>chrome://settings/siteData</strong>` into a new Chrome Tab and you should see something like this. Though if this is a normal-use browser profile you may have thousands more entries. <figure class="wp-block-image size-large">

![](image-1.png) </figure> 

You need to search for and delete each of these with the trash can on the right. Alternatively, you could hit that "Remove All" button - but that will log you out of all of your other sites, and then you might as well just be using a [new Chrome profile](#NewChromeProfile)... Once those are gone, try visiting [https://myapps.microsoft.com](https://myapps.microsoft.com/) again and see if it fills in a username option again. If it doesn't, you're good to go forward to [testing](#TestingYourSSO)!

### "Connected To Windows"

If you see options like "Connected to Windows" you might have been mistakenly following this article from Edge, or Internet Explorer, or have a Chrome extension [Windows 10 Accounts](https://chrome.google.com/webstore/detail/windows-10-accounts/ppnbnpeolgkicgegkbkbjmhlideopiji).

No matter what the case - your browser just detected the login! You should be good to go! Hop down to #Testing to follow up and make sure your SSO Works, or remove the extension to test further. 

## Testing your sSSO {#TestingYourSSO}

To show what the trouble is, we need an app to test with. An excellent app choice with is the My Apps Portal - [https://myapps.microsoft.com](https://myapps.microsoft.com) because you won't need a licensed user to access anything, only an enabled user. 

However, if we just use myapps.microsoft.com, we will have to enter the username - which can make it unclear sometimes whether sSSO worked or if it just had a login that was already logged in before. 

To test with, I recommend using <https://myapps.microsoft.com/YourCompany.com>. This will have the best of both worlds and let us make sure that this was not a previously saved login being used. 

## Appearance

