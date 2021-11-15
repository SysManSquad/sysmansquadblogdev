---
title: Updated Modern Driver/BIOS Management with CMG Support
author: Charles
type: post
date: 2021-04-28T03:04:02+00:00
url: /2021/04/27/updated-modern-driver-bios-management-with-cmg-support/
categories:
  - Endpoint Management
  - MECM/MEMCM/SCCM
  - Powershell
  - Task Sequence
tags:
  - adminservice
  - bios
  - cmg
  - drivers

---
<div class="wp-block-uagb-table-of-contents uagb-toc\_\_align-left uagb-toc\_\_columns-1 uagb-block-d2123629 " data-scroll= "1" data-offset= "30" data-delay= "800" > 

<div class="uagb-toc__wrap">
  <div class="uagb-toc__title-wrap">
    <div class="uagb-toc__title">
      Table Of Contents
    </div>
  </div>
  
  <div class="uagb-toc__list-wrap">
    <ol class="uagb-toc__list">
      <li class="uagb-toc__list">
        <a href="#notable-improvements">Notable improvements</a><li class="uagb-toc__list">
          <a href="#prerequisites-to-use-the-solution-over-cmg">Prerequisites to use the solution over CMG</a><ul class="uagb-toc__list">
            <li class="uagb-toc__list">
              <a href="#a-working-cmg">A working CMG</a><li class="uagb-toc__list">
                <li class="uagb-toc__list">
                  <a href="#additional-configuration-to-use-the-adminservice-over-cmg">Additional configuration to use the AdminService over CMG</a>
                </li></ul>
              </li>
              <li class="uagb-toc__list">
                <a href="#how-to-query-the-adminservice-over-cmg">How to query the AdminService over CMG?</a><ul class="uagb-toc__list">
                  <li class="uagb-toc__list">
                    <a href="#using-the-msalps-module">Using the MSAL.PS module</a>
                  </li>
                </ul>
              </li></ul>
            </li>
            
            <li class="uagb-toc__list">
              <a href="#improvements-to-invoke-getpackageidfromadminservice">Improvements to Invoke-GetPackageIDFromAdminService</a><ul class="uagb-toc__list">
                <li class="uagb-toc__list">
                  <a href="#1-new-parameters-and-parametersets">1) New parameters and ParameterSets</a><li class="uagb-toc__list">
                    <li class="uagb-toc__list">
                      <a href="#2-verify-install-and-import-the-msalps-module">2) Verify, Install and Import the MSAL.PS module</a><li class="uagb-toc__list">
                        <li class="uagb-toc__list">
                          <a href="#3-querying-the-adminservice">3) Querying the AdminService</a>
                        </li></ul>
                      </li></ul>
                    </li></ul>
                  </li>
                  <li class="uagb-toc__list">
                    <a href="#improvements-to-the-task-sequence">Improvements to the task sequence</a><ul class="uagb-toc__list">
                      <li class="uagb-toc__list">
                        <a href="#1-is-the-client-on-internet">1) Is the client on Internet?</a><li class="uagb-toc__list">
                          <li class="uagb-toc__list">
                            <a href="#2-additional-parameters-for-internet-clients">2) Additional Parameters for Internet clients</a><li class="uagb-toc__list">
                              <li class="uagb-toc__list">
                                <a href="#3-running-the-script-with-the-right-parameters">3) Running the script with the right parameters</a>
                              </li></ul>
                            </li></ul>
                          </li></ul>
                        </li></ul>
                      </li>
                      <li class="uagb-toc__list">
                        <a href="#the-end-result">The end result</a><li class="uagb-toc__list">
                          <a href="#how-do-i-set-this-up-in-my-environment">How do I set this up in my environment?</a><ul class="uagb-toc__list">
                            <li class="uagb-toc__list">
                              <a href="#what-if-i-have-multiple-cmgs">What if I have multiple CMGs?</a>
                            </li>
                          </ul>
                        </li></ul>
                      </li>
                    </ul>
                  </li></ul>
                </li>
              </ul>
            </li>
            
            <li class="uagb-toc__list">
              <a href="#a-note-on-the-task-sequence-size">A note on the task sequence size</a><li class="uagb-toc__list">
                <a href="#links">Links</a>
              </li></ul>
            </li>
          </ul>
        </li></ul>
      </li></ul></li></ul>
    </ol>
  </div>
</div></div> 

Hello,

This is a long and overdue update on a solution I started working on last year to allow my organization to use the modern driver management solution without the need of the custom webservice. I also wanted the solution to use the built-in task sequence steps as much as possible to allow other administrators to customize the solution to their need without the need to go modify a big PowerShell script.

You can read the original blog posts here:

**Modern Driver Management with the Administration Service**<figure class="wp-block-embed is-type-wp-embed is-provider-systems-management-squad wp-block-embed-systems-management-squad">

<div class="wp-block-embed__wrapper">
  <div class="x-embed x-is-rich x-is-systems-management-squad">
    <blockquote class="wp-embedded-content" data-secret="jzpz03RRKW">
      <a href="https://sysmansquad.com/2020/05/15/modern-driver-management-with-the-administration-service/">Modern Driver Management with the Administration Service</a>
    </blockquote>
  </div>
</div></figure> 

**Modern BIOS Management with the Administration Service**<figure class="wp-block-embed is-type-wp-embed is-provider-systems-management-squad wp-block-embed-systems-management-squad">

<div class="wp-block-embed__wrapper">
  <div class="x-embed x-is-rich x-is-systems-management-squad">
    <blockquote class="wp-embedded-content" data-secret="11ToJaBiRO">
      <a href="https://sysmansquad.com/2020/06/18/modern-bios-management-with-the-administration-service/">Modern BIOS Management with the Administration Service</a>
    </blockquote>
  </div>
</div></figure> 

## Notable improvements

<ol type="1">
  <li>
    The solution now works for clients on the internet by querying the AdminService over a cloud management gateway (CMG)<br />Bonus: It works in WinPE! You can do a complete reinstallation of a device over CMG using this solution to dynamically apply bios updates and drivers at the same time during the task sequence.<br /><br />
  </li>
  <li>
    The solution now supports 7-Zip and Wim driver packages<br />
  </li>
  <li>
    Improvements to handle driver packages using the DisplayVersion property instead of ReleaseId (ex: 20H2 instead of 2009)
  </li>
</ol>

## Prerequisites to use the solution over CMG

### A working CMG

There are multiple blog articles and guides online to help you set up your CMG. Here are some links that helped me:

  * [Official documentation/guidance from Microsoft](https://docs.microsoft.com/en-us/mem/configmgr/core/clients/manage/cmg/setup-cloud-management-gateway)
  * [CMG Guide from System Center Dudes](https://systemcenterdudes.com/setup-and-configure-sccm-cloud-management-gateway-1806/)
  * [CMG Guide from Prajwal Desai](https://www.prajwaldesai.com/setup-sccm-cloud-management-gateway/)

Personally, for my lab, I used the [Let's Encrypt Cloud Management Gateway](https://z-nerd.com/blog/2019/05/20-lets-encrypt-cloud-management-gateway/) blog post by Nathan Ziehnert to set up my CMG.

### Additional configuration to use the AdminService over CMG

There is some additional configuration that is needed to be able to query the AdminService over the cloud management gateway.

Once again, another one of Nathan’s blog post helped me: [Securing Access to the ConfigMgr AdminService Over Cloud Management Gateway](https://z-nerd.com/blog/2019/12/03-adminservice-over-cmg/)

There are 2 things I had to do differently in the Authentication section:

  * Add a platform and select “Mobile and desktop applications” and check the box for : <https://login.microsoftonline.com/common/oauth2/nativeclient>
  * Select “Yes” to Allow public client flows<figure class="wp-block-image size-large">

<img loading="lazy" width="624" height="513" src="https://sysmansquad.com/wp-content/uploads/2021/04/image.png" alt="" class="wp-image-2553" srcset="https:/wp-content/uploads/2021/04/image.png 624w, https:/wp-content/uploads/2021/04/image-300x247.png 300w, https:/wp-content/uploads/2021/04/image-100x82.png 100w" sizes="(max-width: 624px) 100vw, 624px" /> </figure> 

## How to query the AdminService over CMG?

I started my research by reading the blog post from Sandy Zeng here: <https://msendpointmgr.com/2019/07/16/use-configmgr-administration-service-adminservice-over-internet/>

Also, at the same time, when I was looking at my application registration in the Azure Portal I saw this notification:<figure class="wp-block-image size-large">

<img loading="lazy" width="624" height="65" src="https://sysmansquad.com/wp-content/uploads/2021/04/image-1.png" alt="" class="wp-image-2554" srcset="https:/wp-content/uploads/2021/04/image-1.png 624w, https:/wp-content/uploads/2021/04/image-1-300x31.png 300w, https:/wp-content/uploads/2021/04/image-1-100x10.png 100w" sizes="(max-width: 624px) 100vw, 624px" /> </figure> 

After inspecting Sandy’s script, I confirmed that it was using Azure Active Directory Authentication Library (ADAL), so I wanted to make my solution work with MSAL instead of ADAL.

After doing some research, I found the perfect PowerShell module to help me: [MSAL.PS](https://github.com/AzureAD/MSAL.PS/)

With the help of that module, I was easily able to get an access token that is needed to query the AdminService over CMG.

### Using the MSAL.PS module

Here is a sample script I used to test retrieving an access token with the MSAL.PS module:<figure class="wp-block-image size-large">

<img loading="lazy" width="624" height="76" src="https://sysmansquad.com/wp-content/uploads/2021/04/image-2.png" alt="" class="wp-image-2555" srcset="https:/wp-content/uploads/2021/04/image-2.png 624w, https:/wp-content/uploads/2021/04/image-2-300x37.png 300w, https:/wp-content/uploads/2021/04/image-2-100x12.png 100w" sizes="(max-width: 624px) 100vw, 624px" /> </figure> 

And here is what the result looks like:<figure class="wp-block-image size-large">

<img loading="lazy" width="1024" height="873" src="https://sysmansquad.com/wp-content/uploads/2021/04/getmsaltoken-1-1024x873.png" alt="" class="wp-image-2685" srcset="https:/wp-content/uploads/2021/04/getmsaltoken-1-1024x873.png 1024w, https:/wp-content/uploads/2021/04/getmsaltoken-1-300x256.png 300w, https:/wp-content/uploads/2021/04/getmsaltoken-1-768x655.png 768w, https:/wp-content/uploads/2021/04/getmsaltoken-1-1536x1310.png 1536w, https:/wp-content/uploads/2021/04/getmsaltoken-1-100x85.png 100w, https:/wp-content/uploads/2021/04/getmsaltoken-1-855x729.png 855w, https:/wp-content/uploads/2021/04/getmsaltoken-1-1234x1053.png 1234w, https:/wp-content/uploads/2021/04/getmsaltoken-1.png 1591w" sizes="(max-width: 1024px) 100vw, 1024px" /> </figure> 

Now that I have an access token, I can easily query the AdminService over CMG. I reused the same part of the code used by Sandy to do this:<figure class="wp-block-image size-large">

<img loading="lazy" width="624" height="280" src="https://sysmansquad.com/wp-content/uploads/2021/04/image-4.png" alt="" class="wp-image-2557" srcset="https:/wp-content/uploads/2021/04/image-4.png 624w, https:/wp-content/uploads/2021/04/image-4-300x135.png 300w, https:/wp-content/uploads/2021/04/image-4-100x45.png 100w" sizes="(max-width: 624px) 100vw, 624px" /> </figure> 

In the example above, I was successfully able to retrieve information for 36 packages from the AdminService over CMG.

## Improvements to Invoke-GetPackageIDFromAdminService

Now that I knew what information I needed to use to query the AdminService over CMG, I was ready to make the necessary modifications to my script.

### 1) New parameters and ParameterSets

Depending on if the client is on the internet or not, my script would require a different set of parameters. This was the perfect opportunity to use [parameter sets](https://docs.microsoft.com/en-us/powershell/module/microsoft.powershell.core/about/about_parameter_sets?view=powershell-7.1).

<div class="wp-block-codemirror-blocks-code-block code-block">
  <pre class="CodeMirror" data-setting="{&quot;mode&quot;:&quot;powershell&quot;,&quot;mime&quot;:&quot;application/x-powershell&quot;,&quot;theme&quot;:&quot;default&quot;,&quot;lineNumbers&quot;:false,&quot;styleActiveLine&quot;:false,&quot;lineWrapping&quot;:false,&quot;readOnly&quot;:false,&quot;showPanel&quot;:false,&quot;fileName&quot;:&quot;shell.ps1&quot;,&quot;language&quot;:&quot;PowerShell&quot;,&quot;modeName&quot;:&quot;powershell&quot;}">[parameter(Mandatory = $true, ParameterSetName = "Intranet")]
[ValidateNotNullOrEmpty()]
[string]$ServerFQDN,

[parameter(Mandatory = $true, ParameterSetName = "Internet")]
[ValidateNotNullOrEmpty()]
[string]$ExternalUrl,

[parameter(Mandatory = $true, ParameterSetName = "Internet")]
[ValidateNotNullOrEmpty()]
[string]$TenantID,

[parameter(Mandatory = $true, ParameterSetName = "Internet")]
[ValidateNotNullOrEmpty()]
[string]$ClientID,

[parameter(Mandatory = $false, ParameterSetName = "Internet")]
[ValidateNotNullOrEmpty()]
[string]$ApplicationIdUri = 'https://ConfigMgrService',


[parameter(Mandatory = $false, ParameterSetName = "Intranet")]
[parameter(Mandatory = $true, ParameterSetName = "Internet")]
[ValidateNotNullOrEmpty()]
[string]$Username,

[parameter(Mandatory = $false, ParameterSetName = "Intranet")]
[parameter(Mandatory = $true, ParameterSetName = "Internet")]
[ValidateNotNullOrEmpty()]
[string]$Password,

[parameter(Mandatory = $false, ParameterSetName = "Intranet")]
[parameter(Mandatory = $false, ParameterSetName = "Internet")]
[bool]$BypassCertCheck = $false,</pre>
</div>

### 2) Verify, Install and Import the MSAL.PS module

I wrote a function to handle installing & importing the MSAL.PS.

The tricky part here is that the MSAL.PS module requires us to accept the license agreement before we can install the module. There is a parameter **-AcceptLicense** for the Install-Module function but it is only available in the [PowerShellGet module](https://docs.microsoft.com/en-us/powershell/module/powershellget) version 2 or higher.

This function checks for the availability of the MSAL.PS module and if it’s not there it will check for the prerequisites to install before it can import the module.

<div class="wp-block-codemirror-blocks-code-block code-block">
  <pre class="CodeMirror" data-setting="{&quot;mode&quot;:&quot;powershell&quot;,&quot;mime&quot;:&quot;application/x-powershell&quot;,&quot;theme&quot;:&quot;default&quot;,&quot;lineNumbers&quot;:true,&quot;styleActiveLine&quot;:true,&quot;lineWrapping&quot;:false,&quot;readOnly&quot;:false,&quot;showPanel&quot;:false,&quot;fileName&quot;:&quot;shell.ps1&quot;,&quot;language&quot;:&quot;PowerShell&quot;,&quot;modeName&quot;:&quot;powershell&quot;}">Function Import-MSALPSModule{
    Add-TextToCMLog $LogFile "Checking if MSAL.PS module is available on the device." $component 1
    $MSALModule = Get-Module -ListAvailable MSAL.PS
    If($MSALModule){
        Add-TextToCMLog $LogFile "Module is already available." $component 1
    }Else{
        #Setting PowerShell to use TLS 1.2 for PowerShell Gallery
        [Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12
        
        Add-TextToCMLog $LogFile "MSAL.PS is not installed, checking for prerequisites before installing module." $component 1
        
        Add-TextToCMLog $LogFile "Checking for NuGet package provider... " $component 1
        If(-not (Get-PackageProvider -Name NuGet -ListAvailable -ErrorAction SilentlyContinue)){
            Add-TextToCMLog $LogFile "NuGet package provider is not installed, installing NuGet..." $component 1
            $NuGetVersion = Install-PackageProvider -Name NuGet -Force -ErrorAction Stop | Select-Object -ExpandProperty Version
            Add-TextToCMLog $LogFile "NuGet package provider version $($NuGetVersion) installed." $component 1
        }
        
        Add-TextToCMLog $LogFile "Checking for PowerShellGet module version 2 or higher " $component 1
        $PowerShellGetLatestVersion = Get-Module -ListAvailable -Name PowerShellGet | Sort-Object -Property Version -Descending | Select-Object -First 1 -ExpandProperty Version       
        If((-not $PowerShellGetLatestVersion)){
            Add-TextToCMLog $LogFile "Could not find any version of PowerShellGet installed." $component 1
        }
        If(($PowerShellGetLatestVersion.Major -lt 2)){
            Add-TextToCMLog $LogFile "Current PowerShellGet version is $($PowerShellGetLatestVersion) and needs to be updated." $component 1
        }
        If((-not $PowerShellGetLatestVersion) -or ($PowerShellGetLatestVersion.Major -lt 2)){
            Add-TextToCMLog $LogFile "Installing latest version of PowerShellGet..." $component 1
            Install-Module -Name PowerShellGet -AllowClobber -Force
            $InstalledVersion = Get-Module -ListAvailable -Name PowerShellGet | Sort-Object -Property Version -Descending | Select-Object -First 1 -ExpandProperty Version
            Add-TextToCMLog $LogFile "PowerShellGet module version $($InstalledVersion) installed." $component 1
        }
        
        Add-TextToCMLog $LogFile "Installing MSAL.PS module..." $component 1
        If((-not $PowerShellGetLatestVersion) -or ($PowerShellGetLatestVersion.Major -lt 2)){
            Add-TextToCMLog $LogFile "Starting another powershell process to install the module..." $component 1
            $result = Start-Process -FilePath powershell.exe -ArgumentList "Install-Module MSAL.PS -AcceptLicense -Force" -PassThru -Wait -NoNewWindow
            If($result.ExitCode -ne 0){
                Add-TextToCMLog $LogFile "Failed to install MSAL.PS module" $component 3
                Throw "Failed to install MSAL.PS module"
            }
        }Else{
            Install-Module MSAL.PS -AcceptLicense -Force
        }
    }
    Add-TextToCMLog $LogFile "Importing MSAL.PS module..." $component 1
    Import-module MSAL.PS -Force
    Add-TextToCMLog $LogFile "MSAL.PS module successfully imported." $component 1
}</pre>
</div>

#### What about WinPE? PowerShell Gallery does not work in WinPE!

You are right, by default PowerShell Gallery does not work in WinPE. To solve this issue, you have 2 options:

<ol type="1">
  <li>
    Add PowerShell Gallery support to your boot image:<ul>
      <li>
        See this post by David Segura on how it can be achieved: <a href="https://www.osdeploy.com/blog/2021/winpe-powershell-gallery">https://www.osdeploy.com/blog/2021/winpe-powershell-gallery</a>
      </li>
      <li>
        The easiest way to add PowerShellGallery support to your boot image is to use a <a href="https://osdcloud.osdeploy.com/concepts/universal-winpe">Universal WinPE</a> that can be created with the OSD PowerShell module. Use this as a base for your boot image in Configuration Manager and you will be able to install modules from PSGallery directly in WinPE.
      </li>
    </ul>
  </li>
  
  <li>
    Manually install the MSAL.PS module during the task sequence before you run the script to query the AdminService:
  </li>
</ol>

<div class="wp-block-columns">
  <div class="wp-block-column" style="flex-basis:100%">
    <div class="wp-block-media-text alignwide has-media-on-the-right is-stacked-on-mobile">
      <figure class="wp-block-media-text__media"><img loading="lazy" width="1024" height="514" src="https://sysmansquad.com/wp-content/uploads/2021/04/image-5-1024x514.png" alt="" class="wp-image-2607 size-full" srcset="https:/wp-content/uploads/2021/04/image-5-1024x514.png 1024w, https:/wp-content/uploads/2021/04/image-5-300x150.png 300w, https:/wp-content/uploads/2021/04/image-5-768x385.png 768w, https:/wp-content/uploads/2021/04/image-5-100x50.png 100w, https:/wp-content/uploads/2021/04/image-5-855x429.png 855w, https:/wp-content/uploads/2021/04/image-5-1234x619.png 1234w, https:/wp-content/uploads/2021/04/image-5.png 1248w" sizes="(max-width: 1024px) 100vw, 1024px" /></figure>
      
      <div class="wp-block-media-text__content">
        <p>
          a) Create a package with the saved module and distribute it to your CMG
        </p>
      </div>
    </div>
  </div>
</div>

<div class="wp-block-group">
  <div class="wp-block-group__inner-container">
    <div class="wp-block-columns">
      <div class="wp-block-column" style="flex-basis:100%">
        <div class="wp-block-media-text alignwide has-media-on-the-right is-stacked-on-mobile">
          <figure class="wp-block-media-text__media"><img loading="lazy" width="1024" height="667" src="https://sysmansquad.com/wp-content/uploads/2021/04/manuallyinstallmsal_step-1024x667.png" alt="" class="wp-image-2601 size-full" srcset="https:/wp-content/uploads/2021/04/manuallyinstallmsal_step-1024x667.png 1024w, https:/wp-content/uploads/2021/04/manuallyinstallmsal_step-300x195.png 300w, https:/wp-content/uploads/2021/04/manuallyinstallmsal_step-768x500.png 768w, https:/wp-content/uploads/2021/04/manuallyinstallmsal_step-100x65.png 100w, https:/wp-content/uploads/2021/04/manuallyinstallmsal_step-855x557.png 855w, https:/wp-content/uploads/2021/04/manuallyinstallmsal_step-1234x804.png 1234w, https:/wp-content/uploads/2021/04/manuallyinstallmsal_step.png 1248w" sizes="(max-width: 1024px) 100vw, 1024px" /></figure>
          
          <div class="wp-block-media-text__content">
            <p>
              b) Edit the package in the “Manually install MSAL.PS module” step:
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>

Both options will allow you to install and import the MSAL.PS module in WinPE.

If you decide to go with enabling support for PowerShell Gallery in WinPE, you can disable the step to manually install the module in the task sequence.

### 3) Querying the AdminService

Now, depending on what parameters were used, we will query the AdminService locally or via the CMG:

<div class="wp-block-codemirror-blocks-code-block code-block">
  <pre class="CodeMirror" data-setting="{&quot;mode&quot;:&quot;powershell&quot;,&quot;mime&quot;:&quot;application/x-powershell&quot;,&quot;theme&quot;:&quot;default&quot;,&quot;lineNumbers&quot;:false,&quot;styleActiveLine&quot;:false,&quot;lineWrapping&quot;:false,&quot;readOnly&quot;:false,&quot;showPanel&quot;:false,&quot;fileName&quot;:&quot;shell.ps1&quot;,&quot;language&quot;:&quot;PowerShell&quot;,&quot;modeName&quot;:&quot;powershell&quot;}">switch($PSCmdlet.ParameterSetName){
    'Intranet'{
        $Packages = Invoke-RestMethod -Method Get -Uri $WMIPackageURL -Body $Body @InvokeRestMethodCredential | Select-Object -ExpandProperty value
    }
    'Internet'{
        $authHeader = @{
            'Content-Type'  = 'application/json'
            'Authorization' = "Bearer " + $token.AccessToken
            'ExpiresOn'	    = $token.ExpiresOn
        }
        $Packages = Invoke-RestMethod -Method Get -Uri $WMIPackageURL -Headers $authHeader -Body $Body | Select-Object -ExpandProperty value
    }
} </pre>
</div>

The rest of the script to filter and select the most suitable package did not change.

## Improvements to the task sequence

Now that the script itself supports querying over CMG, I needed to make some adjustments to the “**Query AdminService for PackageID**” task sequence to properly call the script with the right parameters.

### 1) Is the client on Internet?

We need to determine if the device running the task sequence is on Internet or on the corporate network (intranet).

First, we try using the _SMSTSIsClientOnInternet task sequence variable:<figure class="wp-block-image size-large">

<img loading="lazy" width="624" height="338" src="https://sysmansquad.com/wp-content/uploads/2021/04/image-6.png" alt="" class="wp-image-2612" srcset="https:/wp-content/uploads/2021/04/image-6.png 624w, https:/wp-content/uploads/2021/04/image-6-300x163.png 300w, https:/wp-content/uploads/2021/04/image-6-100x54.png 100w" sizes="(max-width: 624px) 100vw, 624px" /> </figure> 

Note: In my limited testing, I found that if a task sequence does not reference any package, this variable may not be set.

If the “ClientIsOnInternet” is still not set after this step and device is not in WinPE, we use the following PowerShell command to determine if the device is on Internet:

<div class="wp-block-codemirror-blocks-code-block code-block">
  <pre class="CodeMirror" data-setting="{&quot;mode&quot;:&quot;powershell&quot;,&quot;mime&quot;:&quot;application/x-powershell&quot;,&quot;theme&quot;:&quot;default&quot;,&quot;lineNumbers&quot;:false,&quot;styleActiveLine&quot;:false,&quot;lineWrapping&quot;:true,&quot;readOnly&quot;:false,&quot;showPanel&quot;:false,&quot;fileName&quot;:&quot;shell.ps1&quot;,&quot;language&quot;:&quot;PowerShell&quot;,&quot;modeName&quot;:&quot;powershell&quot;}">Get-CimInstance -ClassName "ClientInfo" -Namespace "Root\CCM" | Select-Object -ExpandProperty InInternet</pre>
</div><figure class="wp-block-image size-large">

<img loading="lazy" width="1024" height="613" src="https://sysmansquad.com/wp-content/uploads/2021/04/clientinfo-1024x613.png" alt="" class="wp-image-2615" srcset="https:/wp-content/uploads/2021/04/clientinfo-1024x613.png 1024w, https:/wp-content/uploads/2021/04/clientinfo-300x180.png 300w, https:/wp-content/uploads/2021/04/clientinfo-768x460.png 768w, https:/wp-content/uploads/2021/04/clientinfo-100x60.png 100w, https:/wp-content/uploads/2021/04/clientinfo-855x512.png 855w, https:/wp-content/uploads/2021/04/clientinfo-1234x739.png 1234w, https:/wp-content/uploads/2021/04/clientinfo.png 1248w" sizes="(max-width: 1024px) 100vw, 1024px" /> </figure> 

### 2) Additional Parameters for Internet clients

Here you fill out your environment-specific information. The additional parameters needed for CMG support are:

  * ExternalUrl: The ExternalUrl to access the AdminService from your CMG. The followinfg query can be used to find the ExternalUrl:

<div class="wp-block-codemirror-blocks-code-block code-block">
  <pre class="CodeMirror" data-setting="{&quot;mode&quot;:&quot;sql&quot;,&quot;mime&quot;:&quot;text/x-sql&quot;,&quot;theme&quot;:&quot;default&quot;,&quot;lineNumbers&quot;:false,&quot;styleActiveLine&quot;:false,&quot;lineWrapping&quot;:true,&quot;readOnly&quot;:false,&quot;showPanel&quot;:false,&quot;fileName&quot;:&quot;query.sql&quot;,&quot;language&quot;:&quot;SQL&quot;,&quot;modeName&quot;:&quot;sql&quot;}">SELECT ProxyServerName,ExternalUrl FROM [dbo].[vProxy_Routings] WHERE [dbo].[vProxy_Routings].ExternalEndpointName = 'AdminService'</pre>
</div>

  * TenantId: Your Azure AD Tenant ID
  * ClientId: The Client ID of the application registration that you created to interact with the AdminService. See [additional configuration to use the AdminService over CMG](https://sysmansquad.com/wp-admin/post.php?post=2552&action=edit#additional-configuration-to-use-the-adminservice-over-cmg) for details.
  * ApplicationIdUri: The application ID Uri for your application registration. The default value of "https://ConfigMgrService" will probably be OK for most people.<figure class="wp-block-image size-large">

<img loading="lazy" width="1024" height="503" src="https://sysmansquad.com/wp-content/uploads/2021/04/setparam-1024x503.png" alt="" class="wp-image-2620" srcset="https:/wp-content/uploads/2021/04/setparam-1024x503.png 1024w, https:/wp-content/uploads/2021/04/setparam-300x147.png 300w, https:/wp-content/uploads/2021/04/setparam-768x377.png 768w, https:/wp-content/uploads/2021/04/setparam-100x49.png 100w, https:/wp-content/uploads/2021/04/setparam-855x420.png 855w, https:/wp-content/uploads/2021/04/setparam-1234x606.png 1234w, https:/wp-content/uploads/2021/04/setparam.png 1248w" sizes="(max-width: 1024px) 100vw, 1024px" /> </figure> 

### 3) Running the script with the right parameters

Depending on the value of the “ClientIsOnInternet” variable, we run the script with different parameters.

If the client is determined to be intranet, use the intranet parameters:<figure class="wp-block-image size-large">

<img loading="lazy" width="1024" height="357" src="https://sysmansquad.com/wp-content/uploads/2021/04/invoke-intranet-1024x357.png" alt="" class="wp-image-2632" srcset="https:/wp-content/uploads/2021/04/invoke-intranet-1024x357.png 1024w, https:/wp-content/uploads/2021/04/invoke-intranet-300x105.png 300w, https:/wp-content/uploads/2021/04/invoke-intranet-768x268.png 768w, https:/wp-content/uploads/2021/04/invoke-intranet-100x35.png 100w, https:/wp-content/uploads/2021/04/invoke-intranet-855x298.png 855w, https:/wp-content/uploads/2021/04/invoke-intranet-1234x430.png 1234w, https:/wp-content/uploads/2021/04/invoke-intranet.png 1248w" sizes="(max-width: 1024px) 100vw, 1024px" /> </figure> 

If the client is on Internet, use the internet parameters:<figure class="wp-block-image size-large">

<img loading="lazy" width="1024" height="262" src="https://sysmansquad.com/wp-content/uploads/2021/04/invoke-internet-1024x262.png" alt="" class="wp-image-2633" srcset="https:/wp-content/uploads/2021/04/invoke-internet-1024x262.png 1024w, https:/wp-content/uploads/2021/04/invoke-internet-300x77.png 300w, https:/wp-content/uploads/2021/04/invoke-internet-768x196.png 768w, https:/wp-content/uploads/2021/04/invoke-internet-100x26.png 100w, https:/wp-content/uploads/2021/04/invoke-internet-855x219.png 855w, https:/wp-content/uploads/2021/04/invoke-internet-1234x315.png 1234w, https:/wp-content/uploads/2021/04/invoke-internet.png 1248w" sizes="(max-width: 1024px) 100vw, 1024px" /> </figure> 

## The end result

You can now use the Modern Driver Management and Modern BIOS Management solution for Internet clients just like you are doing with your intranet clients.

If you are on Current Branch 2010 or later, you can use a boot media to run bare metal deployment on the Internet and still use the Modern Driver/BIOS Management solution.<figure class="wp-block-image size-large">

<img loading="lazy" width="921" height="1024" src="https://sysmansquad.com/wp-content/uploads/2021/04/log-921x1024.png" alt="" class="wp-image-2635" srcset="https:/wp-content/uploads/2021/04/log-921x1024.png 921w, https:/wp-content/uploads/2021/04/log-270x300.png 270w, https:/wp-content/uploads/2021/04/log-768x854.png 768w, https:/wp-content/uploads/2021/04/log-100x111.png 100w, https:/wp-content/uploads/2021/04/log-855x950.png 855w, https:/wp-content/uploads/2021/04/log.png 1149w" sizes="(max-width: 921px) 100vw, 921px" /> </figure> 

## How do I set this up in my environment?

  1. Download the task sequences [here](https://github.com/CharlesNRU/mdm-adminservice/raw/master/MDM-TS.zip).
  2. Import the task sequences in your environment
  3. Configure the parameters correctly in the “Query AdminService for PackageID” task sequence:<figure class="wp-block-image size-large">

<img loading="lazy" width="1024" height="503" src="https://sysmansquad.com/wp-content/uploads/2021/04/setparam-1024x503.png" alt="" class="wp-image-2620" srcset="https:/wp-content/uploads/2021/04/setparam-1024x503.png 1024w, https:/wp-content/uploads/2021/04/setparam-300x147.png 300w, https:/wp-content/uploads/2021/04/setparam-768x377.png 768w, https:/wp-content/uploads/2021/04/setparam-100x49.png 100w, https:/wp-content/uploads/2021/04/setparam-855x420.png 855w, https:/wp-content/uploads/2021/04/setparam-1234x606.png 1234w, https:/wp-content/uploads/2021/04/setparam.png 1248w" sizes="(max-width: 1024px) 100vw, 1024px" /> </figure> 

<ol start="4">
  <li>
    Add the “Apply Driver Package” and/or “Apply BIOS Package” task sequences in your existing task sequences.
  </li>
</ol>

For example on what you can do with these task sequences, see my previous blog posts:

  * <https://sysmansquad.com/2020/05/15/modern-driver-management-with-the-administration-service/>
  * <https://sysmansquad.com/2020/06/18/modern-bios-management-with-the-administration-service/>

### What if I have multiple CMGs?

There is nothing stopping you from writing a small script to detect/check which CMG to use and then set the "AS_ExternalUrl" variable to whatever you want. 

Now you have support for multiple CMGs 🙂

## A note on the task sequence size

Currently, the scripts used in this solution are added directly in the task sequence instead of referencing a package containing the scripts. As you can see below, the task sequence size can be somewhat big:<figure class="wp-block-image size-large">

<img loading="lazy" width="1024" height="193" src="https://sysmansquad.com/wp-content/uploads/2021/04/tasksequencesize-1024x193.png" alt="" class="wp-image-2645" srcset="https:/wp-content/uploads/2021/04/tasksequencesize-1024x193.png 1024w, https:/wp-content/uploads/2021/04/tasksequencesize-300x57.png 300w, https:/wp-content/uploads/2021/04/tasksequencesize-768x145.png 768w, https:/wp-content/uploads/2021/04/tasksequencesize-100x19.png 100w, https:/wp-content/uploads/2021/04/tasksequencesize-855x162.png 855w, https:/wp-content/uploads/2021/04/tasksequencesize.png 1122w" sizes="(max-width: 1024px) 100vw, 1024px" /> </figure> 

If you are concerned about the total size of the task sequence, you could store the scripts in a package instead and this would greatly reduce the size of the task sequence.

Reference regarding task sequence size: <a href="https://docs.microsoft.com/en-us/mem/configmgr/osd/deploy-use/manage-task-sequences-to-automate-tasks#reduce-the-size-of-task-sequence-policy" target="_blank" rel="noreferrer noopener">https://docs.microsoft.com/en-us/mem/configmgr/osd/deploy-use/manage-task-sequences-to-automate-tasks#reduce-the-size-of-task-sequence-policy</a>

## Links

[Task Sequence Exports](https://github.com/CharlesNRU/mdm-adminservice/raw/master/MDM-TS.zip)

[MDM-AdminService GitHub repository](https://github.com/CharlesNRU/mdm-adminservice)
