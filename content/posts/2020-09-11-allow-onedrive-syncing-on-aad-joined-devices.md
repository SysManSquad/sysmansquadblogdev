---
title: Allow OneDrive Syncing on AAD joined Devices
author: Jóhannes Geir Kristjánsson
type: post
date: 2020-09-11T17:23:02+00:00
url: /2020/09/11/allow-onedrive-syncing-on-aad-joined-devices/
categories:
  - Endpoint Management

---
## The Problem

So I was walking on the beach and noticed that OneDrive wasn't syncing anymore on my AzureAD joined laptop. I later learned that my endpoint administrator, Adam Gross, had enabled <a rel="noreferrer noopener" href="https://docs.microsoft.com/en-us/onedrive/allow-syncing-only-on-specific-domains" target="_blank">Allow syncing only on computers joined to specific domains</a> in the OneDrive admin portal. which effectively blocked my AzureAD device 🙁<figure class="wp-block-image size-large">

<img loading="lazy" width="804" height="408" src="https://sysmansquad.com/wp-content/uploads/2020/08/vmconnect_KUuNJoGAtD.png" alt="" class="wp-image-1533" srcset="https:/wp-content/uploads/2020/08/vmconnect_KUuNJoGAtD.png 804w, https:/wp-content/uploads/2020/08/vmconnect_KUuNJoGAtD-300x152.png 300w, https:/wp-content/uploads/2020/08/vmconnect_KUuNJoGAtD-768x390.png 768w, https:/wp-content/uploads/2020/08/vmconnect_KUuNJoGAtD-100x51.png 100w" sizes="(max-width: 804px) 100vw, 804px" /> </figure> 

Which resulted in this message on my corporate device<figure class="wp-block-image size-large">

<img loading="lazy" width="441" height="290" src="https://sysmansquad.com/wp-content/uploads/2020/08/Annotation-2020-08-21-200957.png" alt="" class="wp-image-1517" srcset="https:/wp-content/uploads/2020/08/Annotation-2020-08-21-200957.png 441w, https:/wp-content/uploads/2020/08/Annotation-2020-08-21-200957-300x197.png 300w, https:/wp-content/uploads/2020/08/Annotation-2020-08-21-200957-100x66.png 100w" sizes="(max-width: 441px) 100vw, 441px" /> </figure> 

Our Legacy AD joined devices were fine, but all of our Azure AD joined devices got the above error.

Needless to say this was worrying since we were knee deep in migrating all new devices to AzureAD

## The Solution

But lo and behold, a golden savior appeared on the <a href="http://aka.ms/winadmins" target="_blank" rel="noreferrer noopener">windows admins discord</a>, a swell fellow called Configmatt commented:

<blockquote class="wp-block-quote">
  <p>
    Here are instructions for how to add Azure AD Join devices to your OneDrive for Business tenant restrictions.<br />• Ensure build 19.192+ of Sync client is installed <strong>(which was released in november 13, 2019)</strong><br />• Set the GUID for policy AADJMachineDomainGuid under HKEY_LOCAL_MACHINE\Software\Policies\Microsoft\OneDrive and apply it to the test AADJ machine. GUID can be any string.
  </p>
  
  <p>
    • Add the same GUID to SPOTenantSyncClientRestriction / OneDrive admin center to allow the test machine for SPO
  </p>
  
  <p>
    • Sync a SPO site on the test AADJ machine, the test machine should be able to sync
  </p>
  
  <p>
    I do have to point out that there are security concerns with this reg key: the domain GUID on the device and in the SharePoint service must match, but effectively the device is allowed to create the domain GUID and is allowed to sync if it matches
  </p>
</blockquote>

Now before we celebrate, we need to make a note that ideally you should be using conditional access and compliance policies to control access to corporate data. The method described in this blog post is a nice stop-gap until you can set those up.

## Implementation

While this might sound like a perfect use case for Endpoint analytics Proactive Remediations, you will run into a chicken-egg problem when a user starts up a brand new device, namely that the user has most likely logged into to a new device before the proactive remediation has run.

To solve this, you should wrap up the script as a win32 app, deploy it as a required app to a relevant device group and <a rel="noreferrer noopener" href="https://docs.microsoft.com/en-us/mem/intune/enrollment/windows-enrollment-status#block-access-to-a-device-until-a-specific-application-is-installed" target="_blank">make it required as part of the autopilot ESP</a>.

Here is a dead simple example code you can use, just change the $DomainGUID to your own

<div class="wp-block-codemirror-blocks-code-block code-block">
  <pre class="CodeMirror" data-setting="{&quot;mode&quot;:&quot;powershell&quot;,&quot;mime&quot;:&quot;application/x-powershell&quot;,&quot;theme&quot;:&quot;default&quot;,&quot;lineNumbers&quot;:true,&quot;styleActiveLine&quot;:true,&quot;lineWrapping&quot;:true,&quot;readOnly&quot;:false,&quot;fileName&quot;:&quot;Set-AADJMachineDomainGuid.ps1&quot;,&quot;language&quot;:&quot;PowerShell&quot;,&quot;modeName&quot;:&quot;powershell&quot;}">$DomainGUID = "a2936ecb-ea97-4854-a494-82a39a3195be"
new-item -itemtype directory -path "hklm:\Software\Policies\Microsoft\OneDrive" -force
Set-ItemProperty -Path "hklm:\Software\Policies\Microsoft\OneDrive" -Name "AADJMachineDomainGuid" -Value $DomainGUID -Force</pre>
</div>

## Final words

Now keep in mind that you need to deploy this registry key to your Azure AD joined devices before you restrict the sync in the OneDrive Admin Center - otherwise your users will need to sign in to OneDrive again.