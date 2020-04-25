using System;
using System.IO;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Azure.WebJobs;
using Microsoft.Azure.WebJobs.Extensions.Http;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;
using Newtonsoft.Json;

namespace SpeechToTextDemo
{
    public static class GetServiceDetailsHttpTrigger
    {
        [FunctionName("GetServiceDetailsHttpTrigger")]
        public static ActionResult Run(
            [HttpTrigger(AuthorizationLevel.Function, "get", Route = null)] HttpRequest req,
            ILogger log)
        {
             
        //     log.LogInformation("C# HTTP trigger function processed a request.");

        //     string name = req.Query["name"];

        //     string requestBody = await new StreamReader(req.Body).ReadToEndAsync();
        //     dynamic data = JsonConvert.DeserializeObject(requestBody);
        //     name = name ?? data?.name;

        //     return name != null
        //         ? (ActionResult)new OkObjectResult($"Hello, {name}")
        //         : new BadRequestObjectResult("Please pass a name on the query string or in the request body");
        //sending details to client, strip cogs details and send them to function proxy


        return new OkObjectResult(ServiceDetailsClient.GetServiceDetailsClient());
        }
    }
}
