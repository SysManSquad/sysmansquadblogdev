---
title: 'NET-102: Build your lab'
author: Aaron
type: post
date: 2020-01-23T07:13:45+00:00
url: /2021/01/23/net-102-build-your-lab/
categories:
  - How-To
  - Networking
  - Powershell
  - Windows

---
Welcome back! We're now going to move on to the actual effort it takes to build your lab. As you recall we got pretty far last time in documenting the beginnings of our network. For this lab I'll be using [VMWare Workstation](https://www.vmware.com/products/workstation-pro.html), but you can accomplish this with [Microsoft Hyper-V](https://docs.microsoft.com/en-us/virtualization/hyper-v-on-windows/about/), [Oracle VirtualBox](https://www.virtualbox.org/), the free tier of [VMWare's ESX](https://www.vmware.com/products/vsphere.html), or [XCP-NG](https://xcp-ng.org/).

If you haven't read the previous post, please have a look [here](https://sysmansquad.com/2019/12/17/net-101-create-a-basic-lab-network-design/) as each post builds upon the last.

I'm not going to cover a lot of the implementation details of any particular hypervisor other than as a general concept. You can view manuals for most hypervisors and find a ton of tutorials for how to create a VM.
                    
## A Note About Pinging
                    
                    <p>
                      You might find yourself wanting to ping things to verify that you have your IP settings correct. In this article, the only thing you'll be able to ping is the default gateway. By default the Windows Firewall rules consider any network they're on as a 'public' network for purposes of the firewall. Just leave all that alone for now, and we'll make some changes later. For now, just ping the gateway
                    </p>
                    
                    ## Documentation
                    
                    
                    <p>
                      In a previous revision of the last article I made 2 mistakes : I picked 'my.example' as our DNS name. Windows DNS rejects this name as not allowed, for it's own reasons. The error message was pretty useless if I'm honest, but it doesn't really matter. We're going to proceed with "lab.test" instead. Since we haven't actually implemented anything yet, now is the time to fix the mistake.
                    </p>
                    
                    <p>
                      It also appears that most DHCP servers won't do a scope smaller than a /64 for IPv6, including Windows DHCP. We will adjust our subnet to a /64 as a result.
                    </p>
                    
                    <p>
                      It's time to upgrade our documentation.
                    </p><figure class="wp-block-table is-style-stripes">
|Item|Value|
|------|-------|
| Subnet ID | IPv4: **10.248.100.0/24** |
|           | IPv6: **fdda:f6d4:f5a2:f1e6::/64** |
| Default Gateway | IPv4: **10.248.100.1/24** |
|                 | IPv6: **fdda:f6d4:f5a2:f1e6::1/64** |
| DNS Server | Hostname: **lab-dns** |
|            | IPv4: **10.248.100.2/24** |
|            | IPv6: **fdda:f6d4:f5a2:f1e6::2/64** |
| DNS Domain | **lab.test.** |
| DHCP Server | Hostname: **lab-dhcp** |
|             | IPv4:**10.248.100.3/24** |
|             | IPv6:**fdda:f6d4:f5a2:f1e6::3/64** |
| DHCP Range | **10.248.100.[50-99]/24** |
|            | **fdda:f6d4:f5a2:f1e6::[32-*]/64** |
| VLAN ID | **77** |
                    </figure> 
                    
                    ## The Admin Workstation
                    
                    
                    <p>
                      You're going to need a machine to use to work from inside your lab network and reach the management address of your gateway/firewall.
                    </p>
                    
                    <p>
                      Install a Windows 10 VM to use as your admin workstation. Let's say that you're using an evaluation copy from the [evaluation center](https://www.microsoft.com/en-us/evalcenter/evaluate-windows-10-enterprise), which will function for 90 days. Place it on the lab network, and if you'd like to RDP to it, give it an adapter on the parent network as well.
                    </p>
                    
                    <p class="has-background has-very-light-gray-background-color">
                      NOTE: Your local account on the admin workstation will need a password if you intend to use remote desktop to connect, and also as basic security hygiene.
                    </p>
                    
                    <p>
                      You'll want to choose Windows over Linux for this workstation because we'll be using PowerShell with domain membership to manage most of this network. You're welcome to try to replicate the roles of these machines in Linux if you want to do it that way, but we're not covering how to do that. For most of these network roles, it only matters that they exist and doesn't matter so much which OS runs the software to do it. If you give up Windows for these roles, you have to move them somewhere else, and the software we'll use for the default gateway can handle it if you're low on RAM in your hypervisor.
                    </p>
                    
                    <p>
                      Install your workstation and document the IP address(es). Since nothing else is up and running in this network, you'll need to set the addresses by hand. Choose addresses not already allocated to something else, and located outside of your DHCP range. Remember that IPv6 addresses are addressed in hexadecimal, not decimal. Numbers range from 0-9, followed by a-f before you move to what would be the tens column in normal numbering.
                    </p>
                    
                    <p>
                      If you're not sure, open the Windows Calculator, switch to the programmer view and type the number you'd like to use and you'll see a **HEX**adecimal, **DEC**imal, **OCT**al and **BIN**ary notation version of the number. It also includes a bit-toggling keypad you can use to get a better feel for how binary math works.
                    </p>
                    
                    <p>
                      For our purposes, we will use the following addresses for the IN LAB network interface:
                    </p>
                    
                    <p>
                      **IPv4**: <br />10.248.100.10 <br />**Netmask** 255.255.255.0 ( this is equivalent to /24 )<br />Fill in the **Gateway**, **DNS server **address from your network documentation you've created last time.<br /><br />**IPv6**: fdda:f6d4:f5a2:f1e6::a/64 <br />Fill in the **subnet prefix length**, **default gateway**, and **DNS server** from your documentation.<br /><br />The parent network interface will be set for DHCP.
                    </p>
                    
                    <p>
                      After setting your addresses, if you open a terminal (either **cmd** or **PowerShell**) and run <code>ipconfig</code>, you will see that you have 2 IPv6 addresses and 1 IPv4 address on the listing. One of these IPv6 addresses is the one you set, the other is called a link-local address. Please consult the links to documentation on IPv6 address types from the last article if you'd like to know why.
                    </p>
                    
                    ## The Default Gateway
                    
                    
                    <p>
                      We touched on what this is and what it does last time, so you know that this will serve as the default gateway for the network. It is also the firewall and IPv4 NAT appliance. Grab the latest [PFSense ](https://www.pfsense.org/download/)ISO and install a VM with ~2048MB RAM and two ethernet interfaces. The first will be the parent network, in this case your home or business network, the second will be the in-lab network. Consult the pfsense documentation for installing and setting the IP addresses you've chosen for the in-lab interface. The parent network interface should be set to DHCP.
                    </p>
                    
                    <p>
                      For now the only setting you need to set on the gateway is it's IPv4 and IPv6 addresses, aside from setting a new default password for the admin account.
                    </p>
                    
                    ## The DNS Server
                    
                    
                    <p>
                      For fun, we're going to use a Windows Core install for this machine. Why a core install? Because there are no buttons to push. It is all command line on the server itself, and the configuration is done either via shell commands, PowerShell, or Remote Management Tools.
                    </p>
                    
                    <p>
                      Create a VM with ~2048MB RAM and a minimum 60GB disk space. You likely won't need all of it but these are pretty standard requirements for a Windows Core install.
                    </p>
                    
                    <p>
                      Insert the Windows Server 2019 ISO and run the setup routine, for our purposes we're using "Windows Server 2019 Standard" which is the core install, instead of "Windows Server 2019 Standard (Desktop Experience)" which is what you would pick if you wanted the normal experience you're used to.
                    </p>
                    
                    <p>
                      When the OS is installed and booted for the first time you'll be prompted to set a password for the local administrator. This is the first built-in account for the machine that you will use until you've created another administrative account, then you may choose to disable this one.
                    </p>
                    
                    <p>
                      Now that you have a good login for this machine, you'll be sitting at a command window. You'll do the initial configuration by running the command <code>sconfig</code>
                    </p>
                    
                    ### Initial Configuration
                    
                    
                    <p>
                      Run the <code>sconfig</code> command and choose option 2 to set the hostname or "Computer Name" of this machine. We didn't cover what the hostnames are for these machines when we were creating our documentation, so we're going to set them and add them to the documentation now. I'm going to name the DNS server "**lab-dns**", so it's FQDN (Fully Qualified Domain Name) is "lab-dns.lab.test". Set the computer name to your chosen short name and we'll cover the rest a bit later. When you've set the computer name, you'll be prompted to restart. You don't need to do this quite yet.
                    </p>
                    
                    <p>
                      You should also set the Windows update settings. I have set mine for full automatic.
                    </p>
                    
                    <p>
                      You may also choose to enable remote desktop while you are in **sconfig**. It'll be the same command line interface you have now, but it may come in handy if you need to paste a command. You'll want to choose the recommended option to require Network Level Authentication.
                    </p>
                    
                    <p>
                      You will now choose the option to set your network settings. This machine should only have the 1 network interface on your lab network. Choose the only interface and set the IPv4 network adapter address. Remember that a /24 subnet mask is equivalent to '255.255.255.0'.
                    </p>
                    
                    <p class="has-background has-very-light-gray-background-color">
                      NOTE: **sconfig** only handles IPv4 addressing. We will cover setting the IPv6 address a bit later.
                    </p>
                    
                    <p>
                      You can also quickly set the time zone, but finish off by restarting the computer for the new name to take effect.
                    </p>
                    
                    <p>
                      Now that you're restarted, log back in and run the **hostname** command to make sure the short computer name is correct. If you're using my settings, the hostname will be 'lab-dns'. You can also run the **ipconfig** command and make sure the IPv4 address is what you expected.
                    </p>
                    
                    <p>
                      You'll notice that the connection-specific DNS suffix is 'localdomain', and there will be a **link-local** ipv6 address present, even though you didn't set one. This is normal.
                    </p>
                    
                    <p>
                      At this point you might want to use your admin workstation to RDP to your lab-dns server in case you want to paste some commands. I'd suggest adjusting the display settings for your connection to the DNS server to no more than 800x600 so you can still see your other windows and maybe your browser in case you need to copy/paste. There isn't much point in having a huge connection just to host a command window.
                    </p>
                    
                    <p>
                      Now, we need to finish configuring our network addressing since we have a working IPv4 RDP connection. Let's open **powershell**. Simply type **powershell** at the command prompt.
                    </p>
                    
                    <p>
                      Here are some commands we'll need to type to get a working IPv6 config as well as finishing out some commands **sconfig** couldn't handle. I would suggest pasting this code block into a notepad (or better yet, VSCode) session on your admin workstation, editing, then pasting it into a powershell session you have running over RDP.
                    </p>
                    
                    <pre class="wp-block-code"><code># Change these to match the config in your documentation
$IPv6Address='fdda:f6d4:f5a2:f1e6::2'
$IPv6PrefixLength='64'
$IPv6Gateway='fdda:f6d4:f5a2:f1e6::1'
$IPv4Gateway='10.248.100.1'
$FQDN='lab.test'

# These bits will be gathered by powershell
# Get information about the only network adapter (or the first network adapter if you have more than one), save it in a variable.
$Adapter=(Get-NetAdapter)[0]
Set-DnsClient -InterfaceIndex $Adapter.ifIndex -ConnectionSpecificSuffix $FQDN
# Figure out what the already-set IPv4 address is of this machine.
$IPv4Address=(Get-NetIPAddress -ifIndex $Adapter.ifIndex -AddressFamily IPv4).IPAddress
# The DNS server should use itself first, then the default gateway:
$DnsServerAddresses=($IPv4Address,$IPv4Gateway,$IPv6Address,$IPv6Gateway)

# Set DHCP to disabled
Set-NetIPInterface -Dhcp Disabled -InterfaceIndex $Adapter.ifIndex
# Set our DNS client settings to the list we decided on earlier:
Set-DnsClientServerAddress -InterfaceIndex $Adapter.ifIndex -ServerAddresses $DnsServerAddresses
# We now build a hash with key = values and save it to a variable. This is called 'splatting'
$IPv6Arguments =@{
    InterfaceIndex = $Adapter.ifIndex
    PrefixLength = $IPv6PrefixLength
    IPAddress = $IPv6Address
    DefaultGateway = $IPv6Gateway
    AddressFamily = 'IPv6'
    Type = 'Unicast'
}
# Now we create the IP address using the hash table we created earlier. 
# Otherwise we would have to have one very long line that is hard to read through.
New-NetIPAddress @IPv6Arguments

</code></pre>
                    
                    <p>
                      Whew. That's a lot to read. If you're not familiar with powershell, the lines beginning with '#' are comments. They are there to give you an idea of what's happening even if you don't understand the code.
                    </p>
                    
                    ### Installing & Configuring DNS server role
                    
                    
                    <p>
                      Once again in powershell:
                    </p>
                    
                    <pre class="wp-block-code"><code># Install the DNS server feature
Install-WindowsFeature DNS
# Install the remote dns tools
Install-WindowsFeature RSAT-DNS-Server
</code></pre>
                    
                    <p>
                      You'd think it might be a little more difficult than that, but no. We'll move right along into configuring the role. In powershell:
                    </p>
                    
                    <pre class="wp-block-code"><code># Define the FQDN of your zone
$ZoneFQDN='lab.test'
$IPv4NetworkID='10.248.100.0/24'
$IPv6NetworkID='fdda:f6d4:f5a2:f1e6::/120'
$IPv4ReverseName='100.248.10.in-addr.arpa.dns'
$IPv6ReverseName='0.0.0.0.0.0.0.0.0.0.0.0.0.0.6.e.1.f.2.a.5.f.4.d.6.f.a.d.d.f.ip6.arpa.dns'

# Add the zone main forward zone
Add-DnsServerPrimaryZone -Name $ZoneFQDN -ZoneFile "$ZoneFQDN.dns" -ComputerName $env:COMPUTERNAME
# Add the appropriate reverse zones
Add-DnsServerPrimaryZone -NetworkId $IPv4NetworkID -ZoneFile $IPv4ReverseName
Add-DnsServerPrimaryZone -NetworkId $IPv6NetworkID -ZoneFile $IPv6ReverseName
</code></pre>
                    
                    <p>
                      Again, pretty simple. No fancy or difficult-to-read powershell here. Let's check our work:
                    </p>
                    
                    <pre class="wp-block-code"><code>PS C:\Users\Administrator> Get-DnsServerZone|select ZoneName
ZoneName
--------
0.0.0.0.0.0.0.0.0.0.0.0.0.0.6.e.1.f.2.a.5.f.4.d.6.f.a.d.d.f.ip6.arpa
0.in-addr.arpa
100.248.10.in-addr.arpa
127.in-addr.arpa
255.in-addr.arpa
lab.test

PS C:\Users\Administrator> Get-ChildItem C:\Windows\System32\dns\

    Directory: C:\Windows\System32\dns

Mode                LastWriteTime         Length Name
----                -------------         ------ ----
d-----       12/26/2019   7:25 PM                backup
d-----       12/26/2019   6:58 PM                samples
-a----       12/26/2019   8:58 PM            632 0.0.0.0.0.0.0.0.0.0.0.0.0.0.6.e.1.f.2.a.5.f.4
                                                 .d.6.f.a.d.d.f.ip6.arpa.dns
-a----       12/26/2019   8:58 PM            538 0.3.10.in-addr.arpa.dns
-a----       12/26/2019   6:58 PM           3864 CACHE.DNS
-a----       12/26/2019   7:25 PM              0 dns.log
-a----       12/26/2019   8:48 PM            513 lab.test.dns


PS C:\Users\Administrator> Get-DnsServerResourceRecord -ZoneName lab.test|select Hostname,RecordType,RecordData

Hostname RecordType RecordData
-------- ---------- ----------
@        NS         DnsServerResourceRecordNS
@        SOA        DnsServerResourceRecordSoa</code></pre>
                    
                    <p>
                      Neat, now we have an empty zone. The only records that currently exist are the required records for a zone to exist at all, the NS and SOA records. Now let's add some records based on our documentation.
                    </p>
                    
                    <pre class="wp-block-code"><code>$ZoneName='lab.test'
$DNSServer=$env:COMPUTERNAME

# Most of this will be repetitive, and some will simply be for exposition.
Add-DnsServerResourceRecord -ZoneName $ZoneName -Passthru -A -Name 'gateway' -ipv4address '10.248.100.1' -CreatePtr -ComputerName $DNSServer
Add-DnsServerResourceRecord -ZoneName $ZoneName -Passthru -A -Name 'lab-dns' -ipv4address '10.248.100.2' -CreatePtr -ComputerName $DNSServer
Add-DnsServerResourceRecord -ZoneName $ZoneName -Passthru -A -Name 'lab-dhcp' -ipv4address '10.248.100.3' -CreatePtr -ComputerName $DNSServer

Add-DnsServerResourceRecord -ZoneName $ZoneName -Passthru -AAAA -Name 'gateway' -ipv6address 'fdda:f6d4:f5a2:f1e6::1' -CreatePtr -ComputerName $DNSServer
Add-DnsServerResourceRecord -ZoneName $ZoneName -Passthru -AAAA -Name 'lab-dns' -ipv6address 'fdda:f6d4:f5a2:f1e6::2' -CreatePtr -ComputerName $DNSServer
Add-DnsServerResourceRecord -ZoneName $ZoneName -Passthru -AAAA -Name 'lab-dhcp' -ipv6address 'fdda:f6d4:f5a2:f1e6::3' -CreatePtr -ComputerName $DNSServer
</code></pre>
                    
                    <p class="has-background has-very-light-gray-background-color">
                      What is the difference between an 'A' record and an 'AAAA' record? At the simplest level, they are both a type of DNS record that specify a normal mapping from a DNS name to an IP address. A records contain IPv4 addresses, and AAAA records contain IPv6 addresses. You can have multiple A or AAAA records that point to more than one IP address, and the DNS server will round-robin rotate through them. This gives a free amount of load balancing but it isn't appropriate if you're trying to balance a heavily used service by utilization. For more information and to see some more detailed and pedantic information on the types of DNS records there are, see [this IANA reference page.](https://www.iana.org/assignments/dns-parameters/dns-parameters.xhtml#dns-parameters-4)
                    </p>
                    
                    <p>
                      So - Why did we create three zones? The first - 'lab.test' is a **forward** lookup zone. The ones tied to the network IDs are **reverse** zones. They enable you to look up an IP address and see what its hostname is. Records tying an IP address to a hostname are called **PTR**, or pointer records. That is why we created the reverse zones up front, then had powershell add the pointer records at the same time as the A or AAAA records by tacking on the '-CreatePtr' flag to the Add-DnsServerResourceRecord cmdlet.
                    </p>
                    
                    <p>
                      Having done this work, you can re-run the Get-DnsServerResourceRecord cmdlet in powershell as outlined in the example above to verify the results.
                    </p>
                    
                    <p>
                      Neat. Now we have a functioning DNS server. You can close your connection to the DNS server now.
                    </p>
                    
                    ## The DHCP Server
                    
                    
                    ### Initial Config
                    
                    
                    <p>
                      By now you've installed a Windows Server OS at least once, so create a vm with ~2048MB ram and a minimum 60gb disk space. You'll also want a core install on this machine.
                    </p>
                    
                    <p>
                      I'm going to name it **lab-dhcp** and apply the same configuration steps for **sconfig **as we did for the DNS server.
                    </p>
                    
                    <p>
                      When you are in **sconfig**, configure the DNS server settings to use the DNS server address for your lab.
                    </p>
                    
                    <p>
                      Restart after setting everything you need to do, log in and open powershell again. This script is modified from the one we used for the DNS server, so don't mix them up.
                    </p>
                    
                    <pre class="wp-block-code"><code># Change these to match the config in your documentation
$IPv6Address='fdda:f6d4:f5a2:f1e6::3'
$IPv6PrefixLength='64'
$IPv6Gateway='fdda:f6d4:f5a2:f1e6::1'
$IPv6DNSServer='fdda:f6d4:f5a2:f1e6::2'
$IPv4Gateway='10.248.100.1'
$IPv4DNSServer='10.248.100.2'
$FQDN='lab.test'

# Use our DNS server, then fall back to the gateway if the DNS server is offline
$DnsServerAddresses=($IPv4DNSServer,$IPv4Gateway,$IPv6DNSServer,$IPv6Gateway)

# Get the adapter 
$Adapter=(Get-NetAdapter)[0]
Set-DnsClient -InterfaceIndex $Adapter.ifIndex -ConnectionSpecificSuffix $FQDN
# turn off DHCP
Set-NetIPInterface -Dhcp Disabled -InterfaceIndex $Adapter.ifIndex
# configure DNS client
Set-DnsClientServerAddress -InterfaceIndex $Adapter.ifIndex -ServerAddresses $DnsServerAddresses

# Create the IPv6 config, create the address
$IPv6Arguments =@{
    InterfaceIndex = $Adapter.ifIndex
    PrefixLength = $IPv6PrefixLength
    IPAddress = $IPv6Address
    DefaultGateway = $IPv6Gateway
    AddressFamily = 'IPv6'
    Type = 'Unicast'
}
New-NetIPAddress @IPv6Arguments
</code></pre>
                    
                    ### Installing & Configuring the DHCP role
                    
                    
                    <p>
                      In powershell on the DHCP server:
                    </p>
                    
                    <pre class="wp-block-code"><code>Install-WindowsFeature -Name 'DHCP' –IncludeManagementTools
Install-WindowsFeature -Name 'RSAT-DHCP'</code></pre>
                    
                    <p>
                      As before, super simple command to make something a DHCP server. Windows will quickly install the relevant services. Now it's time to add scopes.
                    </p>
                    
                    <p>
                      ADHCPserver'sjobistoconfiguretheclientssoyoudon'thavetomanuallysetupeachindividualhost.WewillsetseveralsettingsfortheDHCPservertotellclientsabout.Somewillbeonascope,someataserverlevel.
                    </p>
                    
                    <p>
                      In powershell:
                    </p>
                    
                    <pre class="wp-block-code"><code>

# Server Scope Options
$Server4Values=@{
    DnsServer = '10.248.100.2'
    DnsDomain = 'lab.test'
}
Set-DhcpServerv4OptionValue @Server4Values

$Server6Values=@{
    DnsServer = 'fdda:f6d4:f5a2:f1e6::2'
    DomainSearchList = 'lab.test'
}
Set-DhcpServerv6OptionValue @Server6Values

# DHCP v4 has the concept of a start and end range inside a subnet. 
$V4ScopeID='10.248.100.0'
$IPv4Router='10.248.100.1'

$V4Scope=@{
    Name = 'Lab Subnet'
    StartRange = '10.248.100.50'
    EndRange = '10.248.100.99'
    SubnetMask = '255.255.255.0'
}
Add-DhcpServerv4Scope @V4Scope

Set-DhcpServerv4OptionValue -ScopeId $V4ScopeID -Router $IPv4Router

# DHCPv6 expects you to exclude any addresses you intend to use statically, instead of specifying the range.
#$V6ScopeID='10.248.100.0'
$V6Scope=@{
    Name = 'Lab V6 Subnet'
    Prefix = 'fdda:f6d4:f5a2:f1e6::'
}
Add-DhcpServerv6Scope @V6Scope

$V6ExclusionRange=@{
    StartRange = 'fdda:f6d4:f5a2:f1e6::1'
    EndRange = 'fdda:f6d4:f5a2:f1e6::31'
    Prefix = 'fdda:f6d4:f5a2:f1e6::'
}
Add-DhcpServerv6ExclusionRange @V6ExclusionRange

# We're not setting a router address - IPv6 includes an automatic address all routers listen on. Also router advertisements are a thing.</code></pre>
                    
                    ## Conclusion & Testing
                    
                    
                    <p>
                      At this point, install some workstation class OS on a new vm and see whether you get a usable workstation out of the box without configuring any IP addressing. Try resolving some DNS names and see if they resolve properly. Be sure and check both A and AAAA records, as well as browsing the internet. At this point your workstation should be fully functional.
                    </p>
                    
                    <p>
                      Next article we'll cover layering in identity management in the form of Active Directory.
                    </p>

