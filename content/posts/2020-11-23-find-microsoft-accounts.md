---
title: Find Microsoft Accounts on Company Domains
author: Kevin Crouch
type: post
date: 2020-11-23T15:00:00+00:00
url: /2020/11/23/find-microsoft-accounts/
featured_image: /wp-content/uploads/2020/11/two-buttons-sideways_white-100x38.png
categories:
  - Azure
  - How-To
  - Microsoft
  - Powershell
  - Scripting
tags:
  - Apps
  - Azure
  - Microsoft
  - PowerShell

---
The other day I was helping someone over in the [WinAdmins Discord][1]. Their users kept getting confused about what their passwords were, and it was causing a lot of HelpDesk tickets. Let's find out what users have Microsoft accounts on the company domain so we can help move those accounts elsewhere to streamline the user experience.

<!--more--><div class="wp-block-uagb-table-of-contents uagb-toc\_\_align-left uagb-toc\_\_columns-1 uagb-block-a47e5e16 " data-scroll= "1" data-offset= "30" data-delay= "800" > 

<div class="uagb-toc__wrap">
  <div class="uagb-toc__title-wrap">
    <div class="uagb-toc__title">
      Table of Contents
    </div>
  </div>
  
  <div class="uagb-toc__list-wrap">
    <ol class="uagb-toc__list">
      <li class="uagb-toc__list">
        <a href="#update-on-prevention">Update on Prevention:</a><ul class="uagb-toc__list">
          <li class="uagb-toc__list">
            <a href="#preventing-new-registration">Preventing new registration</a><li class="uagb-toc__list">
              <li class="uagb-toc__list">
                <a href="#what-the-blocking-looks-like">What the blocking looks like</a>
              </li></ul>
            </li>
            <li class="uagb-toc__list">
              <a href="#identifying-the-problem">Identifying the Problem</a><li class="uagb-toc__list">
                <a href="#designing-a-solution">Designing a Solution</a><li class="uagb-toc__list">
                  <a href="#setting-up-your-app-registration">Setting up your App Registration</a><li class="uagb-toc__list">
                    <a href="#constructing-our-app-authorization-url">Constructing our App Authorization URL</a><ul class="uagb-toc__list">
                      <li class="uagb-toc__list">
                        <a href="#valid-microsoft-account">Valid Microsoft Account</a><li class="uagb-toc__list">
                          <li class="uagb-toc__list">
                            <a href="#no-valid-microsoft-account">No Valid Microsoft Account</a>
                          </li></ul>
                        </li></ul>
                      </li>
                      <li class="uagb-toc__list">
                        <a href="#scripting-the-verification-process">Scripting the verification Process</a><li class="uagb-toc__list">
                          <a href="#user-consent-prompt">User Consent Prompt</a><li class="uagb-toc__list">
                            <a href="#wrap-up">Wrap up</a>
                          </li></ul>
                        </li></ul></ol> </div> </div> </div> 
                        <div class="wp-block-group">
                          <div class="wp-block-group__inner-container">
                            <h2>
                              Update on Prevention:
                            </h2>
                            
                            <blockquote class="wp-block-quote">
                              <p>
                                Microsoft has introduced some changes that at least seem to prevent <em>NEW </em>Microsoft Accounts on Company Domains. I added more details in the <a href="#preventing">Preventing</a> section if you want to read more about this. If you just want to find the accounts, jump to <a href="#identifying-the-problem">Identifying the Problem</a>.
                              </p>
                            </blockquote>
                          </div>
                        </div>
                        
                        <h3 id="preventing">
                          Preventing new registration
                        </h3>
                        
                        <p>
                          Microsoft has introduced some changes that at least seem to prevent <em>NEW </em>Microsoft Accounts on Company Domains. I haven't been able to find any specific announcement about this feature/capability, but supposedly all you need to do is have the relevant domain in your Office 365 Domains as Managed.
                        </p>
                        
                        <h3>
                          What the blocking looks like
                        </h3>
                        
                        <p>
                          So far, it seems that the blocking will prevent them from Registering a new account with a validated work email domain, or from adding that email as an alias.
                        </p>
                        
                        <div class="wp-block-jetpack-slideshow aligncenter" data-effect="slide">
                          <div class="wp-block-jetpack-slideshow_container swiper-container">
                            <ul class="wp-block-jetpack-slideshow_swiper-wrapper swiper-wrapper">
                              <li class="wp-block-jetpack-slideshow_slide swiper-slide">
                                <figure><img loading="lazy" width="489" height="437" alt="" class="wp-block-jetpack-slideshow_image wp-image-2978" data-id="2978" src="https://sysmansquad.com/wp-content/uploads/2021/09/image-2.png" srcset="https:/wp-content/uploads/2021/09/image-2.png 489w, https:/wp-content/uploads/2021/09/image-2-300x268.png 300w, https:/wp-content/uploads/2021/09/image-2-100x89.png 100w" sizes="(max-width: 489px) 100vw, 489px" /><figcaption class="wp-block-jetpack-slideshow_caption gallery-caption">Blocked from registering from a new Microsoft Account with Company Email</figcaption></figure>
                              </li>
                              <li class="wp-block-jetpack-slideshow_slide swiper-slide">
                                <figure><img loading="lazy" width="780" height="382" alt="" class="wp-block-jetpack-slideshow_image wp-image-2977" data-id="2977" src="https://sysmansquad.com/wp-content/uploads/2021/09/image-1.png" srcset="https:/wp-content/uploads/2021/09/image-1.png 780w, https:/wp-content/uploads/2021/09/image-1-300x147.png 300w, https:/wp-content/uploads/2021/09/image-1-768x376.png 768w, https:/wp-content/uploads/2021/09/image-1-100x49.png 100w" sizes="(max-width: 780px) 100vw, 780px" /><figcaption class="wp-block-jetpack-slideshow_caption gallery-caption">Blocked from adding the company email as an alias on a current account</figcaption></figure>
                              </li>
                              <li class="wp-block-jetpack-slideshow_slide swiper-slide">
                                <figure><img loading="lazy" width="474" height="426" alt="" class="wp-block-jetpack-slideshow_image wp-image-2979" data-id="2979" src="https://sysmansquad.com/wp-content/uploads/2020/11/zgvcQSD1.png" srcset="https:/wp-content/uploads/2020/11/zgvcQSD1.png 474w, https:/wp-content/uploads/2020/11/zgvcQSD1-300x270.png 300w, https:/wp-content/uploads/2020/11/zgvcQSD1-100x90.png 100w" sizes="(max-width: 474px) 100vw, 474px" /><figcaption class="wp-block-jetpack-slideshow_caption gallery-caption">Seems to work off Domain, not specific Email Addresses</figcaption></figure>
                              </li>
                            </ul>
                            
                            <a class="wp-block-jetpack-slideshow_button-prev swiper-button-prev swiper-button-white" role="button"></a><a class="wp-block-jetpack-slideshow_button-next swiper-button-next swiper-button-white" role="button"></a><a aria-label="Pause Slideshow" class="wp-block-jetpack-slideshow_button-pause" role="button"></a>
                            
                            <div class="wp-block-jetpack-slideshow_pagination swiper-pagination swiper-pagination-white">
                            </div>
                          </div>
                        </div>
                        
                        <h2>
                          Identifying the Problem
                        </h2>
                        
                        <p>
                          This prompt is the main source of the user’s confusion; the email address is the same for the user’s Work/School account and a Microsoft account. When an app supports signing in with both a Work/School and Personal account, it prompts the user for which type of account they want to use. Most users don't know what the difference is, or where the Microsoft account came from.
                        </p>
                        
                        <div class="wp-block-image image-shadow">
                          <figure class="aligncenter size-large is-resized"><img loading="lazy" src="https://sysmansquad.com/wp-content/uploads/2020/11/image-1-edited.png" alt="Screenshot showing a choice between work / School account and Personal / Microsoft Account" class="wp-image-1900" width="344" height="363" srcset="https:/wp-content/uploads/2020/11/image-1-edited.png 344w, https:/wp-content/uploads/2020/11/image-1-edited-284x300.png 284w, https:/wp-content/uploads/2020/11/image-1-edited-100x106.png 100w" sizes="(max-width: 344px) 100vw, 344px" /></figure>
                        </div>
                        
                        <p>
                          As that link in the screenshot says, you can <a href="https://go.microsoft.com/fwlink/p/?LinkID=733247">Rename the personal Microsoft </a><a href="https://go.microsoft.com/fwlink/p/?LinkID=733247" target="_blank" rel="noreferrer noopener">account</a>, but how can you know which users have a conflicting Microsoft account?
                        </p>
                        
                        <h2>
                          Designing a Solution
                        </h2>
                        
                        <p>
                          To find these conflicting Microsoft accounts, we can ... abuse... an Azure App Registrations capabilities. We create a custom application that we register to only accept Microsoft accounts, not AzureAD/Work/School accounts. – if you try to use an email for your domain that doesn’t have a Microsoft account, it will just throw back an error that no Microsoft account could be found.
                        </p><figure class="wp-block-image size-large image-shadow">
                        
                        <img loading="lazy" width="336" height="171" src="https://sysmansquad.com/wp-content/uploads/2020/11/image-2-edited.png" alt="This screenshot shows that a microsoft Account sign in prompt will return a warning if you give it an email address with no Microsoft Account associated " class="wp-image-1901" srcset="https:/wp-content/uploads/2020/11/image-2-edited.png 336w, https:/wp-content/uploads/2020/11/image-2-edited-300x153.png 300w, https:/wp-content/uploads/2020/11/image-2-edited-100x51.png 100w" sizes="(max-width: 336px) 100vw, 336px" /></figure> <p>
                          Even better! We can leverage this, along with <strong><a href="https://docs.microsoft.com/en-us/azure/active-directory/develop/active-directory-optional-claims#:~:text=app%2Buser%20token.-,login_hint,-Login%20hint" target="_blank" rel="noreferrer noopener">login hints</a></strong>, to scale this up and make a scriptable solution to find any domain emails that have a Microsoft account conflicting with their Work account.
                        </p>
                        
                        <p>
                          At this time, I don’t know of a way to prevent Microsoft accounts on the company domain, or automatically move them - but we can at least find the conflicts. This will allow the Help Desk to contact the end-user and help them relocate the personal account.
                        </p>
                        
                        <h2 id="Creating-App-Registration">
                          Setting up your App Registration
                        </h2>
                        
                        <p>
                          To set this up, we need to head to the <a href="https://portal.azure.com/#blade/Microsoft_AAD_IAM/ActiveDirectoryMenuBlade/RegisteredApps">Azure Portal</a> and create a new <strong>app registration</strong>
                        </p><figure class="wp-block-image size-large image-shadow">
                        
                        <img loading="lazy" width="453" height="291" src="https://sysmansquad.com/wp-content/uploads/2020/11/image-3.png" alt="Navigate to portal.azure.com, search for App Registrations, and select New Registration" class="wp-image-1886" srcset="https:/wp-content/uploads/2020/11/image-3.png 453w, https:/wp-content/uploads/2020/11/image-3-300x193.png 300w, https:/wp-content/uploads/2020/11/image-3-100x64.png 100w" sizes="(max-width: 453px) 100vw, 453px" /></figure> <p>
                          We need a name for the consumers to see if they authorize our test application. I used: <code>ContosoMicrosoftAccountVerifier</code>
                        </p>
                        
                        <p>
                          For supported account types, we cannot use the first three options because they all support tenant/company logins, but the fourth type will serve our purposes.
                        </p><figure class="wp-block-image size-large image-shadow">
                        
                        <img loading="lazy" width="624" height="141" src="https://sysmansquad.com/wp-content/uploads/2020/11/image-4.png" alt="We cannot support account types from regular tenants, and instead only support Personal / Microsoft Accounts" class="wp-image-1887" srcset="https:/wp-content/uploads/2020/11/image-4.png 624w, https:/wp-content/uploads/2020/11/image-4-300x68.png 300w, https:/wp-content/uploads/2020/11/image-4-100x23.png 100w" sizes="(max-width: 624px) 100vw, 624px" /></figure> <p>
                          We do not need a redirect URL for this setup.
                        </p>
                        
                        <p>
                          Next, we need to setup a few aspects of the application, to use for dummy information.
                        </p>
                        
                        <p>
                          Under <strong>API Permissions</strong>, we need to add a permission of some sort for it to request access to. The least amount of permissions was just the <strong>Profile</strong> permission.
                        </p><figure class="wp-block-image size-large image-shadow">
                        
                        <img loading="lazy" width="495" height="149" src="https://sysmansquad.com/wp-content/uploads/2020/11/image-5.png" alt="select the minimum amount of permissions that you can. They should never be signed into anyway " class="wp-image-1888" srcset="https:/wp-content/uploads/2020/11/image-5.png 495w, https:/wp-content/uploads/2020/11/image-5-300x90.png 300w, https:/wp-content/uploads/2020/11/image-5-100x30.png 100w" sizes="(max-width: 495px) 100vw, 495px" /></figure> <p>
                          Even though people should not be logging into our App, we need to setup some sort of Authentication for the App to theoretically use, even though we won't use it.
                        </p>
                        
                        <p>
                          Under <strong>Certificates and Secrets</strong>, I created a New Client Secret. You do not need to save the key values
                        </p><figure class="wp-block-image size-large image-shadow">
                        
                        <img loading="lazy" width="624" height="151" src="https://sysmansquad.com/wp-content/uploads/2020/11/image-6.png" alt="Create a Dummy client secret, for the Microsoft backend. you do not need to keep the key" class="wp-image-1889" srcset="https:/wp-content/uploads/2020/11/image-6.png 624w, https:/wp-content/uploads/2020/11/image-6-300x73.png 300w, https:/wp-content/uploads/2020/11/image-6-100x24.png 100w" sizes="(max-width: 624px) 100vw, 624px" /></figure> <div class="wp-block-group">
                          <div class="wp-block-group__inner-container">
                            <h2 id="Constructing-App-Auth-URL">
                              Constructing our App Authorization URL
                            </h2>
                            
                            <p>
                              Next, we need to gather the information for our authentication URL.
                            </p>
                            
                            <ul>
                              <li>
                                Authentication endpoints
                              </li>
                              <li>
                                Application ID (Client ID in the URL)
                              </li>
                              <li>
                                Email Addresses to check
                              </li>
                              <li>
                                Scope for our API Permissions
                              </li>
                            </ul>
                            
                            <p>
                              We get most of these from our App’s Overview page, from the API Permissions tab, and combine those with some other parameters from the <a href="https://docs.microsoft.com/en-us/azure/active-directory/develop/v2-oauth2-auth-code-flow#request-an-authorization-code" target="_blank" rel="noreferrer noopener">OAuth 2.0 code flow</a> to get a URL similar to the one below
                            </p>
                            
                            <div class="wp-block-group">
                              <div class="wp-block-group__inner-container">
                                <p>
                                  <a href="https://login.microsoftonline.com/consumers/oauth2/v2.0/authorize?client_id=bd53bb89-0cc1-4eb3-90b7-ba008b1f2a2c&scope=user.read&response_type=code&state=23424&login_hint=TinaFey@contoso.one" target="_blank" rel="noreferrer noopener nofollow">https://login.microsoftonline.com/consumers/oauth2/v2.0/authorize?<br />&nbsp; &nbsp; client_id=<strong>bd53bb89-0cc1-4eb3-90b7-ba008b1f2a2c</strong><br />&nbsp; &nbsp; &scope=user.read<br />&nbsp; &nbsp; &response_type=code<br />&nbsp; &nbsp; &state=23424<br />&nbsp; &nbsp; &login_hint=<strong>TinaFey@contoso.one</strong></a>
                                </p>
                                
                                <p>
                                </p>
                              </div>
                            </div>
                            
                            <p>
                              You can test this URL above live for yourself, or use your own app created with the process above. Just adjust the <strong>Client_ID</strong> to match your <strong>Application ID</strong>, and adjust the <strong>login_hint</strong> to match your user
                            </p>
                          </div>
                        </div>
                        
                        <div class="wp-block-group">
                          <div class="wp-block-group__inner-container">
                            <div class="wp-block-columns">
                              <div class="wp-block-column">
                                <h5>
                                  <strong>Valid Microsoft Account</strong>
                                </h5><figure class="wp-block-image image-shadow">
                                
                                <img loading="lazy" width="435" height="314" src="https://sysmansquad.com/wp-content/uploads/2020/11/image-7.png" alt="Providing a Valid Microsoft Account email continues to a Password Prompt" class="wp-image-1890" srcset="https:/wp-content/uploads/2020/11/image-7.png 435w, https:/wp-content/uploads/2020/11/image-7-300x217.png 300w, https:/wp-content/uploads/2020/11/image-7-100x72.png 100w" sizes="(max-width: 435px) 100vw, 435px" /><figcaption>Note: the email address is recognized, and the prompt has switched to “Enter password”</figcaption></figure> 
                                
                                <p>
                                </p>
                              </div>
                              
                              <div class="wp-block-column">
                                <h5>
                                  <strong>No Valid Microsoft Account</strong>
                                </h5><figure class="wp-block-image image-shadow">
                                
                                <img loading="lazy" width="431" height="378" src="https://sysmansquad.com/wp-content/uploads/2020/11/image-8.png" alt="Providing an invalid Microsoft Account email throws a watning that the Microsoft Account does not exists" class="wp-image-1891" srcset="https:/wp-content/uploads/2020/11/image-8.png 431w, https:/wp-content/uploads/2020/11/image-8-300x263.png 300w, https:/wp-content/uploads/2020/11/image-8-100x88.png 100w" sizes="(max-width: 431px) 100vw, 431px" /><figcaption>Note: the email address is not recognized, and the prompt still shows “That Microsoft account doesn’t exist”</figcaption></figure> 
                                
                                <p>
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <div class="wp-block-group">
                          <div class="wp-block-group__inner-container">
                          </div>
                        </div>
                        
                        <div class="wp-block-group">
                          <div class="wp-block-group__inner-container">
                            <h2 id="Scripting-the-process">
                              Scripting the verification Process
                            </h2>
                            
                            <p>
                              Below is a quick script I made to build a list of all the company emails and iterate through checking them.
                            </p>
                            
                            <div class="wp-block-codemirror-blocks-code-block code-block">
                              <pre class="CodeMirror" data-setting="{&quot;mode&quot;:&quot;powershell&quot;,&quot;mime&quot;:&quot;application/x-powershell&quot;,&quot;theme&quot;:&quot;default&quot;,&quot;lineNumbers&quot;:true,&quot;styleActiveLine&quot;:true,&quot;lineWrapping&quot;:true,&quot;readOnly&quot;:false,&quot;fileName&quot;:&quot;FindMicrosoftAccounts.ps1&quot;,&quot;language&quot;:&quot;PowerShell&quot;,&quot;modeName&quot;:&quot;powershell&quot;}">#$emailAddresses = 'tinafey@contoso.one','username@domain.com','ronswanson@contoso.one'
$emailAddresses = Get-EXORecipient -RecipientTypeDetails UserMailbox -PropertySets Minimum | select -ExpandProperty Emailaddresses | where {$_ -match "SMTP:"} | foreach {$_ -replace '^smtp:'} 

$ApplicationID  = 'bd53bb89-0cc1-4eb3-90b7-ba008b1f2a2c'
$scope          = 'user.read'

$results = [System.Collections.ArrayList]::new()
$emailAddresses | foreach -Begin { $i = 1} -Process {
    Write-Progress -Activity 'Checking Email Addresses for Microsoft Accounts' -CurrentOperation ("Checking {0} - {1}/{2}" -f $_,$i,$emailAddresses.Count) -PercentComplete ($i/($emailAddresses.count)*100)
    $UserURL  = 'https://login.microsoftonline.com/consumers/oauth2/v2.0/authorize?client_id={0}&scope={1}&response_type=code&state=23424&login_hint={2}' -f $ApplicationID,$scope,$_
    $response = Invoke-WebRequest -Uri $UserURL 

    $results.Add( 
        [psCustomobject]@{
            EmailAddress = $_
            HasMSAccount = $response -match '"HasPassword":1' 
            Result       = $response.StatusCode
        }
    ) | Out-Null
    $i++
} 
$results
</pre>
                            </div><figure class="wp-block-image size-large">
                            
                            <img loading="lazy" width="435" height="324" src="https://sysmansquad.com/wp-content/uploads/2020/11/image-10.png" alt="" class="wp-image-1944" srcset="https:/wp-content/uploads/2020/11/image-10.png 435w, https:/wp-content/uploads/2020/11/image-10-300x223.png 300w, https:/wp-content/uploads/2020/11/image-10-100x74.png 100w" sizes="(max-width: 435px) 100vw, 435px" /></figure>
                          </div>
                        </div>
                        
                        <div class="wp-block-group">
                          <div class="wp-block-group__inner-container">
                            <h2 id="Sample-User-Consent-Prompt">
                              User Consent Prompt
                            </h2>
                            
                            <p>
                              Our app doesn’t have any server code. We only need to get to the pre-login experience to confirm whether an email address has a Microsoft account associated with it. This means that users don’t need to finish logging in and authorize the app, but if they do finish logging in, they will get a consent prompt like this.
                            </p><figure class="wp-block-image image-shadow">
                            
                            <img loading="lazy" width="422" height="486" src="https://sysmansquad.com/wp-content/uploads/2020/11/image-9.png" alt="If a user does sign into this app fully, they will be prompted to approve the permissions requested earlier" class="wp-image-1892" srcset="https:/wp-content/uploads/2020/11/image-9.png 422w, https:/wp-content/uploads/2020/11/image-9-260x300.png 260w, https:/wp-content/uploads/2020/11/image-9-100x115.png 100w" sizes="(max-width: 422px) 100vw, 422px" /><figcaption>Note: <strong>Unverified</strong> is the default state, but you can verify your tenant to show your company’s name instead. Details <a rel="noreferrer noopener" href="https://go.microsoft.com/fwlink/?linkid=2121525&clcid=0x9" target="_blank">here</a></figcaption></figure>
                          </div>
                        </div>
                        
                        <div class="wp-block-group">
                          <div class="wp-block-group__inner-container">
                            <h2>
                              Wrap up
                            </h2>
                            
                            <p>
                              With this app we made, we can verify whether any email address has a Microsoft account associated with it with an automated method that we can script against.
                            </p>
                            
                            <p>
                              To test any email address manually, just remove the <strong>login_hint</strong> parameter from the URL and you can enter any email address to check it, even without their password.
                            </p>
                            
                            <p>
                              <a href="https://login.microsoftonline.com/consumers/oauth2/v2.0/authorize?client_id=bd53bb89-0cc1-4eb3-90b7-ba008b1f2a2c&scope=user.read&response_type=code&state=23424&login_hint=TinaFey@contoso.one" target="_blank" rel="noreferrer noopener">https://login.microsoftonline.com/consumers/oauth2/v2.0/authorize?<br />&nbsp; &nbsp; client_id=<strong>bd53bb89-0cc1-4eb3-90b7-ba008b1f2a2c</strong><br />&nbsp; &nbsp; &scope=user.read<br />&nbsp; &nbsp; &response_type=code<br />&nbsp; &nbsp; &state=23424<br /></a>
                            </p>
                          </div>
                        </div>
                        
                        <p>
                        </p>

 [1]: https://aka.ms/WinAdmins