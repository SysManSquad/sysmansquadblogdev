---
title: 'SCCM Compliance Setting: Root Certificate'
author: Will Locke
type: post
date: -001-11-30T00:00:00+00:00
draft: true
url: /?p=801
categories:
  - Endpoint Management
  - How-To
  - MECM/MEMCM/SCCM

---
Recently my company has been steadily migrating data center servers from patching via a stand-alone WSUS instance to patching via ConfigMgr. While we seemlessly initiated patching via ConfigMgr on our client systems years ago, data center servers have met with various challenges: most notably management trust in ConfigMgr administrators that something won't be improperly deployed (yes, there is a story there) and licensing cost. We finally resolved both of those issues and have been working to install the ConfigMgr client on all data center servers. After fighting with firewall rules and other blockers, we're getting very close. However, after installing the ConfigMgr client on non-domain joined DMZ systems and assuming patching would 'just work', we were sadly mistaken. This post is about what I discovered and how I used Compliance Settings and some ConfigMgr magic to solve the problem.

### Initial Problem to Solve - Deploy Software Updates to Non-Domain Joined Systems

So with ConfigMgr client installed and non-domain joined system showing Active in the console the system should just patch, right? That's what we thought too. After finding no patches in Software Center we ran Get-WindowsUpdateLog and in the output found a block of errors as shown below.<figure class="wp-block-image size-large">

![](WSUS.Log_.Error_-1024x122.png) <figcaption>Image 1 - Windows Update Log indicates failure to process certificate chain.</figcaption></figure> 

Since our ConfigMgr SUP is configured for SSL (yours is too, right?!?) and the SSL certificate was issued by our enterprise certificate authority, the certificate chain is WSUS SSL cert > Online Enterprise CA > Offline Enterprise CA. The Online and Offline Enterprise CA certificates are normally added to the Trusted Root certificate store either when the system is added to the domain or via Group Policy. However, for this non-domain joined DMZ system, it did not have either of the two certificates in the certificate chain. We had completely forgotten about this when expected patching to just start working after installing the ConfigMgr client.

## Solution - Compliance Setting to Verify Necessary Certificates

Since we cannot use Group Policy on the non-domain joined system we needed to find a solution using only ConfigMgr technologies. Compliance Settings can check for existence of the certificate and automatically remediate as necessary. I started with Jason's blog post over at [ConfigMgrFTW](https://home.configmgrftw.com/certificate-deployment-with-configmgr/) (Ioan Popovici at [SCCM Zone](https://sccm-zone.com/installing-a-certificate-with-sccm-configuration-items-53832b099c51) also has a related post for reference) but had to take it a few steps further to make a complete solution. I will be repeating pieces of the post for completeness below.

  1. Obtain certificate(s) .cer file(s)
  2. Convert .cer file(s) to Base64 .txt file(s)
  3. Create and sign the Discover script(s)
  4. Create and sign the Remediation script(s)
  5. Create Configuration Item(s)
  6. Create Configuration Baseline
  7. Deploy Baseline

#### 1. Obtain certifcate(s) .cer file(s)

How you accomplish this will depend on your environment. In this case I needed 3 certificates: the online enterprise CA, the offline enterprise CA, and the code signing certificate used to sign PowerShell code. You do not need a private key for any of these certificates.

#### 2. Convert .cer file(s) to Base64 .txt file(s)

You'll need the converted .txt representation of the certificate for the Remediation script below. Run the below PowerShell against each .cer file, replacing the source and destination filenames each time.


```powershell



#### 3. Create and sign the Discover script(s)

Jason's code (link to his blog post above) is much simpler than Ioan's, so I will be using a slight modification of his code for this. I needed to modify his code because he had it outputting the count of certificates found, but the option to apply a Remediation script was greyed out in SCCM when I used a data type other than boolean. It was a simple enough modification to get the count and pass back $true if greater than 0 or $false if not.

For each certificate you want included in the Compliance Setting, edit the below code, save the script, and finally sign the script with your code signing certificate. The examples and screenshots below are for our code signing certificate which we want in the Trusted Publishers certificate store.


```powershell
$sn = '21001424eb63195fabb987e9fd0003001424eb'
$storeName = "TrustedPublisher"
 
$store = New-Object System.Security.Cryptography.X509Certificates.X509Store $storeName, LocalMachine
$store.Open([System.Security.Cryptography.X509Certificates.OpenFlags]::ReadOnly)

If (($store.Certificates | Where-Object { $_.SerialNumber -eq $sn }).count -ge 1) { $true }
Else { $false }
 
$store.Close()
```


Quick summary of above code:

  * Open certificate store $storeName on LocalMachine in ReadOnly. 
  * Find certificates with SerialNumber matching $sn.
  * If number of certificates found is greater than or equal to 1, return $true; otherwise return $false.
  * Close the store

**3.1. Get the SerialNumber from the certificate.**

Using the .cer files obtained above, double click the .cer file to open the certificate information. On the Details tab, the second property should be Serial Number. Select this property, select the contents of the text box and copy/paste into the string on line 1 of the script.

<div class="wp-block-image">
  <figure class="aligncenter size-large">![](Certificate.Details.jpg)<figcaption>Image 2 - Certificate Details; Copy Serial Number into script on line 1.</figcaption></figure>
</div>

**3.2 Set the $StoreName.**

Our two enterprise CA certificates need to be in Trusted Root Certificate Authorities and our code signer certificate needs to be in Trusted Publishers. Microsoft's documentation regarding the [X509Store .NET library][3] contains a reference for what the $StoreName variable should be assigned (see below). Trusted Root Certificate Authorities is simply "Root" and Trusted Publishers is "TrustedPublishers". 

<pre class="wp-block-code"><code>AuthRoot, LocalMachine
CA, LocalMachine
Disallowed, LocalMachine
My, LocalMachine
Root, LocalMachine
TrustedPeople, LocalMachine
TrustedPublisher, LocalMachine</code>
```

**3.3 Save and sign the script**

In a secure environment, ConfigMgr's PowerShell execution policy should be set to "All Signed" in the Computer Agent Client Settings. This requires all PowerShell scripts used for Compliance Settings, Global Conditions and Application Detection Methods to be properly signed. If your ConfigMgr PowerShell execution policy is set to Bypass, you can skip this step.

There are a couple of ways to sign PowerShell code and that is not the focus of this topic so I'm not going to go into a lot of detail. I personally highly recommend Sapien's PowerShell Studio as it signs scripts I write for me. However assuming you have the codesigning certificate (with private key) in your personal certificate store, you could use a simple PowerShell method like below to sign your scripts.


```powershell



Repeat the above steps for all certificates to be included in the Compliance Setting.

#### 4. Create and sign the Remediation script(s)

Again, I used Jason's code; unmodified in this case. The example and screenshots are still for the code signing certificate as in step 3.


  ```powershell 
$storeName = "TrustedPublisher"
$certString = "----Insert Base64 Encoded Certificate Here----"
 
$store = New-Object System.Security.Cryptography.X509Certificates.X509Store $storeName, LocalMachine
$store.Open([System.Security.Cryptography.X509Certificates.OpenFlags]::ReadWrite)
 
$certByteArray = [System.Convert]::FromBase64String($certString)
 
$cert = New-Object System.Security.Cryptography.X509Certificates.X509Certificate2
$cert.Import($certByteArray)
 
$store.Add($cert)
$store.Close()

```


**4.1 Set the $StoreName**

See 3.2 above for more details. For our code signer certificate we need TrustedPublisher.

**4.2 Set the $certString**

You obtain this by opening the Base64 .txt file created in Step 2 and copying the entire contents of that file into the variable on line 2 of the script.

**4.3 Save and sign the script**

See Step 3.3 above for more details.

#### 5. Create Configuration Item

The below instructions and screenshots were created using Microsoft Endpoint Manager 1910. There may be some differences between past or future versions.

5.1. Open the MEMCM console > Assets and Compliance > Compliance Settings > Configuration Items > (Right Click) Create Configuration Item

5.2. On the General screen of the wizard, for the Name we preface ours based on purpose or type so in this case "Certificate - Trusted Publisher Task_CodeSigner". The remaining items on this screen can be left default. Click Next.

<div class="wp-block-image">
  <figure class="aligncenter size-large">![](CI.Wizard.General.jpg)<figcaption>Image 3 - Create Configuration Item Wizard General Screen</figcaption></figure>
</div>

5.3. On the Support Platforms tab you may want to unselect platforms where the code won't run such as XP, Vista and 2003 (but you shouldn't have any of these left anyway, right?). I haven't validated whether the code uses anything that won't work on Windows 7/Server 2008 R2 or not. Click Next.

<div class="wp-block-image">
  <figure class="aligncenter size-large">![](CI.Wizard.Supported.Platforms.jpg)<figcaption>Image 4 - Create Configuration Item Wizard Supported Platforms</figcaption></figure>
</div>

 
 [2]: 
 [3]: https://docs.microsoft.com/en-us/dotnet/api/system.security.cryptography.x509certificates.x509store.name?view=netframework-4.8
