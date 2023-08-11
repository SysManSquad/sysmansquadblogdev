---
title: Get total job run time for your slurm cluster
author: aaron
type: post
date: 2022-11-21
url: /2022/11/21/create-slurm-report/
categories:
  - linux
  - hpc
  - slurm

---

Every year, we have to produce a total of used hours on our compute cluster. The tools for interacting with slurm's accounting database are complex and the documentation is not very good, so this simple task is incredibly annoying. If you ever have to do this, hopefully you will have an easier time of it. This post is only an example of one way to do the job and there may be better ways.

We start by having `sacct` dump statistics for all jobs from about a year ago:

```ps
sacct --starttime 2021-11-11T00:00:00 --format CPUTime > cputime.csv
```

Transport this file to anywhere you have powershell installed.

This file isn't incredibly helpful to begin with as the `sacct` command is primarily for human-readable reports. There are also json and yaml output options that would be a good start if you wanted to do this with less manual effort. 

The first thing to do is edit the first two lines of the file to trim all the spaces from the column name, and delete the first row that just contains a bunch of `-` characters. You don't need to mess with any of the other values, even though they are also padded with spaces. You'll end up with something looking like this:

```plaintext
 CPUTime
  00:00:00 
  00:00:00 
  22:00:20 
  07:20:34 
  00:20:00 
```

Now all we need to do is write a little powershell to parse this into something useful. This script uses unix-style paths because it was written on a mac, swap the slashes out if you're running on windows.

```ps
# Import the csv file
$jobtimes = import-csv ./cputime.csv
# Initialize an empty timespan
$totals=[timespan]::parse("00:00:00")

# Process all job times
$jobtimes | % { 
    # Slurm uses N- to indicate how many days the job ran, we need to replace that dash with a : to make powershell recognize the format
    # We also trim() the values to throw away all the space padding.
    $runtime=$_.CPUTime.trim().replace("-",":")
    $totals+= [TimeSpan]::Parse($runtime)
}
$totals
```

This took a while for a cluster with over 300K jobs over the course of a year, and there's probably a more efficient way to do it, but I do this once a year so I don't care. You'll end up with a total amount of CPU time used:

```plaintext
Days              : 4172
Hours             : 8
Minutes           : 59
Seconds           : 52
Milliseconds      : 0
Ticks             : 3604931920000000
TotalDays         : 4172.37490740741
TotalHours        : 100136.997777778
TotalMinutes      : 6008219.86666667
TotalSeconds      : 360493192
TotalMilliseconds : 360493192000
```

That's it - quick, dirty, and satisfying.
