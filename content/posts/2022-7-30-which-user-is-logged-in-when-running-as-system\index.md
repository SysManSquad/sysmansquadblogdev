---
title: who is logged on, from the system context
author: johannes
type: post
date: 2022-7-08T13:59:21+00:00
url: /2021/10/08/removing-the-built-in-teams-app-in-windows-11-with-intune/
featured_image: vmconnect_HKVrTs61hf.png
images: [/2021/10/08/removing-the-built-in-teams-app-in-windows-11-with-intune/vmconnect_HKVrTs61hf.png]
categories:
  - Powershell
  - Intune
tags:
  - Intune
  - Powershell

---
# Intro

Have you ever deployed a script that needs to be executed in the system context, but you also need to work with something that is currently running in the user context?

obviously you could just loop through all the user profiles on the system, but thats not always a good idea.

# Solution

```powershell
# grab the owner of explorer
$process = Get-CimInstance Win32_Process -Filter "name = 'explorer.exe'"
# you might have multiple instances of explorer running, so we pick the first one
$username = Invoke-CimMethod -InputObject $proc[0] -MethodName GetOwner | select-object -ExpandProperty user

# examples

# check for a file in the users appdata
Test-Path -Path  "C:\Users\$username\AppData\Roaming\horse\greenbattery.jgp"

# or maybe the app you installed needs a license file in the users appdata
Copy-Item .\licensefile.lic -Destination "C:\Users\$username\appdata\local\MathApp\licensefile.lic

```
