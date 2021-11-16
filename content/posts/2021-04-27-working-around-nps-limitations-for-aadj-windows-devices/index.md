---
title: Working around NPS limitations for AADJ Windows devices
author: Andrew Blackburn
type: post
date: 2021-04-28T03:10:47+00:00
url: /2021/04/27/working-around-nps-limitations-for-aadj-windows-devices/
categories:
  - Endpoint Management
  - Intune
  - Networking
tags:
  - Intune
  - nps
  - PowerShell
  - radius
  - wifi

---
<div class="wp-block-uagb-table-of-contents uagb-toc\_\_align-left uagb-toc\_\_columns-1 uagb-block-d2228891 " data-scroll= "1" data-offset= "30" data-delay= "800" > 

<div class="uagb-toc__wrap">
  <div class="uagb-toc__title-wrap">
    <div class="uagb-toc__title">
      Table Of Contents
    </div>
  </div>
  
  <div class="uagb-toc__list-wrap">
    <ol class="uagb-toc__list">
      <li class="uagb-toc__list">
        [Introduction](#introduction)<li class="uagb-toc__list">
          [Background](#background)<ul class="uagb-toc__list">
            <li class="uagb-toc__list">
              [The tl;dr of the issue](#the-tldr-of-the-issue)<li class="uagb-toc__list">
                <li class="uagb-toc__list">
                  [Why is device based authentication important?](#why-is-device-based-authentication-important)<li class="uagb-toc__list">
                    <li class="uagb-toc__list">
                      [Why not just hybrid join your machines?](#why-not-just-hybrid-join-your-machines)
                    </li></ul>
                  </li>
                  <li class="uagb-toc__list">
                    [Things I am assuming you have](#things-i-am-assuming-you-have)<li class="uagb-toc__list">
                      [The workaround](#the-workaround)<ul class="uagb-toc__list">
                        <li class="uagb-toc__list">
                          [Basic version of the script](#basic-version-of-the-script)<li class="uagb-toc__list">
                            <li class="uagb-toc__list">
                              [More advanced version of the script that works with MS Graph](#more-advanced-version-of-the-script-that-works-with-ms-graph)<li class="uagb-toc__list">
                                <li class="uagb-toc__list">
                                  [Expected changes for readers](#expected-changes-for-readers)
                                </li></ul>
                              </li></ul>
                            </li>
                            <li class="uagb-toc__list">
                              [Closing thoughts](#closing-thoughts)
                            </li></ul>
                          </li></ul></ol> </div> </div> </div> 
                          <h2>
                            Introduction
                          </h2>
                          
                          <p>
                            In this post, I'll show you a workaround to get device based wireless authentication working for AADJ Windows devices via NPS. Keep in mind this is a workaround and your mileage may vary.
                          </p>
                          
                          <h2>
                            Background
                          </h2>
                          
                          <p>
                            NPS does not play nice when it comes to AADJ device authentication. There is a fantastic writeup on this issue [here](https://docs.microsoft.com/en-us/answers/questions/57999/device-certificate-scep-based-authentication-again.html).
                          </p>
                          
                          <h5>
                            <strong>The tl;dr of the issue</strong>
                          </h5>
                          
                          <p>
                            Device based authentication works when there is a computer object in your on-prem. directory that backs up NPS's authentication checks. If the devices are AADJ only (not hybrid), then there is no computer object in the on-prem. directory. NPS sees the device as unknown and authentication fails.
                          </p>
                          
                          <h5>
                            <strong>Why is device based authentication important?</strong>
                          </h5>
                          
                          <p>
                            Ideally, there should be a connection to the network at the login screen. This isn't a big deal if you're 1:1 because of cached credentials. If you're not 1:1, e.g. shared devices, you will need a network connection at the login screen to ensure the first time login for a user works.
                          </p>
                          
                          <h5>
                            <strong>Why not just hybrid join your machines?</strong>
                          </h5>
                          
                          <div class="wp-block-image">
                            <figure class="aligncenter size-large is-resized">![](haadj.gif)<figcaption>More great gifs like this on the [Windows Admins](https://aka.ms/winadmins) Discord server.</figcaption></figure>
                          </div>
                          
                          <h2>
                            Things I am assuming you have
                          </h2>
                          
                          <ul>
                            <li>
                              Healthy PKI<ul>
                                <li>
                                  Certificate enrollment configured for the user <strong>and </strong>device via your MDM
                                </li>
                              </ul>
                            </li>
                            
                            <li>
                              Healthy wireless network<ul>
                                <li>
                                  802.1X via an on-prem. NPS
                                </li>
                              </ul>
                              
                              <ul>
                                <li>
                                  WiFi profile(s) pushed out to your devices via your MDM
                                </li>
                              </ul>
                            </li>
                          </ul>
                          
                          <h2>
                            The workaround
                          </h2>
                          
                          <p>
                            There are several workarounds discussed in the post I linked above. For me, the easiest method is creating "dummy" computer objects in Active Directory that match the AADJ devices. Once NPS sees the AADJ device in your local AD, authentication works.
                          </p>
                          
                          <p>
                            I settled on using PowerShell for this workaround. Although tedious, you could do your initial testing via ADUC and the attribute editor.
                          </p>
                          
                          <h5>
                            Basic version of the script
                          </h5>
                          
                          <p>
                            This basic version of the script lets you create one device at a time (useful for testing):
                          </p>
                          
                          <div class="wp-block-codemirror-blocks-code-block code-block lineWrapping: false">
```powershell
[CmdletBinding(DefaultParameterSetName = 'Default')]
param(
    [Parameter(Mandatory=$False)] [String] $deviceName = "",
    [Parameter(Mandatory=$False)] [Switch] $nameMap
    )

# Set the OU for computer object creation
$orgUnit = "OU=Dummy Devices,OU=Devices,DC=yourdomain,DC=tld" 

# Set the certificate path for name mapping
$certPath = "X509:I>DC=tld,DC=yourdomain,CN=your-CAS>CN=" 

# Prepare SAMAccountName based off of length constraints
$SAMAccountName = if ($deviceName.Length -ge 15) {$deviceName.Substring(0,15) + "$"} else {$deviceName + "$"}

# Create the dummy computer object in AD
try {
    New-ADComputer -Name "$deviceName" -SAMAccountName $SAMAccountName -Path $orgUnit -ServicePrincipalNames "HOST/$deviceName"
    Write-Host "Computer object created. ($($deviceName))" -ForegroundColor Green
} catch {
    Write-Host "Skipping AD computer object creation (likely because it already exists in AD)" -ForegroundColor Yellow
}

# Perform name mapping if specified
if ($nameMap) {
    try {
        Set-ADComputer -Identity $SAMAccountName -Add @{'altSecurityIdentities'="$($certPath)$($deviceName)"}
        Write-Host "Name mapping for computer object done. ($($certPath)$($deviceName))" -ForegroundColor Green
    } catch {
        Write-Host "Skipping name mapping (likely because device does not exist in AD)" -ForegroundColor Red
        exit 1
    }
}
```
                          </div>
                          
                          <p>
                            There are three important things this script does:
                          </p>
                          
                          <ol>
                            <li>
                              Creates the computer object<ul>
                                <li>
                                  Be sure to use the correct device name. Usually this will be what you have mapped to your device certificate. In my case, I used the AAD Device ID for the computer.
                                </li>
                              </ul>
                            </li>
                            
                            <li>
                              Adds the service principal name (SPN) to the computer object<ul>
                                <li>
                                  This is what NPS sees when a device authenticates (HOST/devicename). Again, device name is very important here.
                                </li>
                              </ul>
                            </li>
                            
                            <li>
                              Adds a certificate name mapping to the computer object if needed<ul>
                                <li>
                                  I have heard from others this may not be necessary. This won't work in my environment unless there is a name mapping.
                                </li>
                              </ul>
                            </li>
                          </ol>
                          
                          <p>
                            Be sure to run this on a domain computer that has the 'ActiveDirectory' module. Also, the account that the script is running under will need permissions to create and edit computer objects in AD.
                          </p>
                          
                          <p>
                            Here is an example run command:
                          </p>
                          
                          <div class="wp-block-jetpack-markdown">
                            <pre><code>.\New-DummyADComputer.ps1 -deviceName "device-name-here" -nameMap</code></pre>
                          </div><figure class="wp-block-image size-large">
                          
                          ![](image-8.png)</figure> <p>
                            After using the script for a test device, you should see the computer object in your AD.
                          </p>
                          
                          <div class="wp-block-image">
                            <figure class="aligncenter size-large">![](image-9.png)</figure>
                          </div>
                          
                          <p>
                            Now, you should be able to perform successful device based 802.1X authentication on your test device. 👍
                          </p>
                          
                          <h5>
                            More advanced version of the script that works with MS Graph
                          </h5>
                          
                          <p>
                            For my use case, I needed something that I could run on a schedule and forget about. This more advanced version of the script pulls down all of the Autopilot devices from MS Graph using the 'WindowsAutopilotIntune' module. It then uses the 'ActiveDirectory' module to create/prepare matching computer objects in AD.
                          </p>
                          
                          
```powershell
[CmdletBinding(DefaultParameterSetName = 'Default')]
param(
    [Parameter(Mandatory=$True)] [String] $TenantId = "",
    [Parameter(Mandatory=$True)] [String] $ClientId = "",
    [Parameter(Mandatory=$True)] [String] $ClientSecret = "",
    [Parameter(Mandatory=$False)] [Switch] $NameMap
)

# Get NuGet
Get-PackageProvider -Name "NuGet" -Force | Out-Null

# Get WindowsAutopilotIntune module (and dependencies)
$module = Import-Module WindowsAutopilotIntune -PassThru -ErrorAction Ignore
if (-not $module) {
    Write-Host "Installing module WindowsAutopilotIntune"
    Install-Module WindowsAutopilotIntune -Force
}
Import-Module WindowsAutopilotIntune -Scope Global

# Connect to MSGraph with application credentials
Connect-MSGraphApp -Tenant $TenantId -AppId $ClientId -AppSecret $ClientSecret

# Pull latest Autopilot device information
$AutopilotDevices = Get-AutopilotDevice | Select-Object azureActiveDirectoryDeviceId

# Set the OU for computer object creation
$orgUnit = "OU=Dummy Devices,OU=Devices,DC=yourdomain,DC=tld" 

# Set the certificate path for name mapping
$certPath = "X509:I>DC=tld,DC=yourdomain,CN=your-CAS>CN=" 

# Create new Autopilot computer objects in AD while skipping already existing computer objects
foreach ($Device in $AutopilotDevices) {
    if (Get-ADComputer -Filter "Name -eq ""$($Device.azureActiveDirectoryDeviceId)""" -SearchBase $orgUnit -ErrorAction SilentlyContinue) {
        Write-Host "Skipping $($Device.azureActiveDirectoryDeviceId) because it already exists. " -ForegroundColor Yellow
    } else {
        # Create new AD computer object
        try {
            New-ADComputer -Name "$($Device.azureActiveDirectoryDeviceId)" -SAMAccountName "$($Device.azureActiveDirectoryDeviceId.Substring(0,15))`$" -ServicePrincipalNames "HOST/$($Device.azureActiveDirectoryDeviceId)" -Path $orgUnit
            Write-Host "Computer object created. ($($Device.azureActiveDirectoryDeviceId))" -ForegroundColor Green
        } catch {
            Write-Host "Error. Skipping computer object creation." -ForegroundColor Red
        }
        
        # Perform name mapping
        try {
            Set-ADComputer -Identity "$($Device.azureActiveDirectoryDeviceId.Substring(0,15))" -Add @{'altSecurityIdentities'="$($certPath)$($Device.azureActiveDirectoryDeviceId)"}
            Write-Host "Name mapping for computer object done. ($($certPath)$($Device.azureActiveDirectoryDeviceId))" -ForegroundColor Green
        } catch {
            Write-Host "Error. Skipping name mapping." -ForegroundColor Red
        }
    }
}

# Reverse the process and remove any dummmy computer objects in AD that are no longer in Autopilot
$DummyDevices = Get-ADComputer -Filter * -SearchBase $orgUnit | Select-Object Name, SAMAccountName
foreach ($DummyDevice in $DummyDevices) {
	if ($AutopilotDevices.azureActiveDirectoryDeviceId -contains $DummyDevice.Name) {
        # Write-Host "$($DummyDevice.Name) exists in Autopilot." -ForegroundColor Green
    } else {
        Write-Host "$($DummyDevice.Name) does not exist in Autopilot." -ForegroundColor Yellow
        # Remove-ADComputer -Identity $DummyDevice.SAMAccountName -Confirm:$False -WhatIf 
        #Remove -WhatIf once you are comfortrable with this workflow and have verified the remove operations are only performed in the OU you specified
    }
}
```
                          
                          
                          <p>
                            Here is a play-by-play of the script:
                          </p>
                          
                          <ol>
                            <li>
                              Connects to MS Graph with application credentials<ul>
                                <li>
                                  You could change this to perform an interactive login. For my use case, Azure app-based authentication allows me to schedule this script. The Azure app registration only needs API permissions to read Autopilot devices.
                                </li>
                              </ul>
                            </li>
                            
                            <li>
                              Pulls Autopilot device information from MS Graph
                            </li>
                            <li>
                              Creates&nbsp;new&nbsp;dummy computer objects&nbsp;in&nbsp;AD using the Autopilot device information<ul>
                                <li>
                                  Already&nbsp;existing&nbsp;dummy devices are skipped
                                </li>
                              </ul>
                            </li>
                            
                            <li>
                              Reverses the process and removes any dummy computer objects in AD that no longer exist in Autopilot<ul>
                                <li>
                                  <strong>This step is potentially dangerous. </strong>Because of that, I added comments in the script above (line 63) and added <em>-WhatIf</em> as further risk control.
                                </li>
                              </ul>
                            </li>
                          </ol>
                          
                          <p>
                            Here is an example run command:
                          </p>
                          
                          <div class="wp-block-jetpack-markdown">
                            <pre><code>.\Sync-DummyComputers.ps1 -TenantId "your-tenant-id-here" -ClientId "your-app-id-here" -ClientSecret "your-app-secret-here" -NameMap
</code></pre>
                          </div>
                          
                          <div class="wp-block-image">
                            <figure class="aligncenter size-large is-resized">![](image-3-1024x71.png)</figure>
                          </div>
                          
                          <p>
                            After running this script for the first time, you should see your new dummy computer objects in the OU you configured.
                          </p>
                          
                          <div class="wp-block-image">
                            <figure class="aligncenter size-large">![](image-15.png)</figure>
                          </div>
                          
                          <p>
                            Now, you should be able to perform successful device based 802.1X authentication on your devices. 👍
                          </p>
                          
                          <h5>
                            Expected changes for readers
                          </h5>
                          
                          <p>
                            I would expect you need to make changes to the script based off of your needs. Here are a few things I think will vary between readers:
                          </p>
                          
                          <ul>
                            <li>
                              Device name <ul>
                                <li>
                                  I went with the AAD Device ID in my certificates
                                </li>
                              </ul>
                            </li>
                            
                            <li>
                              The org. unit where your dummy computer objects will live
                            </li>
                            <li>
                              The X509 certificate path used for name mapping<ul>
                                <li>
                                  This is dependent on your CA and other factors. I was able to find this path by performing the name mapping in ADUC and looking at the 'altSecurityIdentities' attribute on the object
                                </li>
                              </ul>
                            </li>
                          </ul>
                          
                          <h2>
                            Closing thoughts
                          </h2>
                          
                          <p>
                            It took me several tries to nail this down and I would expect this on your end too. Analyzing NPS logs to see what I was missing was the most helpful troubleshooting step on my end.
                          </p>
                          
                          <p>
                            I'm not sure why Microsoft hasn't considered this or even followed up to the [linked post above](https://docs.microsoft.com/en-us/answers/questions/57999/device-certificate-scep-based-authentication-again.html). In an ideal world, Microsoft might create some sort of connector for on-prem. NPS to check AAD, as well as the local AD, for devices during authentications.
                          </p>
                          
                          <p>
                            I realize that a solution like ClearPass would completely mitigate the need for a workaround like this. For many reasons, like budget, continuing to use NPS is ideal for my environment.
                          </p>
                          
                          <p>
                            I hope this gets you to a decent starting point when you are considering device based authentication for your AADJ Windows devices.
                          </p>
