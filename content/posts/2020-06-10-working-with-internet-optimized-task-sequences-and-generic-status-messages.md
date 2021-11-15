---
title: Working With Internet-Optimized Task Sequences and Generic Status Messages
author: Ronald Montgomery
type: post
date: 2020-06-10T14:00:00+00:00
url: /2020/06/10/working-with-internet-optimized-task-sequences-and-generic-status-messages/
categories:
  - Endpoint Management

---
For my customer the move to remote work is here to stay. In adjustment to the “New Normal,” deployment projects put on hold these last months are in discussion again. One project resuming soon is the upgrade from Office 2016 to Microsoft 365 Apps. With many laptop computers now internet or VPN-based what can be done to optimize upgrades for these remote users?

To provide background, my customer has recently implemented cloud management gateways and cloud distribution points. Content is available off VPN, but the task sequence is set to download all content before start. Therefore, we try to keep the task sequence as slim as possible since all dependencies (needed or not) are downloaded. The base Microsoft 365 Apps installation package in the task sequence is provided by a global team. We can’t easily make changes to the package or tweak it. Similarly, running PowerShell scripts from the console is tightly controlled.

One set of issues to solve are the uninstallation and upgrades for related Office software. My client uses two configurations of a room scheduling Outlook plug-in application, and 32-bit versions of Project and Visio are installed for many. With a 2.5 GB Microsoft 365 Apps install package, I was reluctant to add more binaries to the task sequence payload that won’t be needed by many computers. To alleviate payload we created a bare bones uninstall package for the Outlook plug-in and reduced those packages from 100 MB to less than 1 MB. The Microsoft 365 Apps upgrade application handles the 32-bit Project and Visio uninstalls.

The next challenge was how to capture the Outlook plug-in, Visio, and Project reinstalls. The task sequence sets boolean variables to capture the presence of each software. My customer has a webservice that can be called to inject these computer resource records into remediation deployment collections, but it’s not accessible to internet-based computers.

I found <a href="https://www.reddit.com/r/SCCM/comments/b19gzw/how_we_used_to_do_it_collecting_client_data_via/" target="_blank" rel="noreferrer noopener">this</a> generic status message article on Reddit and worked through the examples. A way to piggyback off SCCM client communication back to the infrastructure appealed to me. Could it somehow solve my problem with the application reinstalls?

The author explains how to return a generic information status message, with information of your choice in one of the insertion string fields. I created an action in my task sequence to return a string value of **projectInstalled** if 32-bit Project was installed. I use the Project boolean task sequence variable set earlier in the task sequence as a condition for the action.

If the 32-bit Project condition evaluates true the generic status message is sent:<figure class="wp-block-table">

<table>
  <tr>
    <td>
      <strong>%</strong>SYSTEMROOT%\System32\WindowsPowerShell\v1.0\powershell.exe -ExecutionPolicy Bypass -Command " & { $eventObj = New-Object -ComObject Microsoft.SMS.Event -ErrorAction Stop; $eventObj.EventType = \"SMS_GenericStatusMessage_Info\";$eventObj.SetProperty(\"Attribute403\", \"GenericMsg_SeeInsertionStrings\");$eventObj.SetProperty(\"InsertionString1\", \"MsgType_Office365Upgrade\");$eventObj.SetProperty(\"InsertionString2\", \"projectInstalled\");$eventObj.Submit()}" &nbsp;
    </td>
  </tr>
</table></figure> 

(A quick aside: I used a task sequence command line action to run this script. The preferred method is to run a PowerShell script; old dog, new tricks, and all that jazz. Adam Gross has re-written the above code as a robust PowerShell script. The script is available <a href="https://github.com/RonaldMontgomery/SysManSquad/blob/master/New-CustomStatusMessage" target="_blank" rel="noreferrer noopener">here</a>.)

I created similar task sequence actions for 32-bit Visio and the Outlook plug-ins. These actions are executed at the start of the task sequence, when there is the best chance the client will successfully return this information. We originally had this after the Microsoft 365 Apps install reboot and the messages weren’t always successfully sent – the computer was on VPN and didn’t switch to communicating with the CMG, an issue we’re still trying to understand.

When querying status messages on the CAS I saw the generic status messages returned. Now to use that data for remediation.

There are creative ways to use this information. We can programmatically query for these generic status messages, or use Microsoft Flow or a Status Filter Rule, and then call the internal webservice to inject the resource records in the corresponding 64-bit deployment collections. For now, we’ve stayed simple and built remediation collections from the generic status messages.

<a href="https://social.technet.microsoft.com/Forums/en-US/0822d4d9-3033-4344-8cff-c72d89a0db20/how-to-create-collection-based-on-status-message?forum=configmgrgeneral" target="_blank" rel="noreferrer noopener">This</a> Technet forum thread gives the collection query syntax. The WQL query for the 64-bit Project deployment collection is below. Messsage ID **39997** is the generic information status message ID. The first insertion string value of **MsgType_Office365Upgrade** was chosen to separate these messages from future deployment messages.<figure class="wp-block-table">

<table>
  <tr>
    <td>
      <strong>select</strong> SMS_R_SYSTEM.ResourceID,<br />SMS_R_SYSTEM.ResourceType,<br />SMS_R_SYSTEM.Name,<br />SMS_R_SYSTEM.SMSUniqueIdentifier,<br />SMS_R_SYSTEM.ResourceDomainORWorkgroup,<br />SMS_R_SYSTEM.Client <br /><strong>from</strong> sms_R_System&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; <br /><strong>JOIN</strong> sms_statusmessage <strong>ON</strong> sms_R_System.netbios_name0 = sms_statusmessage.machinename&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; <br /><strong>JOIN</strong> sms_StatMsgWithInsStrings <strong>ON</strong> sms_statusmessage.RecordID = sms_StatMsgWithInsStrings.RecordID&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; <br /><strong>WHERE</strong> sms_statusmessage.messageid = "39997"&nbsp;&nbsp;&nbsp;&nbsp; <br /><strong>AND</strong> sms_StatMsgWithInsStrings.InsString1 = "MsgType_Office365Upgrade"&nbsp; <br /><strong>AND</strong> sms_StatMsgWithInsStrings.InsString2 = "projectInstalled" &nbsp;
    </td>
  </tr>
</table></figure> 

Through the use of generic status messages in the Microsoft 365 Apps upgrade task sequence we hope to automate application upgrade/installation for the Outlook plug-in, Visio, and Project users. A second goal is to reduce the task sequence payload for internet-based clients – and keep only one task sequence for all deployment cases.  
Do you do similar work in your environment? Do you have ideas to make this process work better? I’m always trying to learn new ways of working. Please let me know.