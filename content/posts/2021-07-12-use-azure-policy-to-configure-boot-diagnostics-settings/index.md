---
title: Use Azure Policy to configure Boot Diagnostics Settings
author: kevin-crouch
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

## 1. Overview

Our process will have several major parts

* Create a Custom Azure Policy Definition
* Assign to a Subscription or Resource Group
  * Find the Blob Storage URI to use
* Create a Remediation task to Apply the changes
* Optional: Link to GitHub for versioning

## 2.Create a Custom Policy Definition

First we will need to Create a Custom Definition. To start with head to Portal.Azure.com > [Azure Policy | Definitions](https://portal.azure.com/#blade/Microsoft_Azure_Policy/PolicyMenuBlade/Definitions).

From here, we will need to create a new Policy Definition
![screenshot](https://i.imgur.com/7ANVOqt.png) Fill in several fields

* "Definition Location" - which will be the Subscription.
* Give it a name
* Create a custom category, or select an existing one

![screenshot](https://i.imgur.com/BRJEnNY.png) For the Policy Rule Definition, you should be able to copy over this JSON below, or use [this JSON](https://gist.github.com/PsychoData/27c5028a5a78237f9910d4f652f6b269#file-enable_boot_diagnostics-json). Note: Later on, you can configure this to be deployed from a GitHub repo directly, though GitHub actions, but we will talk about that in a later section.

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

## 3. Assign Policy to Resources

  Next you can select a Resource Group or entire Subscription to apply to.

  By default, the JSON policy provided will ignore any resources with the tag **IgnoreBootDiagnostics**, but you can also add **Exclusions** here, as well.

![screenshot](https://i.imgur.com/1lJbBMM.png)   
For the parameter, you need to fill in the URL to a Azure Blob storage service.

### Get your Blob Storage Endpoint

My example is [https://YourBlobStorage.blob.core.windows.net](https://YourBlobStorage.blob.core.windows.net) , but you can find the endpoint for your Storage Account by opening your [Storage Accounts](https://portal.azure.com/#blade/HubsExtension/BrowseResource/resourceType/Microsoft.Storage%2FStorageAccounts) > Select or Create Relevant Storage account > Settings > Endpoints

![screenshot](https://i.imgur.com/XIQQYC4.png)

## 4. Create Remediation Task

Part of the assignment process will give you the option to create the Remediation Task.

Since the policy specifies the access needed, it will default to creating a managed Identity to remediate the issues.

Without the Remediation Task, the Policy will just Report Compliance or failure, but you can always start with no Remediation and then add it back later.

![screenshot](https://i.imgur.com/4Ndafmo.png) 

## 5. Be Patient and Enjoy

In my experience, the policy will take around 15-45 minutes to evaluate, depending on the amount of resources it is checking over.

From there it usually takes *another* 30 minutes to multiple hours before the remediation runs. These are not the most immediate methods to apply the policy, but they can be fully automatic!

You can check your Remediation status by going to [Policy Assignments](https://portal.azure.com/#blade/Microsoft_Azure_Policy/PolicyMenuBlade/Assignments)> Select your policy name > Remediation tab

![screenshot](https://i.imgur.com/JtkoH2i.png) 

To see the details, use the three-dots menu on the right to View remediation task

![screenshot](https://i.imgur.com/qESeb98.png) 

## 6. Optional: Export to GitHub

Modifying the Azure Policies can be a highly iterative process, so being able to reference or revert to previous versions can be an **enormous** benefit.

Azure Policies has this built in, including Automated Deployment from GitHub with GitHub Actions! You can read more about that [here](https://docs.microsoft.com/azure/governance/policy/tutorials/policy-as-code-github?WT.mc_id=Portal-AzureTfsExtension#export-azure-policy-objects-from-the-azure-portal), but the basic process is shown below.

Open [Azure Policy Assignments](https://portal.azure.com/#blade/Microsoft_Azure_Policy/PolicyMenuBlade/Assignments) > Select your assignment > **View Definition** button near the top > **Export Definition** button

![screenshot](https://i.imgur.com/KGmXwlg.gif) 

From there, you will need to authorize a connection to a GitHub account with rights to the Account/Repo you want to store the policy in.

Now, I would mention the important difference that the GitHub repo stores the Rules, Parameters, and any remaining parts into separate files within that Repo. Don't be surprised that it took your glorious new policy and chopped it up into different sections, and fills out a few metadata attributes.

If you aren't familiar with [GitHub Actions](https://github.com/features/actions), the export process will create a **.github/workflows/manage_azure_policy_xxxxxx.yml** that will outline the Workflow and use secrets to securely connect back to Azure.

To make future changes, commit them to the Repository and the GitHub Action will try to build the policy, apply it, and let you know if it was able to apply successfully.
