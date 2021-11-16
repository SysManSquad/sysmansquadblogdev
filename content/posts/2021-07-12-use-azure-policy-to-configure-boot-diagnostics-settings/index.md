---
title: Use Azure Policy to configure Boot Diagnostics Settings
author: Kevin Crouch
type: post
date: 2021-07-12T17:42:11+00:00
url: /2021/07/12/use-azure-policy-to-configure-boot-diagnostics-settings/
categories:
  - Endpoint Management
tags:
  - Azure Policy

---
I found several posts about configuring Diagnostic Settings on VMs, but none that specified or included **boot diagnostics**. 

With this Azure Policy you can automatically enable Boot Diagnostics and apply a storage account to it. This is also a great base if you want to start testing out your own policies. 

<!--more--><div class="wp-block-uagb-table-of-contents uagb-toc\_\_align-left uagb-toc\_\_columns-1 uagb-block-e8e171b1 " data-scroll= "1" data-offset= "30" data-delay= "800" > 

<div class="uagb-toc__wrap">
  <div class="uagb-toc__title-wrap">
    <div class="uagb-toc__title">
      Table Of Contents
    </div>
  </div>
  
  <div class="uagb-toc__list-wrap">
    <ol class="uagb-toc__list">
      <li class="uagb-toc__list">
        [1. Overview](#1-overview)<li class="uagb-toc__list">
          [2. Create a Custom Policy Definition](#2-create-a-custom-policy-definition)<li class="uagb-toc__list">
            [3. Assign Policy to Resources](#3-assign-policy-to-resources)<ul class="uagb-toc__list">
              <li class="uagb-toc__list">
                [Get your Blob Storage Endpoint](#get-your-blob-storage-endpoint)
              </li>
            </ul>
          </li>
          
          <li class="uagb-toc__list">
            [4. Create Remediation Task](#4-create-remediation-task)<li class="uagb-toc__list">
              [5. Be Patient and Enjoy](#5-be-patient-and-enjoy)<li class="uagb-toc__list">
                [6. Optional: Export to GitHub](#6-optional-export-to-github)
              </li></ul></ol> </div> </div> </div> 
              <div class="wp-block-group">
                <div class="wp-block-group__inner-container">
                  <h2 class="has-large-font-size">
                    <span style="color:#ba0c49" class="has-inline-color">1.</span> Overview
                  </h2>
                  
                  <p>
                    Our process will have several major parts
                  </p>
                  
                  <ul>
                    <li>
                      Create a Custom Azure Policy Definition
                    </li>
                    <li>
                      Assign to a Subscription or Resource Group<ul>
                        <li>
                          Find the Blob Storage URI to use
                        </li>
                      </ul>
                    </li>
                    
                    <li>
                      Create a Remediation task to Apply the changes
                    </li>
                    <li>
                      Optional: Link to GitHub for versioning
                    </li>
                  </ul>
                  
                  <p>
                  </p>
                </div>
              </div>
              
              <h2 class="has-large-font-size">
                <span style="color:#ba0c49" class="has-inline-color">2.</span> Create a Custom Policy Definition
              </h2>
              
              <p>
                First we will need to Create a Custom Definition. To start with head to Portal.Azure.com > [Azure Policy | Definitions](https://portal.azure.com/#blade/Microsoft_Azure_Policy/PolicyMenuBlade/Definitions).
              </p>
              
              <p>
              </p>
              
              <p>
                From here, we will need to create a new Policy Definition
              </p><figure class="wp-block-image size-large">
              
              ![](https://i.imgur.com/7ANVOqt.png)</figure> <p>
                Fill in several fields
              </p>
              
              <ul>
                <li>
                  "Definition Location" - which will be the Subscription.
                </li>
                <li>
                  Give it a name
                </li>
                <li>
                  Create a custom category, or select an existing one
                </li>
              </ul><figure class="wp-block-image size-large">
              
              ![](https://i.imgur.com/BRJEnNY.png)</figure> <p>
                For the Policy Rule Definition, you should be able to copy over this JSON below, or use [this JSON](https://gist.github.com/PsychoData/27c5028a5a78237f9910d4f652f6b269#file-enable_boot_diagnostics-json). Note: Later on, you can configure this to be deployed from a GitHub repo directly, though GitHub actions, but we will talk about that in a later section.
              </p>
              
              
```json
{
  "mode": "All",
  "policyRule": {
    "if": {
      "allOf": [
        {
          "field": "type",
          "equals": "Microsoft.Compute/virtualMachines"
        },
        {
          "field": "tags",
          "notContains": "IgnoreBootDiagnostics"
        },
        {
          "field": "Microsoft.Compute/virtualMachines/diagnosticsProfile.bootDiagnostics.storageUri",
          "notContains": "[parameters('StorageURI')]"
        },
        {
          "not": {
            "field": "Microsoft.Compute/virtualMachines/diagnosticsProfile.bootDiagnostics.storageUri",
            "equals": ""
          }
        }
      ]
    },
    "then": {
      "effect": "modify",
      "details": {
        "roleDefinitionIds": [
          "/providers/Microsoft.Authorization/roleDefinitions/9980e02c-c2be-4d73-94e8-173b1dc7cf3c"
        ],
        "conflictEffect": "audit",
        "operations": [
          {
            "operation": "addOrReplace",
            "field": "Microsoft.Compute/virtualMachines/diagnosticsProfile.bootDiagnostics.storageUri",
            "value": "[parameters('StorageURI')]"
          },
          {
            "operation": "addOrReplace",
            "field": "Microsoft.Compute/virtualMachines/diagnosticsProfile.bootDiagnostics.enabled",
            "value": true
          }
        ]
      }
    }
  },
  "parameters": {
    "StorageURI": {
      "type": "String",
      "metadata": {
        "displayName": "StorageURI",
        "description": "Storage Account that will be applied to any account that does not already have one applied."
      },
      "defaultValue": "https://YourBlobStorage.blob.core.windows.net"
    }
  }
}
```
              
              
              <h2 class="has-large-font-size">
                <span style="color:#ba0c49" class="has-inline-color">3.</span> Assign Policy to Resources
              </h2>
              
              <p>
                Next you can select a Resource Group or entire Subscription to apply to.
              </p>
              
              <p>
                By default, the JSON policy provided will ignore any resources with the tag <strong>IgnoreBootDiagnostics </strong>, but you can also add <strong>Exclusions</strong> here, as well.
              </p><figure class="wp-block-image size-large">
              
              ![](https://i.imgur.com/1lJbBMM.png)</figure> <p>
                For the parameter, you need to fill in the URL to a Azure Blob storage service.
              </p>
              
              <h3>
                Get your Blob Storage Endpoint
              </h3>
              
              <p>
                My example is [https://YourBlobStorage.blob.core.windows.net](https://YourBlobStorage.blob.core.windows.net) , but you can find the endpoint for your Storage Account by opening your [Storage Accounts](https://portal.azure.com/#blade/HubsExtension/BrowseResource/resourceType/Microsoft.Storage%2FStorageAccounts) > Select or Create Relevant Storage account > Settings > Endpoints
              </p><figure class="wp-block-image size-large">
              
              ![](https://i.imgur.com/XIQQYC4.png)</figure> <h2 class="has-large-font-size">
                <span style="color:#ba0c49" class="has-inline-color">4.</span> Create Remediation Task
              </h2>
              
              <p>
                Part of the assignment process will give you the option to create the Remediation Task.
              </p>
              
              <p>
                Since the policy specifies the access needed, it will default to creating a managed Identity to remediate the issues.
              </p>
              
              <p>
                Without the Remediation Task, the Policy will just Report Compliance or failure, but you can always start with no Remediation and then add it back later.
              </p><figure class="wp-block-image size-large">
              
              ![](https://i.imgur.com/4Ndafmo.png)</figure> <h2 class="has-large-font-size">
                <span style="color:#ba0c49" class="has-inline-color">5.</span> Be Patient and Enjoy
              </h2>
              
              <p>
                In my experience, the policy will take around 15-45 minutes to evaluate, depending on the amount of resources it is checking over.
              </p>
              
              <p>
                From there it usually takes <em>another</em> 30 minutes to multiple hours before the remediation runs. These are not the most immediate methods to apply the policy, but they can be fully automatic!
              </p>
              
              <p>
                You can check your Remediation status by going to [Policy Assignments ](https://portal.azure.com/#blade/Microsoft_Azure_Policy/PolicyMenuBlade/Assignments)> Select your policy name > Remediation tab
              </p><figure class="wp-block-image size-large">
              
              ![](https://i.imgur.com/JtkoH2i.png)</figure> <p>
                To see the details, use the three-dots menu on the right to View remediation task
              </p><figure class="wp-block-image size-large">
              
              ![](https://i.imgur.com/qESeb98.png)</figure> <h2 class="has-large-font-size">
                <span style="color:#ba0c49" class="has-inline-color">6.</span> Optional: Export to GitHub
              </h2>
              
              <p>
                Modifying the Azure Policies can be a highly iterative process, so being able to reference or revert to previous versions can be an <strong>enormous</strong> benefit.
              </p>
              
              <p>
                Azure Policies has this built in, including Automated Deployment from GitHub with GitHub Actions! You can read more about that [here](https://docs.microsoft.com/azure/governance/policy/tutorials/policy-as-code-github?WT.mc_id=Portal-AzureTfsExtension#export-azure-policy-objects-from-the-azure-portal), but the basic process is shown below.
              </p>
              
              <p>
                Open [Azure Policy Assignments](https://portal.azure.com/#blade/Microsoft_Azure_Policy/PolicyMenuBlade/Assignments) > Select your assignment > <strong>View Definition</strong> button near the top > <strong>Export Definition</strong> button
              </p><figure class="wp-block-image size-large">
              
              ![](https://i.imgur.com/KGmXwlg.gif)</figure> <p>
                From there, you will need to authorize a connection to a GitHub account with rights to the Account/Repo you want to store the policy in.
              </p>
              
              <p>
                Now, I would mention the important difference that the GitHub repo stores the Rules, Parameters, and any remaining parts into separate files within that Repo. Don't be surprised that it took your glorious new policy and chopped it up into different sections, and fills out a few metadata attributes.
              </p>
              
              <p>
                If you aren't familiar with [GitHub Actions](https://github.com/features/actions), the export process will create a <strong>.github/workflows/manage_azure_policy_xxxxxx.yml</strong> that will outline the Workflow and use secrets to securely connect back to Azure.
              </p>
              
              <p>
                To make future changes, commit them to the Repository and the GitHub Action will try to build the policy, apply it, and let you know if it was able to apply successfully.
              </p>
