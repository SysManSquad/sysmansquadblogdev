---
title: Inventory Deprovisioned Windows 10 Apps
author: cody
type: post
date: 2020-03-11T14:00:00+00:00
url: /2020/03/11/inventory-deprovisioned-windows-10-apps/
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
In my [previous post](https://sysmansquad.com/2020/01/06/reprovision-windows-10-apps-wait-what/) I've shown that we can revert the deprovisioning of Windows 10 apps. This is awesome news for anyone that has removed the Windows Store. I have been unable to find any other way of restoring the Windows Store once it has been deprovisioned, so this is an awesome time saver. Instead of reimaging devices that do not have the store we can simply 'reprovision' the store, and perform a feature update! But... who knows the existing impact of deprovisioned apps in their environment? Opinions have changed over time regarding what should be removed (if anything at all!)

## Identify sins of the past

Thankfully the power of MEMCM can save us from our mistakes! Custom hardware inventory enables us to gather any information desired into the database. The value of this cannot be overstated. MEMCM is a powerful tool that should be used with care. Because of this we should **take action based on DATA** whenever possible. 

Custom Hardware Inventory Overview

1. **Write a script to gather the data**  
    Script stores the data in WMI.
1. **Run script on a schedule**  
    Typically with a Configuration Item, but it can be done however you'd like.
1. **Add new WMI class to hardware inventory**  
    This is done on the 'Default Settings'
1. **Leverage new inventory for making collections, reports, and decisions**  
    **ACT BASED ON DATA!**

## Step 1 - Write a script to gather the data

'The data' is stored in the registry, so we need to extract it from there. From my previous post, we know the data is located at:

`"HKEY_LOCAL_MACHINE\SOFTWARE\Microsoft\Windows\CurrentVersion\Appx\AppxAllUserStore\Deprovisioned"`

But it is stored as a set of registry keys instead of properties on a registry key. Depending on the structure of data in the registry it may be possible to use [RegKeyToMof](https://gallery.technet.microsoft.com/RegKeyToMof-28e84c28) to generate a MOF file. With this being a set of indeterminate registry keys I've decided to use a script instead.

Scripts for custom hardware inventory typically follow this workflow. At least... mine do

* Ensure the WMI Namespace exists
* Clear / Remove the WMI Class if it exists
* (Re)create the WMI Class
* Collect the data
* Populate WMI
* Write out some random gibberish so that your CI can be 'Compliant'

```powershell
  #region define your Hardware Inventory Class Name, and the namespace in WMI to store it
  $HinvClassName = 'DeprovisionedAppX'
  $HinvNamespace = 'root\CustomHinv'
  #endregion define your Hardware Inventory Class Name, and the namespace in WMI to store it

  #region test if the namespace exists, and create it if it does not
  try {
      $null = [wmiclass]"$HinvNamespace`:__NameSpace"
  }
  catch {
      $HinvNamespaceSplit = $HinvNamespace -split '\\'
      $PathToTest = $HinvNamespaceSplit[0]
      for (${i} = 1; ${i} -lt $($HinvNamespaceSplit.Count); ${i}++) {
          $PathToTest = [string]::Join('\', @($PathToTest, $HinvNamespaceSplit[$i]))
          try {
              $null = [wmiclass]"$PathToTest`:__NameSpace"
          }
          catch {
              $PathToTestParent = Split-Path -Path $PathToTest -Parent
              $PathToTestName = Split-Path -Path $PathToTest -Leaf
              $NewNamespace = [wmiclass]"$PathToTestParent`:__NameSpace"
              $NamespaceCreation = $NewNamespace.CreateInstance()
              $NamespaceCreation.Name = $PathToTestName
              $null = $NamespaceCreation.Put()
          }
      }
  }
  #endregion test if the namespace exists, and create it if it does not

  #region clear our class from the namespace if it exists
  Remove-WmiObject -Class $HinvClassName -Namespace $HinvNamespace -ErrorAction SilentlyContinue
  #endregion clear our class from the namespace if it exists

  #region create the WMI class, and set the properties to be inventoried
  $HinvClass = [System.Management.ManagementClass]::new($HinvNamespace, [string]::Empty, $null)
  $HinvClass["__CLASS"] = $HinvClassName
  $HinvClass.Qualifiers.Add("Static", $true)
  $HinvClass.Properties.Add("DeprovisionedApp", [System.Management.CimType]::String, $false)
  $HinvClass.Properties["DeprovisionedApp"].Qualifiers.Add("Key", $true)
  $null = $HinvClass.Put()
  #endregion create the WMI class, and set the properties to be inventoried

  $DeprovisionRoot = "registry::HKEY_LOCAL_MACHINE\SOFTWARE\Microsoft\Windows\CurrentVersion\Appx\AppxAllUserStore\Deprovisioned"
  $AllDeprovisionedApps = Get-ChildItem -Path $DeprovisionRoot | Select-Object -ExpandProperty PSChildName
  if ($null -ne $AllDeprovisionedApps) {
      foreach ($App in $AllDeprovisionedApps) {
          $null = Set-WmiInstance -Namespace $HinvNamespace -Class $HinvClassName -ErrorAction SilentlyContinue -Arguments @{
              DeprovisionedApp = $App
          }
      }
  }

  Write-Output 'Inventory Complete'
```

[https://github.com/CodyMathis123/CM-Ramblings/blob/master/Reprovision%20Windows%2010%20Apps/Inventory-DeprovisionedAppX.ps1](https://github.com/CodyMathis123/CM-Ramblings/blob/master/Reprovision%20Windows%2010%20Apps/Inventory-DeprovisionedAppX.ps1)
  </p>
  
  <cite>Inventory-DeprovisionedAppX</cite>
</blockquote>

#### Step 2 - Run script on a schedule

There are countless sources to show you how to create a CI in MEMCM (Don't search for MEMCM, you won't get any results. Use SCCM, or ConfigMgr). While a step by step on all those sweet sweet next buttons sounds invigorating, I'm going to provide some screenshots instead.
[![screenshot](CustomHINV-Depro2.png)](CustomHINV-Depro2.png)
[![screenshot](CustomHINV-Depro1.png)](CustomHINV-Depro1.png)
[![screenshot](CustomHINV-Depro3.png)](CustomHINV-Depro3.png)
[![screenshot](CustomHINV-Depro4.png)](CustomHINV-Depro4.png)
[![screenshot](CustomHINV-Depro5.png)](CustomHINV-Depro5.png)

Some 'good to knows' for doing custom hardware inventory in this fashion are below.

  1. Make sure it returns compliant... Having 'non-compliant' in your reporting data, or your control panel applet because of a poorly written script is silly!
  2. Do NOT include a 'timestamp' as part of your custom inventory unless you absolutely have to. (See [this post](https://sccmf12twice.com/2019/08/hinvchangelog-the-600gb-db-backlog/) for an explanation)
  3. Put some thought to the schedule. Some types of inventory may require a more frequent gather. Compare your need for data with your hardware inventory cycle, as well as the expected rate of change of the data.

#### Step 3 - Add new WMI class to hardware inventory

The script is written, deployed, and has run on a client. Now it is time to actually get this data into MEMCM! 

I start at a client that I know has run my script. If everything is working as expected, and I have deprovisioned apps, I should be able to perform a query to return my custom data stored in WMI.<figure class="wp-block-image size-full is-resized">

![](CustomHINV-GetDeproHINV-1.png)  

Awesome! That is easily half the battle. Now, to complete the cycle we need to get the data into the database. If you are feeling frisky you can start editing MOF files. Otherwise, you can connect to a computer from the MEMCM console and select the new WMI class. I recommend option #2.

Pop open the 'Default Settings' policy, and navigate to the 'Hardware Inventory' section. Now click that thingy I have highlighted below (**Set Classes**...).<figure class="wp-block-image size-large">

![](CustomHINV-Depro-SetClasses.png)  

And from there: 

  1. Click **Add**
  2. Click **Connect...**
  3. Type in the Computer name of the device that has the new WMI class
  4. Specify your WMI namespace if it is NOT the default root\cimv2
  5. Specify credentials if required
  6. Click **Connect**

![screenshot](CustomHINV-Depro-AddHinvClass.png)

If you didn't forget your password, a wonderful list of WMI classes under the specified namespace should appear. Check the box, click edit if you feel like poking around, and click ok!

![screenshot](CustomHINV-Depro-AddHinvClass2.png)

#### Step 4 - ACT BA**SED ON DATA!** 

This bit will have to wait for another post! There is some fun stuff we can do with the data we are now collecting. The next post should spark some ideas for people, I hope. But, let's still take a look at the data we have now. 

In it's simplest form, we can query the MEMCM database as below.

```sql
SELECT * FROM v_GS_DEPROVISIONEDAPPX
```

<figure class="wp-block-image size-large">

![](CustomHINV-BasicDB.png)  

If we desire a little more insight, the query can be adjusted to show counts.

```sql
SELECT 
  depro.DeprovisionedApp0,
  COUNT(depro.DeprovisionedApp0) [Count]
FROM v_GS_DEPROVISIONEDAPPX depro
GROUP BY depro.DeprovisionedApp0
ORDER BY 2 DESC
```

<figure class="wp-block-image size-large">

![screenshot](CustomHINV-CountDB.png)  

Join us next time, when decisions, and actions are made with our new found data!

[@CodyMathis123](https://twitter.com/CodyMathis123)
