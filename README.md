# Google sheets as a Data Source for SkyGiraffe

### What is this Google sheets datasource for SkyGiraffe?

Before we go there, you need to know -  what is SkyGiraffe?

Think of SkyGiraffe as a **black-box enterprise data connector** that enables the following:

* Enterprise Authentication: Allows you have a single endpoint that integrates with enterprise Identity providers such as AD, ADFS and other custom providers while passing on permissions for on-prem and cloud enterprise data sources. 
* Data Connectivity: Pulls and updates data from backend systems, e.g., Oracle, SAP, Salesforce, MSSQL, REST APIs, Office 365, Google apps and many other systems. 
* Create Applications: Build simple and complex workflows that involve one or more systems and enables read and write operations with the SkyGiraffe studio. 

Now to let you get started quickly on SkyGiraffe, we have created a generic Google sheets REST service that allows you to write, retrieve and update data on Google sheets, thereby using it as a SkyGiraffe REST data source.

Once you have designed the app and workflow, you can plugin the actual enterprise data source.Pretty simple, isn't it.

### OK, so far so good, how do I get started?

* Please email support@skygiraffe.com to receive a link to SkyGiraffe Studio. You must have Windows to install the Studio. 
* Follow the installer to properly install the Studio (5 min).

We will come back to the studio, but before that, lets look at the Google sheets REST service.

### Alright, I understand. Please carry on.

Good. What follows is lengthy but simple.

Just create a new sheet and rename it to 'SGTest'. Leave it empty for now.

1. Now, go to Tools --> Script Editor on your sheets and open it.

![Google sheets script editor] (https://download.skygiraffe.com/publicImages/ScriptEditor.png)
2. Copy the code from here (in Code.gs) and paste it in your script editor. Please update the google sheet id in Code.gs to the id of your google sheet. You will have to make 4 edits in total.
3. Deploy it as a web app. When you do this, you will get the url of the REST service. Copy it and save it somewhere.
![Google sheets deploy] (https://download.skygiraffe.com/publicImages/gsheets_deploy.png)

Next step is to understand the service requests and test it out.

**Add a row to sheet**

The following POST request adds a row to Google sheet:

`?action=post&sheetname=SGTest`

Sample json payload example:

`{"Col1Key":"Col1Val", "Col2Key":"Col2Val", "Col3Key":"Col3Val","Col4Key":"Col4Val", "Col5Key":"Col5Val"}`

As you would expect, a new row will be added to the Google sheet, with keys as column headers. AN `id` column is automatically added to a row.

**Retrieve data from sheet**

The following POST request retrieves rows from the Google sheet:

`?action=get&sheetname=SGTest`

Sample json payload example:

`[{"key": "ColKey","val": "ColVal","operation": "notequals"},{"key": "ColKey","val": "ColVal","operation": "equals"}]`

This needs some explaining. The JSON payload represents a filter to be able to select one or multiple rows from the google sheet. The field description is as follows:
* key - This is the column header
* val - This is the filter value for this column
* operation - This is the operation to be performed on the column value. There are 2 operations that are possible as of now - `equals` and `notequals`.

As you can see there are 2 conditions in the sample JSON request. All these conditions are applied. At this point an OR condition is not possible.

Just to provide an example:

If there are 5 rows like:

id	FirstName	LastName
1	John		Doe
2	David		Brown
3	Sarah		Britton
4	John		Curry
5	Sam		Johnson

We want to select persons with first names John and with last name Doe, the JSON payload will be:

`[{"key": "FirstName","val": "John","operation": "equals"},{"key": "LastName","val": "Doe","operation": "equals"}]`

The same result can be retrieved with the following JSON payload:

`[{"key": "FirstName","val": "John","operation": "equals"},{"key": "LastName","val": "Curry","operation": "notequals"}]`

**Update row in sheet**

The following POST request updates a row:

?action=update&sheetname=SGTest

Sample JSON payload example:

`{"id":"3","ColKey":"ColVal"}`

The above request simply updates the `ColKey` value for row with `id` 3 to `ColVal`.

Now that the REST service is understood, we can consume these in the SkyGiraffe studio and build an app.

Please email us at support@skygiraffe.com and we will quickly guide you through app creation process on SkyGiraffe studio (30 mins).
