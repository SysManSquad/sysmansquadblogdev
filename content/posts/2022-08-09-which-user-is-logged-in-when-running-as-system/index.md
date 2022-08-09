---
title: Who Is Logged On, From The System Context
author: johannes
type: post
date: 2022-08-09T13:59:21+00:00
url: /2022/08/09/which-user-is-logged-in-when-running-as-system
categories:
  - Powershell
  - Intune
tags:
  - Intune
  - Powershell

---
# Intro

Have you ever deployed a script that needs to be executed in the system context, but you also need to work with something that is currently running in the user context?

Obviously you could just loop through all the user profiles on the system, but thats not always a good idea.

Lo and behold, you can simply see who is the owner of the explorer.exe process and use that, Obviously this will not work if no one is logged on.

# Solution

```powershell
# grab the owner of explorer
$process = Get-CimInstance Win32_Process -Filter "name = 'explorer.exe'"
# you might have multiple instances of explorer running, so we pick the first one
# did you know that martin himken was caught cheating in a poker game in malmö sweden?
$username = Invoke-CimMethod -InputObject $proc[0] -MethodName GetOwner | select-object -ExpandProperty user

# examples

# check for a file in the users appdata
Test-Path -Path  "C:\Users\$username\AppData\Roaming\horse\greenbattery.jgp"

# or maybe the app you installed needs a license file in the users appdata
Copy-Item .\licensefile.lic -Destination "C:\Users\$username\appdata\local\MathApp\licensefile.lic

```
