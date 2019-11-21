# Speech to Text Batch Solution Accelerator

**Disclaimer**: This content is not officially endorsed by *Microsoft*.


* [![Deploy to Azure](http://azuredeploy.net/deploybutton.png)](https://portal.azure.com/#create/Microsoft.Template/uri/https%3A%2F%2Fraw.githubusercontent.com%2Ftimleyden%2Fspeechtotextdemo%2Fmaster%2Fazuredeploy.json) Original deploy via portal.azure.com - working
* [![Viszualize](http://armviz.io/visualizebutton.png)](http://armviz.io/#/?load=https%3A%2F%2Fraw.githubusercontent.com%2Ftimleyden%2Fspeechtotextdemo%2fmaster%2Fazuredeploy.json) 
* [![Deploy to Azure](http://azuredeploy.net/deploybutton.png)](https://azuredeploy.net/) New deploy portal, template validation failing on linked templates - last checked July 2019

This template demonstrates a serverless approach to calling the Azure cognitive services speech [batch transcription](https://docs.microsoft.com/en-gb/azure/cognitive-services/speech-service/batch-transcription) api. Once deployed you can copy supported audio files (wav, mp3, ogg) to the audio container in the storage account and the solution will automatically queue your file for transcription using speech services. Once complete the transcription files will be copied back to the transcript container.

This template uses the sample batch api code found [here](https://github.com/Azure-Samples/cognitive-services-speech-sdk/tree/master/samples/batch/csharp). Instead of using a console app we use azure functions to start the transcriptions and instead of polling for complettion we use the webhook to callback into azure functions. The callback function then copies the transcript back into the origin blob storage account.

## Solution Architecture
![](Architecture.png)


## Technology Choices 
### Speech to text cognitive service
The Speech Services are the unification of speech-to-text, text-to-speech, and speech-translation into a single Azure subscription. It's easy to speech enable your applications, tools, and devices with the Speech SDK, Speech Devices SDK, or REST APIs.
#### Batch Transcription 
Batch transcription is ideal if you want to transcribe a large quantity of audio in storage, such as Azure Blobs. By using the dedicated REST API, you can point to audio files with a shared access signature (SAS) URI and asynchronously receive transcriptions.

### Azure Functions 
Azure Functions is a solution for easily running small pieces of code, or "functions," in the cloud. You can write just the code you need for the problem at hand, without worrying about a whole application or the infrastructure to run it. Functions can make development even more productive, and you can use your development language of choice, such as C#, Java, JavaScript, PowerShell, and Python. Functions is a great solution for processing data, integrating systems, working with the internet-of-things (IoT), and building simple APIs and microservices. Consider Functions for tasks like image or order processing, file maintenance, or for any tasks that you want to run on a schedule. Azure Functions integrates with various Azure and 3rd-party services. These services can trigger your function and start execution, or they can serve as input and output for your code. This solution accelerator used:
* **Azure Event Grid** - **EventHubTrigger**. Respond to events delivered to an Azure Event Hub. Particularly useful in application instrumentation, user experience or workflow processing, and internet-of-things (IoT) scenarios. 
* **HTTPTrigger** - Trigger the execution of your code by using an HTTP request.

### Event Grid
Azure Event Grid allows you to easily build applications with event-based architectures. First, select the Azure resource you would like to subscribe to, and then give the event handler or WebHook endpoint to send the event to. Event Grid has built-in support for events coming from Azure services, like storage blobs and resource groups. Event Grid also has support for your own events, using custom topics.
![](Images/EventGridImmage.png)

### Azure Blob storage
Azure Blob storage is Microsoft's object storage solution for the cloud. Blob storage is optimized for storing massive amounts of unstructured data. Unstructured data is data that does not adhere to a particular data model or definition, such as text or binary data.


## Implementation Notes
* The RegisterCallback component is not yet idempotent and will register multiple webhooks if you run the template more than once
* you may notice the dependacy chain in the template is not what you expect and the register callback depends on several resources it does not need, this is because if the registercallback ran too early the function had not yet restarted with the required appSettings and was failing, adding these dependacies gave time for the function to recylce. An alterntative could be to send parameters subscriptionid, region and callbackurl in the querystring or have the event grid trigger check the callback is registered on each event
* had an issue with HttpClient.PostAsJsonAsync in batchClient when running as a function it was always getting a bad request response from the api, we believe this was due to a bug which was setting Content-Length to 0. As a workaround we used StringContent and JsonConvert.SerialiseObject
* Ran into issues trying to use a function trigger url when the function was deployed from github. found a work around [here](https://github.com/MicrosoftDocs/azure-docs/issues/9656) which uses a linked template and the deployment resources has a dependsOn link to the sourcecontrol resource. I did try using a nested template but it failed, it must be a linked template. This issue seems to come from the listsecrets arm function. it seems to evaluate as soon as the function app is created even if the resrouce you have it in has a dependson to the sourcecontrol resource. using a linked template was the only way i could defer the evaluation, i was suprised nested did not work.
* Initially we had issues registering the eventgrid subscription with the eventgrid binding in azure funtions due to the different webhook url used for eventgrid bindings. The biggest issues was the eventgrid trigger requires the function app master key and will not work with other keys. The inital listkeys function call i was using would not return the master key and so i used an azure funtion to return the key embedded in an arm template as shown [here](https://medium.com/@mandur/get-azure-function-host-key-in-an-arm-deployment-template-1eb7ba03c083) (this function has now been removed). I later discovered that the listkeys function had been updated and it was possible to get the master key [issue descriped here](https://github.com/Azure/Azure-Functions/issues/1007)
* The RegisterCallback component is not yet idempotent and will register multiple webhooks if you run the template more than once

