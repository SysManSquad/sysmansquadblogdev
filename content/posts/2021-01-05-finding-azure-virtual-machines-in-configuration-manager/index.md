---
title: Finding Azure Virtual Machines in Configuration Manager
author: Nic Wendlowsky
type: post
date: 2021-01-06T05:04:40+00:00
url: /2021/01/05/finding-azure-virtual-machines-in-configuration-manager/
featured_image: image-14.png
categories:
  - Azure
  - Endpoint Management
  - MECM/MEMCM/SCCM
  - Powershell
  - Windows

---
A request came in from my System Admin group to push certain policies only to VMs hosted in Azure. Currently, they had a naming convention being used (well, _supposed_ to be used) to simply prefix the hostname with `AZ-`, but they came across a couple Domain Controllers that hadn't installed Updates in 7+ months, and of course the names didn't follow the accepted standard.

<p id="AzureMetadataService">
  So I started looking for ways to identify Azure devices definitively and came across this [Detect Windows Azure Virtual Machine](https://gallery.technet.microsoft.com/scriptcenter/Detect-Windows-Azure-aed06d51) post, which led to reading the [Azure Metadata Service](https://docs.microsoft.com/en-us/azure/virtual-machines/linux/instance-metadata-service) docs, and eventually got me to turn this into a Configuration Item / Configuration Baseline and subsequent Device Collections.
</p><div class="wp-block-uagb-table-of-contents uagb-toc\_\_align-left uagb-toc\_\_columns-1 uagb-block-243a63e7 " data-scroll= "1" data-offset= "30" data-delay= "800" > 

<div class="uagb-toc__wrap">
  <div class="uagb-toc__title-wrap">
    <div class="uagb-toc__title">
      Table Of Contents
    </div>
  </div>
  
  <div class="uagb-toc__list-wrap">
    <ol class="uagb-toc__list">
      <li class="uagb-toc__list">
        [Azure Metadata Service](#azure-metadata-service)<li class="uagb-toc__list">
          [Detection Script](#detection-script)<li class="uagb-toc__list">
            [Create Configuration Baseline](#create-configuration-baseline)<ul class="uagb-toc__list">
              <li class="uagb-toc__list">
                [Configuration Item](#configuration-item)<li class="uagb-toc__list">
                  <li class="uagb-toc__list">
                    [Configuration Baseline](#configuration-baseline)<li class="uagb-toc__list">
                      <li class="uagb-toc__list">
                        [Deploy Baseline](#deploy-baseline)
                      </li></ul>
                    </li>
                    <li class="uagb-toc__list">
                      [Create Collections](#create-collections)
                    </li></ul></ol> </div> </div> </div> 
                    <h1>
                      Azure Metadata Service
                    </h1>
                    
                    <p>
                      Officially, the Azure Metadata Service is:
                    </p>
                    
                    <pre class="wp-block-code"><code>[...] a REST API that's available at a well-known, non-routable IP address (169.254.169.254). You can only access it from within the VM. Communication between the VM and IMDS never leaves the host. Have your HTTP clients bypass web proxies within the VM when querying IMDS, and treat 169.254.169.254 the same as 168.63.129.16.</code></pre>
                    
                    <p>
                      Basically, it's an internal API using APIPA addressing to ensure that it can only be accessed while logged into the OS (or using <code>Invoke-Command</code>). It allows us to get information about the guest OS. For our purposes today, we only care if it exists and won't be utilizing the actual data, but you can use this as a starting point for whatever's useful for you.
                    </p>
                    
                    <h1>
                      Detection Script
                    </h1>
                    
                    <p>
                      First, let's convert the Azure Metadata Service documentation Curl command from bash/shell:
                    </p>
                    
                    
```shell
curl -H Metadata:true --noproxy "*" "http://169.254.169.254/metadata/instance?api-version=2020-09-01"
```
                    
                    
                    <p>
                      to PowerShell:
                    </p>
                    
                    
```powershell
Invoke-RestMethod -Headers @{"Metadata"="true"} -Uri "http://169.254.169.254/metadata/instance/compute?api-version=2018-10-01"
```
                    
                    
                    <p>
                      Next, we should turn it into a simple Function
                    </p>
                    
                    
```powershell
FUNCTION Test-IsAzureVM {
    IF(Invoke-RestMethod -Headers @{"Metadata"="true"} -URI "http://169.254.169.254/metadata/instance/compute?api-version=2017-08-01"){
      $true
    }ELSE{
      $false
    }
}
```
                    
                    
                    <p>
                      And test on an Azure VM to make sure it works
                    </p><figure class="wp-block-image size-large is-resized">
                    
                    ![](image-14-1024x332.png)</figure> <p>
                      Success!<br />Now let's make sure it works on a non-Azure VM
                    </p><figure class="wp-block-image size-large is-resized">
                    
                    ![](Snag_233efd31-1024x321.png)</figure> <p>
                      Yikes. Ok, now to handle that error message. We could try adding <code>-Erroraction silentlycontinue</code>
                    </p><figure class="wp-block-image size-large is-resized">
                    
                    ![](Snag_234114b7-1024x276.png)</figure> <p>
                      Dang, still isn't suppressing that exception.<br />Looking up the documentation for [Invoke-WebRequest](https://docs.microsoft.com/en-us/powershell/module/microsoft.powershell.utility/invoke-webrequest?view=powershell-7.1#example-7--catch-non-success-messages-from-invoke-webrequest), Microsoft states
                    </p>
                    
                    <div class="wp-block-group">
                      <div class="wp-block-group__inner-container">
                        <blockquote class="wp-block-quote">
                          <p>
                            When&nbsp;<code>Invoke-WebRequest</code>&nbsp;encounters a non-success HTTP message (404, 500, etc.), it returns no output and throws a terminating error. To catch the error and view the&nbsp;<strong>StatusCode</strong>&nbsp;you can enclose execution in a&nbsp;<code>try/catch</code>&nbsp;block.
                          </p>
                        </blockquote>
                      </div>
                    </div>
                    
                    <p>
                      Ok, let's try adding the Try/Catch
                    </p><figure class="wp-block-image size-large is-resized">
                    
                    ![](Snag_23486006-1024x241.png)</figure> <p>
                      Wait, where's the output??<br />It looks as though, since the metadata "URI" doesn't exist on non-Azure VMs, there's no response even sent back to the <code>$Response</code> variable. <br /><br />To fix this, we can forcibly set <code>Invoke-Webrequest</code> to use Boolean instead, since all we're looking for is a True/False output
                    </p><figure class="wp-block-image size-large is-resized">
                    
                    ![](Snag_234d2101-1024x262.png)</figure> <p>
                      Great! Here's the finished function
                    </p>
                    
                    
```powershell
FUNCTION Test-IsAzureVM {
  TRY{
    $Output = [bool](Invoke-RestMethod -Headers @{"Metadata"="true"} -URI "http://169.254.169.254/metadata/instance/compute?api-version=2017-08-01")
  }
  CATCH{
    $Output = $false
  }
  $Output
}
```
                    
                    
                    <h1>
                      Create Configuration Baseline
                    </h1>
                    
                    <h2>
                      Configuration Item
                    </h2>
                    
                    <p>
                      In your ConfigMgr Admin Console, navigate to <code>\Assets and Compliance\Overview\Compliance Settings\Configuration Items</code> and Create a new Configuration Item
                    </p><figure class="wp-block-image size-large is-resized">
                    
                    ![](Snag_2366eb5c-968x1024.png)</figure> <ol>
                      <li>
                        Setting Type: <code>Script</code>
                      </li>
                      <li>
                        Data Type: <code>Boolean</code>
                      </li>
                      <li>
                        Script: Past the Function in the window and <span style="color:Red"><strong><em>don't forget to call the function on the last line!</em></strong></span>
                      </li>
                    </ol><figure class="wp-block-image size-large">
                    
                    ![](Snag_23698fff.png)</figure> <ol>
                      <li>
                        Values: <code>true</code>
                      </li>
                      <li>
                        Noncompliance severity: <code>none</code><ul>
                          <li>
                            This is key so that the non-compliance devices don't throw errors if you add to an existing Configuration Baseline
                          </li>
                        </ul>
                      </li>
                    </ol>
                    
                    <h2>
                      Configuration Baseline
                    </h2>
                    
                    <p>
                      In the console, move down to the Configuration Baseline section and create a new Baseline, adding the Configuration Item we previously created
                    </p><figure class="wp-block-image size-large is-resized">
                    
                    ![](image-15.png)</figure> <h2>
                      Deploy Baseline
                    </h2>
                    
                    <p>
                      Now you can Deploy your newly created Baseline to whichever devices you wish. For this example, we're deploying to the <em>All Systems</em> collection and we're only going to run the baseline evaluation once per device, but there's no real harm in having it run every month or so (the data we're looking at is static and shouldn't vary at all).
                    </p><figure class="wp-block-image size-large is-resized">
                    
                    ![](image-17-1024x640.png)</figure> <h1>
                      Create Collections
                    </h1>
                    
                    <p>
                      The only real "required" collection to make is based on Compliant devices with the Baseline we deployed. To do that, click the Baseline, then the Deployments tab at the bottom, and right-click the <strong>Deployment</strong> > <strong>Create New Collection</strong> > <strong>Compliant</strong>, and follow the on-screen prompts to finish the Collection
                    </p><figure class="wp-block-image size-large is-resized">
                    
                    ![](image-18.png)</figure> <p>
                      I named my Collection "<em>All Systems_Azure</em>"
                    </p><figure class="wp-block-image size-large is-resized">
                    
                    ![](image-19.png)</figure> <p>
                      and now you can create collections based on this collection, for example:
                    </p>
                    
                    <ul>
                      <li>
                        <strong>Collection Name</strong>: <em>All Windows Workstations in Azure</em><ul>
                          <li>
                            <strong>Limiting Collection</strong>: <em>All Systems_Azure</em>
                          </li>
                          <li>
                            <strong>Include Collection</strong>: <em>All Windows Workstations</em>
                          </li>
                          <li>
                            <strong>Result</strong>: Collection of Azure VMs running Windows client OS
                          </li>
                        </ul>
                      </li>
                      
                      <li>
                        <strong>Collection Name</strong>: <em>All Windows Servers in Azure</em><ul>
                          <li>
                            <strong>Limiting Collection</strong>: <em>All Systems_Azure</em>
                          </li>
                          <li>
                            <strong>Include Collection</strong>: <em>All Windows Servers</em>
                          </li>
                          <li>
                            <strong>Result</strong>: Collection of Azure VMs running Windows server OS
                          </li>
                        </ul>
                      </li>
                    </ul>
                    
                    <p>
                      Once I completed this, I found 34 additional Azure VMs that weren't showing up in our previous Collection that was querying based on the hostname prefix.
                    </p>
