---
title: Create Windows 10 Kiosk Environment
author: AshMT
type: post
date: 2020-06-16T14:00:00+00:00
url: /2020/06/16/create-windows-10-kiosk-environment/
categories:
  - Endpoint Management

---
Recently I had case where a we had to deploy computers that required Kiosk mode. Trouble was, I couldn't run Windows Kiosk mode for the auto start of the application I wanted the Kiosk users to operate.  
  
I discovered these registry settings to allow me to functionally create a Kiosk environment.

These registry edits will result in the following:

  * Any time the user logs into this computer. The chosen application will launch.
  * The taskbar will be hidden
  * Ctrl+Alt+Del wont work once the user is logged in (If you opt in for that registry edit.)
  * The user will login automatically when the computer turns on (If you opt in for that registry edit.)

First enter Registry Editor:  
Win+R<figure class="wp-block-image size-large is-resized">

<img loading="lazy" src="https://www.sysmansquad.com/wp-content/uploads/2020/05/image-8.png" alt="" class="wp-image-1126" width="273" height="140" srcset="https:/wp-content/uploads/2020/05/image-8.png 396w, https:/wp-content/uploads/2020/05/image-8-300x154.png 300w, https:/wp-content/uploads/2020/05/image-8-100x51.png 100w" sizes="(max-width: 273px) 100vw, 273px" /> </figure> 



<pre class="wp-block-code"><code># Add startup application:

    [HKEY_CURRENT_USER\Software\Microsoft\Windows\CurrentVersion\Policies\System]
    "Shell"="C:\\full\\path\\to\\your\\application.exe>"

# Autologin for kiosk user (Optional):
  
    [HKEY_LOCAL_MACHINE\Software\Microsoft\Windows NT\CurrentVersion\Winlogon] 
    "AutoAdminLogon"="1"
    "ForceAutoLogon"="1"
    "DefaultUserName"="kiosk"
    "DefaultDomainName"="&lt;place here pc hostname>"
    "DefaultPassword"=""

# If you need to disable Ctrl+Alt+Del

    Computer\HKEY_CURRENT_USER\Software\Microsoft\Windows\CurrentVersion\Policies\System
     ## the registry key "System" may not exist. In that situation just create       a new key called System.
    "DisableTaskMgr "="1"</code></pre><figure class="wp-block-image size-large">

<img loading="lazy" width="1024" height="556" src="https://www.sysmansquad.com/wp-content/uploads/2020/06/image-10-1024x556.png" alt="" class="wp-image-1394" srcset="https:/wp-content/uploads/2020/06/image-10-1024x556.png 1024w, https:/wp-content/uploads/2020/06/image-10-300x163.png 300w, https:/wp-content/uploads/2020/06/image-10-768x417.png 768w, https:/wp-content/uploads/2020/06/image-10-100x54.png 100w, https:/wp-content/uploads/2020/06/image-10-855x464.png 855w, https:/wp-content/uploads/2020/06/image-10.png 1075w" sizes="(max-width: 1024px) 100vw, 1024px" /> </figure> 

  
  
I also suggest downgrading that user to a "Standard User" so they can't make changes to the computer without admin privileges.  
<figure class="wp-block-image size-large">

<img loading="lazy" width="461" height="261" src="https://www.sysmansquad.com/wp-content/uploads/2020/05/image-9.png" alt="" class="wp-image-1127" srcset="https:/wp-content/uploads/2020/05/image-9.png 461w, https:/wp-content/uploads/2020/05/image-9-300x170.png 300w, https:/wp-content/uploads/2020/05/image-9-100x57.png 100w" sizes="(max-width: 461px) 100vw, 461px" /> </figure> 

Using these simple Registry settings you will be up and running with a Kiosk that runs any application you need as well as locking down the interface of the Windows 10 computer.