---
title: Getting Reboot History and Optimizing Legacy Functions
author: Nic Wendlowsky
type: post
date: 2020-08-28T14:00:00+00:00
url: /2020/08/28/getting-reboot-history-and-optimizing-legacy-functions/
categories:
  - Endpoint Management
  - MECM/MEMCM/SCCM
  - Powershell

---
The other day, I logged on to a jump server and, while investigating an unrelated issue, I noticed the BG Info background showed the Last Reboot as March 1st, 2020. "That can't be right," I thought. "We have weekly maintenance windows to reboot these servers."

As I opened an old stand-by function from my stash (originally posted here: [https://gallery.technet.microsoft.com/scriptcenter/Get-RebootHistory-bc804819](https://gallery.technet.microsoft.com/scriptcenter/Get-RebootHistory-bc804819) in 2015) and ran it, I was a bit annoyed at how SLOW it was. I decide to open the function and was saddened to see that it wasn't even using Get-Event... It was using WMI to comb Event Logs. So, I deviated from my original task and set out fixing it. Here's how:

The first thing I needed to do was identify how to get the same information in a faster manner. Since this function is using `Get-WMIObject` to search Event Logs, we already know improvements can be made with using `Get-EventLog` or `Get-WinEvent`. And we can test each with `Measure-Object` to determine the winner:


```powershell
'Get-WinEvent takes {0} milliseconds to find {1} events' -f (Measure-Command -Expression {
    $Params = @{ 
      FilterHashtable = @{Logname = 'System';ID = "1074","6008","6009"}
    }   
    $Count = (Get-WinEvent @Params).count
}).TotalMilliseconds,$Count
Remove-Variable Params,count

'Get-EventLog takes {0} milliseconds to find {1} events' -f (Measure-Command -Expression {
    $Params = @{ 
      Logname = 'System'
      InstanceId = "2147484722","2147489656","2147489657"
    }   
    $Count = (Get-EventLog @Params).count
}).TotalMilliseconds,$Count
Remove-Variable Params,count

'Get-WMIObject takes {0} milliseconds to find {1} events' -f (Measure-Command -Expression {
    $Params = @{ 
      Class  = 'Win32_NTLogEvent' 
      Filter  = "LogFile = 'System' and EventCode = 6009 or EventCode = 6008 or EventCode = 1074" 
    }    
    $Count = (Get-WmiObject @Params).count
}).TotalMilliseconds,$Count
Remove-Variable Params,count
```


<div class="wp-block-uagb-inline-notice uagb-inline_notice__outer-wrap uagb-inline_notice__align-left uagb-block-1f687e7f">
  <h5 class="uagb-notice-title">
    Note: Get-EventLog InstanceID
  </h5>
  
  <div class="uagb-notice-text">
    <p>
      Even though it's not used in the script, I wanted to point out that <code>Get-EventLog</code>'s InstanceID value does not correspond to the Event ID used in the other cmdlets. I used this [ConvertTo-InstanceID](https://community.idera.com/database-tools/powershell/powertips/b/tips/posts/translate-eventid-to-instanceid) function to get the corresponding InstanceID for each Event ID.
    </p>
  </div>
</div>

Which resulted in the following times:

<div class="wp-block-image">
  <figure class="alignleft size-full is-resized">![Measure cmdlets to search Event Logs](Snag_21a99dae.png)<figcaption>A 99.78% decrease in time!</figcaption></figure>
</div>

Wow, I knew WMI cmdlets were a bit slow, but I didn't expect to see such a drastic improvement by using `Get-WinEvent`. It's safe to say this is how we'll move forward. 

I like the information that `Get-RebootHistory` outputs, so I want to keep the same data while using the more efficient command. Let's dig through the function to find out what we're modifying.

Identify the main, slow command:


```powershell
Try {  
   $d = 0 
   $Events = Get-WmiObject @Params 
   
   ForEach ($Event In $Events) {..}
```


And Since it's using splatting, we need to find the variable holding the values:


```powershell
# Arguments to be passed to our WMI call.  
$Params = @{ 
   ErrorAction  = 'Stop' 
   ComputerName = $Computer 
   Credential   = $Credential 
   Class        = 'Win32_NTLogEvent' 
   Filter       = "LogFile = 'System' and EventCode = 6009 or EventCode = 6008 or EventCode = 1074" 
} 
```


Now we need to replace `Get-WMIObject` with `Get-WinEvent` and compare the outputs. Referencing good ol' [Dr. Scripto's blog on the FilterHashtable param](https://devblogs.microsoft.com/scripting/use-filterhashtable-to-filter-event-log-with-powershell/), we replace the WMI splat and the `$Events` line with:


```powershell
$Params = @{ 
            ErrorAction  = 'Stop' 
            ComputerName = $Computer 
            Credential   = $Credential 
            FilterHashtable = @{Logname = 'System';ID = "1074","6008","6009"}
        }
..
$Events = Get-WinEvent @Params
```


Next we'll need to verify the integrity of this `Switch` statement


```powershell
# Record the relevant details for the shutdown event. 
Switch ($Event.EventCode) {
   6009 { $BootHistory += (Get-Date(([WMI]'').ConvertToDateTime($Event.TimeGenerated)) -Format g)}
   6008 { $UnexpectedShutdowns += ('{0} {1}' -f ($Event.InsertionStrings[1], $Event.InsertionStrings[0]))}
   1074 { $ShutdownDetail += $Event }
}
```


Testing the output of our new `$Events` variable, we see the properties of the first element do not have the same property names. Most are easy enough to match up, save for the `InsertionStrings` property  
![Event property compare](Snag_2180a815.png)  
For the `InsertionStrings` property, I just went exploring and tried this, which had the corresponding values:  
![6008 properties](Snag_2184b929.png)  
and led to the new Switch statement:


```powershell
# Record the relevant details for the shutdown event. 
Switch ($Event.Id) {  
   6009 { $BootHistory += $Event.TimeCreated | Get-Date -Format g } 
   6008 { $UnexpectedShutdowns += ('{0} {1}' -f ($Event.Properties[1].Value, $Event.Properties[0].Value)) } 
   1074 { $ShutdownDetail += $Event } 
} 
```


Finally, we validate the `$ShutdownDetail` values:


```powershell
# Grab details about the last clean shutdown and generate our return object. 
$ShutdownDetail | Select -First 1 | ForEach-Object {  
  New-Object -TypeName PSObject -Property @{ 
    Computer = $Computer 
    BootHistory = $BootHistory  
    RecentUnexpected = $RecentUnexpected 
    LastShutdownUser = $_.InsertionStrings[6] 
    UnexpectedShutdowns = $UnexpectedShutdowns 
    LastShutdownProcess = $_.InsertionStrings[0] 
    PercentDirty = '{0:P0}' -f (($UnexpectedShutdowns.Count/$BootHistory.Count)) 
    LastShutdownType = (Get-Culture).TextInfo.ToTitleCase($_.InsertionStrings[4]) 
    LastShutdown = (Get-Date(([WMI]'').ConvertToDateTime($_.TimeGenerated)) -Format g) 
    RecentShutdowns = ($BootHistory | ? { ((Get-Date)-(Get-Date $_)).TotalDays -le 30 }).Count 
    LastShutdownReason = 'Reason Code: {0}, Reason: {1}' -f ($_.InsertionStrings[3], $_.InsertionStrings[2]) 
  } | Select $BootInformation     
}   
```


Once again, there are values to modify by comparing the output of the WMI event object to the new object, but I came across one property that didn't translate well, the `LastShutdownUser` property. With WMI, the readable User Name was placed in the `$Events[0].InsertionStrings` property, but `Get-WinEvent` provides just the SID. I put together a quick CIM function to grab the User name:


```powershell
FUNCTION Get-UserFromRegistry{
  PARAM(
    $SID
  )
    $ProfileList = Get-CimInstance -ClassName win32_userprofile | Select-Object @{L="User";E={($_.localpath -split '\\')[-1]}},*
    try
    {
      $ProfileList | Where-Object {$_.SID -eq $SID} | select User,SID,LocalPath
    }
    catch
    {
      "Error was $_"
      $line = $_.InvocationInfo.ScriptLineNumber
      "Error was in Line $line"
    }
}
```


Now I can call that function for the `LastShutdownUser` property and replicate the output from the original `Get-RebootHistory` function in the output object.  
Additionally, we can once again replace the `InsertionStrings` and simplify the `LastShutdownUser`, `LastShutdownProcess`, `LastShutdown`, and `LastShutdownReason` since `Get-WinEvent` also provides more readily readable values:


```powershell
# Grab details about the last clean shutdown and generate our return object. 
$ShutdownDetail | Select -First 1 | ForEach-Object {  
  New-Object -TypeName PSObject -Property @{
    Computer = $_.MachineName 
    BootHistory = $BootHistory  
    RecentUnexpected = $RecentUnexpected 
    LastShutdownUser = (Get-UserFromRegistry -SID $_.UserId).User
    UnexpectedShutdowns = $UnexpectedShutdowns 
    LastShutdownProcess = $_.Properties[0].Value
    PercentDirty = '{0:P0}' -f (($UnexpectedShutdowns.Count/$BootHistory.Count)) 
    LastShutdownType = (Get-Culture).TextInfo.ToTitleCase($_.Properties[4].Value)
    LastShutdown = ($_.TimeCreated | Get-Date -Format g)
    RecentShutdowns = ($BootHistory | ? { ((Get-Date)-(Get-Date $_)).TotalDays -le 30 }).Count 
    LastShutdownReason = 'Reason Code: {0}, Reason: {1}' -f ($_.Properties[3].Value, $_.Properties[2].Value) 
  } | Select $BootInformation     
}
```


All of that leads to the finished product, which I've put in a gist on GitHub.  
Enjoy!

[https://gist.github.com/hkystar35/12b5f54401edfb9077346da7fe938e4e](https://gist.github.com/hkystar35/12b5f54401edfb9077346da7fe938e4e)

