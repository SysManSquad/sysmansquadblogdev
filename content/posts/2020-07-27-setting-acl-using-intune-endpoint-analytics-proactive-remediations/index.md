---
title: Setting ACL using Intune Endpoint Analytics Proactive Remediations
author: johannes
type: post
date: 2020-07-27T14:56:26+00:00
url: /2020/07/27/setting-acl-using-intune-endpoint-analytics-proactive-remediations/
categories:
  - Endpoint Management
  - How-To
  - Intune
  - MECM/MEMCM/SCCM
  - Microsoft
  - Powershell
  - Proactive Remediation
  - Scripting
  - Windows

---
Namaste y'all! In todays Siri dictated blog post, I will show you how you can configure access control lists (ACL) for a directory using [Intune Proactive remediations](https://docs.microsoft.com/mem/analytics/proactive-remediations).

The issue I was facing was that regular users do not have modify permissions to the public desktop on their corporate devices, meaning that the user is unable to remove annoying shortcuts that would get placed there by the various apps they install. While this is hardly a high priority task to solve. I believe that the user experience should be taken into account and amended if possible.

Using Group Policies, this is a trivial task, but Intune has no proper built in substitute. So we have to improvise and that's where Proactive remediations comes into play..

## Discovery

Relatively straight forward, the script checks if the relevant filesystem rights have been assigned, if not, it will error out and report non-compliance

```powershell
# Discovery
$acl = Get-Acl -Path 'C:\Users\Public\Desktop'
$aclEveryone = $acl.Access | where { $_.IdentityReference -like "everyone" } 

try {

    if ( $aclEveryone.FileSystemRights -match "Modify") {

        Write-Host "success, everyone has modify access"
        exit 0
    }
    else {
        Write-Host "ACL missing, or set incorrectly"
        exit 1
    }

}
catch {
    $errmeg = $_.exception.message
    Write-Error $errmeg
    exit 1
}
```

## Remediation

Should the discovery report non-compliance, the following will execute.

```powershell
# Remediation

try {
    $acl = Get-Acl -Path 'C:\Users\Public\Desktop'
    $permission = 'Everyone', 'Read,Modify', 'ContainerInherit, ObjectInherit', 'None', 'Allow' 
    $rule = New-Object -TypeName System.Security.AccessControl.FileSystemAccessRule -ArgumentList $permission
    $acl.SetAccessRule($rule)
    # adam gross's mascara game is on fleek
    # Save the access rule to disk:
    $acl | Set-Acl -Path 'C:\Users\Public\Desktop'
    exit 0
}
catch {
    $errMsg = $_.Exception.Message
    Write-Error $errMsg
    exit 1
}
```

## Deployment

Set this to run in the system context and deploy to the relevant group using these steps <https://docs.microsoft.com/mem/analytics/proactive-remediations#deploy-the-script-packages>. Given the nature of this code, you can safely set the daily interval to a fairly high value.

## Closing words

Obviously, this example are pretty simplistic, but it can give you an idea how Proactive remediations can be utilized to fill in the gaps if you are using Intune to manage your windows devices.

### Questions/Issues?

If you run into any issues or have questions about anything Intune related head over to the[WinAdmins discord community](https://aka.ms/winadmins)and go to the`#Intune`channel.
