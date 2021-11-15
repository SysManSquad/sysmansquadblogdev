---
title: Downloading a Device Guard Signing Service version 2 Root Certificate for MSIX
author: Jóhannes Geir Kristjánsson
type: post
date: 2020-11-02T03:54:11+00:00
url: /2020/11/01/downloading-a-device-guard-signing-service-version-2-root-certificate-for-msix/
categories:
  - Endpoint Management

---
Howdy y'all  
In this post I will show you how to get the Device Guard Signing Service v2 root certificate.

Device Guard Signing Services v1 (DGSS) is being deprecated at the end of December 2020, so we need to migrate to DGSSv2, and it just so happens that the means to download the DGSSv2 root cert is a little bit more complex than the DGSSv1.

## MSIX crash course

While MSIX is generally marketed as a replacement for MSI for developers, there are scenarios that can benefit systems administrators.

  * A means to install an app that has no silent installation
  * Capture installs of apps that require manual setup as part of the post install setup
  * MSIX apps are easy to uninstall, which is not always possible/reliable for some Win32 apps
  * MSIX apps are containerized, you can install multiple versions of the same app at the same time, for example: Office 2010 and M365A/O365 running at the same time
  * MSIX app attach for Windows Virtual Desktops
  * MSIX apps can be installed per user or provisioned for all users on a device

So what does this have to do with certificates?  
The MSIX packaging format has a strict signing requirement. While you can always buy a code signing certificate, you can use a free DGSSv2 certificate from Microsoft.

If you want to know how MSIX apps are setup and deployed, check out <a rel="noreferrer noopener" href="https://sysmansquad.com/2020/09/15/signing-and-deploying-applications-via-msix-with-intune/" target="_blank">Jake's blog post on MSIX</a>.

## Registering the AzureAD app

First we need to setup an AzureAd Application, <a rel="noreferrer noopener" href="https://docs.microsoft.com/en-us/windows/msix/package/signing-package-device-guard-signing" target="_blank">this is mostly covered in the official docs</a> but it's not very user friendly and when this post was written (31.10.2020), it was missing a crucial step.

For those of you who have done this sort of thing before, here is the quick overview:

  * Sign into AzureAd and start registering an app
  * Under Redirect URI, select "Public client (mobile & desktop)". and set https://dgss.microsoft.com as the URI
  * In the API permissions, select the "Windows Store for Business API", Delegated permissions and select **user_impersonation**
  * Go to the overview and copy the Application (client) ID, and head to the **Get-DGSSv2RootCert** part of this post

For those of you who have never done this before, here are the detailed steps with screenshots.

Sign into Azure AD and register a new application.<figure class="wp-block-image size-large">

<img loading="lazy" width="1024" height="573" src="https://sysmansquad.com/wp-content/uploads/2020/10/1-app-registration-1024x573.png" alt="" class="wp-image-1864" srcset="https:/wp-content/uploads/2020/10/1-app-registration-1024x573.png 1024w, https:/wp-content/uploads/2020/10/1-app-registration-300x168.png 300w, https:/wp-content/uploads/2020/10/1-app-registration-768x430.png 768w, https:/wp-content/uploads/2020/10/1-app-registration-100x56.png 100w, https:/wp-content/uploads/2020/10/1-app-registration-855x478.png 855w, https:/wp-content/uploads/2020/10/1-app-registration-1234x690.png 1234w, https:/wp-content/uploads/2020/10/1-app-registration.png 1452w" sizes="(max-width: 1024px) 100vw, 1024px" /> </figure> 

Give it a descriptive name.  
Under Redirect URI, select "Public client (mobile & desktop)", and set https://dgss.microsoft.com as the URI.<figure class="wp-block-image size-large">

<img loading="lazy" width="927" height="749" src="https://sysmansquad.com/wp-content/uploads/2020/10/2-replyurl.png" alt="" class="wp-image-1865" srcset="https:/wp-content/uploads/2020/10/2-replyurl.png 927w, https:/wp-content/uploads/2020/10/2-replyurl-300x242.png 300w, https:/wp-content/uploads/2020/10/2-replyurl-768x621.png 768w, https:/wp-content/uploads/2020/10/2-replyurl-100x81.png 100w, https:/wp-content/uploads/2020/10/2-replyurl-855x691.png 855w" sizes="(max-width: 927px) 100vw, 927px" /> </figure> 

Once the app has been created, click on **API permissions**.  
**Add permissions**.  
Click on **APIs my organization uses**.  
Search for "windows store".  
And click on it.<figure class="wp-block-image size-large">

<img loading="lazy" width="1024" height="342" src="https://sysmansquad.com/wp-content/uploads/2020/10/3-api-permissions-1024x342.png" alt="" class="wp-image-1866" srcset="https:/wp-content/uploads/2020/10/3-api-permissions-1024x342.png 1024w, https:/wp-content/uploads/2020/10/3-api-permissions-300x100.png 300w, https:/wp-content/uploads/2020/10/3-api-permissions-768x256.png 768w, https:/wp-content/uploads/2020/10/3-api-permissions-1536x513.png 1536w, https:/wp-content/uploads/2020/10/3-api-permissions-100x33.png 100w, https:/wp-content/uploads/2020/10/3-api-permissions-855x285.png 855w, https:/wp-content/uploads/2020/10/3-api-permissions-1234x412.png 1234w, https:/wp-content/uploads/2020/10/3-api-permissions.png 1699w" sizes="(max-width: 1024px) 100vw, 1024px" /> </figure> 

Click on **Delegated permissions**.  
And select **user_impresonation**.<figure class="wp-block-image size-large">

<img loading="lazy" width="665" height="788" src="https://sysmansquad.com/wp-content/uploads/2020/10/4-delegate-access.png" alt="" class="wp-image-1867" srcset="https:/wp-content/uploads/2020/10/4-delegate-access.png 665w, https:/wp-content/uploads/2020/10/4-delegate-access-253x300.png 253w, https:/wp-content/uploads/2020/10/4-delegate-access-100x118.png 100w" sizes="(max-width: 665px) 100vw, 665px" /> </figure> 

Click on **Grant consent for...** otherwise the app will not work.<figure class="wp-block-image size-large">

<img loading="lazy" width="1024" height="494" src="https://sysmansquad.com/wp-content/uploads/2020/10/5-consent-1024x494.png" alt="" class="wp-image-1868" srcset="https:/wp-content/uploads/2020/10/5-consent-1024x494.png 1024w, https:/wp-content/uploads/2020/10/5-consent-300x145.png 300w, https:/wp-content/uploads/2020/10/5-consent-768x370.png 768w, https:/wp-content/uploads/2020/10/5-consent-100x48.png 100w, https:/wp-content/uploads/2020/10/5-consent-855x412.png 855w, https:/wp-content/uploads/2020/10/5-consent.png 1218w" sizes="(max-width: 1024px) 100vw, 1024px" /> </figure> 

Now head back to the application overview and copy the GUID that's next to **Application (client) ID**, this is used in a script that is featured in this blog post.<figure class="wp-block-image size-large">

<img loading="lazy" width="967" height="524" src="https://sysmansquad.com/wp-content/uploads/2020/10/6-appid.png" alt="" class="wp-image-1869" srcset="https:/wp-content/uploads/2020/10/6-appid.png 967w, https:/wp-content/uploads/2020/10/6-appid-300x163.png 300w, https:/wp-content/uploads/2020/10/6-appid-768x416.png 768w, https:/wp-content/uploads/2020/10/6-appid-100x54.png 100w, https:/wp-content/uploads/2020/10/6-appid-855x463.png 855w" sizes="(max-width: 967px) 100vw, 967px" /> </figure> 

## Get-DGSSv2RootCert

Since for most people, downloading the root certificate is a one time operation, I elected to run this this in a <a href="https://docs.microsoft.com/en-us/windows/security/threat-protection/windows-sandbox/windows-sandbox-overview" target="_blank" rel="noreferrer noopener">windows sandbox</a>. but that is 100% optional.

Paste the application GUID into the $AppID variable and you should be ready to go.

<div class="wp-block-codemirror-blocks-code-block code-block">
  <pre class="CodeMirror" data-setting="{&quot;mode&quot;:&quot;powershell&quot;,&quot;mime&quot;:&quot;application/x-powershell&quot;,&quot;theme&quot;:&quot;default&quot;,&quot;lineNumbers&quot;:true,&quot;styleActiveLine&quot;:true,&quot;lineWrapping&quot;:true,&quot;readOnly&quot;:false,&quot;fileName&quot;:&quot;Get-DGSSv2RootCert.ps1&quot;,&quot;language&quot;:&quot;PowerShell&quot;,&quot;modeName&quot;:&quot;powershell&quot;}"># This simple script is used to download the Device Guard Signing Service v2 Root Certificate


# please add your own App ID
$AppID = "PUT YOUR GUID HERE"



# we need to add nuget as a package source first
Register-PackageSource -Name MyNuGet -Location https://www.nuget.org/api/v2 -ProviderName NuGet -Confirm:$false -Force

# installing the package
Install-Package Microsoft.Acs.Dgss.Client -Source mynuget -Confirm:$false -Force -Verbose

# importing the module
Import-Module "C:\Program Files\PackageManagement\NuGet\Packages\Microsoft.Acs.Dgss.Client.1.0.11\PowerShell\Microsoft.Acs.Dgss.Client.dll"

# just for convenience
New-Item -Path c:\ -Name "DGCertv2" -ItemType Directory -Force

# downloading the cert to the folder specified above, this step is not instant, ive seen it take a while
Get-RootCertificate -PassThru -OutFile C:\DGCertv2\DGSSv2root.cer -AppId $AppID

# voila! the cert appears before your eyes
start C:\DGCertv2\</pre>
</div>

Congrats, you now have a Device Guard Signing Service v2 Root Certificate in your possession.

Now you can deploy the cert to your clients using your delivery mechanism of choice.