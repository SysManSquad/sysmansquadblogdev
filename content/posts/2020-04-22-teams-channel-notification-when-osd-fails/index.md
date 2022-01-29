---
title: Teams Channel Notification when OSD Fails
author: grant
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

Well, now you can! 

> _Removed broken screenshot - editor_

## Step 1 - Configure Teams {#step-1}

*You need to make sure your O365 Administrator has enabled Incoming webhooks connectors in your O365 Tenant.*

* Open Teams.
* Select a channel, or create a new channel specific for these notifications (This is best practice so normal channels are not spammed)
* Click the **...** Next to the channel name and choose Connectors

> _Removed broken screenshot - editor_

* Click Add / Configure 

> _Removed broken screenshot - editor_

* Give your Connector an appropriate name and custom image. 

> _Removed broken screenshot - editor_

* It will then generate a unique API code for you to use later. Copy this URI and keep it safe! 

> _Removed broken screenshot - editor_

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
    https://docs.microsoft.com/outlook/actionable-messages/message-card-reference
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

### Customizing the MessageCard

If you want to change the JSON, there is a reference guide here: <https://docs.microsoft.com/en-us/outlook/actionable-messages/message-card-reference>

And a Playground site: <https://messagecardplayground.azurewebsites.net/>

This modification of the PowerShell script means you can just copy/paste the JSON as long as it's wrapped inside $body = @" ... "@

**NB: Incoming Webconnectors only support the Legacy MessageCard format at this time.**

## Step 3 - Create Package for Script {#step-3}

* Copy the PowerShell script to your Config Manager package source share.
* In Config Manager Console, create a new Package.
* Give it a **Name**, **Description**, and specify the **source share**

> _Removed broken screenshot - editor_

* Select **Do not create a program**

> _Removed broken screenshot - editor_

* Complete the wizard.
* Distribute the Package contents.

## Step 4 - Task Sequence {#step-4}

Edit the task sequence for OSD.

Our TS is set up with logic and a section to run if the task sequence encounters an error. This is where we will put the OSD Failure notification script.

_For more information on how to set up Error Handling in OSD Task Sequence, see [Jörgen Nilsson's](https://ccmexec.com/author/jonil/) post about it here: [https://ccmexec.com/2016/12/error-handling-in-ts-without-mdt-using-osdbackground/](https://ccmexec.com/2016/12/error-handling-in-ts-without-mdt-using-osdbackground/)_

> _Removed broken screenshot - editor_

* After the Gather step, we want to add a Run PowerShell Script task.
* Select the package with our Script.
* Change the PowerShell execution policy to Bypass

> _Removed broken screenshot - editor_

* Click OK and that's it set up!

If you want to try emulating a failure, create a **Run Command Line** task somewhere in your Task Sequence that runs the following:

cmd /c exit 8008135  

> _Removed broken screenshot - editor_

So now, if your task sequence runs into an error, you will now get a lovely message straight into your Teams channel: 

> _Removed broken screenshot - editor_
