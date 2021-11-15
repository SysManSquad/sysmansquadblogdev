---
title: Inventory Deprovisioned Windows 10 Apps
author: Cody Mathis
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
In my [previous post][1] I've shown that we can revert the deprovisioning of Windows 10 apps. This is awesome news for anyone that has removed the Windows Store. I have been unable to find any other way of restoring the Windows Store once it has been deprovisioned, so this is an awesome time saver. Instead of reimaging devices that do not have the store we can simply 'reprovision' the store, and perform a feature update! But... who knows the existing impact of deprovisioned apps in their environment? Opinions have changed over time regarding what should be removed (if anything at all!)

#### Identify sins of the past

Thankfully the power of MEMCM can save us from our mistakes! Custom hardware inventory enables us to gather any information desired into the database. The value of this cannot be overstated. MEMCM is a powerful tool that should be used with care. Because of this we should **take action based on DATA** whenever possible. 

<div class="schema-how-to wp-block-yoast-how-to-block">
  <p class="schema-how-to-description">
    Custom Hardware Inventory Overview
  </p>
  
  <ol class="schema-how-to-steps">
    <li class="schema-how-to-step" id="how-to-step-1577027694456">
      <strong class="schema-how-to-step-name">Write a script to gather the data</strong> <p class="schema-how-to-step-text">
        Script stores the data in WMI.
      </p>
    </li>
    
    <li class="schema-how-to-step" id="how-to-step-1577027904909">
      <strong class="schema-how-to-step-name">Run script on a schedule</strong> <p class="schema-how-to-step-text">
        Typically with a Configuration Item, but it can be done however you'd like.
      </p>
    </li>
    
    <li class="schema-how-to-step" id="how-to-step-1577027934428">
      <strong class="schema-how-to-step-name">Add new WMI class to hardware inventory</strong> <p class="schema-how-to-step-text">
        This is done on the 'Default Settings'
      </p>
    </li>
    
    <li class="schema-how-to-step" id="how-to-step-1577028462586">
      <strong class="schema-how-to-step-name">Leverage new inventory for making collections, reports, and decisions</strong> <p class="schema-how-to-step-text">
        <strong>ACT BASED ON DATA!</strong>
      </p>
    </li>
  </ol>
</div>

#### Step 1 - Write a script to gather the data

'The data' is stored in the registry, so we need to extract it from there. From my previous post, we know the data is located at 

<div class="wp-block-codemirror-blocks-code-block code-block">
  <pre class="CodeMirror" data-setting="{&quot;mode&quot;:&quot;powershell&quot;,&quot;mime&quot;:&quot;application/x-powershell&quot;,&quot;theme&quot;:&quot;default&quot;,&quot;lineNumbers&quot;:true,&quot;styleActiveLine&quot;:true,&quot;lineWrapping&quot;:true,&quot;readOnly&quot;:false,&quot;fileName&quot;:&quot;Depro.reg&quot;,&quot;language&quot;:&quot;PowerShell&quot;,&quot;modeName&quot;:&quot;powershell&quot;}">"HKEY_LOCAL_MACHINE\SOFTWARE\Microsoft\Windows\CurrentVersion\Appx\AppxAllUserStore\Deprovisioned"</pre>
</div>

But it is stored as a set of registry keys instead of properties on a registry key. Depending on the structure of data in the registry it may be possible to use [RegKeyToMof][2] to generate a MOF file. With this being a set of indeterminate registry keys I've decided to use a script instead.

Scripts for custom hardware inventory typically follow this workflow. At least... mine do

  * Ensure the WMI Namespace exists
  * Clear / Remove the WMI Class if it exists
  * (Re)create the WMI Class
  * Collect the data
  * Populate WMI
  * Write out some random gibberish so that your CI can be 'Compliant'

<div class="wp-block-codemirror-blocks-code-block code-block">
  <pre class="CodeMirror" data-setting="{&quot;mode&quot;:&quot;powershell&quot;,&quot;mime&quot;:&quot;application/x-powershell&quot;,&quot;theme&quot;:&quot;default&quot;,&quot;lineNumbers&quot;:true,&quot;styleActiveLine&quot;:true,&quot;lineWrapping&quot;:true,&quot;readOnly&quot;:false,&quot;fileName&quot;:&quot; Inventory-DeprovisionedAppX.ps1&quot;,&quot;language&quot;:&quot;PowerShell&quot;,&quot;modeName&quot;:&quot;powershell&quot;}">#region define your Hardware Inventory Class Name, and the namespace in WMI to store it
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

Write-Output 'Inventory Complete'</pre>
</div>

<blockquote class="wp-block-quote">
  <p>
    <a href="https://github.com/CodyMathis123/CM-Ramblings/blob/master/Reprovision%20Windows%2010%20Apps/Inventory-DeprovisionedAppX.ps1">https://github.com/CodyMathis123/CM-Ramblings/blob/master/Reprovision%20Windows%2010%20Apps/Inventory-DeprovisionedAppX.ps1</a>
  </p>
  
  <cite>Inventory-DeprovisionedAppX</cite>
</blockquote>

#### Step 2 - Run script on a schedule

There are countless sources to show you how to create a CI in MEMCM (Don't search for MEMCM, you won't get any results. Use SCCM, or ConfigMgr). While a step by step on all those sweet sweet next buttons sounds invigorating, I'm going to provide some screenshots instead.<figure class="wp-block-gallery columns-3">

<ul class="blocks-gallery-grid">
  <li class="blocks-gallery-item">
    <figure><a href="https://sysmansquad.com/wp-content/uploads/2020/02/CustomHINV-Depro2.png"><img loading="lazy" width="654" height="621" src="https://sysmansquad.com/wp-content/uploads/2020/02/CustomHINV-Depro2.png" alt="" data-id="833" data-full-url="https://sysmansquad.com/wp-content/uploads/2020/02/CustomHINV-Depro2.png" data-link="https://sysmansquad.com/?attachment_id=833" class="wp-image-833" srcset="https:/wp-content/uploads/2020/02/CustomHINV-Depro2.png 654w, https:/wp-content/uploads/2020/02/CustomHINV-Depro2-300x285.png 300w, https:/wp-content/uploads/2020/02/CustomHINV-Depro2-100x95.png 100w" sizes="(max-width: 654px) 100vw, 654px" /></a></figure>
  </li>
  <li class="blocks-gallery-item">
    <figure><a href="https://sysmansquad.com/wp-content/uploads/2020/02/CustomHINV-Depro1.png"><img loading="lazy" width="602" height="591" src="https://sysmansquad.com/wp-content/uploads/2020/02/CustomHINV-Depro1.png" alt="" data-id="832" data-full-url="https://sysmansquad.com/wp-content/uploads/2020/02/CustomHINV-Depro1.png" data-link="https://sysmansquad.com/?attachment_id=832" class="wp-image-832" srcset="https:/wp-content/uploads/2020/02/CustomHINV-Depro1.png 602w, https:/wp-content/uploads/2020/02/CustomHINV-Depro1-300x295.png 300w, https:/wp-content/uploads/2020/02/CustomHINV-Depro1-100x98.png 100w" sizes="(max-width: 602px) 100vw, 602px" /></a></figure>
  </li>
  <li class="blocks-gallery-item">
    <figure><a href="https://sysmansquad.com/wp-content/uploads/2020/02/CustomHINV-Depro3.png"><img loading="lazy" width="596" height="607" src="https://sysmansquad.com/wp-content/uploads/2020/02/CustomHINV-Depro3.png" alt="" data-id="834" data-full-url="https://sysmansquad.com/wp-content/uploads/2020/02/CustomHINV-Depro3.png" data-link="https://sysmansquad.com/?attachment_id=834" class="wp-image-834" srcset="https:/wp-content/uploads/2020/02/CustomHINV-Depro3.png 596w, https:/wp-content/uploads/2020/02/CustomHINV-Depro3-295x300.png 295w, https:/wp-content/uploads/2020/02/CustomHINV-Depro3-100x102.png 100w" sizes="(max-width: 596px) 100vw, 596px" /></a></figure>
  </li>
  <li class="blocks-gallery-item">
    <figure><a href="https://sysmansquad.com/wp-content/uploads/2020/02/CustomHINV-Depro4.png"><img loading="lazy" width="654" height="621" src="https://sysmansquad.com/wp-content/uploads/2020/02/CustomHINV-Depro4.png" alt="" data-id="835" data-full-url="https://sysmansquad.com/wp-content/uploads/2020/02/CustomHINV-Depro4.png" data-link="https://sysmansquad.com/?attachment_id=835" class="wp-image-835" srcset="https:/wp-content/uploads/2020/02/CustomHINV-Depro4.png 654w, https:/wp-content/uploads/2020/02/CustomHINV-Depro4-300x285.png 300w, https:/wp-content/uploads/2020/02/CustomHINV-Depro4-100x95.png 100w" sizes="(max-width: 654px) 100vw, 654px" /></a></figure>
  </li>
  <li class="blocks-gallery-item">
    <figure><a href="https://sysmansquad.com/wp-content/uploads/2020/02/CustomHINV-Depro5.png"><img loading="lazy" width="606" height="632" src="https://sysmansquad.com/wp-content/uploads/2020/02/CustomHINV-Depro5.png" alt="" data-id="836" data-full-url="https://sysmansquad.com/wp-content/uploads/2020/02/CustomHINV-Depro5.png" data-link="https://sysmansquad.com/?attachment_id=836" class="wp-image-836" srcset="https:/wp-content/uploads/2020/02/CustomHINV-Depro5.png 606w, https:/wp-content/uploads/2020/02/CustomHINV-Depro5-288x300.png 288w, https:/wp-content/uploads/2020/02/CustomHINV-Depro5-100x104.png 100w" sizes="(max-width: 606px) 100vw, 606px" /></a></figure>
  </li>
</ul></figure> 

Some 'good to knows' for doing custom hardware inventory in this fashion are below.

  1. Make sure it returns compliant... Having 'non-compliant' in your reporting data, or your control panel applet because of a poorly written script is silly!
  2. Do NOT include a 'timestamp' as part of your custom inventory unless you absolutely have to. (See [this post][3] for an explanation)
  3. Put some thought to the schedule. Some types of inventory may require a more frequent gather. Compare your need for data with your hardware inventory cycle, as well as the expected rate of change of the data.

#### Step 3 - Add new WMI class to hardware inventory

The script is written, deployed, and has run on a client. Now it is time to actually get this data into MEMCM! 

I start at a client that I know has run my script. If everything is working as expected, and I have deprovisioned apps, I should be able to perform a query to return my custom data stored in WMI.<figure class="wp-block-image size-full is-resized">

<img loading="lazy" src="https://sysmansquad.com/wp-content/uploads/2020/02/CustomHINV-GetDeproHINV-1.png" alt="" class="wp-image-841" width="859" height="341" srcset="https:/wp-content/uploads/2020/02/CustomHINV-GetDeproHINV-1.png 859w, https:/wp-content/uploads/2020/02/CustomHINV-GetDeproHINV-1-300x119.png 300w, https:/wp-content/uploads/2020/02/CustomHINV-GetDeproHINV-1-768x305.png 768w, https:/wp-content/uploads/2020/02/CustomHINV-GetDeproHINV-1-100x40.png 100w, https:/wp-content/uploads/2020/02/CustomHINV-GetDeproHINV-1-855x339.png 855w" sizes="(max-width: 859px) 100vw, 859px" /> </figure> 

Awesome! That is easily half the battle. Now, to complete the cycle we need to get the data into the database. If you are feeling frisky you can start editing MOF files. Otherwise, you can connect to a computer from the MEMCM console and select the new WMI class. I recommend option #2.

Pop open the 'Default Settings' policy, and navigate to the 'Hardware Inventory' section. Now click that thingy I have highlighted below (**Set Classes**...).<figure class="wp-block-image size-large">

<img loading="lazy" width="778" height="723" src="https://sysmansquad.com/wp-content/uploads/2020/02/CustomHINV-Depro-SetClasses.png" alt="" class="wp-image-843" srcset="https:/wp-content/uploads/2020/02/CustomHINV-Depro-SetClasses.png 778w, https:/wp-content/uploads/2020/02/CustomHINV-Depro-SetClasses-300x279.png 300w, https:/wp-content/uploads/2020/02/CustomHINV-Depro-SetClasses-768x714.png 768w, https:/wp-content/uploads/2020/02/CustomHINV-Depro-SetClasses-100x93.png 100w" sizes="(max-width: 778px) 100vw, 778px" /> </figure> 

And from there: 

  1. Click **Add**
  2. Click **Connect...**
  3. Type in the Computer name of the device that has the new WMI class
  4. Specify your WMI namespace if it is NOT the default root\cimv2
  5. Specify credentials if required
  6. Click **Connect**<figure class="wp-block-image size-large">

<img loading="lazy" width="526" height="593" src="https://sysmansquad.com/wp-content/uploads/2020/02/CustomHINV-Depro-AddHinvClass.png" alt="" class="wp-image-844" srcset="https:/wp-content/uploads/2020/02/CustomHINV-Depro-AddHinvClass.png 526w, https:/wp-content/uploads/2020/02/CustomHINV-Depro-AddHinvClass-266x300.png 266w, https:/wp-content/uploads/2020/02/CustomHINV-Depro-AddHinvClass-100x113.png 100w" sizes="(max-width: 526px) 100vw, 526px" /> </figure> 

If you didn't forget your password, a wonderful list of WMI classes under the specified namespace should appear. Check the box, click edit if you feel like poking around, and click ok!<figure class="wp-block-image size-large">

<img loading="lazy" width="506" height="120" src="https://sysmansquad.com/wp-content/uploads/2020/02/CustomHINV-Depro-AddHinvClass2.png" alt="" class="wp-image-845" srcset="https:/wp-content/uploads/2020/02/CustomHINV-Depro-AddHinvClass2.png 506w, https:/wp-content/uploads/2020/02/CustomHINV-Depro-AddHinvClass2-300x71.png 300w, https:/wp-content/uploads/2020/02/CustomHINV-Depro-AddHinvClass2-100x24.png 100w" sizes="(max-width: 506px) 100vw, 506px" /> </figure> 

#### Step 4 - ACT BA**SED ON DATA!** 

This bit will have to wait for another post! There is some fun stuff we can do with the data we are now collecting. The next post should spark some ideas for people, I hope. But, let's still take a look at the data we have now. 

In it's simplest form, we can query the MEMCM database as below.

<div class="wp-block-codemirror-blocks-code-block code-block">
  <pre class="CodeMirror" data-setting="{&quot;mode&quot;:&quot;powershell&quot;,&quot;mime&quot;:&quot;application/x-powershell&quot;,&quot;theme&quot;:&quot;default&quot;,&quot;lineNumbers&quot;:true,&quot;styleActiveLine&quot;:true,&quot;lineWrapping&quot;:true,&quot;readOnly&quot;:false,&quot;fileName&quot;:&quot;Get-AllDeproAppX.sql<br><br>.sql&quot;,&quot;language&quot;:&quot;PowerShell&quot;,&quot;modeName&quot;:&quot;powershell&quot;}">SELECT * FROM v_GS_DEPROVISIONEDAPPX</pre>
</div><figure class="wp-block-image size-large">

<img loading="lazy" width="683" height="372" src="https://sysmansquad.com/wp-content/uploads/2020/03/CustomHINV-BasicDB.png" alt="" class="wp-image-865" srcset="https:/wp-content/uploads/2020/03/CustomHINV-BasicDB.png 683w, https:/wp-content/uploads/2020/03/CustomHINV-BasicDB-300x163.png 300w, https:/wp-content/uploads/2020/03/CustomHINV-BasicDB-100x54.png 100w" sizes="(max-width: 683px) 100vw, 683px" /> </figure> 

If we desire a little more insight, the query can be adjusted to show counts.

<div class="wp-block-codemirror-blocks-code-block code-block">
  <pre class="CodeMirror" data-setting="{&quot;mode&quot;:&quot;powershell&quot;,&quot;mime&quot;:&quot;application/x-powershell&quot;,&quot;theme&quot;:&quot;default&quot;,&quot;lineNumbers&quot;:true,&quot;styleActiveLine&quot;:true,&quot;lineWrapping&quot;:true,&quot;readOnly&quot;:false,&quot;fileName&quot;:&quot;Get-DeproAppXCount.sql&quot;,&quot;language&quot;:&quot;PowerShell&quot;,&quot;modeName&quot;:&quot;powershell&quot;}">SELECT depro.DeprovisionedApp0
	, COUNT(depro.DeprovisionedApp0) [Count]
FROM v_GS_DEPROVISIONEDAPPX depro
GROUP BY depro.DeprovisionedApp0
ORDER BY 2 DESC</pre>
</div><figure class="wp-block-image size-large">

<img loading="lazy" width="366" height="438" src="https://sysmansquad.com/wp-content/uploads/2020/03/CustomHINV-CountDB.png" alt="" class="wp-image-866" srcset="https:/wp-content/uploads/2020/03/CustomHINV-CountDB.png 366w, https:/wp-content/uploads/2020/03/CustomHINV-CountDB-251x300.png 251w, https:/wp-content/uploads/2020/03/CustomHINV-CountDB-100x120.png 100w" sizes="(max-width: 366px) 100vw, 366px" /> </figure> 

Join us next time, when decisions, and actions are made with our new found data!

[@CodyMathis123][4]

 [1]: https://sysmansquad.com/2020/01/06/reprovision-windows-10-apps-wait-what/
 [2]: https://gallery.technet.microsoft.com/RegKeyToMof-28e84c28
 [3]: https://sccmf12twice.com/2019/08/hinvchangelog-the-600gb-db-backlog/
 [4]: https://twitter.com/CodyMathis123