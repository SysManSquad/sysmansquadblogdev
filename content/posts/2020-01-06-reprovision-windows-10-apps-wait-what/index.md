---
title: Reprovision Windows 10 Apps… Wait, What?
author: Cody Mathis
type: post
date: 2020-01-06T13:54:48+00:00
url: /2021/01/06/reprovision-windows-10-apps-wait-what/
featured_image: Reprovision-AppX.png
categories:
  - Endpoint Management
  - How-To
  - MECM/MEMCM/SCCM
  - Powershell
  - Scripting
tags:
  - AppX
  - MEMCM
  - PowerShell
  - SCCM
  - Windows 10

---
Remember when we all complained that Microsoft "wasn't respecting our app removals!" and they were all reinstalled during every feature update? Pepperidge farm remembers. Well, Microsoft was kind enough to hear our collective complaints, and take action on them. That is an awesome quality that we are seeing from the product teams at Microsoft. 

Starting in Windows 10 1803, deprovisioned apps will NOT be reinstalled during a feature update. No more Solitaire returning from the dead every time we try to "Get current and stay current." No more ZuneMusic trying to be brought back from the dead by Microsoft. 

#### But I changed my mind... I want those apps back

Ironically, I found myself pounding my head against the keyboard trying to reinstall the Windows Store! Bad decisions are made sometimes . In this case, a business decision was made to deprovision the Windows Store because it is _evil_!!! Or at least that was the misunderstanding 3-4 years ago when the decision was made. **(Note: DON'T REMOVE THE STORE, THERE ARE BETTER WAYS TO HANDLE IT SUCH AS DISABLING WITH GPO, OR MANAGING IT WITH WINDOWS STORE FOR BUSINESS)**

The Windows Store was of course not the only app removed. Various applications were selected for removal based on this reason, or that reason. 

#### We can unfix it, we have the technology

Microsoft details the 'trigger' for these apps not being reinstalled in the docs here.

<blockquote class="wp-block-quote">
  <p>
    [https://docs.microsoft.com/en-us/windows/application-management/remove-provisioned-apps-during-update](https://docs.microsoft.com/en-us/windows/application-management/remove-provisioned-apps-during-update)
  </p>
</blockquote>

The gist of it is, when an app is deprovisioned a registry key will be made. If that registry key is present then the app will not be reinstalled on any Windows 10 Feature Update that is 1803 or above. To help get a handle on this I've written up some functions that have multiple use cases. 

#### Find 'em

First, we can identify apps that have been deprovisioned with the below function. I’ve linked to it on GitHub, and the codeblock is below. 


```powershell 
function Get-DeprovisionedAppX {
    #
    .SYNOPSIS
        Returns an array of apps that are deprovisioned
    .DESCRIPTION
        This function returns an array of all the apps that are deprovisioned on the local computer.
        Deprovisioned apps will show up in the registry if they were removed while Windows was offline, or
        with the PowerShell cmdlets for removing AppX Packages.
    .PARAMETER Filter
        Option filter that will be ran through as a '-match' so that regex can be used
        Accepts an array of strings, which can be a regex string if you wish
    .EXAMPLE
        PS C:\> Get-DeprovisionedAppX
        Return all deprovisioned apps on the local computers
    .EXAMPLE
        PS C:\> Get-DeprovisionedAppX -Filter Store
        Return all deprovisioned apps on the local computers that match the filter 'Store'
    #>
    param (
        [parameter(Mandatory = $false)]
        [string[]]$Filter
    )
    begin {
        $DeprovisionRoot = "registry::HKEY_LOCAL_MACHINE\SOFTWARE\Microsoft\Windows\CurrentVersion\Appx\AppxAllUserStore\Deprovisioned"
        $AllDeprovisionedApps = Get-ChildItem -Path $DeprovisionRoot | Select-Object -Property @{ Name = 'DeprovisionedApp'; Expression = { $_.PSChildName } }
        if ($null -eq $AllDeprovisionedApps) {
            Write-Warning "There are no deprovisioned apps"
        }
    }
    process {
        switch ($PSBoundParameters.ContainsKey('Filter')) {
            $true {
                foreach ($SearchString in $Filter) {
                    switch -regex ($AllDeprovisionedApps.DeprovisionedApp) {
                        $SearchString {
                            [PSCustomObject]@{ 
                                'DeprovisionedApp' = $PSItem
                            }
                        }
                        default {
                            Write-Verbose "$PSItem does not match the filter `'$SearchString`""
                        }
                    }
                }
            }
            $false {
                Write-Output $AllDeprovisionedApps
            }
        }
    }
}
```


<blockquote class="wp-block-quote">
  <p>
    [https://github.com/CodyMathis123/CM-Ramblings/blob/master/Reprovision%20Windows%2010%20Apps/Get-DeprovisionedAppX.ps1](https://github.com/CodyMathis123/CM-Ramblings/blob/master/Reprovision%20Windows%2010%20Apps/Get-DeprovisionedAppX.ps1)
  </p>
  
  <cite>Get-DeprovisionedAppX</cite>
</blockquote>

Nothing too crazy going on here. At the core we are grabbing all keys under the path provided in the MS docs. I am just tossing in support for filters, comment based help, and some verbose output. I am also ensuring that we return an object with a specific property name, DeprovisionedApp. The reason for this will be apparent when we look at the next function.

#### Fix 'em

We have our targets, now lets blow them away! The below function 'reprovisions' the apps by removing the registry keys for the requested apps. 


```powershell 
function Reprovision-AppX {
    #
    .SYNOPSIS
        'Reprovision' apps by removing the registry key that prevents app reinstall
    .DESCRIPTION
        Starting in Windows 10 1803, a registry key is set for every deprovisioned app. As long as this registry key
        is in place, a deprovisioned application will not be reinstalled during a feature update. By removing these
        registry keys, we can ensure that deprovisioned apps, such as the windows store are able to be reinstalled.
    .PARAMETER DeprovisionedApp
        The full name of the app to reprovision, as it appears in the registry. You can easily get this name using
        the Get-DeprovisionedApp function. 
    .EXAMPLE
        PS C:\> Reprovision-AppX -DeprovisionedApp 'Microsoft.WindowsAlarms_8wekyb3d8bbwe'
        Removes the registry key for the deprovisioned WindowsAlarms app. The app will return after the next
        feature update.
    .INPUTS
        [string[]]
    .NOTES
        You must provide the exact name of the app as it appears in the registry. This is the full app 'name' - It is 
        recommended to first use the Get-DeprovisionApp function to find apps that can be reprovisioned.
    #>
    [CmdletBinding(SupportsShouldProcess)]
    param(
        [parameter(Mandatory = $true, ValueFromPipelineByPropertyName = $true)]
        [string[]]$DeprovisionedApp
    )
    begin {
        $DeprovisionRoot = "registry::HKEY_LOCAL_MACHINE\SOFTWARE\Microsoft\Windows\CurrentVersion\Appx\AppxAllUserStore\Deprovisioned"
        $AllDeprovisionedApps = Get-ChildItem -Path $DeprovisionRoot
        if ($null -eq $AllDeprovisionedApps) {
            Write-Warning "There are no deprovisioned apps"
        }
    }
    process {
        foreach ($App in $DeprovisionedApp) {
            $DeprovisionedAppPath = Join-Path -Path $DeprovisionRoot -ChildPath $App
            if ($PSCmdlet.ShouldProcess($App, "Reprovision-App")) {
                $AppPath = Resolve-Path -Path $DeprovisionedAppPath -ErrorAction Ignore
                if ($null -ne $AppPath) {
                    Remove-Item -Path $AppPath.Path -Force
                }
                else {
                    Write-Warning "App $App was not found to be deprovisioned"
                }
            }
        }
    }
}
```


<blockquote class="wp-block-quote">
  <p>
    [https://github.com/CodyMathis123/CM-Ramblings/blob/master/Reprovision%20Windows%2010%20Apps/Reprovision-AppX.ps1](https://github.com/CodyMathis123/CM-Ramblings/blob/master/Reprovision%20Windows%2010%20Apps/Reprovision-AppX.ps1)
  </p>
  
  <cite>Reprovision-AppX</cite>
</blockquote>

What we have here is a glorified wrapper for **Remove-Item**. But, it does have a bit of extra spice sprinkled on it. 

**ValueFromPipelineByPropertyName** - With this specified on the DeprovisionedApp input parameter we are able to pipe from our Get-DeprovisionedApp function, to Reprovision-App. 


```powershell 
Get-DeprovisionedAppX -Filter 'Store' | Reprovision-AppX
```


That's pretty cool! 

**[CmdletBinding(SupportsShouldProcess)]** - At the top of the function this snippet allows the implementation of WhatIf support. To finish the implementation we have to use **$PSCmdlet.ShouldProcess** where it is fitting. This function has it at line 37, just before the action happens. 

<div class="wp-block-image">
  <figure class="aligncenter size-large is-resized">![](Reprovision-AppX-1024x435.png)<figcaption>Function use examples</figcaption></figure>
</div>

#### Last step

Once the deprovisioned apps have been identified, and 'reprovisioned' by removing the registry keys, there is one last step. You have to do a feature update! It is always good to 'Get current and stay current' anyway, but this gives you another reason to update Windows 10. 

#### A good start

In this post I've outlined the mechanism that ensures a deprovisioned AppX Package stays removed. Knowing how this works, we can leverage functions that help identify deprovisoned apps, and 'reprovision' them. 

I hope this helps someone get their environment back in working order by restoring the Windows Store! Or maybe just Solitaire... Let them play cards guys. 

[@CodyMathis123](https://twitter.com/CodyMathis123)


