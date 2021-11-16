---
title: Teams Channel Notification when OSD Fails
author: Grant
type: post
date: 2020-04-22T13:00:00+00:00
url: /2020/04/22/teams-channel-notification-when-osd-fails/
categories:
  - Endpoint Management
  - How-To
  - MECM/MEMCM/SCCM
  - Office
  - Powershell
  - Scripting
tags:
  - ConfigMgr
  - MECM
  - OSD
  - PowerShell
  - SCCM

---
How would you like this lovely notification appearing within MS Teams every time a build failed? Better than getting a helpdesk ticket or not finding out at all.

Well, now you can! <figure class="wp-block-image">

![Oh how sexy!](https://lh3.googleusercontent.com/BoKEAscaxddhdwbdL99Ks2fPQLO1TojP-vK3LtEddTJWWCHkG7rOapin1BhIkxOtFOT3B_eDY-vU6rFjo6bEBnMEpzzS2H7PbRnb4d9l7vIcbq1QQiUyHleq3K1KlYERHzcWyBk) </figure> 

## Step 1 - Configure Teams {#step-1}

<p class="has-luminous-vivid-amber-background-color has-background">
  *You need to make sure your O365 Administrator has enabled Incoming webhooks connectors in your O365 Tenant.*
</p>

  * Open Teams.
  * Select a channel, or create a new channel specific for these notifications (This is best practice so normal channels are not spammed)
  * Click the **...** Next to the channel name and choose Connectors<figure class="wp-block-image">

![](https://lh3.googleusercontent.com/IDmdOWv7kS2rHVKHZWxkRq_k4Jk6EYKwwJZzu9M9OWDkcM9uIWFsskyUlDP6XGKK_5OES_bpHyWOd3AJVdicjZnKGe97-2PhCVWkCpusBJjaFn5Ej_rg2Gt3i4AM4JkYCoc4eE4) </figure> 

  * Click Add / Configure <figure class="wp-block-image">

![](https://lh6.googleusercontent.com/PQNNHfPzcDuCgYGJVAFlhynNeAIzMS11W75ak6v6udvTDjUGfjDjZCFuUGiDJOsh1FD3xgQXx5vKpwx9uQ-Q5ra-rN65nKcfMVVpCPSNoWhPJZXz_uY6IPZeYG2kuXezvfpEieA) </figure> 

  * Give your Connector an appropriate name and custom image. <figure class="wp-block-image">

![](https://lh6.googleusercontent.com/JNlowFdme9yLmJs6kIMjYZaLw1hJ4Y_W5GYiQC55gc-0k8R6hPjaCv8Ia7Si73rU3bnoxRFE_OtwJgnTiZy0sXcQGWNQzyH-MlGYksJsj0SGaAOUHjxL6aV1rHDglSOtwaSti2w) </figure> 

  * It will then generate a unique API code for you to use later. Copy this URI and keep it safe! <figure class="wp-block-image">

![](https://lh3.googleusercontent.com/fHuRMMRmCLr-gwHGqwT3UCVd76Y_UtjuZ6yhlsaRQCE83X9WFYqYwSk30AN8694sDkDvkuBRLX1OTnbqdX3YMFRfMq51CIgIFx2VrfOLOwy7XSoetUG-qlChyZXtQGAPysivMcw) </figure> 

## Step 2 - PowerShell Script {#step-2}

I have modified the PowerShell script created by Terence Beggs from <https://www.scconfigmgr.com/2017/10/06/configmgr-osd-notification-service-teams/>


```powershell
#
    .NOTES
    ==================================================================
    Originally Created by:     Terence Beggs (https://www.scconfigmgr.com)
    Modified by:    Grant Dickins
    ==================================================================
    .DESCRIPTION
    This script uses Microsoft Teams to notify when a OSD task sequence has failed.
    .REFERENCE
    https://docs.microsoft.com/en-us/outlook/actionable-messages/message-card-reference
    https://www.scconfigmgr.com/2017/10/06/configmgr-osd-notification-service-teams/
    https://messagecardplayground.azurewebsites.net/
    ==================================================================
    .TODO
    - Add Error codes to MessageCard
#>
$uri = 'INSERT URI HERE'

# Open TSEnv for use.
$TSenv = New-Object -COMObject Microsoft.SMS.TSEnvironment -ErrorAction SilentlyContinue

# Date and Time
$DateTime = Get-Date -Format "dddd dd/MM/yyyy HH:mm"
    
# Computer Make
$Make = (Get-WmiObject -Class Win32_BIOS).Manufacturer
    
# Computer Model
$Model = (Get-WmiObject -Class Win32_ComputerSystem).Model
    
# Computer Name
#DEBUG# $Name = (Get-WmiObject -Class Win32_ComputerSystem).Name
if ($TSenv.Value("_SMSTSPackageName") -ne "") { $Name = $TSenv.value("OSDComputerName") } else { $Name = (Get-WmiObject -Class Win32_ComputerSystem).Name }

# Computer Serial Number
[string]$SerialNumber = (Get-WmiObject win32_bios).SerialNumber
    
# IP Address of the Computer
$IPAddress = (Get-WmiObject win32_Networkadapterconfiguration | Where-Object { $_.ipaddress -notlike $null }).IPaddress | Select-Object -First 1
    
#$TS Name
#DEBUG# $TSName = "TSName"
if ($TSenv.Value("_SMSTSPackageName") -ne "") { $TSName = $TSenv.value("_SMSTSPackageName") } else { $TSName = "Unknown Task Sequence" }

#Error Code
$TSLastError = ($TSenv.Value("ErrorReturnCode"))
If([string]::IsNullOrEmpty($TSLastError)){$TSLastError = "Unknown Error. Check Logs."}
    
# JSON for the Teams MessageCard (LEGACY)
$body = @"
    {
        "@type": "MessageCard",
        "@context": "https://schema.org/extensions",
        "summary": "OSD Failure Card",
        "themeColor": "0078D7",
        "title": "$Name Failed to build",
        "text": "",
        "sections": [
            {
                "activityTitle": "Task Sequence",
                "activitySubtitle": "$TSName",
                "activityImage": "https://media.giphy.com/media/27EhcDHnlkw1O/giphy.gif"
            },
            {
                "title": "## Deployment Details",
                "facts": [
                    {
                        "name": "Name:",
                        "value": "$Name"
                    },
                    {
                        "name": "Date Time:",
                        "value": "$DateTime"
                    },
                    {
                        "name": "IP Number:",
                        "value": "$IPAddress"
                    },
                    {
                        "name": "Make:",
                        "value": "$Make"
                    },
                    {
                        "name": "Model:",
                        "value": "$Model"
                    },
                    {
                        "name": "Serial:",
                        "value": "$SerialNumber"
                    },
                    {
                        "name": "Last Error",
                        "value": "$TSLastError"
                    }
                ]
            },
            {
                "title": "## Log Location",
                "text": "\\\\\\SERVER\\Logs\\OSD\\"
            }
        ]
    }
"@

Invoke-RestMethod -uri $uri -Method Post -body $body -ContentType 'application/json'

```


### Customising the MessageCard

If you want to change the JSON, there is a reference guide here: <https://docs.microsoft.com/en-us/outlook/actionable-messages/message-card-reference>

And a Playground site: <https://messagecardplayground.azurewebsites.net/>

This modification of the PowerShell script means you can just copy/paste the JSON as long as it's wrapped inside $body = @" ... "@

**NB: Incoming Webconnectors only support the Legacy MessageCard format at this time.**

## Step 3 - Create Package for Script {#step-3}

  * Copy the PowerShell script to your Config Manager package source share.
  * In Config Manager Console, create a new Package.
  * Give it a **Name**, **Description**, and specify the **source share**<figure class="wp-block-image">

![](https://lh5.googleusercontent.com/ogV4YKLMOxUoa9EcZ3ZZcvs7FBWrFC6FTkct_kvD7slFw2nJjZUqMk9U7w3dFPRGk1j3vK6Q9MC5M_hLVJxgWV38bdLzhaR1N59gZ3rty8szV9nWxo84y3uRLXwk4ONaLtiYOhk) </figure>

  * Select **Do not create a program**<figure class="wp-block-image">

![](https://lh3.googleusercontent.com/fnKUiM0o1crWIn8rhzNcpvVJHEeLzJT-M6EelVNqcTDdwkvwYNTwHl_igoC2hoHQPRKLj9XK0JfKjTk7jQiyD-IT4z6qtcruWZujQ_pBYFwZE3S3oeleF24RFG9qOV2mVpLXmis) </figure>

  * Complete the wizard.
  * Distribute the Package contents.

## Step 4 - Task Sequence {#step-4}

Edit the task sequence for OSD.

Our TS is set up with logic and a section to run if the task sequence encounters an error. This is where we will put the OSD Failure notification script.

_For more information on how to set up Error Handling in OSD Task Sequence, see [Jörgen Nilsson's](https://ccmexec.com/author/jonil/) post about it here: [https://ccmexec.com/2016/12/error-handling-in-ts-without-mdt-using-osdbackground/](https://ccmexec.com/2016/12/error-handling-in-ts-without-mdt-using-osdbackground/)_<figure class="wp-block-image">

![](https://lh5.googleusercontent.com/GRx_3DUP7m-LKvPLhxOqfdS0hI94Nii31qrJyXmyH9pXxGHmPs_VNZzm8Yr42YOA_6e5TUhhJHLQ3xLT7t4psCGvJsE7qLSRZRBRweEpNZ0QHuCh8t1OIcx80lDYpH8NR82AM4E) </figure> 

  * After the Gather step, we want to add a Run PowerShell Script task.
  * Select the package with our Script.
  * Change the PowerShell execution policy to Bypass<figure class="wp-block-image">

![](https://lh4.googleusercontent.com/j3haF1BmaCbjBJWnwwRFZ0mjRn_yfDGlUsgb1R2MBiRMDj8Bbc4meoRpeh0ekaruaa_yqiZdD-MZF_ZDFjKaPoXu9Ny5VWJTS6B9q8s4tWXuRPz1lEi84YbKyCK60Lip_ZLOxMA) </figure> 

  * Click OK and that's it set up!

If you want to try emulating a failure, create a **Run Command Line** task somewhere in your Task Sequence that runs the following:

<pre class="wp-block-preformatted">cmd /c exit 8008135  </pre><figure class="wp-block-image">

![](https://lh5.googleusercontent.com/48_DvgDPw7zontS5B_1_x7XLGKptLobBqnS3wf9nGkywHwxKzYYoME70O7J6KFSTOqh8T5bkf4xR3_tZ89z1Sl2enGMYJoB8o-_uSvIi0znFDRDtcW9aPk_ro7kYnDC1k3JIMTU) </figure> 

So now, if your task sequence runs into an error, you will now get a lovely message straight into your Teams channel: <figure class="wp-block-image">

![](https://lh3.googleusercontent.com/BoKEAscaxddhdwbdL99Ks2fPQLO1TojP-vK3LtEddTJWWCHkG7rOapin1BhIkxOtFOT3B_eDY-vU6rFjo6bEBnMEpzzS2H7PbRnb4d9l7vIcbq1QQiUyHleq3K1KlYERHzcWyBk) </figure>

