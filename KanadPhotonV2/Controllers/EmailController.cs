using System;
using System.Collections.Generic;
using System.Configuration;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Text;
using System.Web;
using System.Web.Helpers;
using System.Web.Mail;
using System.Web.Mvc;
using KanadPhotonV2.Models;

namespace KanadPhotonV2.Controllers
{
    public class EmailController : Controller
    {
        public HttpResponseMessage GetMail()
        {
            return new HttpResponseMessage(HttpStatusCode.OK);
        }
        [HttpPost]
        public ActionResult SendMail(MailModel mail)
        {
            try
            {
                var mailBodyBuilder = new StringBuilder();
                mailBodyBuilder.Append(string.Format("<br/><b>Firm Name</b>: {0}<br/>", mail.FirmName));
                mailBodyBuilder.Append(string.Format("<br/><b>Contact Name</b>: {0}<br/>", mail.ContactName));
                mailBodyBuilder.Append(string.Format("<br/><b>Contact Phone</b>: {0}<br/>", mail.ContactPhone));
                mailBodyBuilder.Append(string.Format("<br/><b>Contact Email</b>: {0}<br/>", mail.ContactEmail));
                mailBodyBuilder.Append(string.Format("<br/><b>Query</b>: {0}<br/>", mail.Query));
                mailBodyBuilder.Append("<br/>--------------------- Origination Details ---------------------<br/>");
                mailBodyBuilder.Append(mail.OriginationDetails);

                var body = mailBodyBuilder.ToString();

                const string SERVER = "relay-hosting.secureserver.net";
                MailMessage oMail = new System.Web.Mail.MailMessage();
                oMail.From = mail.ContactEmail;
                oMail.To = ConfigurationManager.AppSettings["ReceiverEmail"].ToString();
                oMail.Subject = mail.Subject;
                oMail.BodyFormat = MailFormat.Html;	// enumeration
                oMail.Priority = MailPriority.Normal;	// enumeration
                oMail.Body = body;
                SmtpMail.SmtpServer = SERVER;
                SmtpMail.Send(oMail);
                oMail = null;	// free up resources
                return Json(new { result = "Success" });
            }
            catch (Exception)
            {
                
                throw;
            }
            return Json(new { result = "Success" });
            
        }
    }
}