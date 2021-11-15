---
title: Use the Task Sequence deployment type to deploy an application with sensitive information
author: Michael De Bona
type: post
date: 2020-09-27T10:40:58+00:00
url: /2020/09/27/use-the-task-sequence-deployment-type-to-deploy-an-application-with-sensitive-information/
categories:
  - MECM/MEMCM/SCCM
  - Task Sequence

---
<div class="wp-block-uagb-table-of-contents uagb-toc\_\_align-left uagb-toc\_\_columns-1 uagb-block-47f39ccb " data-scroll= "1" data-offset= "30" data-delay= "800" > 

<div class="uagb-toc__wrap">
  <div class="uagb-toc__title-wrap">
    <div class="uagb-toc__title">
      Table Of Contents
    </div>
  </div>
  
  <div class="uagb-toc__list-wrap">
    <ol class="uagb-toc__list">
      <li class="uagb-toc__list">
        <a href="#introduction">Introduction</a><li class="uagb-toc__list">
          <a href="#prerequisites-and-limitations">Prerequisites and limitations</a><li class="uagb-toc__list">
            <a href="#how-to-create-an-application-with-a-task-sequence-deployment-type">How to create an application with a Task Sequence deployment type</a><li class="uagb-toc__list">
              <a href="#use-case-installation-of-the-microsoft-monitoring-agent-to-report-to-microsoft-defender-atp">Use case: installation of the Microsoft Monitoring Agent to report to Microsoft Defender ATP</a><li class="uagb-toc__list">
                <a href="#conclusion">Conclusion</a></ol> </div> </div> </div> <h2>
                  Introduction
                </h2>
                
                <p class="has-text-align-justify">
                  <a aria-label="undefined (opens in a new tab)" rel="noreferrer noopener" href="https://docs.microsoft.com/en-us/mem/configmgr/core/plan-design/changes/whats-new-in-version-2002#task-sequence-as-an-app-model-deployment-type" target="_blank">Introduced with ConfigMgr 2002</a>, the "<strong>Task Sequence as an application deployment type</strong>" feature is available in pre-release. That means it is still in active development and can contains bugs. Using a Task Sequence (TS) as a deployment type allows for more complex installation process that can even contains reboot. And as it is a Task Sequence, you can also benefit from many other feature like the use of TS variables. This will be the focus of this post.
                </p>
                
                <p class="has-text-align-justify">
                  Indeed, some applications require that you provide a password or other sensitive information during the installation process. With a standard application deployment, it often means these information must be stored in clear text (which is not the best way to keep them secret). With the Task Sequence model, you can use TS variables that can be hidden. Though not 100% safe, it is harder to get access to the information that you want to hide.
                </p>
                
                <h2>
                  Prerequisites and limitations
                </h2>
                
                <p class="has-text-align-justify">
                  To use the "Task sequence as an app model deployment type" feature, you need to have at least Configuration Manager Current Branch 2002 installed. You also have <a aria-label="undefined (opens in a new tab)" rel="noreferrer noopener" href="https://docs.microsoft.com/en-us/mem/configmgr/core/servers/manage/pre-release-features#enable-pre-release-features" target="_blank">enable the pre-release feature</a>. Once this is done, you are all good.
                </p>
                
                <p class="has-text-align-justify">
                  It is also important to note that there are <a aria-label="undefined (opens in a new tab)" href="https://docs.microsoft.com/en-us/mem/configmgr/apps/get-started/creating-windows-applications#prerequisites-for-a-task-sequence-deployment-type" target="_blank" rel="noreferrer noopener">some limitations</a> inherent to the Task Sequence deployment type:
                </p>
                
                <ul>
                  <li>
                    You can only use <strong>non-OS deployment TS steps</strong> (Like Install Package, Run Command Line or Run PowerShell Script);
                  </li>
                  <li>
                    You can’t select the option for a <strong>high-impact TS</strong> in the User Notification tab.
                  </li>
                </ul>
                
                <p class="has-text-align-justify">
                  There are also some <a aria-label="undefined (opens in a new tab)" href="https://docs.microsoft.com/en-us/mem/configmgr/apps/get-started/creating-windows-applications#known-issues-for-a-task-sequence-deployment-type" target="_blank" rel="noreferrer noopener">known issues</a> (Remember the feature is still in pre-release):
                </p>
                
                <ul>
                  <li>
                    In version 2006 and earlier, you can’t deploy an application using a Task Sequence deployment type to a <strong>user collection</strong>;
                  </li>
                  <li>
                    You can’t use the <strong>Install Application</strong> step.
                  </li>
                </ul>
                
                <h2>
                  How to create an application with a Task Sequence deployment type
                </h2>
                
                <p class="has-text-align-justify">
                  Before beginning with the use case, here is a quick How-to that will explain how to create an application that is using a Task Sequence as a deployment type in a few easy steps.
                </p>
                
                <div class="wp-block-group">
                  <div class="wp-block-group__inner-container">
                    <div class="wp-block-group">
                      <div class="wp-block-group__inner-container">
                        <ol>
                          <li>
                            <span style="text-decoration: underline">Create a package</span> that will contains the source for the application you want to install but do not create a program associated to it;
                          </li>
                          <li>
                            <span style="text-decoration: underline">Create a Task Sequence</span> that will execute all the actions needed to install your application (Including a step that will use the package previously created);
                          </li>
                          <li>
                            <span style="text-decoration: underline">Create an application</span> and chose the <strong>Custom deployment</strong> setting. When you are at the deployment type creation, select Task Sequence and pick your TS. You can also select a Task Sequence for the un-installation of the application;
                          </li>
                          <li>
                            <span style="text-decoration: underline">Deploy</span> the application like any other.
                          </li>
                        </ol>
                      </div>
                    </div>
                  </div>
                </div><figure class="wp-block-gallery aligncenter columns-2 is-cropped">
                
                <ul class="blocks-gallery-grid">
                  <li class="blocks-gallery-item">
                    <figure><a href="https://www.sysmansquad.com/wp-content/uploads/2020/09/Package-1.png"><img loading="lazy" width="1366" height="768" src="https://www.sysmansquad.com/wp-content/uploads/2020/09/Package-1.png" alt="" data-id="1785" data-link="https://www.sysmansquad.com/?attachment_id=1785" class="wp-image-1785" srcset="https:/wp-content/uploads/2020/09/Package-1.png 1366w, https:/wp-content/uploads/2020/09/Package-1-300x169.png 300w, https:/wp-content/uploads/2020/09/Package-1-1024x576.png 1024w, https:/wp-content/uploads/2020/09/Package-1-768x432.png 768w, https:/wp-content/uploads/2020/09/Package-1-100x56.png 100w, https:/wp-content/uploads/2020/09/Package-1-855x481.png 855w, https:/wp-content/uploads/2020/09/Package-1-1234x694.png 1234w" sizes="(max-width: 1366px) 100vw, 1366px" /></a><figcaption class="blocks-gallery-item__caption">Package overview</figcaption></figure>
                  </li>
                  <li class="blocks-gallery-item">
                    <figure><a href="https://www.sysmansquad.com/wp-content/uploads/2020/09/Task-Sequence.png"><img loading="lazy" width="901" height="592" src="https://www.sysmansquad.com/wp-content/uploads/2020/09/Task-Sequence.png" alt="Task Sequence" data-id="1680" data-link="https://www.sysmansquad.com/?attachment_id=1680" class="wp-image-1680" srcset="https:/wp-content/uploads/2020/09/Task-Sequence.png 901w, https:/wp-content/uploads/2020/09/Task-Sequence-300x197.png 300w, https:/wp-content/uploads/2020/09/Task-Sequence-768x505.png 768w, https:/wp-content/uploads/2020/09/Task-Sequence-100x66.png 100w, https:/wp-content/uploads/2020/09/Task-Sequence-855x562.png 855w" sizes="(max-width: 901px) 100vw, 901px" /></a><figcaption class="blocks-gallery-item__caption">Task Sequence</figcaption></figure>
                  </li>
                  <li class="blocks-gallery-item">
                    <figure><a href="https://www.sysmansquad.com/wp-content/uploads/2020/09/TS-Deployment-Type.png"><img loading="lazy" width="791" height="703" src="https://www.sysmansquad.com/wp-content/uploads/2020/09/TS-Deployment-Type.png" alt="Deployment type selection" data-id="1681" data-link="https://www.sysmansquad.com/?attachment_id=1681" class="wp-image-1681" srcset="https:/wp-content/uploads/2020/09/TS-Deployment-Type.png 791w, https:/wp-content/uploads/2020/09/TS-Deployment-Type-300x267.png 300w, https:/wp-content/uploads/2020/09/TS-Deployment-Type-768x683.png 768w, https:/wp-content/uploads/2020/09/TS-Deployment-Type-100x89.png 100w" sizes="(max-width: 791px) 100vw, 791px" /></a><figcaption class="blocks-gallery-item__caption">Deployment type selection</figcaption></figure>
                  </li>
                  <li class="blocks-gallery-item">
                    <figure><a href="https://www.sysmansquad.com/wp-content/uploads/2020/09/TS-Deployment-Type-TS-Selection.png"><img loading="lazy" width="791" height="703" src="https://www.sysmansquad.com/wp-content/uploads/2020/09/TS-Deployment-Type-TS-Selection.png" alt="Task Sequence Selection" data-id="1683" data-link="https://www.sysmansquad.com/?attachment_id=1683" class="wp-image-1683" srcset="https:/wp-content/uploads/2020/09/TS-Deployment-Type-TS-Selection.png 791w, https:/wp-content/uploads/2020/09/TS-Deployment-Type-TS-Selection-300x267.png 300w, https:/wp-content/uploads/2020/09/TS-Deployment-Type-TS-Selection-768x683.png 768w, https:/wp-content/uploads/2020/09/TS-Deployment-Type-TS-Selection-100x89.png 100w" sizes="(max-width: 791px) 100vw, 791px" /></a><figcaption class="blocks-gallery-item__caption">Task sequence selection</figcaption></figure>
                  </li>
                </ul></figure> 
                
                <p class="has-text-align-justify has-pale-cyan-blue-background-color has-background">
                  <strong>Note:</strong> if you can’t find the TS in the drop-down menu, check your <strong>RBAC </strong>permissions. To be able to add a TS deployment type, you need to have the <strong>Read Task Sequence permission</strong>. It can be done by giving your account the Read-Only Analyst role (Which allows view on all Configuration Manager objects) or by creating a custom role with the sufficient permissions. If the permissions are good, double-check that the TS doesn't include the <strong>OS deployment or OS upgrade step</strong> and that you have not marked it as a<strong> high-impact</strong> Task Sequence.
                </p>
                
                <h2>
                  Use case: installation of the Microsoft Monitoring Agent to report to Microsoft Defender ATP
                </h2>
                
                <p class="has-text-align-justify">
                  After this (long) introduction, let's move to a real world use case and see how the Microsoft Monitoring Agent (MMA) can be installed and set up to report to Microsoft Defender ATP without ever showing the workspace information in clear (Whether it be in logs or application settings).
                </p>
                
                <p class="has-text-align-justify">
                  Indeed, when you want to set up the Microsoft Monitoring Agent to report to an Azure Log Analytics service (The component used by MD ATP to collect data from other OS than Windows 10 or Windows Server 2019), you will be required to add a Workspace ID and a Workspace Key. It is best if these two values are not visible in an installation script, some command lines, or logs so we are going to hide them.
                </p>
                
                <h5>
                  1. Package creation
                </h5>
                
                <p class="has-text-align-justify">
                  The first step is to<strong> create a package with the MMA source</strong> (Remember you can’t use applications in a TS used as an application deployment type). This time, create a package with only the source and no program. Once it is created, <strong>distribute the package</strong> to your target Distribution Point(s).
                </p>
                
                <p class="has-text-align-justify">
                  Note that there is a particularity with the MMA executable. When you get the sources <a rel="noreferrer noopener" href="https://docs.microsoft.com/en-us/azure/azure-monitor/platform/agent-windows#install-agent-using-dsc-in-azure-automation" target="_blank">from this page</a>, you need to extract them because the MMA-Setup_AMD64.exe file can't be used for a silent installation. Instead, use the following command to extract its content and use this extracted content as the source of your package.
                </p>
                
                <pre class="wp-block-code"><code>MMASetup-AMD64.exe /c /t:&lt;Full Extraction Path&gt;</code></pre><figure class="wp-block-image size-large">
                
                <img loading="lazy" width="1024" height="576" src="https://www.sysmansquad.com/wp-content/uploads/2020/09/Package-1-1024x576.png" alt="" class="wp-image-1785" srcset="https:/wp-content/uploads/2020/09/Package-1-1024x576.png 1024w, https:/wp-content/uploads/2020/09/Package-1-300x169.png 300w, https:/wp-content/uploads/2020/09/Package-1-768x432.png 768w, https:/wp-content/uploads/2020/09/Package-1-100x56.png 100w, https:/wp-content/uploads/2020/09/Package-1-855x481.png 855w, https:/wp-content/uploads/2020/09/Package-1-1234x694.png 1234w, https:/wp-content/uploads/2020/09/Package-1.png 1366w" sizes="(max-width: 1024px) 100vw, 1024px" /><figcaption>Package overview</figcaption></figure> <h5>
                  2. Task Sequence creation
                </h5>
                
                <p class="has-text-align-justify">
                  Once it is done, you can start working on the Task Sequence. It will need only a few steps here.
                </p>
                
                <p class="has-text-align-justify">
                  First, set two <strong>Task Sequence variables</strong> to store the Workspace ID and the Workspace key that you can find in the MD-ATP portal. Then, set a third TS variable named <a rel="noreferrer noopener" href="https://docs.microsoft.com/en-us/mem/configmgr/osd/understand/task-sequence-variables#OSDDoNotLogCommand" target="_blank">OSDDoNotLogCommand</a> to <strong>True</strong> to hide the command line in the log. Alternatively, you can also set <a rel="noreferrer noopener" href="https://docs.microsoft.com/en-us/mem/configmgr/osd/understand/task-sequence-variables#OSDLogPowerShellParameters" target="_blank">OSDLogPowerShellParameters</a> to <strong>False</strong> to hide PowerShell parameters in smsts.log (If you are using PowerShell rather than CMD to install your application).
                </p>
                
                <p class="has-text-align-justify">
                  The next step is the <strong>installation of the application</strong> itself. Use the “<strong>Run Command Line</strong>” step and select the package you previously created and the following command line (Taken from the <a rel="noreferrer noopener" href="https://docs.microsoft.com/en-us/azure/azure-monitor/platform/agent-windows#install-agent-using-command-line" target="_blank">online documentation</a>).
                </p>
                
                <pre class="wp-block-code"><code>setup.exe /qn NOAPM=1 ADD_OPINSIGHTS_WORKSPACE=1 OPINSIGHTS_WORKSPACE_AZURE_CLOUD_TYPE=0 OPINSIGHTS_WORKSPACE_ID="%WorkspaceID%" OPINSIGHTS_WORKSPACE_KEY="%WorkspaceKey%" AcceptEndUserLicenseAgreement=1</code></pre>
                
                <p class="has-text-align-justify">
                  Note that in place of the Workspace ID and key, you need to call the two TS variables that you have defined in the previous step. That is done by surrounding the variable name with the<strong> % character</strong>.
                </p>
                
                <p class="has-text-align-justify">
                  And voila! The Task Sequence is ready and as you can see, it is fairly simple.
                </p><figure class="wp-block-gallery aligncenter columns-2 is-cropped">
                
                <ul class="blocks-gallery-grid">
                  <li class="blocks-gallery-item">
                    <figure><a href="https://www.sysmansquad.com/wp-content/uploads/2020/09/TS-Command-Line.png"><img loading="lazy" width="300" height="209" src="https://www.sysmansquad.com/wp-content/uploads/2020/09/TS-Command-Line-300x209.png" alt="" data-id="1783" data-full-url="https://www.sysmansquad.com/wp-content/uploads/2020/09/TS-Command-Line.png" data-link="https://www.sysmansquad.com/?attachment_id=1783" class="wp-image-1783" srcset="https:/wp-content/uploads/2020/09/TS-Command-Line-300x209.png 300w, https:/wp-content/uploads/2020/09/TS-Command-Line-768x535.png 768w, https:/wp-content/uploads/2020/09/TS-Command-Line-100x70.png 100w, https:/wp-content/uploads/2020/09/TS-Command-Line-855x596.png 855w, https:/wp-content/uploads/2020/09/TS-Command-Line.png 864w" sizes="(max-width: 300px) 100vw, 300px" /></a><figcaption class="blocks-gallery-item__caption">Use the command line to install the application</figcaption></figure>
                  </li>
                  <li class="blocks-gallery-item">
                    <figure><a href="https://www.sysmansquad.com/wp-content/uploads/2020/09/TS-Secret-Variable.png"><img loading="lazy" width="300" height="209" src="https://www.sysmansquad.com/wp-content/uploads/2020/09/TS-Secret-Variable-300x209.png" alt="" data-id="1784" data-full-url="https://www.sysmansquad.com/wp-content/uploads/2020/09/TS-Secret-Variable.png" data-link="https://www.sysmansquad.com/?attachment_id=1784" class="wp-image-1784" srcset="https:/wp-content/uploads/2020/09/TS-Secret-Variable-300x209.png 300w, https:/wp-content/uploads/2020/09/TS-Secret-Variable-768x535.png 768w, https:/wp-content/uploads/2020/09/TS-Secret-Variable-100x70.png 100w, https:/wp-content/uploads/2020/09/TS-Secret-Variable-855x596.png 855w, https:/wp-content/uploads/2020/09/TS-Secret-Variable.png 864w" sizes="(max-width: 300px) 100vw, 300px" /></a><figcaption class="blocks-gallery-item__caption">Declaration of a secret TS variable</figcaption></figure>
                  </li>
                </ul></figure> 
                
                <p class="has-text-align-justify">
                  An alternative to the first step is to use <strong>Collection variables</strong>. This way, you can have different pairs of variables if you want to report to different workspaces. In the screenshot above, you may note another variable named MMA_ProxyURL is used. This one is set using collection variables because depending on the server location, the proxy URL is not the same.
                </p>
                
                <h5>
                  3. Application creation
                </h5>
                
                <p class="has-text-align-justify">
                  The last step is the creation of the application itself. <strong>Create a new application</strong> and select Custom deployment type. When you need to select your deployment type, chose <strong>Task Sequence</strong>. This will lead you to a screen that allows the selection of two TS. One for the installation (Mandatory) and one for the uninstallation (Optional) of the application.
                </p><figure class="wp-block-image size-large">
                
                <img loading="lazy" width="791" height="703" src="https://www.sysmansquad.com/wp-content/uploads/2020/09/TS-Deployment-Type-TS-Selection.png" alt="Task Sequence Selection" class="wp-image-1683" srcset="https:/wp-content/uploads/2020/09/TS-Deployment-Type-TS-Selection.png 791w, https:/wp-content/uploads/2020/09/TS-Deployment-Type-TS-Selection-300x267.png 300w, https:/wp-content/uploads/2020/09/TS-Deployment-Type-TS-Selection-768x683.png 768w, https:/wp-content/uploads/2020/09/TS-Deployment-Type-TS-Selection-100x89.png 100w" sizes="(max-width: 791px) 100vw, 791px" /><figcaption>Task Sequence Selection</figcaption></figure> <h5>
                  4. Testing the result
                </h5>
                
                <p class="has-text-align-justify">
                  Now that the application is ready, <strong>deploy it to a device collection</strong> to install the agent on a server. Once it is installed, give a look at the logs. You need to look at the <strong>smsts.log</strong> file as the installation is executed with a Task Sequence. As you can notice below, the Workspace ID and key are never shown (Look at the yellow line).
                </p><figure class="wp-block-image size-large">
                
                <img loading="lazy" width="1024" height="546" src="https://www.sysmansquad.com/wp-content/uploads/2020/09/OneTrace-Logs-1024x546.png" alt="smsts.log content showing not command line" class="wp-image-1786" srcset="https:/wp-content/uploads/2020/09/OneTrace-Logs-1024x546.png 1024w, https:/wp-content/uploads/2020/09/OneTrace-Logs-300x160.png 300w, https:/wp-content/uploads/2020/09/OneTrace-Logs-768x409.png 768w, https:/wp-content/uploads/2020/09/OneTrace-Logs-100x53.png 100w, https:/wp-content/uploads/2020/09/OneTrace-Logs-855x456.png 855w, https:/wp-content/uploads/2020/09/OneTrace-Logs-1234x658.png 1234w, https:/wp-content/uploads/2020/09/OneTrace-Logs.png 1366w" sizes="(max-width: 1024px) 100vw, 1024px" /><figcaption>smsts.log</figcaption></figure> <p class="has-text-align-justify">
                  If you log onto your server and you start the Microsoft Monitoring Agent, you can see it is registered with the <strong>Azure Logs Analytic</strong> space, so everything worked as expected.
                </p><figure class="wp-block-image size-large">
                
                <img loading="lazy" width="751" height="483" src="https://www.sysmansquad.com/wp-content/uploads/2020/09/MMA_Success.png" alt="Microsoft Monitoring Agent reporting succesfully to Azure Log Analytics (OMS)" class="wp-image-1713" srcset="https:/wp-content/uploads/2020/09/MMA_Success.png 751w, https:/wp-content/uploads/2020/09/MMA_Success-300x193.png 300w, https:/wp-content/uploads/2020/09/MMA_Success-100x64.png 100w" sizes="(max-width: 751px) 100vw, 751px" /></figure> <h2>
                  Conclusion
                </h2>
                
                <p class="has-text-align-justify">
                  <strong>Task Sequence as an application deployment type</strong> can help you deploy applications that require a complex installation process. But they can also be used to deploy simple application that requires password or other sensitive information that need to be hid with the help of TS variables though all the steps involved (Creating a package, a TS and finally an application) will add a little overhead to the complete process of creating and deploying an application.
                </p>