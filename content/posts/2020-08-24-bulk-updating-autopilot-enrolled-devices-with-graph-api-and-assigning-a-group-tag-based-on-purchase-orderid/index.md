---
title: Bulk Updating Autopilot enrolled devices with Graph API and assigning a Group Tag based on Purchase OrderID
author: Jake Shackelford
type: post
date: 2020-08-24T14:31:46+00:00
url: 2020-08/24/bulk-updating-autopilot-enrolled-devices-with-graph-api-and-assigning-a-group-tag-based-on-purchase-orderid/
featured_image: msedge_qxJ7I3fI72.png
categories:
  - Endpoint Management
  - Graph
  - Intune
  - Powershell
  - Scripting

---
### The Problem

For any new machines ordered from a vendor such as Dell that get enrolled into Autopilot you get the basic device info enrolled but nothing defining that would let it get auto-enrolled into a dynamic group easily. Purchase Order ID is included in every order we receive from Dell however I don't want to have to add that Purchase Order ID into the dynamic device query every time a new machine gets added. 

Instead assigning a Group Tag would be much more beneficial. I won't have to change the dynamic device query and won't run the risk of messing the group up. 

Watch a demo of this script on Intune.Training.  
[https://youtu.be/VCR-J5pvQbo](https://youtu.be/VCR-J5pvQbo)

### Requirements

  1. Access to Create Groups in (AAD) Azure Active Directory
  2. Access to create an Application in AAD
  3. Access to grant admin consent for your organization
  4. Access to Intune

### Creating a Dynamic Device Group

  1. Navigate to your [Intune portal](https://devicemanagement.microsoft.com/)
  2. Select **Groups**
  3. Select **New Group**
  4. Group Type should be Security
  5. Assign a group name "Intune Windows Device Enrollment"
  6. Membership type should be changed to **Dynamic Device**
  7. Select **Add dynamic query**
  8. On Rule Syntax Select  **Edit** on the right hand side
  9. Type in the following:  
    `(device.devicePhysicalIds -any _ -contains "StandardMachine")`
 10. Feel free to change `"StandardMachine"` to whatever you'd like your group tag to be
 11. Select **Save**
 12. Select **Create**

### Registering an APP to access Graph API and Grabbing Additional Information

  1. Navigate to your [Azure Active Directory](https://portal.azure.com/#blade/Microsoft_AAD_IAM/ActiveDirectoryMenuBlade/RegisteredApps)
  2. Select **App registrations** 
  3. Select **New registration**
  4. Give your app a name such as Intune Graph Access
  5. Select **Register**
  6. Go to your newly created App
  7. Select **API permissions**
  8. Select **Add a permission**
  9. Select **Microsoft Graph**
 10. Select **Application permissions**
 11. Enable **DeviceManagementServiceConfig.ReadWrite.All**
 12. Select **Add permissions**
 13. Select **Grant Admin Consent for CONTOSO**

  1. Navigate to **Certificates & Secrets** for your app
  2. Select **New client secret**
  3. Give a description and select an expiration time
  4. Select **Add**
  5. Copy the key value for later use

  1. Select **Overview**
  2. Copy the Application (client) ID for later use

  1. Select **Custom domain names**
  2. Copy your domain that has the .onmicrosoft.com for later use

### The Script

You will need to update 4 fields in the below script with information you copied earlier. Those fields being line 2,3,4, and 6 if you changed the group tag for your dynamic device query. The script will use the App we created earlier to authenticate and grab information for all devices and create an array of devices based on Purchase Order ID. that you manually enter via prompt. It then loops through that array and assigns the Group Tag to all devices . Once all group tags have been assigned it will push a refresh to your portal, bare in mind that you may have to wait an hour or so for the new group tags to show up. This is incredibly helpful for large bulk orders.

<div class="wp-block-codemirror-blocks-code-block code-block">
  <pre class="CodeMirror" data-setting="{&quot;mode&quot;:&quot;powershell&quot;,&quot;mime&quot;:&quot;application/x-powershell&quot;,&quot;theme&quot;:&quot;default&quot;,&quot;lineNumbers&quot;:true,&quot;styleActiveLine&quot;:true,&quot;lineWrapping&quot;:true,&quot;readOnly&quot;:false,&quot;fileName&quot;:&quot;GroupTag.ps1&quot;,&quot;language&quot;:&quot;PowerShell&quot;,&quot;modeName&quot;:&quot;powershell&quot;}"># Application (client) ID, tenant Name and secret
$clientid = ""
$clientSecret = "-"
$TenantName = ""
$resource = "https://graph.microsoft.com/"
$grouptag = "StandardMachine"
$purchaseOrderId = Read-Host -Prompt 'Input an order ID'

$ReqTokenBody = @{
    Grant_Type    = "client_credentials"
    Scope         = "https://graph.microsoft.com/.default"
    client_Id     = $clientID
    Client_Secret = $clientSecret
} 

$TokenResponse = Invoke-RestMethod -Uri "https://login.microsoftonline.com/$TenantName/oauth2/v2.0/token" -Method POST -Body $ReqTokenBody
$apiUrl = 'https://graph.microsoft.com/beta/deviceManagement/windowsAutopilotDeviceIdentities/'
$Data = Invoke-RestMethod -Headers @{Authorization = "Bearer $($TokenResponse.access_token)"} -Uri $apiUrl -Method Get
$Devices = ($Data | select-object Value).Value

$devices = ($data.value | where purchaseOrderIdentifier -eq $purchaseOrderId).id

$body = '{"groupTag":"'+$groupTag+'"}'

foreach ($device in $Devices) {
    $apiUrl = "https://graph.microsoft.com/beta/deviceManagement/windowsAutopilotDeviceIdentities/$device/UpdateDeviceProperties"
    $rest = Invoke-RestMethod -Headers @{Authorization = "Bearer $($TokenResponse.access_token)"} -Uri $apiUrl -Body $body -Method Post -ContentType 'application/json'
    Write-Host ($device + ' has been added to the ' + $grouptag)
}

#Special thanks to @JGKPS, @portaldotjay, @AdamGross

$apiUrl2 = "https://graph.microsoft.com/beta/deviceManagement/windowsAutopilotSettings/sync"
Invoke-RestMethod -Headers @{Authorization = "Bearer $($TokenResponse.access_token)"} -Uri $apiUrl2 -Method Post</pre>
</div>
