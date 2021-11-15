---
title: Setting ACL using Intune Endpoint Analytics Proactive Remediations
author: Jóhannes Geir Kristjánsson
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
Namaste y'all! In todays Siri dictated blog post, I will show you how you can configure access control lists (ACL) for a directory using <a aria-label="undefined (opens in a new tab)" href="https://docs.microsoft.com/en-us/mem/analytics/proactive-remediations" target="_blank" rel="noreferrer noopener">Intune Proactive remediations</a>.

The issue I was facing was that regular users do not have modify permissions to the public desktop on their corporate devices, meaning that the user is unable to remove annoying shortcuts that would get placed there by the various apps they install. While this is hardly a high priority task to solve. I believe that the user experience should be taken into account and amended if possible.

Using Group Policies, this is a trivial task, but Intune has no proper built in substitute. So we have to improvise and that's where Proactive remediations comes into play..

## Discovery

Relatively straight forward, the script checks if the relevant filesystem rights have been assigned, if not, it will error out and report non-compliance

<div class="wp-block-codemirror-blocks-code-block code-block">
  <pre class="CodeMirror" data-setting="{&quot;mode&quot;:&quot;powershell&quot;,&quot;mime&quot;:&quot;application/x-powershell&quot;,&quot;theme&quot;:&quot;default&quot;,&quot;lineNumbers&quot;:true,&quot;styleActiveLine&quot;:true,&quot;lineWrapping&quot;:true,&quot;readOnly&quot;:false,&quot;fileName&quot;:&quot;Discovery.ps1&quot;,&quot;language&quot;:&quot;PowerShell&quot;,&quot;modeName&quot;:&quot;powershell&quot;}"># Discovery
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
}</pre>
</div>

## Remediation

Should the discovery report non-compliance, the following will execute.

<div class="wp-block-codemirror-blocks-code-block code-block">
  <pre class="CodeMirror" data-setting="{&quot;mode&quot;:&quot;powershell&quot;,&quot;mime&quot;:&quot;application/x-powershell&quot;,&quot;theme&quot;:&quot;default&quot;,&quot;lineNumbers&quot;:true,&quot;styleActiveLine&quot;:true,&quot;lineWrapping&quot;:true,&quot;readOnly&quot;:false,&quot;fileName&quot;:&quot;Remediation.ps1&quot;,&quot;language&quot;:&quot;PowerShell&quot;,&quot;modeName&quot;:&quot;powershell&quot;}"># Remediation

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
}</pre>
</div>

## Deployment

Set this to run in the system context and deploy to the relevant group using these steps <https://docs.microsoft.com/en-us/mem/analytics/proactive-remediations#deploy-the-script-packages>. Given the nature of this code, you can safely set the daily interval to a fairly high value.

## Closing words

Obviously, this example are pretty simplistic, but it can give you an idea how Proactive remediations can be utilized to fill in the gaps if you are using Intune to manage your windows devices.

### Questions/Issues?

If you run into any issues or have questions about anything Intune related head over to the&nbsp;<a rel="noreferrer noopener" href="https://aka.ms/winadmins" target="_blank">WinAdmins discord community</a>&nbsp;and go to the&nbsp;`#Intune`&nbsp;channel.